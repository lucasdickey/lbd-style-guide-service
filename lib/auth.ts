/**
 * Authentication utilities for API key validation
 */

import { NextRequest, NextResponse } from 'next/server'

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.API_KEY_SECRET

  if (!expectedKey) {
    console.warn('API_KEY_SECRET not configured')
    return false
  }

  if (!apiKey) {
    return false
  }

  return apiKey === expectedKey
}

export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function createForbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function createBadRequestResponse(message: string = 'Bad Request') {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function createNotFoundResponse(message: string = 'Not Found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function createErrorResponse(error: unknown, statusCode: number = 500) {
  const message = error instanceof Error ? error.message : 'Internal Server Error'
  return NextResponse.json({ error: message }, { status: statusCode })
}
