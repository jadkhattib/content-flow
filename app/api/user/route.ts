import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

interface UserInfo {
  name?: string
  email?: string
  picture?: string
  sub?: string
}

// Initialize Google Auth for People API
const getGoogleAuth = () => {
  try {
    // Use the same credentials as BigQuery
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
      ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
      : null

    if (credentials) {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/cloud-platform'
        ]
      })
      return auth
    }
    return null
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error)
    return null
  }
}

// Function to get profile picture using Google APIs
const getProfilePictureFromGoogleAPIs = async (email: string, userId: string): Promise<string | null> => {
  try {
    const auth = getGoogleAuth()
    if (!auth) {
      console.log('Google Auth not available')
      return null
    }

    // Method 1: Try Google Workspace Directory API if this is a workspace domain
    try {
      const admin = google.admin({ version: 'directory_v1', auth })
      const userResponse = await admin.users.get({
        userKey: email
      })
      
      if (userResponse.data.thumbnailPhotoUrl) {
        console.log('Found profile picture via Directory API')
        return userResponse.data.thumbnailPhotoUrl
      }
    } catch (dirError) {
      console.log('Directory API not available or user not in workspace:', dirError)
    }

    // Method 2: Try OAuth2 userinfo endpoint (requires domain-wide delegation)
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth })
      const userInfo = await oauth2.userinfo.get()
      
      if (userInfo.data.picture) {
        console.log('Found profile picture via OAuth2 userinfo')
        return userInfo.data.picture
      }
    } catch (oauthError) {
      console.log('OAuth2 userinfo not available:', oauthError)
    }

    return null
  } catch (error) {
    console.error('Google APIs error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Method 1: Check for Cloud Run with Google IAM authentication headers
    const googleUser = request.headers.get('x-goog-authenticated-user-email')
    const googleId = request.headers.get('x-goog-authenticated-user-id')
    
    if (googleUser && googleId) {
      // Extract email from the header format: accounts.google.com:user@domain.com
      const email = googleUser.replace('accounts.google.com:', '')
      const userId = googleId.replace('accounts.google.com:', '')
      
      let profilePicture: string | undefined = undefined
      
      // Try multiple methods to get the Google profile picture
      try {
        // Method 1: Check if there are additional Cloud Run headers with profile info
        const additionalHeaders = {
          userInfo: request.headers.get('x-goog-authenticated-user-info'),
          userJwt: request.headers.get('x-goog-iap-jwt-assertion'),
          userAttributes: request.headers.get('x-goog-authenticated-user-attributes')
        }
        
        console.log('Cloud Run IAM Headers:', {
          email,
          userId,
          additionalHeaders
        })
      
        // Method 2: Try Google APIs first (Directory API, OAuth2 userinfo)
        const apiProfilePicture = await getProfilePictureFromGoogleAPIs(email, userId)
        if (apiProfilePicture) {
          profilePicture = apiProfilePicture
          console.log('Profile picture found via Google APIs')
        }
        
        // Method 3: If APIs didn't work, try URL patterns as fallback
        if (!profilePicture) {
          // Define URL patterns to try
          const possibleProfileUrls = [
            // Try with email-based patterns (less likely to work but worth trying)
            `https://lh3.googleusercontent.com/a/default-user=${encodeURIComponent(email)}`,
            // Try with user ID patterns
            `https://lh3.googleusercontent.com/a/default-user=${userId}`,
            `https://lh3.googleusercontent.com/a-/${userId}`, 
            `https://lh4.googleusercontent.com/a/default-user=${userId}`,
            `https://lh5.googleusercontent.com/a/default-user=${userId}`,
            `https://lh6.googleusercontent.com/a/default-user=${userId}`,
            // Try without default-user prefix
            `https://lh3.googleusercontent.com/a/${userId}`,
            `https://lh3.googleusercontent.com/a-/${userId}`
          ]
          
          console.log('Trying profile picture URL patterns as fallback')
        
          // Try to fetch a profile picture URL that actually exists
          for (const url of possibleProfileUrls) {
            try {
              // Use AbortController for timeout
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 3000)
              
              const response = await fetch(url, { 
                method: 'HEAD', 
                signal: controller.signal 
              })
              clearTimeout(timeoutId)
              
              console.log(`Testing URL ${url}: ${response.status} ${response.statusText}`)
              
              if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
                profilePicture = url
                console.log('Found working profile picture URL:', url)
                break
              }
            } catch (error) {
              console.log(`URL ${url} failed:`, error instanceof Error ? error.message : 'Unknown error')
              continue
            }
          }
        }
         
       } catch (error) {
         console.log('Error fetching Google profile picture:', error)
       }

      const userInfo: UserInfo = {
        email: email,
        name: email.split('@')[0], // Use email username as display name
        picture: profilePicture, // Will be undefined if we couldn't fetch it, triggering initials fallback
        sub: userId
      }

      return NextResponse.json({
        success: true,
        user: userInfo,
        authenticated: true,
        method: 'cloud-iam',
        profilePictureMethod: profilePicture ? 'google-url-pattern' : 'fallback-to-initials'
      })
    }

    // Method 2: Check for OAuth cookies (if using Google OAuth)
    const googleUserCookie = request.cookies.get('google_user_info')
    const googleTokenCookie = request.cookies.get('google_access_token')
    
    if (googleUserCookie && googleTokenCookie) {
      try {
        const profile = JSON.parse(googleUserCookie.value)
        
        return NextResponse.json({
          success: true,
          user: {
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
            sub: profile.id
          },
          authenticated: true,
          method: 'oauth-cookie'
        })
      } catch (error) {
        console.error('Failed to parse OAuth cookie:', error)
      }
    }

    // Method 3: Check for OAuth token in Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // Verify with Google's tokeninfo endpoint
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`)
        
        if (response.ok) {
          const tokenInfo = await response.json()
          
          // Get user profile from Google
          const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (profileResponse.ok) {
            const profile = await profileResponse.json()
            
            return NextResponse.json({
              success: true,
              user: {
                name: profile.name,
                email: profile.email,
                picture: profile.picture,
                sub: profile.id
              },
              authenticated: true,
              method: 'oauth-bearer'
            })
          }
        }
      } catch (error) {
        console.error('OAuth token verification failed:', error)
      }
    }

    // Method 4: Development mode fallback
    if (process.env.NODE_ENV === 'development') {
      // Return a mock user for development without external image URLs
      const mockUser: UserInfo = {
        name: 'Developer User',
        email: 'developer@example.com',
        picture: undefined, // Let frontend generate initials-based avatar
        sub: 'dev-user-123'
      }

      return NextResponse.json({
        success: true,
        user: mockUser,
        authenticated: true,
        method: 'development'
      })
    }

    // No authentication found
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null,
      message: 'No authentication found',
      instructions: {
        cloudRun: 'For Cloud Run, ensure IAM authentication is configured',
        oauth: 'For OAuth, visit /api/auth/google?action=login to get authentication URL',
        development: 'Development mode provides mock user data'
      }
    })

  } catch (error) {
    console.error('User API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get user information',
      authenticated: false
    }, { status: 500 })
  }
} 