/**
 * POST /api/admin/create-test-user
 * Create a test user profile for development
 * Requires x-init-token for security
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

    console.log('Creating test user profile...')

    // Create a default test user with the default UUID
    const result = await query(
      `INSERT INTO user_profile (id, name, persona_tags, default_tone, default_length)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      ['00000000-0000-0000-0000-000000000000', 'default_user', ['test', 'development'], 'professional', 20]
    )

    if (result.rows.length === 0) {
      // User already exists
      return NextResponse.json({
        status: 'success',
        message: 'Test user already exists',
        userId: '00000000-0000-0000-0000-000000000000',
      })
    }

    console.log('✓ Test user created successfully')

    return NextResponse.json({
      status: 'success',
      message: 'Test user created successfully',
      user: result.rows[0],
    })
  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create test user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
