-- =============================================
-- Apna Stay — PostgreSQL Schema
-- Run this on your Neon database console
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'user'
               CHECK (role IN ('user', 'owner', 'admin')),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- =============================================
-- Properties Table
-- =============================================
CREATE TABLE properties (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id   UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255)   NOT NULL,
    description TEXT,
    price      NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    latitude   DOUBLE PRECISION NOT NULL,
    longitude  DOUBLE PRECISION NOT NULL,
    image_url  TEXT           NOT NULL,
    status     VARCHAR(20)    NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Critical for bounding-box geo queries
CREATE INDEX idx_properties_lat_lng ON properties (latitude, longitude);

-- For filtering by status (most queries filter on approved)
CREATE INDEX idx_properties_status ON properties (status);

-- For owner lookup
CREATE INDEX idx_properties_owner ON properties (owner_id);

-- =============================================
-- Seed admin user (password: Admin@123)
-- Hash generated with bcrypt 10 rounds
-- CHANGE THIS immediately after first login
-- =============================================
-- INSERT INTO users (name, email, password, role)
-- VALUES ('Admin', 'admin@apnastay.com', '<bcrypt-hash-here>', 'admin');
