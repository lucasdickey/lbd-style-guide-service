/**
 * POST /api/twin/upload
 * Upload a new sample to the style guide
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, createUnauthorizedResponse, createBadRequestResponse, createErrorResponse } from '@/lib/auth'
import { query } from '@/lib/db'
import { uploadFile } from '@/lib/s3'
import { generateEmbedding } from '@/lib/embeddings'
import { UploadSampleRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return createUnauthorizedResponse('Invalid or missing API key')
    }

    // Parse request body
    const contentType = request.headers.get('content-type') || ''

    let sampleData: UploadSampleRequest & { user_id?: string } = {}

    if (contentType.includes('application/json')) {
      sampleData = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      sampleData = {
        type: (formData.get('type') as string) as any,
        context: formData.get('context') as string,
        tags: JSON.parse((formData.get('tags') as string) || '[]'),
        file: formData.get('file') as any,
      }
    } else {
      return createBadRequestResponse('Unsupported content type')
    }

    // Validate required fields
    if (!sampleData.type) {
      return createBadRequestResponse('Missing required field: type')
    }

    // For now, use a default user ID (in production, extract from auth token)
    const userId = sampleData.user_id || process.env.DEFAULT_USER_ID || '00000000-0000-0000-0000-000000000000'

    let fileUrl: string | null = null
    let embeddingVector: number[] | null = null

    // Handle different sample types
    if (sampleData.type === 'text') {
      if (!sampleData.content) {
        return createBadRequestResponse('Missing required field for text: content')
      }

      // Generate embedding for text content
      embeddingVector = await generateEmbedding(sampleData.content)

      // Optionally upload text to S3
      const key = `samples/text/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.txt`
      fileUrl = await uploadFile(key, sampleData.content, 'text/plain')
    } else if (sampleData.type === 'audio' || sampleData.type === 'video' || sampleData.type === 'image') {
      if (!sampleData.file) {
        return createBadRequestResponse(`Missing required field for ${sampleData.type}: file`)
      }

      // Upload file to S3
      const ext = sampleData.type === 'audio' ? 'mp3' : sampleData.type === 'video' ? 'mp4' : 'jpg'
      const contentTypeMap = {
        audio: 'audio/mpeg',
        video: 'video/mp4',
        image: 'image/jpeg',
      }
      const key = `samples/${sampleData.type}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
      fileUrl = await uploadFile(key, sampleData.file as any, contentTypeMap[sampleData.type] || 'application/octet-stream')

      // For now, we'll generate embedding from context/description instead of transcribing
      if (sampleData.context) {
        embeddingVector = await generateEmbedding(sampleData.context)
      }
    }

    if (!fileUrl) {
      return createBadRequestResponse('Failed to upload sample')
    }

    // Insert sample into database
    const sampleResult = await query(
      `INSERT INTO samples (user_id, type, url, context, tags, embedding_vector)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, sampleData.type, fileUrl, sampleData.context || null, sampleData.tags || [], embeddingVector ? JSON.stringify(embeddingVector) : null]
    )

    const sample = sampleResult.rows[0]

    return NextResponse.json({
      id: sample.id,
      status: 'success',
      message: 'Sample ingested and embedded',
      sample: {
        id: sample.id,
        type: sample.type,
        url: sample.url,
        tags: sample.tags,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return createErrorResponse(error)
  }
}
