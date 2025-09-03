import { NextRequest, NextResponse } from 'next/server'
import { getBigQueryService } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const type = searchParams.get('type') || 'brand' // 'brand' or 'market'

    const bq = getBigQueryService().getBigQueryClient()

    if (type === 'market') {
      // Fetch market overview from combined_marketoverview table
      const query = `
        SELECT ml_generate_text_result
        FROM \`discovery-flow.content_df.combined_marketoverview\`
        LIMIT 1
      `
      const [rows] = await bq.query({ query })

      if (!rows || rows.length === 0) {
        return NextResponse.json({ success: true, overview: null })
      }

      const row = rows[0] as any
      const result = row.ml_generate_text_result

      // Parse market overview result
      let tldr: string[] = []
      let paragraph = ''

      try {
        const resultObj = typeof result === 'string' ? JSON.parse(result) : result
        const text = resultObj?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (typeof text === 'string' && text.length > 0) {
          const fencedMatch = text.match(/```json[\s\S]*?\n([\s\S]*?)\n```/i)
          const jsonPayload = fencedMatch ? fencedMatch[1] : text
          try {
            const payload = JSON.parse(jsonPayload)
            // Handle different structure: tldr.bullet instead of just tldr
            if (Array.isArray(payload?.tldr?.bullet)) tldr = payload.tldr.bullet
            else if (Array.isArray(payload?.tldr)) tldr = payload.tldr
            if (typeof payload?.paragraph === 'string') paragraph = payload.paragraph
          } catch (e) {
            logger.warn('Failed to parse market overview JSON payload; attempting regex extraction')
          }
        }
      } catch (e) {
        logger.error('Error parsing market overview ml_generate_text_result:', e)
      }

      return NextResponse.json({ success: true, overview: { type: 'market', tldr, paragraph } })
    } else {
      // Existing brand overview logic
      if (!brand?.trim()) {
        return NextResponse.json({ success: false, error: 'Missing brand parameter' }, { status: 400 })
      }

      const query = `
        SELECT brand, ml_generate_text_result
        FROM \`discovery-flow.content_df.aioverviews\`
        WHERE LOWER(brand) = LOWER(@brand)
        LIMIT 1
      `
      const [rows] = await bq.query({ query, params: { brand: brand.trim() } })

      if (!rows || rows.length === 0) {
        return NextResponse.json({ success: true, overview: null })
      }

      const row = rows[0] as any
      const result = row.ml_generate_text_result

      let tldr: string[] = []
      let paragraph = ''

      try {
        const resultObj = typeof result === 'string' ? JSON.parse(result) : result
        const text = resultObj?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (typeof text === 'string' && text.length > 0) {
          const fencedMatch = text.match(/```json[\s\S]*?\n([\s\S]*?)\n```/i)
          const jsonPayload = fencedMatch ? fencedMatch[1] : text
          try {
            const payload = JSON.parse(jsonPayload)
            if (Array.isArray(payload?.tldr)) tldr = payload.tldr
            if (typeof payload?.paragraph === 'string') paragraph = payload.paragraph
          } catch (e) {
            logger.warn('Failed to parse brand overview JSON payload; attempting regex extraction')
          }
        }
      } catch (e) {
        logger.error('Error parsing brand overview ml_generate_text_result:', e)
      }

      return NextResponse.json({ success: true, overview: { brand: row.brand, tldr, paragraph } })
    }
  } catch (error) {
    logger.error('Failed to fetch overview:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch overview' }, { status: 500 })
  }
}


