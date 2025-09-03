import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../../lib/bigquery'

// GET /api/shares/[shareId] - Get a specific shared analysis
export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }
    
    const { shareId } = params
    
    console.log(`🔍 Fetching shared analysis: ${shareId} for user: ${userEmail}`)
    
    const bigQueryService = getBigQueryService()
    const result = await bigQueryService.getSharedAnalysis(shareId, userEmail)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Shared analysis not found or access denied' },
        { status: 404 }
      )
    }
    
    // Parse the analysis JSON if it's a string
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(result.analysis.analysis)
    } catch (e) {
      parsedAnalysis = result.analysis.analysis
    }
    
    return NextResponse.json({
      success: true,
      data: {
        analysis: {
          ...result.analysis,
          parsedAnalysis
        },
        shareInfo: result.shareInfo
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch shared analysis:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch shared analysis'
    }, { status: 500 })
  }
}

// DELETE /api/shares/[shareId] - Revoke a share
export async function DELETE(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }
    
    const { shareId } = params
    
    console.log(`🚫 Revoking share: ${shareId} by user: ${userEmail}`)
    
    const bigQueryService = getBigQueryService()
    const success = await bigQueryService.revokeShare(shareId, userEmail)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Share revoked successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to revoke share or share not found' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    console.error('❌ Failed to revoke share:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to revoke share'
    }, { status: 500 })
  }
} 