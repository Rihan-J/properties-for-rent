-- =============================================
-- Apna Stay - PostgreSQL Schema (Production-ready MVP)
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- =============================================
-- Properties Table
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  image_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  category VARCHAR(30),
  dimensions VARCHAR(50),
  area_sqft NUMERIC,
  price_per_sqft NUMERIC,
  total_price NUMERIC,
  municipal_status VARCHAR(50),
  revenue_type VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for 10k active users scaling
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng ON properties (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category);
CREATE INDEX IF NOT EXISTS idx_properties_created_at_desc ON properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties (owner_id);

-- =============================================
-- Query Plan Verification (run in Neon SQL editor)
-- =============================================
EXPLAIN ANALYZE
WITH nearby AS (
  SELECT
    p.id,
    p.title,
    p.price,
    p.latitude AS lat,
    p.longitude AS lng,
    p.image_url,
    (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(12.9716)) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(77.5946)) +
          sin(radians(12.9716)) * sin(radians(p.latitude))
        ))
      )
    ) AS distance_km
  FROM properties p
  WHERE p.status = 'approved'
    AND p.latitude BETWEEN 12.80 AND 13.10
    AND p.longitude BETWEEN 77.40 AND 77.80
)
SELECT id, title, price, lat, lng, image_url, distance_km
FROM nearby
WHERE distance_km <= 10
ORDER BY distance_km ASC
LIMIT 50 OFFSET 0;
