/**
 * DELETE /api/twin/samples/[id]
 * Delete a sample by ID
 *
 * PATCH /api/twin/samples/[id]
 * Update a sample by ID (tags, modes, context)
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse, createBadRequestResponse, createErrorResponse, createNotFoundResponse } from '@/lib/auth'
import { query } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    const { id } = await params
    const userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'

    // Verify the sample exists and belongs to the user
    const sampleResult = await query(
      'SELECT id FROM samples WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (sampleResult.rows.length === 0) {
      return createNotFoundResponse('Sample not found')
    }

    // Delete the sample (metadata will cascade delete)
    await query('DELETE FROM samples WHERE id = $1', [id])

    return NextResponse.json({
      status: 'success',
      message: 'Sample deleted successfully',
      id,
    })
  } catch (error) {
    console.error('Delete sample error:', error)
    return createErrorResponse(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    const { id } = await params
    const userId = process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'

    // Verify the sample exists and belongs to the user
    const sampleResult = await query(
      'SELECT * FROM samples WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (sampleResult.rows.length === 0) {
      return createNotFoundResponse('Sample not found')
    }

    const sample = sampleResult.rows[0]
    const body = await request.json()

    // Update allowed fields
    const tags = body.tags !== undefined ? body.tags : sample.tags
    const modes = body.modes !== undefined ? body.modes : sample.modes
    const context = body.context !== undefined ? body.context : sample.context

    const updateResult = await query(
      `UPDATE samples
       SET tags = $1, modes = $2, context = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [tags, modes, context, id]
    )

    const updated = updateResult.rows[0]

    return NextResponse.json({
      status: 'success',
      message: 'Sample updated successfully',
      sample: {
        id: updated.id,
        type: updated.type,
        url: updated.url,
        tags: updated.tags,
        modes: updated.modes,
        context: updated.context,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Update sample error:', error)
    return createErrorResponse(error)
  }
}
