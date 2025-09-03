import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: 'ok',
        database: 'unknown', // Will be 'ok' if BigQuery is configured
        apis: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
          perplexity: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing',
          brandwatch: process.env.BRANDWATCH_TOKEN ? 'configured' : 'optional',
          bigquery: process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'configured' : 'optional'
        }
      }
    }

    // Check BigQuery connection if configured
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        // Simple check - we won't actually query to avoid costs
        health.checks.database = 'configured'
      } catch (error) {
        health.checks.database = 'error'
      }
    }

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 