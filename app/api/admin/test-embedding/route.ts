/**
 * GET /api/admin/test-embedding
 * Test the embedding generation and check dimensions
 * Requires x-init-token for security
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateEmbedding } from '@/lib/embeddings'

export async function GET(request: NextRequest) {
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

    console.log('Testing embedding generation...')

    const testText = 'This is a test sentence for embedding generation'
    const embedding = await generateEmbedding(testText)

    return NextResponse.json({
      status: 'success',
      testText,
      embeddingDimensions: embedding.length,
      firstFiveDimensions: embedding.slice(0, 5),
      lastFiveDimensions: embedding.slice(-5),
      model: 'amazon.titan-embed-text-v2:0',
    })
  } catch (error) {
    console.error('Embedding test error:', error)
    return NextResponse.json(
      {
        error: 'Failed to test embedding',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
