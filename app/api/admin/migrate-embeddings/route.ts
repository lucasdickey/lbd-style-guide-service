/**
 * POST /api/admin/migrate-embeddings
 * Migrate embedding_vector column from 1024 to 1536 dimensions
 * Requires x-init-token header for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    // Step 1: Drop the old index that depends on the column
    console.log('Dropping old embedding index...')
    try {
      await query('DROP INDEX IF EXISTS idx_samples_embedding')
    } catch (err) {
      console.warn('Warning dropping index:', err)
    }

    // Step 2: Drop the old column and recreate with new dimensions
    console.log('Recreating embedding_vector column with 1536 dimensions...')
    try {
      await query('ALTER TABLE samples DROP COLUMN IF EXISTS embedding_vector')
    } catch (err) {
      console.warn('Warning dropping column:', err)
    }

    await query('ALTER TABLE samples ADD COLUMN embedding_vector vector(1536)')

    // Step 3: Recreate the index with new dimensions
    console.log('Recreating embedding index...')
    try {
      await query('CREATE INDEX idx_samples_embedding ON samples USING ivfflat (embedding_vector vector_cosine_ops)')
    } catch (err) {
      console.warn('Warning creating index:', err)
    }

    console.log('✓ Migration completed successfully')

    return NextResponse.json({
      status: 'success',
      message: 'Embedding vector dimensions updated to 1536',
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      {
        error: 'Failed to migrate embeddings',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
