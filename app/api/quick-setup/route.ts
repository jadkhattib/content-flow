import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'

const bigQueryService = getBigQueryService()

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Running quick setup for brand_name based permissions...')

    // Get current user from Cloud Run headers
    const googleUser = request.headers.get('x-goog-authenticated-user-email')
    if (!googleUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const currentUserEmail = googleUser.replace('accounts.google.com:', '')
    console.log(`Quick setup for user: ${currentUserEmail}`)

    // Use the public setup method that handles all the BigQuery operations
    const setupResult = await bigQueryService.runSetupQueries(currentUserEmail)

    return NextResponse.json({
      success: true,
      message: '🎉 Quick setup completed! You should now see analyses in your dashboard.',
      details: {
        userEmail: currentUserEmail,
        ...setupResult
      }
    })

  } catch (error) {
    console.error('❌ Quick setup failed:', error)
    return NextResponse.json({
      error: 'Quick setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
