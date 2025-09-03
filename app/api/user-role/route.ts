import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'
import { logger } from '../../../lib/logger'

const bigQueryService = getBigQueryService()

// Development mode helpers
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
    logger.info('=== USER ROLE CHECK START ===')
    logger.info('Environment mode:', process.env.NODE_ENV)
    logger.info('Development mode:', isDevelopmentMode())
    
    if (!isDevelopmentMode()) {
      logger.safe('Production headers received:', {
        'x-goog-authenticated-user-email': request.headers.get('x-goog-authenticated-user-email'),
        'x-goog-authenticated-user-id': request.headers.get('x-goog-authenticated-user-id'),
        'host': request.headers.get('host')
      })
    }
    
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

    logger.info('Processing user email:', userEmail)

    let userRole = await bigQueryService.getUserRole(userEmail)
    logger.info('Current role from BigQuery:', userRole)

    // Auto-bootstrap specific users as admin if no role exists
    const adminEmails = [
      'jad.khattib@monks.com',
      'dev@localhost.com' // Development user
    ]
    
    if (!userRole && adminEmails.includes(userEmail)) {
      logger.info(`Auto-bootstrapping ${userEmail} as admin`)
      try {
        await bigQueryService.setUserRole({
          userEmail: userEmail,
          role: 'admin',
          createdBy: 'auto-bootstrap'
        })
        userRole = 'admin'
        logger.info(`Successfully bootstrapped ${userEmail} as admin`)
      } catch (error) {
        logger.error('Failed to auto-bootstrap admin:', error)
        // Continue with regular flow
      }
    }

    // Default to regular if no role found
    const finalRole = userRole || 'regular'

    logger.info('Final user role determined:', { email: userEmail, role: finalRole })
    logger.info('=== USER ROLE CHECK END ===')

    return NextResponse.json({
      userEmail,
      role: finalRole,
      isAdmin: finalRole === 'admin',
      developmentMode: isDevelopmentMode()
    })

  } catch (error) {
    logger.error('Failed to get user role:', error)
    return NextResponse.json({ 
      error: 'Failed to get user role',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, role } = body

    if (!userEmail || !role) {
      return NextResponse.json({ error: 'User email and role are required' }, { status: 400 })
    }

    if (!['admin', 'regular'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or regular' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only admins can set user roles' }, { status: 403 })
    }

    await bigQueryService.setUserRole({
      userEmail,
      role: role as 'admin' | 'regular',
      createdBy: currentUserEmail
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Failed to set user role:', error)
    return NextResponse.json({ error: 'Failed to set user role' }, { status: 500 })
  }
}
