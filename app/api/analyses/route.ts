import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      brandName: searchParams.get('brandName') || undefined,
      category: searchParams.get('category') || undefined,
      clientName: searchParams.get('clientName') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }
    
    const limit = parseInt(searchParams.get('limit') || '50')
    
    console.log('📊 Fetching analysis history with filters:', filters)
    
    const bigQueryService = getBigQueryService()
    const analyses = await bigQueryService.getAnalyses(filters, limit)
    
    return NextResponse.json({
      success: true,
      data: analyses,
      total: analyses.length
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch analysis history:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis history',
      data: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brandName } = body
    
    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }
    
    console.log(`🔍 Fetching latest analysis for ${brandName}`)
    
    const bigQueryService = getBigQueryService()
    const analysis = await bigQueryService.getAnalysisByBrand(brandName)
    
    if (analysis) {
      // Parse the analysis JSON if it's a string
      let parsedAnalysis
      try {
        parsedAnalysis = JSON.parse(analysis.analysis)
      } catch (e) {
        parsedAnalysis = analysis.analysis
      }
      
      return NextResponse.json({
        success: true,
        data: {
          ...analysis,
          parsedAnalysis
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `No analysis found for ${brandName}`
      })
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch analysis by brand:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis'
    }, { status: 500 })
  }
} 