-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgvector for vector operations
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For text search using trigrams
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";  -- For fuzzy string matching
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For encryption functions
CREATE EXTENSION IF NOT EXISTS "hstore";         -- For key-value store

-- Set up RLS (Row Level Security) for multi-tenant support
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS vector;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS functions;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 