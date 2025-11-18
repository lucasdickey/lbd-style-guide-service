/**
 * POST /api/admin/migrate-embeddings
 * Migrate embedding_vector column from 1024 to 1536 dimensions
 * Requires x-init-token header for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(request: NextRequest) {
  let pool: Pool | null = null
  try {
    // Validate initialization token
    const headerToken = request.headers.get('x-init-token')
    const { searchParams } = new URL(request.url)
    const queryToken = searchParams.get('token')
    const initToken = headerToken || queryToken
    const expectedToken = process.env.DB_INIT_TOKEN

    if (!expectedToken || !initToken || initToken !== expectedToken) {
      return NextResponse.json(
        {
          error: 'Unauthorized: Invalid or missing initialization token',
        },
        { status: 401 }
      )
    }

    console.log('Starting migration: fixing embedding vector dimensions...')

    // Create direct connection with timeout
    pool = new Pool({
      connectionString: process.env.DATABASE_URL?.replace(/\?sslmode=.*/, ''),
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    const client = await pool.connect()
    try {
      // Set statement timeout to 30 seconds
      await client.query('SET statement_timeout = 30000')

      // Step 1: Drop the old index that depends on the column
      console.log('Dropping old embedding index...')
      try {
        await client.query('DROP INDEX IF EXISTS idx_samples_embedding')
        console.log('Index dropped')
      } catch (err) {
        console.warn('Warning dropping index:', err)
      }

      // Step 2: Drop the old column
      console.log('Dropping old embedding_vector column...')
      try {
        await client.query('ALTER TABLE samples DROP COLUMN IF EXISTS embedding_vector CASCADE')
        console.log('Column dropped')
      } catch (err) {
        console.warn('Warning dropping column:', err)
      }

      // Step 3: Add new column with correct dimensions (Titan Embedding V2 returns 1024 dimensions)
      console.log('Adding new embedding_vector column with 1024 dimensions...')
      await client.query('ALTER TABLE samples ADD COLUMN embedding_vector vector(1024)')
      console.log('New column added')

      // Step 4: Recreate the index
      console.log('Recreating embedding index...')
      try {
        await client.query('CREATE INDEX idx_samples_embedding ON samples USING ivfflat (embedding_vector vector_cosine_ops)')
        console.log('Index recreated')
      } catch (err) {
        console.warn('Warning creating index:', err)
      }

      console.log('✓ Migration completed successfully')

      return NextResponse.json({
        status: 'success',
        message: 'Embedding vector column migrated successfully (using 1024 dimensions for Titan Embedding V2)',
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Failed to migrate embeddings',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}
