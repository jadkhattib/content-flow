import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '@/lib/bigquery'

// Helper function to get BigQuery client with proper error handling
async function getBigQueryClient() {
  try {
    const bigQueryService = getBigQueryService()
    return bigQueryService.getBigQueryClient()
  } catch (error) {
    console.error('BigQuery authentication failed:', error)
    throw new Error('BigQuery service account not configured. Please check your GOOGLE_APPLICATION_CREDENTIALS_JSON.')
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    console.log(`🔍 Fetching campaign with ID: ${params.campaignId}`)
    
    const query = `
      SELECT 
        id,
        brand_name,
        campaign_title,
        campaign_description,
        target_audience,
        key_messages,
        channels,
        budget_range,
        timeline,
        success_metrics,
        additional_notes,
        status,
        created_at,
        updated_at
      FROM \`discovery-flow.content_df.campaigns\`
      WHERE id = @campaignId
    `
    
    // Use the proper BigQuery service with credentials
    const bigquery = await getBigQueryClient()
    
    const [rows] = await bigquery.query({
      query: query,
      params: [params.campaignId]
    })
    
    if (rows.length === 0) {
      console.log(`❌ Campaign not found: ${params.campaignId}`)
      return NextResponse.json({
        success: false,
        error: 'Campaign not found'
      }, { status: 404 })
    }
    
    const campaign = rows[0]
    
    // Parse campaign_data if it's a string
    if (typeof campaign.campaign_data === 'string') {
      try {
        campaign.campaign_data = JSON.parse(campaign.campaign_data)
      } catch (parseError) {
        console.error('Failed to parse campaign_data:', parseError)
        // Keep as string if parsing fails
      }
    }
    
    console.log(`✅ Campaign fetched successfully: ${campaign.campaign_name}`)
    
    return NextResponse.json({
      success: true,
      campaign: campaign
    })
    
  } catch (error) {
    console.error('❌ Failed to fetch campaign:', error)
    
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaign'
    const isAuthError = errorMessage.includes('authentication') || errorMessage.includes('credentials') || errorMessage.includes('invalid_grant')
    
    return NextResponse.json({
      success: false,
      error: isAuthError ? 'BigQuery authentication failed. Please check your service account configuration.' : errorMessage
    }, { status: isAuthError ? 401 : 500 })
  }
} 