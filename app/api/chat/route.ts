import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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

interface ChatRequest {
  message: string
  brandData: {
    brandName: string
    category: string
    structuredAnalysis?: any
    fullAnalysis?: string
    socialData?: any
  }
  isInitialized: boolean
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

// Store conversation context in memory (in production, you'd use a database or Redis)
const conversationContexts = new Map<string, {
  systemContext: string
  initialized: boolean
  lastAccessed: number
}>()

// Clean up old conversations (older than 1 hour)
const cleanupOldConversations = () => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000)
  Array.from(conversationContexts.entries()).forEach(([key, context]) => {
    if (context.lastAccessed < oneHourAgo) {
      conversationContexts.delete(key)
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, brandData, isInitialized, conversationHistory } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Clean up old conversations periodically
    if (Math.random() < 0.1) { // 10% chance to clean up
      cleanupOldConversations()
    }

    // Create a unique key for this conversation
    const conversationKey = `${brandData.brandName}_${brandData.category}`

    let messages: any[] = []
    let storedContext = conversationContexts.get(conversationKey)

    // If this is the first message or we don't have stored context, create it
    if (!isInitialized || !storedContext) {
      const systemContext = createSystemContext(brandData)
      
      // Store the context for future use
      conversationContexts.set(conversationKey, {
        systemContext,
        initialized: true,
        lastAccessed: Date.now()
      })

      messages = [
        {
          role: 'system',
          content: systemContext
        },
        {
          role: 'user',
          content: message
        }
      ]
    } else {
      // Update last accessed time
      storedContext.lastAccessed = Date.now()
      
      // Use the stored system context and add conversation history if provided
      messages = [
        {
          role: 'system',
          content: storedContext.systemContext
        }
      ]

      // Add recent conversation history (last 10 messages to manage token usage)
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10)
        messages.push(...recentHistory)
      }

      // Add the current user message
      messages.push({
        role: 'user',
        content: message
      })
    }

    // Use GPT-4o with optimized settings for conversation and large context
    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response generated')
    }

    return NextResponse.json({
      reply: assistantMessage,
      success: true,
      conversationKey // Return the key for client-side reference if needed
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        reply: 'I apologize, but I encountered an error. Please try again.'
      },
      { status: 500 }
    )
  }
}

function createSystemContext(brandData: any): string {
  const { brandName, category, structuredAnalysis, fullAnalysis, socialData } = brandData

  let context = `You are an expert brand analyst with comprehensive knowledge about ${brandName}, a company in the ${category} industry. You have access to detailed analysis data and should answer questions naturally and helpfully.

BRAND: ${brandName}
CATEGORY: ${category}

You are having an ongoing conversation with a user about this brand. Maintain context from previous messages and provide consistent, helpful responses. If you reference previous parts of the conversation, do so naturally.

`

  // PRIORITY 1: Use the complete fullAnalysis from BigQuery if available
  if (fullAnalysis && typeof fullAnalysis === 'string' && fullAnalysis.length > 100) {
    context += `COMPLETE BRAND ANALYSIS:
${fullAnalysis}

`
  } else {
    // FALLBACK: Use structured analysis data if fullAnalysis is not available
    if (structuredAnalysis) {
      if (structuredAnalysis.executiveSnapshot) {
        context += `EXECUTIVE SUMMARY:
Key Insight: ${structuredAnalysis.executiveSnapshot.keyInsight || 'N/A'}
Summary: ${structuredAnalysis.executiveSnapshot.summary || 'N/A'}

COMPANY INFO:
${structuredAnalysis.executiveSnapshot.companyInfo ? `
- Size: ${structuredAnalysis.executiveSnapshot.companyInfo.size || 'N/A'}
- Employees: ${typeof structuredAnalysis.executiveSnapshot.companyInfo.employees === 'string' ? structuredAnalysis.executiveSnapshot.companyInfo.employees : 'N/A'}
- Revenue: ${typeof structuredAnalysis.executiveSnapshot.companyInfo.revenue === 'string' ? structuredAnalysis.executiveSnapshot.companyInfo.revenue : 'N/A'}
- Founded: ${structuredAnalysis.executiveSnapshot.companyInfo.founded || 'N/A'}
- Headquarters: ${structuredAnalysis.executiveSnapshot.companyInfo.headquarters || 'N/A'}
` : ''}

`
      }

      if (structuredAnalysis.businessChallenge) {
        context += `BUSINESS CHALLENGES:
Objective: ${structuredAnalysis.businessChallenge.commercialObjective || 'N/A'}
Top Challenges: ${structuredAnalysis.businessChallenge.topChallenges?.join(', ') || 'N/A'}
Strengths: ${structuredAnalysis.businessChallenge.strengths?.join(', ') || 'N/A'}
Weaknesses: ${structuredAnalysis.businessChallenge.weaknesses?.join(', ') || 'N/A'}

`
      }

      if (structuredAnalysis.audience?.corePersonas) {
        context += `TARGET AUDIENCE:
${structuredAnalysis.audience.corePersonas.slice(0, 2).map((persona: any, index: number) => 
          `Persona ${index + 1}: ${persona.name} - ${persona.description || persona.title}`
        ).join('\n')}

`
      }

      if (structuredAnalysis.categoryCompetition) {
        context += `COMPETITIVE LANDSCAPE:
Market Overview: ${structuredAnalysis.categoryCompetition.overview || 'N/A'}
Market Size: ${typeof structuredAnalysis.categoryCompetition.marketSize?.marketValue === 'string' ? structuredAnalysis.categoryCompetition.marketSize.marketValue : 'N/A'}

Top Competitors:
${structuredAnalysis.categoryCompetition.topCompetitors?.slice(0, 3).map((competitor: any) => 
  `- ${competitor.name}: ${competitor.position} (Revenue: ${typeof competitor.revenue === 'string' ? competitor.revenue : 'N/A'})`
).join('\n') || 'N/A'}

`
      }
    }

    // Add social data if available
    if (socialData) {
      context += `SOCIAL METRICS:
- Total Mentions: ${socialData.mentions?.toLocaleString() || 'N/A'}
- Positive Sentiment: ${socialData.sentiment?.positive || 'N/A'}%
- Negative Sentiment: ${socialData.sentiment?.negative || 'N/A'}%
- Engagement Rate: ${socialData.engagementRate || 'N/A'}%
- Share of Voice: ${socialData.shareOfVoice || 'N/A'}%

`
    }
  }

  context += `
INSTRUCTIONS:
- This is an ongoing conversation, so maintain context and refer to previous messages naturally
- Answer questions conversationally and helpfully
- Use the data provided to give specific, accurate insights
- If asked about data you don't have, politely say so
- Keep responses helpful and concise but comprehensive when needed
- Focus on actionable insights when possible
- Use the brand name naturally in responses
- Remember that you're having a continuous dialogue with the user`

  return context
}
