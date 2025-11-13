import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const docs = {
    title: 'LBD Style Guide Service - API Documentation',
    version: '1.0.0',
    baseUrl: 'http://localhost:3010',
    endpoints: [
      {
        path: '/api/twin/style',
        method: 'GET',
        description: 'Retrieve the current style guide',
        query: {
          optional: ['detailed']
        },
        response: {
          styleName: 'string',
          description: 'string',
          patterns: 'array of strings',
          toneDescriptors: 'array of strings'
        }
      },
      {
        path: '/api/twin/samples',
        method: 'GET',
        description: 'List all uploaded samples',
        query: {
          optional: ['limit', 'offset', 'type']
        },
        response: {
          samples: 'array of sample objects',
          total: 'number'
        }
      },
      {
        path: '/api/twin/upload',
        method: 'POST',
        description: 'Upload a new sample (text, audio, video, or image)',
        body: 'FormData with file and metadata',
        response: {
          id: 'string',
          type: 'string',
          url: 'string',
          uploadedAt: 'ISO timestamp'
        }
      },
      {
        path: '/api/twin/query',
        method: 'POST',
        description: 'Query the style guide with semantic search',
        body: {
          query: 'string - what to search for',
          limit: 'number - max results (default: 10)'
        },
        response: {
          results: 'array of matching patterns',
          confidence: 'array of confidence scores'
        }
      },
      {
        path: '/api/health',
        method: 'GET',
        description: 'Service health check',
        response: {
          status: 'ok',
          timestamp: 'ISO timestamp',
          service: 'lbd-style-guide-service',
          version: '1.0.0'
        }
      }
    ],
    mcp: {
      protocol: 'Model Context Protocol',
      endpoint: 'http://localhost:3010/api/twin/mcp',
      description: 'Available via Claude Desktop, Claude Code, Cursor, and other MCP-compatible tools'
    }
  }

  return NextResponse.json(docs, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
