import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getBigQueryService } from '@/lib/bigquery'

// Export maxDuration for this API route (Next.js 14 way to extend timeout)
export const maxDuration = 7200 // 2 hours (7200 seconds)

// Lazy-load OpenAI client to avoid build-time errors
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  return new OpenAI({
    apiKey,
})
}

interface GuidedAnswers {
  objectives: string
  homerun: string
  thoughts: string
}

interface CampaignRequest {
  mode: 'auto' | 'guided'
  brandName?: string  // Add brandName parameter
  guidedAnswers?: GuidedAnswers
}

// Helper function to extract JSON from OpenAI response with multiple parsing strategies
function extractJSONFromResponse(responseText: string): any {
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Empty or invalid response from OpenAI')
  }

  console.log('🔍 Attempting to parse OpenAI response...')
  
  // Strategy 1: Direct JSON parsing
  try {
    const parsed = JSON.parse(responseText)
    console.log('✅ Direct JSON parsing successful')
    return parsed
  } catch (e) {
    console.log('❌ Direct JSON parsing failed, trying extraction methods...')
  }

  // Strategy 2: Extract from code blocks
  const codeBlockPatterns = [
    /```json\s*([\s\S]*?)\s*```/i,
    /```\s*([\s\S]*?)\s*```/,
    /`([\s\S]*?)`/
  ]

  for (const pattern of codeBlockPatterns) {
    const match = responseText.match(pattern)
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim())
        console.log('✅ Code block extraction successful')
        return parsed
      } catch (e) {
        continue
      }
    }
  }

  // Strategy 3: Find JSON objects in text
  const jsonObjectPattern = /\{[\s\S]*\}/
  const match = responseText.match(jsonObjectPattern)
  if (match) {
    try {
      const parsed = JSON.parse(match[0])
      console.log('✅ JSON object extraction successful')
      return parsed
    } catch (e) {
      console.log('❌ JSON object extraction failed')
    }
  }

  // Strategy 4: Clean up common formatting issues and retry
  let cleanedText = responseText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/^\s*[\r\n]+/gm, '') // Remove empty lines
    .trim()

  try {
    const parsed = JSON.parse(cleanedText)
    console.log('✅ Cleaned text parsing successful')
    return parsed
  } catch (e) {
    console.error('❌ All JSON parsing strategies failed')
    throw new Error('Failed to extract valid JSON from OpenAI response')
  }
}

// Simplified and more robust brand data extraction
function extractBrandData(clientData: any, requestedBrandName?: string): { brandName: string; category: string } {
  let brandName = 'Your Brand'
  let category = 'Consumer Goods'

  if (!clientData) {
    console.log('⚠️ No client data available')
    return { brandName: requestedBrandName || brandName, category }
  }

  try {
    // Try multiple paths to get brand name
    const brandPaths = [
      'brandName',
      'brand_name', 
      'structuredAnalysis.brandName',
      'structuredAnalysis.brand_name',
      'executiveSnapshot.brandName',
      'executiveSnapshot.brand_name'
    ]

    for (const path of brandPaths) {
      const value = getNestedValue(clientData, path)
      if (value && typeof value === 'string' && value.trim() !== '') {
        brandName = value.trim()
        console.log(`✅ Found brand name from ${path}: "${brandName}"`)
        break
      }
    }

    // Try multiple paths to get category
    const categoryPaths = [
      'category',
      'structuredAnalysis.category',
      'executiveSnapshot.category'
    ]

    for (const path of categoryPaths) {
      const value = getNestedValue(clientData, path)
      if (value && typeof value === 'string' && value.trim() !== '') {
        category = value.trim()
        console.log(`✅ Found category from ${path}: "${category}"`)
        break
      }
    }

  } catch (error) {
    console.error('❌ Error extracting brand data:', error)
  }

  // Use requested brand name if extraction failed
  if (brandName === 'Your Brand' && requestedBrandName && requestedBrandName !== 'Unknown Brand') {
    brandName = requestedBrandName
  }

  // Clean up brand name
  if (brandName !== 'Your Brand') {
    brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1).replace(/['"]/g, '')
  }

  return { brandName, category }
}

// Helper function to safely get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Retry wrapper for OpenAI API calls
async function callOpenAIWithRetry(openai: OpenAI, request: any, maxRetries: number = 2): Promise<any> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 OpenAI API attempt ${attempt}/${maxRetries}`)
      const startTime = Date.now()
      
      const completion = await openai.chat.completions.create(request)
      
      const endTime = Date.now()
      console.log(`⏱️ OpenAI API call completed in ${(endTime - startTime) / 1000}s`)
      
      return completion
    } catch (error) {
      lastError = error as Error
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        const delay = attempt * 2000 // 2s, 4s delays
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('OpenAI API failed after all retries')
}

export async function POST(request: NextRequest) {
    // Better JSON parsing with error handling
    let body: CampaignRequest
    try {
      const rawBody = await request.text()
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Empty request body')
      }
      body = JSON.parse(rawBody)
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        mode: 'error'
      }, { status: 400 })
    }
    
  const { mode, brandName, guidedAnswers } = body

  // Add comprehensive logging for debugging
  console.log('🔍 CAMPAIGN CREATION DEBUG INFO:')
  console.log(`📝 Mode: ${mode}`)
  console.log(`🏷️ Brand Name from request: "${brandName}"`)

  try {
    // Get client analysis from BigQuery with improved error handling
    let clientData = null
    
    try {
      const bigQueryService = getBigQueryService()
    
    if (brandName && brandName !== 'Unknown Brand' && brandName.trim() !== '') {
      console.log(`🔍 Fetching analysis for specific brand: "${brandName}"`)
      
        // Get analyses for this brand
        const brandAnalyses = await bigQueryService.getAnalyses({ brandName }, 5)
      console.log(`📊 Found ${brandAnalyses.length} analyses for brand search`)
      
      if (brandAnalyses.length > 0) {
          // Use the most recent valid analysis
        for (const analysis of brandAnalyses) {
          try {
              const parsed = JSON.parse(analysis.analysis)
              clientData = parsed
              console.log(`✅ Using analysis from: ${analysis.client_name}`)
              break
            } catch (parseError) {
              console.warn('⚠️ Could not parse analysis, trying next...')
              continue
            }
          }
        }
    }
    
    // Fallback to latest analysis if no specific brand found
    if (!clientData) {
      console.log('🔄 FALLING BACK to latest analysis')
      const recentAnalyses = await bigQueryService.getAnalyses({}, 1)
      
    if (recentAnalyses.length > 0) {
        try {
      clientData = JSON.parse(recentAnalyses[0].analysis)
            console.log(`✅ Using fallback analysis from: ${recentAnalyses[0].client_name}`)
        } catch (parseError) {
          console.error('❌ Failed to parse latest analysis:', parseError)
        }
        }
      }
    } catch (bigQueryError) {
      console.error('❌ BigQuery error (will continue with generic campaign):', bigQueryError)
      // Continue without client data - will create generic campaign
    }

    // Extract brand data with improved logic
    const { brandName: extractedBrandName, category } = extractBrandData(clientData, brandName)
    
    console.log(`🎯 FINAL BRAND DATA:`)
    console.log(`  🏷️ Brand: "${extractedBrandName}"`)
    console.log(`  📂 Category: "${category}"`)

    // Build comprehensive prompt for OpenAI
    const systemPrompt = `You are an expert marketing strategist and campaign creator. Create a comprehensive, actionable marketing campaign.

CRITICAL: You MUST respond with a valid JSON object containing ALL required sections. Do not include any text before or after the JSON.

Required JSON structure:
{
  "campaignSummary": {
    "overview": "string",
    "rationale": "string", 
    "approach": "string"
  },
  "businessChallenge": {
    "objectives": ["array of strings"],
    "challenges": ["array of strings"],
    "kpis": ["array of strings"]
  },
  "audience": {
    "primary": {
      "demographics": "string",
      "psychographics": "string",
      "behaviors": "string"
    },
    "secondary": {
      "demographics": "string", 
      "psychographics": "string",
      "behaviors": "string"
    }
  },
  "category": {
    "landscape": "string",
    "competitors": ["array of strings"],
    "trends": ["array of strings"],
    "opportunities": ["array of strings"]
  },
  "productBrand": {
    "positioning": "string",
    "uniqueValue": "string",
    "brandPersonality": ["array of strings"],
    "coreMessage": "string"
  },
  "culture": {
    "culturalMoments": ["array of strings"],
    "socialTrends": ["array of strings"], 
    "relevantMovements": ["array of strings"],
    "timelyOpportunities": ["array of strings"]
  },
  "strategy": {
    "approach": "string",
    "channels": ["array of strings"],
    "timeline": "string",
    "phases": [
      {
        "phase": "string",
        "duration": "string", 
        "focus": "string",
        "tactics": ["array of strings"]
      }
    ]
  },
  "propositionPlatform": {
    "bigIdea": "string",
    "coreMessage": "string",
    "supportingMessages": ["array of strings"],
    "tonalAttributes": ["array of strings"]
  },
  "keyDetails": {
    "budget": "string",
    "timeline": "string",
    "team": ["array of strings"],
    "resources": ["array of strings"],
    "constraints": ["array of strings"]
  },
  "ambition": {
    "primaryGoal": "string", 
    "successMetrics": ["array of strings"],
    "longTermVision": "string",
    "competitiveAdvantage": "string"
  },
  "thoughtStarters": {
    "creativeDirections": ["array of strings"],
    "activationIdeas": ["array of strings"],
    "partnershipOpportunities": ["array of strings"],
    "innovativeApproaches": ["array of strings"]
  },
  "keyDeliverables": {
    "immediate": ["array of strings"],
    "shortTerm": ["array of strings"],
    "longTerm": ["array of strings"],
    "measurables": ["array of strings"]
  }
}

Make all content specific, actionable, and realistic. Include specific budgets, timelines, and metrics.`

    let userPrompt = ''
    
    if (mode === 'auto') {
      userPrompt = `Create a comprehensive marketing campaign for ${extractedBrandName} in the ${category} category.

${clientData ? `Use this analysis data for insights:\n${JSON.stringify(clientData, null, 2)}` : 'Create a strategic campaign with industry best practices.'}

Focus on data-driven strategies and measurable outcomes.`
    } else {
      userPrompt = `Create a comprehensive marketing campaign for ${extractedBrandName} based on these user objectives:

OBJECTIVES: ${guidedAnswers?.objectives || 'Not specified'}
SUCCESS DEFINITION: ${guidedAnswers?.homerun || 'Not specified'}
ADDITIONAL CONTEXT: ${guidedAnswers?.thoughts || 'Not specified'}

${clientData ? `Analysis data available:\n${JSON.stringify(clientData, null, 2)}` : 'Use user inputs as primary guidance.'}

Address the user's specific goals and success criteria.`
    }

    const model = "o4-mini-2025-04-16"
    const maxTokens = 16000 // Conservative but sufficient for comprehensive campaigns
    
    console.log(`🤖 MODEL CONFIGURATION:`)
    console.log(`  🎯 Model: ${model}`)
    console.log(`  ✍️ Max completion tokens: ${maxTokens}`)

    // Call OpenAI with retry logic
    const openai = getOpenAIClient()
    
    const completion = await callOpenAIWithRetry(openai, {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_completion_tokens: maxTokens,
    })

    const campaignText = completion.choices[0]?.message?.content

    if (!campaignText) {
      throw new Error('No campaign content generated by AI')
    }

    console.log(`📏 Generated campaign text length: ${campaignText.length} characters`)

    // Parse the JSON response with improved error handling
    let campaign
    try {
      campaign = extractJSONFromResponse(campaignText)
      console.log('✅ Campaign JSON parsed successfully')
      
      // Basic validation
      if (!campaign || typeof campaign !== 'object') {
        throw new Error('Parsed result is not a valid object')
      }
      
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError)
      console.error('Response text (first 1000 chars):', campaignText.substring(0, 1000))
      
      // Create fallback campaign instead of failing
      campaign = createFallbackCampaign(clientData, guidedAnswers, extractedBrandName, category)
      console.log('🔄 Using fallback campaign due to parsing error')
    }

    // Validate and enhance campaign
    campaign = validateAndEnhanceCampaign(campaign, extractedBrandName, category)

    console.log(`🎉 CAMPAIGN CREATION COMPLETED:`)
    console.log(`  🏷️ Brand: "${extractedBrandName}"`)
    console.log(`  🎯 Mode: ${mode}`)
    console.log(`  ⚡ Success: true`)

    return NextResponse.json({
      success: true,
      campaign,
      mode,
      brandName: extractedBrandName,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ CAMPAIGN CREATION ERROR:', error)
    
    let errorMessage = 'Campaign generation failed'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('🔍 ERROR DETAILS:', {
        message: error.message,
        stack: error.stack
      })
    }
    
    // Create a high-quality fallback campaign
    const { brandName: fallbackBrandName, category: fallbackCategory } = extractBrandData(null, brandName)
    const fallbackCampaign = createFallbackCampaign(null, guidedAnswers, fallbackBrandName, fallbackCategory)
    
    console.log(`⚠️ RETURNING FALLBACK CAMPAIGN for error recovery`)
    
    return NextResponse.json({
      success: false,
      campaign: fallbackCampaign,
      mode: 'fallback',
      error: errorMessage,
      brandName: fallbackBrandName,
      timestamp: new Date().toISOString()
    }, { status: 200 }) // Return 200 so frontend can still use the fallback
  }
}

function createFallbackCampaign(clientData: any, guidedAnswers: GuidedAnswers | undefined, brandName: string = 'Your Brand', category: string = 'Consumer Goods') {
  console.log(`🔄 Creating fallback campaign for: ${brandName} in ${category}`)
  
  return {
    campaignSummary: {
      overview: `This comprehensive ${brandName} campaign focuses on driving brand awareness, customer acquisition, and market share growth through an integrated omnichannel approach.`,
      rationale: `${brandName} needs to strengthen its market position in the competitive ${category} landscape while building deeper customer relationships and sustainable growth.`,
      approach: `We'll execute a data-driven, multi-phase campaign combining digital marketing, content creation, influencer partnerships, and strategic PR to achieve maximum impact and measurable ROI.`
    },
    businessChallenge: {
      objectives: guidedAnswers?.objectives ? [guidedAnswers.objectives] : [
        `Increase ${brandName} brand awareness by 35% in target markets`,
        'Drive customer acquisition through digital channels',
        'Enhance brand perception and emotional connection',
        'Boost market share in competitive landscape'
      ],
      challenges: [
        'Increasing competition in digital space',
        'Evolving consumer preferences and behaviors',
        'Attribution and measurement complexity',
        'Budget allocation across multiple channels'
      ],
      kpis: [
        'Brand Awareness: +35% unaided recall',
        'Customer Acquisition: 25% increase in new customers',
        'Engagement Rate: +40% across social platforms',
        'Conversion Rate: +20% from digital touchpoints'
      ]
    },
    audience: {
      primary: {
        demographics: 'Adults 25-45, household income £50K+, urban/suburban, college-educated',
        psychographics: 'Value-conscious, digitally savvy, quality-focused, socially aware consumers',
        behaviors: 'Active on social media, research before purchasing, influenced by peer reviews and brand values'
      },
      secondary: {
        demographics: 'Young professionals 22-35, diverse backgrounds, tech-enabled lifestyle',
        psychographics: 'Innovation-seeking, sustainability-minded, experience-driven',
        behaviors: 'Mobile-first, share brand experiences, advocate for brands that align with personal values'
      }
    },
    category: {
      landscape: `The ${category} market is highly competitive with both established players and emerging disruptors`,
      competitors: ['Market Leader A', 'Challenger Brand B', 'Emerging Player C'],
      trends: ['Sustainability focus', 'Digital transformation', 'Personalization', 'Direct-to-consumer growth'],
      opportunities: ['Untapped market segments', 'New distribution channels', 'Technology integration', 'Partnership potential']
    },
    productBrand: {
      positioning: `${brandName} delivers premium quality and authentic value that enhances everyday life`,
      uniqueValue: 'Combination of innovation, quality, and customer-centric approach',
      brandPersonality: ['Authentic', 'Innovative', 'Reliable', 'Customer-focused'],
      coreMessage: `${brandName} - Where quality meets innovation for real life`
    },
    culture: {
      culturalMoments: ['Sustainability awareness month', 'Digital wellness trends', 'Community support movements'],
      socialTrends: ['Authentic brand storytelling', 'User-generated content', 'Social commerce growth'],
      relevantMovements: ['Environmental consciousness', 'Local community support', 'Digital accessibility'],
      timelyOpportunities: ['Q1 New Year motivation', 'Spring renewal season', 'Back-to-school period', 'Holiday shopping']
    },
    strategy: {
      approach: 'Integrated omnichannel campaign focusing on authentic storytelling and community building',
      channels: ['Social Media', 'Digital Advertising', 'Content Marketing', 'Influencer Partnerships', 'Email Marketing', 'PR'],
      timeline: '6-month campaign with quarterly optimization cycles',
      phases: [
        {
          phase: 'Awareness & Foundation',
          duration: '0-8 weeks',
          focus: 'Brand awareness and audience education',
          tactics: ['Brand storytelling', 'Content creation', 'Social media launch', 'PR outreach']
        },
        {
          phase: 'Engagement & Consideration',
          duration: '8-16 weeks',
          focus: 'Drive engagement and consideration',
          tactics: ['Influencer partnerships', 'User-generated content', 'Retargeting campaigns', 'Email nurturing']
        },
        {
          phase: 'Conversion & Advocacy',
          duration: '16-24 weeks',
          focus: 'Convert prospects and build advocacy',
          tactics: ['Conversion optimization', 'Customer testimonials', 'Referral programs', 'Community building']
        }
      ]
    },
    propositionPlatform: {
      bigIdea: `"Real Solutions for Real Life" - ${brandName} understands and solves genuine customer challenges`,
      coreMessage: `${brandName} delivers practical innovation that makes life better`,
      supportingMessages: [
        'Quality you can trust in every interaction',
        'Innovation that serves real needs',
        'Community-focused brand values',
        'Sustainable practices for future generations'
      ],
      tonalAttributes: ['Authentic', 'Confident', 'Approachable', 'Solution-oriented']
    },
    keyDetails: {
      budget: '£500K - £1M total campaign investment',
      timeline: '6 months with 3 optimization checkpoints',
      team: ['Campaign Manager', 'Creative Director', 'Digital Specialist', 'Data Analyst', 'Content Creator'],
      resources: ['Creative agency partnership', 'Influencer network', 'Content production capabilities', 'Analytics platform'],
      constraints: ['Seasonal market fluctuations', 'Competitive response time', 'Regulatory compliance requirements']
    },
    ambition: {
      primaryGoal: guidedAnswers?.homerun || `Establish ${brandName} as the preferred choice in the ${category} category while building sustainable customer relationships`,
      successMetrics: [
        'Brand awareness increase of 35%',
        'Customer acquisition growth of 25%',
        'Social engagement rate improvement of 40%',
        'Customer lifetime value increase of 15%'
      ],
      longTermVision: `Become the most trusted and innovative brand in ${category}, known for customer-centricity and sustainable practices`,
      competitiveAdvantage: 'Deep customer understanding combined with agile innovation and authentic brand storytelling'
    },
    thoughtStarters: {
      creativeDirections: [
        'Real customer stories showcasing brand impact',
        'Behind-the-scenes content demonstrating brand values',
        'Interactive social campaigns encouraging participation',
        'Collaborative content with complementary brands'
      ],
      activationIdeas: [
        'Limited-time product experiences in key markets',
        'Social media challenges with branded hashtags',
        'Partnership activations with local communities',
        'Exclusive member benefits and early access programs'
      ],
      partnershipOpportunities: [
        'Complementary brand collaborations',
        'Influencer and creator partnerships',
        'Non-profit organization alliances',
        'Retail and distribution partnerships'
      ],
      innovativeApproaches: [
        'AI-powered personalization at scale',
        'Augmented reality product experiences',
        'Sustainable packaging initiatives',
        'Community-driven product development'
      ]
    },
    keyDeliverables: {
      immediate: [
        'Campaign strategy document and creative brief',
        'Brand messaging framework and content guidelines',
        'Channel-specific tactical plans',
        'Measurement and analytics setup'
      ],
      shortTerm: [
        'Creative asset development and production',
        'Campaign launch across all channels',
        'Influencer partnership execution',
        'Performance monitoring and optimization'
      ],
      longTerm: [
        'Comprehensive campaign performance analysis',
        'Customer journey optimization recommendations',
        'Sustained brand community development',
        'Strategic recommendations for next phase'
      ],
      measurables: [
        'Weekly performance dashboards',
        'Monthly strategic reviews and optimizations',
        'Quarterly business impact assessments',
        'Annual brand health tracking'
      ]
    }
  }
}

// Simplified campaign validation 
function validateAndEnhanceCampaign(campaign: any, brandName: string, category: string) {
  // Ensure basic structure exists
  const requiredSections = [
    'campaignSummary', 'businessChallenge', 'audience', 'category', 
    'productBrand', 'culture', 'strategy', 'propositionPlatform',
    'keyDetails', 'ambition', 'thoughtStarters', 'keyDeliverables'
  ]

  for (const section of requiredSections) {
    if (!campaign[section] || typeof campaign[section] !== 'object') {
      console.log(`⚠️ Missing or invalid section: ${section}, using fallback`)
      const fallback = createFallbackCampaign(null, undefined, brandName, category)
      campaign[section] = (fallback as any)[section]
      }
    }
    
  // Ensure arrays are actually arrays
  const arrayFields = [
    'businessChallenge.objectives', 'businessChallenge.challenges', 'businessChallenge.kpis',
    'category.competitors', 'category.trends', 'category.opportunities',
    'productBrand.brandPersonality', 'culture.culturalMoments', 'culture.socialTrends',
    'culture.relevantMovements', 'culture.timelyOpportunities', 'strategy.channels',
    'strategy.phases', 'propositionPlatform.supportingMessages', 'propositionPlatform.tonalAttributes',
    'keyDetails.team', 'keyDetails.resources', 'keyDetails.constraints',
    'ambition.successMetrics', 'thoughtStarters.creativeDirections', 'thoughtStarters.activationIdeas',
    'thoughtStarters.partnershipOpportunities', 'thoughtStarters.innovativeApproaches',
    'keyDeliverables.immediate', 'keyDeliverables.shortTerm', 'keyDeliverables.longTerm', 'keyDeliverables.measurables'
  ]
  
  for (const fieldPath of arrayFields) {
    const value = getNestedValue(campaign, fieldPath)
    if (!Array.isArray(value)) {
      console.log(`⚠️ Field ${fieldPath} is not an array, fixing...`)
      setNestedValue(campaign, fieldPath, [])
    }
  }
  
  return campaign
  }

// Helper to set nested values
function setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.')
  let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    
  current[keys[keys.length - 1]] = value
} 