/**
 * GET /api/twin/style
 * Return a JSON descriptor of the style inferred from samples
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

    // For now, use a default user ID (in production, extract from auth token)
    const userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'

    // Get user profile
    const profileResult = await query(
      'SELECT * FROM user_profile WHERE id = $1',
      [userId]
    )

    let profile = profileResult.rows[0]

    // If no profile exists, create a default one
    if (!profile) {
      const createResult = await query(
        `INSERT INTO user_profile (id, name, default_tone, default_length)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, 'lucas', 'analytical, conversational', 20]
      )
      profile = createResult.rows[0]
    }

    // Get sample statistics
    const statsResult = await query(
      `SELECT type, COUNT(*) as count FROM samples
       WHERE user_id = $1 AND embedding_vector IS NOT NULL
       GROUP BY type`,
      [userId]
    )

    // Get a few example samples
    const examplesResult = await query(
      `SELECT id, type, url, tags, created_at FROM samples
       WHERE user_id = $1 AND embedding_vector IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 2`,
      [userId]
    )

    const typeStats: { [key: string]: number } = {}
    statsResult.rows.forEach((row: any) => {
      typeStats[row.type] = parseInt(row.count)
    })

    // Infer style metrics (simplified for now)
    const totalSamples = Object.values(typeStats).reduce((a: number, b: number) => a + b, 0)
    const brevityScore = totalSamples > 0 ? 0.7 : 0
    const humorScore = 0.4
    const cadence = 'mid-length sentences, varied rhythm'

    return NextResponse.json({
      persona: profile.name,
      preferred_tone: profile.default_tone,
      persona_tags: profile.persona_tags || [],
      style: {
        brevity: brevityScore,
        humor: humorScore,
        cadence: cadence,
      },
      sample_statistics: {
        total: totalSamples,
        by_type: typeStats,
      },
      examples: examplesResult.rows.map((sample: any) => ({
        id: sample.id,
        type: sample.type,
        url: sample.url,
        tags: sample.tags,
        created_at: sample.created_at,
      })),
    })
  } catch (error) {
    console.error('Style descriptor error:', error)
    return createErrorResponse(error)
  }
}
