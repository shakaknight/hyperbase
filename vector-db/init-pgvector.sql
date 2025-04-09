-- Create a basic vector storage table without pgvector
DROP TABLE IF EXISTS vector_collections;
CREATE TABLE vector_collections (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  dimensions INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vector_collections
DROP TRIGGER IF EXISTS update_vector_collections_updated_at ON vector_collections;
CREATE TRIGGER update_vector_collections_updated_at
BEFORE UPDATE ON vector_collections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 