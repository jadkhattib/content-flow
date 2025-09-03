import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'
import { logger } from '../../../lib/logger'

const bigQueryService = getBigQueryService()

// Development mode helpers (same as user-role)
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development' || 
         process.env.NODE_ENV === 'test' ||
         process.env.DEVELOPMENT_MODE === 'true'
}

function getDevelopmentUserEmail(): string {
  return process.env.DEV_USER_EMAIL || 'dev@localhost.com'
}

function extractUserEmail(request: NextRequest): string | null {
  // Development mode: use mock user
  if (isDevelopmentMode()) {
    const devEmail = getDevelopmentUserEmail()
    logger.info('Development mode detected, using dev user:', devEmail)
    return devEmail
  }

  // Production mode: use Cloud Run headers
  const googleUser = request.headers.get('x-goog-authenticated-user-email')
  if (!googleUser) {
    logger.warn('No x-goog-authenticated-user-email header found in production mode')
    return null
  }

  // Extract email from the header format: accounts.google.com:user@domain.com
  const userEmail = googleUser.replace('accounts.google.com:', '')
  return userEmail || null
}

export async function GET(request: NextRequest) {
  try {
    logger.info('=== ANALYSIS PERMISSIONS CHECK START ===')
    logger.info('Development mode:', isDevelopmentMode())
    
    // Get user email (development or production)
    const userEmail = extractUserEmail(request)
    
    if (!userEmail) {
      logger.warn('No user email found')
      return NextResponse.json({ 
        error: isDevelopmentMode() 
          ? 'Development user email not configured' 
          : 'No authentication header found' 
      }, { status: 401 })
    }

    logger.info('Checking analyses for user:', userEmail)

    // Get user's accessible analyses based on role
    const analyses = await bigQueryService.getUserAccessibleAnalyses(userEmail)
    
    logger.info('Found analyses:', analyses.length)
    logger.info('=== ANALYSIS PERMISSIONS CHECK END ===')

    return NextResponse.json({ analyses })

  } catch (error) {
    logger.error('Failed to get user analyses:', error)
    return NextResponse.json({ 
      error: 'Failed to get user analyses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId, userEmail, brandName, category } = body

    if (!analysisId || !userEmail || !brandName || !category) {
      return NextResponse.json({ 
        error: 'Analysis ID, user email, brand name, and category are required' 
      }, { status: 400 })
    }

    // Get current user email (development or production)
    const currentUserEmail = extractUserEmail(request)
    if (!currentUserEmail) {
      return NextResponse.json({ 
        error: isDevelopmentMode() 
          ? 'Development user email not configured' 
          : 'Authentication required' 
      }, { status: 401 })
    }

    // Check if current user is admin
    const currentUserRole = await bigQueryService.getUserRole(currentUserEmail)
    if (currentUserRole !== 'admin') {
      return NextResponse.json({ error: 'Only admins can grant analysis permissions' }, { status: 403 })
    }

    const permissionId = await bigQueryService.grantAnalysisPermission({
      analysisId,
      userEmail,
      grantedBy: currentUserEmail,
      brandName,
      category
    })

    return NextResponse.json({ success: true, permissionId })

  } catch (error) {
    logger.error('Failed to grant analysis permission:', error)
    return NextResponse.json({ error: 'Failed to grant analysis permission' }, { status: 500 })
  }
}
