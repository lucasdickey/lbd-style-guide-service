/**
 * Embeddings utility functions for generating semantic vectors
 * Uses AWS Bedrock Titan Embedding V2 model
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const EMBEDDING_MODEL = 'amazon.titan-embed-text-v2:0'
const EMBEDDING_DIMENSION = 1536

let bedrockClient: BedrockRuntimeClient | null = null

function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
  }
  return bedrockClient
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION not configured')
  }

  try {
    const client = getBedrockClient()
    const command = new InvokeModelCommand({
      modelId: EMBEDDING_MODEL,
      body: JSON.stringify({
        inputText: text,
      }),
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    return responseBody.embedding
  } catch (error) {
    console.error('Error generating embedding with Bedrock:', error)
    throw error
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION not configured')
  }

  try {
    const client = getBedrockClient()
    const embeddings: number[][] = []

    // Process texts sequentially to avoid rate limiting
    for (const text of texts) {
      const command = new InvokeModelCommand({
        modelId: EMBEDDING_MODEL,
        body: JSON.stringify({
          inputText: text,
        }),
      })

      const response = await client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      embeddings.push(responseBody.embedding)
    }

    return embeddings
  } catch (error) {
    console.error('Error generating embeddings with Bedrock:', error)
    throw error
  }
}
