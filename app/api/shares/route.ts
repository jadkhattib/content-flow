import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'
import { generateAnalysisSubdomain } from '../../../lib/domain'

// GET /api/shares - Get shares created by the current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }
    
    console.log(`📊 Fetching shares for user: ${userEmail}`)
    
    const bigQueryService = getBigQueryService()
    const shares = await bigQueryService.getSharesByUser(userEmail)
    
    return NextResponse.json({
      success: true,
      data: shares
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch user shares:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch shares'
    }, { status: 500 })
  }
}

// POST /api/shares - Create a new share
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysisId, sharedBy, sharedWith, brandName, expiresInDays } = body
    
    // Validate required fields
    if (!analysisId || !sharedBy || !sharedWith || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: analysisId, sharedBy, sharedWith, brandName' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sharedWith)) {
      return NextResponse.json(
        { error: 'Invalid email format for sharedWith' },
        { status: 400 }
      )
    }
    
    console.log(`🔗 Creating share: ${brandName} from ${sharedBy} to ${sharedWith}`)
    
    const bigQueryService = getBigQueryService()
    const shareId = await bigQueryService.createShare({
      analysisId,
      sharedBy,
      sharedWith,
      brandName,
      expiresInDays: expiresInDays || 30
    })
    
    // Generate the subdomain URL
    const host = request.headers.get('host') || 'localhost:3000'
    let baseDomain = host
    
    // Extract base domain for subdomain generation
    if (host.includes('.') && !host.includes('localhost')) {
      const parts = host.split('.')
      if (parts.length > 2) {
        // Remove subdomain if present (e.g., app.example.com -> example.com)
        baseDomain = parts.slice(-2).join('.')
      }
    }
    
    const shareUrl = generateAnalysisSubdomain(shareId, baseDomain)
    
    return NextResponse.json({
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresInDays: expiresInDays || 30
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to create share:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create share'
    }, { status: 500 })
  }
}

// DELETE /api/shares/[shareId] - Revoke a share (handled by dynamic route) 