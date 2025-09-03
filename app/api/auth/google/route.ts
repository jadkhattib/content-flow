import { NextRequest, NextResponse } from 'next/server'

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'login'

  if (action === 'login') {
    // Generate Google OAuth URL
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({
        error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID in environment variables.',
        authUrl: null
      }, { status: 400 })
    }

    const scopes = [
      'openid',
      'email',
      'profile'
    ].join(' ')

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', scopes)
    authUrl.searchParams.append('access_type', 'offline')
    authUrl.searchParams.append('prompt', 'consent')

    return NextResponse.json({
      authUrl: authUrl.toString(),
      message: 'Redirect user to this URL for Google authentication'
    })
  }

  if (action === 'logout') {
    // Handle logout
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear authentication cookies
    response.cookies.delete('google_access_token')
    response.cookies.delete('google_user_info')

    return response
  }

  return NextResponse.json({
    error: 'Invalid action. Use ?action=login or ?action=logout'
  }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({
        error: 'Authorization code is required'
      }, { status: 400 })
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({
        error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables.'
      }, { status: 500 })
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    const tokens = await tokenResponse.json()

    // Get user profile information
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile')
    }

    const profile = await profileResponse.json()

    // Create response with user information
    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        verified_email: profile.verified_email
      },
      message: 'Authentication successful'
    })

    // Set secure cookies (optional - you might prefer to handle this client-side)
    if (process.env.NODE_ENV === 'production') {
      response.cookies.set('google_access_token', tokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: tokens.expires_in || 3600
      })

      response.cookies.set('google_user_info', JSON.stringify(profile), {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: tokens.expires_in || 3600
      })
    }

    return response

  } catch (error) {
    console.error('Google OAuth error:', error)
    
    return NextResponse.json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 