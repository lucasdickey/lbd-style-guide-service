/**
 * GET /api/twin/samples
 * List all samples with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse, createErrorResponse } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const tagsParam = searchParams.get('tags')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // For now, use a default user ID (in production, extract from auth token)
    const userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'

    // Build the query
    let sqlQuery = 'SELECT id, type, url, context, tags, created_at FROM samples WHERE user_id = $1'
    const params: any[] = [userId]

    // Filter by type if specified
    if (type) {
      sqlQuery += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    // Filter by tags if specified
    if (tagsParam) {
      const tags = tagsParam.split(',').map(t => t.trim())
      sqlQuery += ` AND tags && $${params.length + 1}`
      params.push(tags)
    }

    // Get total count
    const countQuery = sqlQuery.replace('SELECT id, type, url, context, tags, created_at', 'SELECT COUNT(*) as total')
    const countResult = await query(countQuery, params)
    const total = parseInt(countResult.rows[0].total)

    // Add pagination and ordering
    sqlQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await query(sqlQuery, params)

    return NextResponse.json({
      samples: result.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        url: row.url,
        context: row.context,
        tags: row.tags,
        created_at: row.created_at,
      })),
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Samples list error:', error)
    return createErrorResponse(error)
  }
}
