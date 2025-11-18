/**
 * Database utility functions for PostgreSQL connection and query execution
 * Uses simple node-postgres for now, can be upgraded to an ORM later
 */

let pool: any = null

export async function initDB() {
  if (pool) return pool

  // Import dynamically to avoid issues during build
  const { Pool } = await import('pg')

  // Parse the DATABASE_URL and ensure SSL is properly configured
  const dbUrl = process.env.DATABASE_URL

  // Remove SSL parameters from connection string to avoid conflicts
  // Let the ssl config object handle it instead
  const cleanUrl = dbUrl?.replace(/\?sslmode=.*/, '') || ''

  pool = new Pool({
    connectionString: cleanUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
      rejectUnauthorized: false, // Always accept self-signed certificates from RDS
    },
  })

  pool.on('error', (err: Error) => {
    console.error('Unexpected pool error:', err)
  })

  return pool
}

export async function query(text: string, params?: any[]) {
  const pool = await initDB()
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getConnection() {
  const pool = await initDB()
  return pool.connect()
}

export async function closeDB() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
