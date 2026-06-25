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
  listing_type VARCHAR(20) DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale')),
  booking_type VARCHAR(20) CHECK (booking_type IN ('hourly', 'daily', 'both')),
  price_per_hour NUMERIC(12, 2),
  price_per_day NUMERIC(12, 2),
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
-- Reviews Table
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews (property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id);

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

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  brand_name VARCHAR(100) NOT NULL DEFAULT 'Namma Stay',
  brand_initials VARCHAR(10) NOT NULL DEFAULT 'NS',
  brand_tagline VARCHAR(255) NOT NULL DEFAULT 'Your perfect local stay',
  CHECK (id = 1)
);

INSERT INTO settings (id, brand_name, brand_initials, brand_tagline)
VALUES (1, 'Namma Stay', 'NS', 'Your perfect local stay')
ON CONFLICT (id) DO NOTHING;

