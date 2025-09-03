import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '../../../lib/bigquery'
import { logger } from '../../../lib/logger'

export const maxDuration = 300

interface MediaSpendRecord {
  advertiser: string
  brand_root: string
  brand_major: string
  brand_minor: string
  brand_leaf: string
  publisher: string
  date: string
  device: string
  direct_indirect: string
  category_level_1: string
  category_level_2: string
  category_level_3: string
  category_level_4: string
  category_level_5: string
  category_level_6: string
  category_level_7: string
  category_level_8: string
  region: string
  width: number
  height: number
  type: string
  first_seen: string
  last_seen: string
  video_duration: number
  creative_text: string
  landing_page: string
  link_to_creative: string
  creative_id: number
  sales_channel: string
  sales_channel_type: string
  purchase_channel: string
  purchase_channel_type: string
  gaming_franchise: string
  gaming_title: string
  spend_usd: number
  impressions: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brandName') || ''
    const startDate = searchParams.get('startDate') || '2023-01-01'
    const endDate = searchParams.get('endDate') || '2023-12-31'
    const limit = parseInt(searchParams.get('limit') || '1000')

    if (brandName) {
      logger.info('Fetching media spend data for brand:', brandName)
    } else {
      logger.info('Fetching all media spend data (no brand filter)')
    }

    const bigQueryService = getBigQueryService()
    
    // Build the query with optional brand filtering on Brand_Leaf
    let whereClause = 'WHERE DATE(Date) BETWEEN @startDate AND @endDate'
    const queryParams: any = {
      startDate,
      endDate,
      limit
    }

    if (brandName && brandName.trim() !== '') {
      whereClause += ` AND \`Brand _Leaf_\` = @brandName`
      queryParams.brandName = brandName
    }

    const query = `
      SELECT 
        Advertiser as advertiser,
        \`Brand Root\` as brand_root,
        \`Brand _Major_\` as brand_major,
        \`Brand _Minor_\` as brand_minor,
        \`Brand _Leaf_\` as brand_leaf,
        Publisher as publisher,
        Date as date,
        Device as device,
        Direct_Indirect as direct_indirect,
        \`Category Level 1\` as category_level_1,
        \`Category Level 2\` as category_level_2,
        \`Category Level 3\` as category_level_3,
        \`Category Level 4\` as category_level_4,
        \`Category Level 5\` as category_level_5,
        \`Category Level 6\` as category_level_6,
        \`Category Level 7\` as category_level_7,
        \`Category Level 8\` as category_level_8,
        Region as region,
        Width as width,
        Height as height,
        Type as type,
        \`First Seen\` as first_seen,
        \`Last Seen\` as last_seen,
        \`Video Duration\` as video_duration,
        \`Creative Text\` as creative_text,
        \`Landing Page\` as landing_page,
        \`Link to Creative\` as link_to_creative,
        \`Creative ID\` as creative_id,
        \`Sales Channel\` as sales_channel,
        \`Sales Channel Type\` as sales_channel_type,
        \`Purchase Channel\` as purchase_channel,
        \`Purchase Channel Type\` as purchase_channel_type,
        \`Gaming Franchise\` as gaming_franchise,
        \`Gaming Title\` as gaming_title,
        \`Spend _USD_\` as spend_usd,
        Impressions as impressions
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      ORDER BY Date DESC, \`Spend _USD_\` DESC
      LIMIT @limit
    `

    const [rows] = await bigQueryService.getBigQueryClient().query({
      query,
      params: queryParams,
    })

    // Also get summary statistics (with optional brand filter)
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_records,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(DISTINCT Publisher) as unique_publishers,
        COUNT(DISTINCT Device) as unique_devices,
        COUNT(DISTINCT Direct_Indirect) as channel_types
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
    `

    const [summaryRows] = await bigQueryService.getBigQueryClient().query({
      query: summaryQuery,
      params: queryParams,
    })

    // Get top publishers by spend (with optional brand filter)
    const topPublishersQuery = `
      SELECT 
        Publisher,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(*) as campaign_count
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      GROUP BY Publisher
      ORDER BY total_spend DESC
      LIMIT 10
    `

    const [topPublishersRows] = await bigQueryService.getBigQueryClient().query({
      query: topPublishersQuery,
      params: queryParams,
    })

    // Get spend by device (with optional brand filter)
    const deviceSpendQuery = `
      SELECT 
        Device,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(*) as campaign_count
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      GROUP BY Device
      ORDER BY total_spend DESC
    `

    const [deviceSpendRows] = await bigQueryService.getBigQueryClient().query({
      query: deviceSpendQuery,
      params: queryParams,
    })

    // Get spend by purchase channel type (with optional brand filter)
    const purchaseChannelSpendQuery = `
      SELECT 
        \`Purchase Channel Type\` as purchase_channel_type,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(*) as campaign_count
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      AND \`Purchase Channel Type\` IS NOT NULL
      AND \`Purchase Channel Type\` != ''
      GROUP BY \`Purchase Channel Type\`
      ORDER BY total_spend DESC
    `

    const [purchaseChannelSpendRows] = await bigQueryService.getBigQueryClient().query({
      query: purchaseChannelSpendQuery,
      params: queryParams,
    })

    // Get total spend per brand (across full date range; not affected by row LIMIT)
    const brandTotalsQuery = `
      SELECT 
        \`Brand _Leaf_\` as brand_leaf,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(*) as campaign_count
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      GROUP BY brand_leaf
      ORDER BY total_spend DESC
    `

    const [brandTotalsRows] = await bigQueryService.getBigQueryClient().query({
      query: brandTotalsQuery,
      params: queryParams,
    })

    // Get spend over time (monthly, with optional brand filter)
    const timeSeriesQuery = `
      SELECT 
        FORMAT_DATE('%Y-%m', Date) as month,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions,
        COUNT(*) as campaign_count
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      GROUP BY month
      ORDER BY month
    `

    const [timeSeriesRows] = await bigQueryService.getBigQueryClient().query({
      query: timeSeriesQuery,
      params: queryParams,
    })

    // Get brand-month spend over time (for multi-brand trends chart)
    const brandMonthlySpendQuery = `
      SELECT 
        \`Brand _Leaf_\` as brand_leaf,
        FORMAT_DATE('%Y-%m', Date) as month,
        SUM(\`Spend _USD_\`) as total_spend,
        SUM(Impressions) as total_impressions
      FROM \`discovery-flow.content_df.media_spend\`
      ${whereClause}
      GROUP BY brand_leaf, month
      ORDER BY month
    `

    const [brandMonthlySpendRows] = await bigQueryService.getBigQueryClient().query({
      query: brandMonthlySpendQuery,
      params: queryParams,
    })

    // Log sample data for debugging
    if (rows.length > 0) {
      logger.info('Sample record:', {
        advertiser: rows[0].advertiser,
        brand_root: rows[0].brand_root,
        brand_major: rows[0].brand_major,
        brand_leaf: rows[0].brand_leaf,
        spend: rows[0].spend_usd,
        impressions: rows[0].impressions
      })
    }

    if (brandName) {
      logger.info(`Retrieved ${rows.length} media spend records for brand: ${brandName}`)
    } else {
      logger.info(`Retrieved ${rows.length} media spend records (all brands)`)
    }

    return NextResponse.json({
      success: true,
      data: {
        records: rows as MediaSpendRecord[],
        summary: summaryRows[0] || {},
        topPublishers: topPublishersRows || [],
        deviceSpend: deviceSpendRows || [],
        purchaseChannelSpend: purchaseChannelSpendRows || [],
        timeSeries: timeSeriesRows || [],
        brandMonthlySpend: brandMonthlySpendRows || [],
        brandTotals: brandTotalsRows || []
      }
    })

  } catch (error) {
    logger.error('Failed to fetch media spend data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch media spend data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 