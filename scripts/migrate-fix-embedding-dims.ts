/**
 * Migration: Fix embedding vector dimensions from 1024 to 1536
 * This updates the samples table to use 1536 dimensions for Bedrock Titan Embedding V2
 * Run with: npm run db:migrate-dims (after adding to package.json)
 */

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrateDatabase() {
  const client = await pool.connect()
  try {
    console.log('Starting migration: fixing embedding vector dimensions...')

    // Step 1: Drop the old index that depends on the column
    console.log('Dropping old embedding index...')
    await client.query('DROP INDEX IF EXISTS idx_samples_embedding')

    // Step 2: Drop the old column and recreate with new dimensions
    console.log('Recreating embedding_vector column with 1536 dimensions...')
    await client.query('ALTER TABLE samples DROP COLUMN IF EXISTS embedding_vector')
    await client.query('ALTER TABLE samples ADD COLUMN embedding_vector vector(1536)')

    // Step 3: Recreate the index with new dimensions
    console.log('Recreating embedding index...')
    await client.query('CREATE INDEX idx_samples_embedding ON samples USING ivfflat (embedding_vector vector_cosine_ops)')

    console.log('✓ Migration completed successfully')
  } catch (error) {
    console.error('✗ Error during migration:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

migrateDatabase().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
