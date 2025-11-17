/**
 * POST /api/admin/init-db
 * Initialize the database schema (admin-only endpoint)
 *
 * This endpoint requires a special initialization token for security
 * Usage: POST /api/admin/init-db with header: x-init-token: <INIT_TOKEN>
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

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
  modes TEXT[] DEFAULT '{}',
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

export async function POST(request: NextRequest) {
  try {
    // Validate initialization token - accept from header or query parameter
    const headerToken = request.headers.get('x-init-token')
    const { searchParams } = new URL(request.url)
    const queryToken = searchParams.get('token')
    const initToken = headerToken || queryToken
    const expectedToken = process.env.DB_INIT_TOKEN

    console.log('Token validation:', {
      headerToken: headerToken ? '***' : 'missing',
      queryToken: queryToken ? '***' : 'missing',
      expectedToken: expectedToken ? '***' : 'missing',
      match: initToken === expectedToken
    })

    if (!expectedToken || !initToken || initToken !== expectedToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Invalid or missing initialization token',
          hasExpectedToken: !!expectedToken,
          hasInitToken: !!initToken
        },
        { status: 401 }
      )
    }

    // Check if DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable not configured' },
        { status: 500 }
      )
    }

    // First, create the database if it doesn't exist
    // Connect to the default 'postgres' database to create our database
    const createDbUrl = databaseUrl.replace('/lbd_style_guide', '/postgres')
    const adminPool = new Pool({
      connectionString: createDbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    const adminClient = await adminPool.connect()
    try {
      console.log('Creating database if it does not exist...')
      try {
        await adminClient.query('CREATE DATABASE lbd_style_guide')
        console.log('✓ Database created')
      } catch (err) {
        // Database might already exist, which is fine
        if (err instanceof Error && err.message.includes('already exists')) {
          console.log('✓ Database already exists')
        } else {
          throw err
        }
      }
    } finally {
      adminClient.release()
      await adminPool.end()
    }

    // Now connect to our actual database and initialize schema
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    })

    // Connect and initialize schema
    const client = await pool.connect()
    try {
      console.log('Initializing database schema...')
      await client.query(schema)
      console.log('✓ Database schema initialized successfully')

      return NextResponse.json({
        status: 'success',
        message: 'Database schema initialized successfully',
      })
    } finally {
      client.release()
      await pool.end()
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json(
      {
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
