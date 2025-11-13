import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'lbd-style-guide-service',
    version: '1.0.0',
  })
}
