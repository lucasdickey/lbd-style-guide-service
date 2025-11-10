/**
 * Database initialization script
 * Run with: npx ts-node scripts/init-db.ts
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const schema = `
-- Enable vector extension for pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- User profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  persona_tags TEXT[] DEFAULT '{}',
  default_tone TEXT DEFAULT 'professional',
  default_length INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Samples table
CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'audio', 'video', 'image')),
  url TEXT NOT NULL,
  context TEXT,
  tags TEXT[] DEFAULT '{}',
  embedding_vector vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metadata table
CREATE TABLE IF NOT EXISTS metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_id UUID NOT NULL REFERENCES samples(id) ON DELETE CASCADE,
  source TEXT,
  license TEXT,
  language TEXT DEFAULT 'en',
  mood TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_samples_user_id ON samples(user_id);
CREATE INDEX IF NOT EXISTS idx_samples_type ON samples(type);
CREATE INDEX IF NOT EXISTS idx_samples_tags ON samples USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_metadata_sample_id ON metadata(sample_id);

-- Vector similarity search index (requires pgvector)
CREATE INDEX IF NOT EXISTS idx_samples_embedding ON samples USING ivfflat (embedding_vector vector_cosine_ops);
`

async function initializeDatabase() {
  const client = await pool.connect()
  try {
    console.log('Initializing database schema...')
    await client.query(schema)
    console.log('✓ Database schema initialized successfully')
  } catch (error) {
    console.error('✗ Error initializing database:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

initializeDatabase().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
