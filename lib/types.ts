/**
 * TypeScript type definitions for the style guide service
 */

export type SampleType = 'text' | 'audio' | 'video' | 'image'

export interface UserProfile {
  id: string
  name: string
  persona_tags: string[]
  default_tone: string
  default_length: number
  created_at: string
  updated_at: string
}

export interface Sample {
  id: string
  user_id: string
  type: SampleType
  url: string
  context?: string
  tags: string[]
  embedding_vector?: number[]
  created_at: string
  updated_at: string
}

export interface SampleMetadata {
  id: string
  sample_id: string
  source?: string
  license?: string
  language: string
  mood?: string
  duration_seconds?: number
  file_size_bytes?: number
  created_at: string
  updated_at: string
}

export interface UploadSampleRequest {
  type: SampleType
  context?: string
  content?: string
  file?: Buffer
  tags?: string[]
}

export interface QueryRequest {
  prompt: string
  limit?: number
  type?: SampleType
  tags?: string[]
}

export interface StyleDescriptor {
  persona: string
  preferred_tone: string
  style: {
    brevity: number
    humor: number
    cadence: string
  }
  examples: Sample[]
}
