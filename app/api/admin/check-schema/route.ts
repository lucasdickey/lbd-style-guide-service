/**
 * GET /api/admin/check-schema
 * Check the current database schema
 * Requires x-init-token for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function GET(request: NextRequest) {
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

    pool = new Pool({
      connectionString: process.env.DATABASE_URL?.replace(/\?sslmode=.*/, ''),
      ssl: {
        rejectUnauthorized: false,
      },
    })

    const client = await pool.connect()
    try {
      // Check column info for embedding_vector and table structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_name = 'samples' AND column_name = 'embedding_vector'
      `)

      // Also check indexes
      const indexesResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'samples' AND indexname LIKE '%embedding%'
      `)

      // Check vector dimensions directly using pgvector functions
      const vectorCheckResult = await client.query(`
        SELECT typname FROM pg_type WHERE typname = 'vector'
      `).catch(() => ({ rows: [] }))

      return NextResponse.json({
        status: 'success',
        columns: columnsResult.rows,
        indexes: indexesResult.rows,
        vectorType: vectorCheckResult.rows,
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check schema',
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
