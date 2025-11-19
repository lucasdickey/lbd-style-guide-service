/**
 * GET /api/twin/profile
 * Retrieve the style guide profile and persona information
 *
 * PATCH /api/twin/profile
 * Update user profile (persona_tags, default_tone, default_length)
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse, createBadRequestResponse, createErrorResponse } from '@/lib/auth'
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

export async function PATCH(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    const userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'
    const body = await request.json()

    // Get current profile
    const profileResult = await query(
      'SELECT * FROM user_profile WHERE id = $1',
      [userId]
    )

    let profile = profileResult.rows[0]

    // Create default profile if needed
    if (!profile) {
      const createResult = await query(
        `INSERT INTO user_profile (id, name, default_tone, default_length)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, 'lucas', 'professional-casual', 20]
      )
      profile = createResult.rows[0]
    }

    // Validate and update fields
    const personaTags = body.persona_tags !== undefined ? body.persona_tags : profile.persona_tags
    const defaultTone = body.default_tone !== undefined ? body.default_tone : profile.default_tone
    const defaultLength = body.default_length !== undefined ? body.default_length : profile.default_length

    // Validate types
    if (personaTags && !Array.isArray(personaTags)) {
      return createBadRequestResponse('persona_tags must be an array')
    }
    if (defaultTone && typeof defaultTone !== 'string') {
      return createBadRequestResponse('default_tone must be a string')
    }
    if (defaultLength && typeof defaultLength !== 'number') {
      return createBadRequestResponse('default_length must be a number')
    }

    // Update profile
    const updateResult = await query(
      `UPDATE user_profile
       SET persona_tags = $1, default_tone = $2, default_length = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, persona_tags, default_tone, default_length, created_at, updated_at`,
      [personaTags || [], defaultTone, defaultLength, userId]
    )

    const updated = updateResult.rows[0]

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      persona_tags: updated.persona_tags || [],
      default_tone: updated.default_tone,
      default_length: updated.default_length,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return createErrorResponse(error)
  }
}
