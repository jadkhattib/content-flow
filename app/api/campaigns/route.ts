import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '@/lib/bigquery'

interface CampaignData {
  campaign_id: string
  brand_name: string
  campaign_name: string
  campaign_data: string  // JSON string for BigQuery
  created_at: string
  mode: 'auto' | 'guided'
  status: 'draft' | 'active' | 'completed'
}

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

// Helper function to ensure campaigns table exists
async function ensureCampaignsTable() {
  try {
    const bigQueryService = getBigQueryService()
    await bigQueryService.createCampaignsTableIfNotExists()
  } catch (error) {
    console.error('Failed to ensure campaigns table exists:', error)
    throw error
  }
}

// GET - Fetch saved campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brandName')
    
    // Ensure campaigns table exists before querying
    await ensureCampaignsTable()
    
    let query = `
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
      ORDER BY created_at DESC
      LIMIT @limit
      OFFSET @offset
    `
    
    const queryParams: any[] = []
    
    if (brandName) {
      query += ` WHERE brand_name = ?`
      queryParams.push(brandName)
    }
    
    query += ` ORDER BY created_at DESC`
    
    // Use the proper BigQuery service with credentials
    const bigquery = await getBigQueryClient()
    
    const [rows] = await bigquery.query({
      query,
      params: queryParams,
    })

    return NextResponse.json({
      success: true,
      campaigns: rows
    })

  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaigns'
    const isAuthError = errorMessage.includes('authentication') || errorMessage.includes('credentials') || errorMessage.includes('invalid_grant')
    
    return NextResponse.json(
      { 
        success: false, 
        error: isAuthError ? 'BigQuery authentication failed. Please check your service account configuration.' : errorMessage,
        campaigns: []
      },
      { status: isAuthError ? 401 : 500 }
    )
  }
}

// POST - Save a new campaign
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/campaigns - Starting campaign save...')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    
    const { 
      brandName, 
      campaignName, 
      campaignData, 
      mode = 'auto',
      status = 'draft' 
    } = body

    if (!brandName || !campaignName || !campaignData) {
      console.log('❌ Missing required fields')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: brandName, campaignName, campaignData' 
        },
        { status: 400 }
      )
    }

    console.log('📝 Ensuring campaigns table exists...')
    // Ensure campaigns table exists before inserting
    await ensureCampaignsTable()
    console.log('✅ Campaigns table check completed')

    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()

    const row: CampaignData = {
      campaign_id: campaignId,
      brand_name: brandName,
      campaign_name: campaignName,
      campaign_data: JSON.stringify(campaignData),
      created_at: timestamp,
      mode: mode,
      status: status
    }

    console.log('📝 Preparing to insert campaign:', { campaignId, brandName, campaignName })

    // Use the proper BigQuery service with credentials
    const bigquery = await getBigQueryClient()
    const dataset = bigquery.dataset('content_df')
    const campaignsTable = dataset.table('campaigns')

    console.log('📝 Inserting campaign into BigQuery...')
    await campaignsTable.insert([row])
    console.log('✅ Campaign inserted successfully')

    return NextResponse.json({
      success: true,
      message: 'Campaign saved successfully',
      campaignId: campaignId
    })

  } catch (error: any) {
    console.error('❌ Failed to save campaign - Full error:', error)
    console.error('❌ Error name:', error?.name)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)
    
    // Handle BigQuery PartialFailureError specifically
    if (error?.name === 'PartialFailureError' && error?.errors) {
      console.error('❌ BigQuery PartialFailureError details:', error.errors)
      for (const err of error.errors) {
        console.error('❌ BigQuery error:', err)
        if (err.errors) {
          for (const subErr of err.errors) {
            console.error('❌ BigQuery sub-error:', subErr)
          }
        }
      }
    }
    
    // More detailed error information
    let errorMessage = 'Unknown error occurred'
    let statusCode = 500
    
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('❌ Error instanceof Error:', errorMessage)
    } else if (typeof error === 'string') {
      errorMessage = error
      console.error('❌ Error is string:', errorMessage)
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
      console.error('❌ Error is object:', errorMessage)
    }
    
    // Handle BigQuery specific errors
    if (error?.name === 'PartialFailureError') {
      errorMessage = 'BigQuery data validation failed. Check the data format and field types.'
      if (error?.errors?.[0]?.errors?.[0]?.message) {
        errorMessage += ` Details: ${error.errors[0].errors[0].message}`
      }
    }
    
    // Check if it's an authentication error
    const isAuthError = errorMessage.includes('authentication') || 
                       errorMessage.includes('credentials') || 
                       errorMessage.includes('invalid_grant') ||
                       errorMessage.includes('Could not load the default credentials')
    
    if (isAuthError) {
      statusCode = 401
      errorMessage = 'BigQuery authentication failed. Please check your service account configuration.'
    }
    
    console.error('❌ Final error response:', { success: false, error: errorMessage, statusCode })
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        debug: {
          originalError: error?.toString(),
          errorType: typeof error,
          errorName: error?.name,
          bigqueryErrors: error?.errors
        }
      },
      { status: statusCode }
    )
  }
}

// DELETE - Delete a campaign
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const query = `
      DELETE FROM \`discovery-flow.content_df.campaigns\`
      WHERE campaign_id = ?
    `

    // Use the proper BigQuery service with credentials
    const bigquery = await getBigQueryClient()

    await bigquery.query({
      query,
      params: [campaignId],
    })

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete campaign:', error)
    
    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete campaign'
    const isAuthError = errorMessage.includes('authentication') || errorMessage.includes('credentials') || errorMessage.includes('invalid_grant')
    
    return NextResponse.json(
      { 
        success: false, 
        error: isAuthError ? 'BigQuery authentication failed. Please check your service account configuration.' : errorMessage
      },
      { status: isAuthError ? 401 : 500 }
    )
  }
} 