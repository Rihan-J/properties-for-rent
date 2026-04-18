# Apna Stay — Backend Implementation

> Production-ready Node.js & Express MVP backend adhering to strict requirements: No Redis, No PostGIS, simple JWT auth, Cloudinary unsigned uploads, and manual bounding-box + Haversine geo-queries.

---

## 1. Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   └── db.ts                   # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── auth.controller.ts      # Register / Login logic
│   │   ├── property.controller.ts  # CRUD & Geo queries
│   │   └── admin.controller.ts     # Admin approval logic
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification & roles
│   │   └── error.middleware.ts     # Global error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── property.routes.ts
│   │   └── admin.routes.ts
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Server entry point
├── database.sql                    # SQL Schema
├── package.json
├── .env
└── tsconfig.json
```

---

## 2. Database Schema (SQL)

```sql
-- database.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    image_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for bounding box geo-queries (Critical for performance)
CREATE INDEX idx_properties_lat_lng ON properties (latitude, longitude);
CREATE INDEX idx_properties_status ON properties (status);
```

---

## 3. Express Server Setup

### `src/config/db.ts`
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Neon pooled connection string requires ?sslmode=require
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});
```

### `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
```

### `src/server.ts`
```typescript
import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
```

---

## 4. Auth Routes + Controllers

### `src/routes/auth.routes.ts`
```typescript
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
```

### `src/controllers/auth.controller.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = role === 'owner' ? 'owner' : 'user'; // Don't allow passing 'admin' easily

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' } // Simple setup as requested, no refresh tokens
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Property Routes + Controllers

### `src/routes/property.routes.ts`
```typescript
import { Router } from 'express';
import { createProperty, getProperties, getNearbyProperties, getPropertyById } from '../controllers/property.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getProperties);
router.get('/nearby', getNearbyProperties);
router.get('/:id', getPropertyById);
router.post('/', protect, authorize('owner', 'admin'), createProperty);

export default router;
```

### `src/controllers/property.controller.ts`
*(Geo query logic is placed here. See Section 6 for the detailed Geo Query logic block).*

```typescript
import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';

export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, price, latitude, longitude, image_url } = req.body;
    const owner_id = (req as any).user.id; // From auth middleware

    const result = await pool.query(
      `INSERT INTO properties (owner_id, title, price, latitude, longitude, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [owner_id, title, price, latitude, longitude, image_url]
    );

    res.status(201).json({ property: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM properties WHERE status = 'approved' ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.status(200).json({ properties: result.rows, page, limit });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT * FROM properties WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    res.status(200).json({ property: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
```

---

## 6. Geo Query Implementation (SQL + Logic)

> **Important**: Because we are NOT using PostGIS, calculating the exact distance for *every* row in the table is an `O(N)` full table scan. To avoid this, we first create a **Bounding Box** (min/max latitude and longitude) based on the radius. The SQL engine uses the standard index `(latitude, longitude)` to filter properties within this square bounding box extremely fast. Then, we apply the Haversine formula ONLY to the few properties inside the box to get the exact circular radius distance.

### `getNearbyProperties` in `property.controller.ts`
```typescript
export const getNearbyProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radius as string) || 5;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Please provide valid lat and lng' });
    }

    // 1 degree of latitude is roughly 111 km
    const latDelta = radiusKm / 111.045;
    // 1 degree of longitude varies by latitude
    const lngDelta = radiusKm / (111.045 * Math.cos(lat * (Math.PI / 180)));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    const query = `
      SELECT *,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) AS distance
      FROM properties
      WHERE status = 'approved'
        AND latitude BETWEEN $3 AND $4
        AND longitude BETWEEN $5 AND $6
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(latitude))
          )
        ) <= $7
      ORDER BY distance ASC
      LIMIT 50;
    `;

    const result = await pool.query(query, [
      lat,      // $1
      lng,      // $2
      minLat,   // $3
      maxLat,   // $4
      minLng,   // $5
      maxLng,   // $6
      radiusKm  // $7
    ]);

    res.status(200).json({ properties: result.rows });
  } catch (error) {
    next(error);
  }
};
```

---

## 7. Middleware (Auth + Error Handling)

### `src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden, insufficient permissions' });
    }
    next();
  };
};
```

### `src/middleware/error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log error for server debugging

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
```

### `src/routes/admin.routes.ts` (Admin Controller/Routes)
```typescript
import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply auth and admin check to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/properties', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`SELECT * FROM properties ORDER BY created_at DESC`);
    res.status(200).json({ properties: result.rows });
  } catch (error) { next(error); }
});

router.patch('/properties/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      `UPDATE properties SET status = 'approved' WHERE id = $1 RETURNING *`, 
      [req.params.id]
    );
    res.status(200).json({ property: result.rows[0] });
  } catch (error) { next(error); }
});

router.delete('/properties/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await pool.query(`DELETE FROM properties WHERE id = $1`, [req.params.id]);
    res.status(200).json({ message: 'Property deleted' });
  } catch (error) { next(error); }
});

export default router;
```
