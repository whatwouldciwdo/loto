-- PostgreSQL initialization script for LOTO database
-- This script runs automatically when the container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for fuzzy text search (useful untuk search fitur)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('ADMIN', 'SP_HAR', 'SPS_HAR', 'OP_LOKAL', 'OP_CCR', 'PELAKSANA_HAR');
CREATE TYPE loto_status AS ENUM ('DRAFT', 'PROGRESS', 'CLOSE', 'CANCELLED');
CREATE TYPE approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE loto_type AS ENUM ('TAGGING', 'RELEASE');

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE loto_db TO loto_user;

-- Create schema (optional, untuk organization)
-- CREATE SCHEMA IF NOT EXISTS loto;

-- Set default schema
-- ALTER DATABASE loto_db SET search_path TO loto, public;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'LOTO Database initialization completed successfully!';
END
$$;
