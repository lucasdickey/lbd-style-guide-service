/**
 * GET /api/twin/profile
 * Retrieve the style guide profile and persona information
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
      'SELECT id, name, persona_tags, default_tone, default_length, created_at, updated_at FROM user_profile WHERE id = $1',
      [userId]
    )

    let profile = profileResult.rows[0]

    // If no profile exists, create a default one
    if (!profile) {
      const createResult = await query(
        `INSERT INTO user_profile (id, name, default_tone, default_length)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, persona_tags, default_tone, default_length, created_at, updated_at`,
        [userId, 'lucas', 'professional-casual', 20]
      )
      profile = createResult.rows[0]
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      persona_tags: profile.persona_tags || [],
      default_tone: profile.default_tone,
      default_length: profile.default_length,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    })
  } catch (error) {
    console.error('Profile endpoint error:', error)
    return createErrorResponse(error)
  }
}
