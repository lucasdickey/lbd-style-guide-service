/**
 * POST /api/twin/query
 * Query the style guide for semantically similar samples
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse, createBadRequestResponse, createErrorResponse } from '@/lib/auth'
import { query } from '@/lib/db'
import { generateEmbedding } from '@/lib/embeddings'
import { QueryRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    const body: QueryRequest = await request.json()

    // Validate required fields
    if (!body.prompt) {
      return createBadRequestResponse('Missing required field: prompt')
    }

    const limit = Math.min(body.limit || 5, 50) // Cap at 50 results

    // Generate embedding for the query prompt
    const queryEmbedding = await generateEmbedding(body.prompt)

    // Build the query
    let sqlQuery = `
      SELECT
        id, user_id, type, url, context, tags, created_at,
        1 - (embedding_vector <=> $1::vector) as similarity
      FROM samples
      WHERE embedding_vector IS NOT NULL
    `
    const params: any[] = [JSON.stringify(queryEmbedding)]

    // Filter by type if specified
    if (body.type) {
      sqlQuery += ` AND type = $${params.length + 1}`
      params.push(body.type)
    }

    // Filter by tags if specified
    if (body.tags && body.tags.length > 0) {
      sqlQuery += ` AND tags && $${params.length + 1}`
      params.push(body.tags)
    }

    // Order by similarity and limit results
    sqlQuery += ` ORDER BY similarity DESC LIMIT $${params.length + 1}`
    params.push(limit)

    const result = await query(sqlQuery, params)

    const results = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      url: row.url,
      context: row.context,
      tags: row.tags,
      similarity: parseFloat(row.similarity).toFixed(3),
      created_at: row.created_at,
    }))

    return NextResponse.json({
      query: body.prompt,
      results,
      count: results.length,
    })
  } catch (error) {
    console.error('Query error:', error)
    return createErrorResponse(error)
  }
}
