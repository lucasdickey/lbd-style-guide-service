/**
 * Database migration to add modes column to samples table
 * Run with: npm run db:migrate
 */

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrate() {
  const client = await pool.connect()
  try {
    console.log('Adding modes column to samples table...')
    await client.query(`
      ALTER TABLE samples
      ADD COLUMN IF NOT EXISTS modes TEXT[] DEFAULT '{}';
    `)
    console.log('✓ Migration completed successfully')
  } catch (error) {
    console.error('✗ Error during migration:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
