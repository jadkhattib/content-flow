import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'

const bigQueryService = getBigQueryService()

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting permission migration...')

    // Get current user from Cloud Run headers (admin only)
    const googleUser = request.headers.get('x-goog-authenticated-user-email')
    if (!googleUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const currentUserEmail = googleUser.replace('accounts.google.com:', '')
    const currentUserRole = await bigQueryService.getUserRole(currentUserEmail)
    
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Only admins can run migrations' }, { status: 403 })
    }

    // Run the migration
    const result = await bigQueryService.migrateAnalysisPermissions()

    return NextResponse.json({ 
      success: true, 
      message: 'Permission migration completed successfully',
      details: 'Updated analysis_id format for existing permissions',
      result
    })

  } catch (error) {
    console.error('❌ Permission migration failed:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 