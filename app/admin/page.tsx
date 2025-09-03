'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, TrendingUp, Users, BarChart3, Eye, Plus, Minus, Brain, History, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import AnalysisDashboard from '../components/AnalysisDashboard'
import PerplexityWorkflowModal from '../components/PerplexityWorkflowModal'
import { useRouter } from 'next/navigation'

// Generate the same prompt used in the automated workflow
function generateManualWorkflowPrompt(params: {
  fandomName: string
  brandPartner: string
  category: string
  timeframe: string
  pitchContext: string
  markets: string[]
}): string {
  const timeframeMonths = params.timeframe === '3 months' ? 3 : 
                         params.timeframe === '6 months' ? 6 : 
                         params.timeframe === '12 months' ? 12 : 6

  return `EMILY IN PARIS × VASELINE STRATEGIC FANDOM RESEARCH
CRITICAL: RESPONSE MUST BE VALID JSON FORMAT ONLY

You are a specialist fandom researcher, social listening expert, and brand anthropologist conducting comprehensive strategic research into the ${params.fandomName} fandom for ${params.brandPartner}'s Year 2 partnership strategy.

RESEARCH CONTEXT & OBJECTIVE:
Following successful Year 1 partnership, ${params.brandPartner} and ${params.fandomName} are preparing Year 2 limited edition product launch. After client redirection, we need strategic audience insights to guide Creative Development, focusing on authentic fandom engagement and ${params.brandPartner} Lip Oil integration opportunities.

=== STRATEGIC RESEARCH FRAMEWORK ===

CORE FANDOM THEMES TO ANALYZE:
For each theme below, provide comprehensive analysis covering all specified research dimensions:

1. FASHION THEME
- "Get the look" content, affordable recreations, style inspiration
- Love-it vs. hate-it outfit debates
- Seasonal wardrobe analysis and style evolution

2. BEAUTY & SKINCARE THEME  
- Glowing skin tutorials and skincare routines
- Makeup tutorials and product identification
- Official beauty collaborations and brand mentions
- French girl aesthetic discussions

3. ROMANCE THEME
- Gabriel vs. Alfie vs. Marcello debates and team dynamics
- Favourite couples and relationship analysis
- Biggest heartbreaks and emotional moments
- Romantic scene analysis and fan reactions

4. FRIENDSHIPS THEME
- Emily-Mindy dynamic and friendship goals
- Camille relationship evolution and complexity
- Group friendship dynamics and loyalty discussions

5. WORK RELATIONSHIPS THEME
- Luc, Julien, Sylvie professional dynamics
- Workplace conflict to growth narratives
- Career inspiration and professional development

6. EMILY'S CHARACTER TRAITS THEME
- Confidence and resilience discussions
- Optimism and empowerment messaging
- "Trying new things" inspiration and personal growth

7. LOCATIONS THEME
- Paris vs. Rome setting preferences and comparisons
- Filming location identification and travel inspiration
- Before/after location visits and travel planning

8. SCENE CUT-DOWNS THEME
- Iconic romantic moment edits and compilations
- Dramatic scene breakdowns and analysis
- Fan-created content and video editing trends

9. BRAND COLLABORATIONS THEME
- Discussion of official Emily in Paris partnerships
- Fashion, beauty, and travel brand integration
- Collaboration reception and authenticity debates

=== COMPREHENSIVE ANALYSIS REQUIREMENTS ===

For EACH theme above, provide detailed insights on:

A. CONTENT FORMATS & PERFORMANCE
- Dominant formats: soft edits, side-by-side comparisons, outfit breakdowns, GRWMs, memes, tutorials
- Best-performing formats for engagement (saves, shares, comments)
- Creator experimentation: split screens, filters, overlays, captions, audio choices
- Format prevalence variations across markets (${params.markets.join(', ')})
- Emerging format trends and innovations

B. CONVERSATION DYNAMICS
- Key discussion drivers and conversation starters
- Terminology, slang, hashtags, and fan vocabulary
- Tone variations by theme (banter vs. aspirational vs. emotional)
- Recurring in-jokes, memes, cultural references unique to community
- Conversation triggers: posts, comments, season drops, news, viral moments
- Original post vs. comment-thread debate patterns

C. COMMUNITY BEHAVIOR
- Unifying themes creating agreement and solidarity
- Divisive topics sparking debate and why
- High-engagement moments: controversial outfits, scenes, character decisions
- Audience segments: general fans vs. creators vs. influencers
- Content production patterns and community roles

D. INFLUENCE MAPPING
- Most influential voices by reach, engagement, authority
- Fandom-led vs. creator/influencer-led conversation differences
- Micro-community formation around couples, characters, aesthetics
- Hashtag evolution and fan page dynamics

E. SENTIMENT & CULTURAL ANALYSIS
- Fan feelings about Emily as character (admiration vs. criticism)
- Paris vs. Rome setting preferences and emotional connections
- Gabriel vs. Marcello romantic preferences and intensity
- Cultural differences by market (${params.markets.join(', ')}) in emphasis and discussion topics
- Aspirational vs. relatable engagement patterns

F. TEMPORAL PATTERNS
- Conversation peak timing: season drops, cast news, brand collabs, viral edits
- Seasonal content trends and cyclical discussions
- Real-time vs. evergreen content performance

G. CROSS-FANDOM & BRAND INTEGRATION
- Cross-references with other shows (Sex and the City, fashion weeks, cultural moments)
- Brand mention patterns (luxury vs. affordable associations)
- Official collaboration reception vs. organic brand discovery
- ${params.brandPartner} integration opportunities within each theme

RESEARCH METHODOLOGY:
• Cross-platform analysis: TikTok, Instagram, Reddit, Twitter, YouTube, Pinterest
• ${timeframeMonths}-month trend analysis with seasonal pattern identification
• Verbatim quote extraction for authentic voice capture
• Engagement metric analysis across content types and themes
• Cultural nuance mapping across target markets
• Brand mention sentiment and context analysis

=== CRITICAL INFLUENCER RESEARCH ===
• IDENTIFY SPECIFIC CREATORS: Real names/handles actively creating Emily in Paris content
• REGIONAL SEGMENTATION: Different creators for ${params.markets.join(', ')} markets
• ORGANIC FANDOM VALIDATION: Genuine fans vs. trend-followers
• LIP OIL INTEGRATION ASSESSMENT: Authentic partnership potential
• CONTENT EXAMPLE ANALYSIS: Recent Emily in Paris posts and engagement
• COLLABORATION READINESS: Beauty brand partnership experience
• CONTACT PATHWAYS: Management, email, or outreach methods

ANALYSIS TARGET:
Primary Focus: ${params.fandomName} Fandom × ${params.brandPartner} Brand Synergy
Category: ${params.category}
Markets: ${params.markets.join(', ')}
Purpose: ${params.pitchContext}
Timeline: Last ${timeframeMonths} months priority

RESEARCH REQUIREMENTS:
1. What is the ${params.fandomName} fandom talking about?
2. What's their language, tone of voice, and key words?
3. How do they organically create content about the series?
4. How does ${params.brandPartner} fit into this ecosystem?
5. What insights can fuel creativity and guide influencer partnerships?

RESEARCH METHODOLOGY:
• Analyze ${params.fandomName} fan communities across platforms (Reddit, TikTok, Instagram, Twitter, Facebook groups, Discord servers, fan forums)
• Study conversation patterns, language use, content creation behaviors
• DEEP INFLUENCER RESEARCH: Identify specific creators/influencers who are organically part of the fandom
• Map brand integration opportunities with ${params.brandPartner} Lip Oil products
• Surface verbatim fan quotes to illustrate sentiment and language patterns
• Focus on last ${timeframeMonths} months for current trends and conversations
• Prioritize actionable insights that can inform campaign development and creator briefings

CRITICAL INFLUENCER RESEARCH REQUIREMENTS:
• FIND SPECIFIC CREATORS: List actual creator names/handles who regularly create Emily in Paris content
• REGION-SPECIFIC CREATORS: Provide different influencers for each target market (${params.markets.join(', ')})
• ORGANIC FANDOM CONNECTION: Only include creators who are genuinely part of the fandom, not just trend-followers
• LIP OIL ALIGNMENT: Assess each creator's potential for authentic Vaseline Lip Oil integration
• BRIEFING FRAMEWORKS: Develop specific content briefs tailored for Lip Oil + Emily in Paris fandom
• CONTACT INFORMATION: Include known contact details or representation when available
• CONTENT EXAMPLES: Reference specific recent content they've created related to Emily in Paris
• COLLABORATION HISTORY: Note their experience with beauty brand partnerships
• REGIONAL VARIATIONS: Show how content and influencer strategies should vary by market

RESEARCH PRIORITY SOURCES:
• ${params.fandomName} fan communities (Reddit: r/EmilyInParis, TikTok #EmilyInParis, Instagram fan accounts)
• Beauty and skincare discussions within fandom
• User-generated content and fan-created materials
• Influencer content featuring both show and beauty brands
• Cross-platform conversation analysis
• Beauty brand partnerships in entertainment context
• Gen Z and Millennial fan behavior studies

SPECIFIC INFLUENCER DISCOVERY SOURCES:
• TikTok: Search #EmilyInParis, #EmilysStyle, #EmilyInParisFashion, #ParisianStyle
• Instagram: Emily in Paris hashtags, fashion recreations, Parisian beauty content
• YouTube: Emily in Paris reaction videos, style analyses, character breakdowns
• Reddit: r/EmilyInParis active contributors and content creators
• Beauty influencer databases: Cross-reference with Emily in Paris content
• Creator databases: Filter for creators with Emily in Paris and beauty content
• Social media monitoring: Track creator mentions of Emily in Paris + beauty products
• Platform analytics: Identify high-engagement creators in the fandom space

ANALYSIS TARGET:
Primary Focus: ${params.fandomName} Fandom × ${params.brandPartner} Brand Synergy
Category: ${params.category}
Markets: ${params.markets.join(', ')}
Purpose: ${params.pitchContext}
Timeline: Last ${timeframeMonths} months priority

EXPECTED DELIVERABLES:
• Comprehensive fandom overview with demographics and behavior patterns
• Region-specific influencer recommendations with detailed profiles and contact information
• Vaseline Lip Oil integration strategies tailored to Emily in Paris aesthetic
• Creator briefing frameworks for fashion, beauty, and lifestyle influencers
• Campaign activation roadmap for Year 2 partnership launch
• Fan language patterns and content creation insights
• Strategic opportunities for authentic brand integration

FOCUS AREAS FOR MANUAL RESEARCH:
1. 📱 SOCIAL LISTENING across all major platforms
2. 🌍 REGIONAL CREATOR IDENTIFICATION with specific profiles
3. 💄 BEAUTY BRAND ALIGNMENT opportunities
4. 📋 CONTENT STRATEGY DEVELOPMENT frameworks
5. 📊 ACTIONABLE INSIGHTS compilation

EXTREMELY IMPORTANT – OUTPUT FORMAT RULES:
• Respond with VALID JSON ONLY – NO explanatory text before or after
• DO NOT wrap in markdown code fences
• START immediately with { and END with }
• Use double quotes for all strings; escape internal quotes
• Include real verbatim fan quotes with attribution platform
• Validate JSON before responding

REQUIRED JSON STRUCTURE – COPY EXACTLY:
{
  "fandomOverview": {
    "keyInsight": "Single most important insight about EIP fandom for ${params.brandPartner} partnership",
    "fandomSize": {
      "totalCommunitySize": "Estimated global fan community size",
      "activeCommunitySize": "Active engaged fan community size",
      "growthTrend": "Growing/Stable/Declining and reason",
      "platformDistribution": {
        "tiktok": "Percentage and engagement level",
        "instagram": "Percentage and engagement level", 
        "reddit": "Percentage and engagement level",
        "twitter": "Percentage and engagement level",
        "other": "Other significant platforms"
      }
    },
    "demographicSnapshot": {
      "primaryAge": "Dominant age group",
      "secondaryAge": "Secondary age group",
      "genderSplit": "Gender distribution",
      "geography": "Primary geographic markets",
      "incomeLevel": "Estimated income demographics"
    },
    "fandomHealth": {
      "engagementLevel": "High/Medium/Low with context",
      "contentVolume": "Daily/weekly content creation volume",
      "communityGrowth": "Community growth patterns",
      "seasonality": "How engagement varies with show seasons"
    },
    "vaselineRelevance": {
      "currentMentions": "Current ${params.brandPartner} mentions in EIP content",
      "brandAffinity": "Fan affinity for beauty/skincare brands",
      "productInterest": "Interest in lip care/beauty products",
      "partnershipAwareness": "Awareness of ${params.brandPartner} x EIP partnership"
    }
  },
  "communityDeepDive": {
    "fanPersonas": [
      {
        "name": "Persona name",
        "percentage": "% of community",
        "age": "Age range",
        "description": "Detailed persona description",
        "platforms": ["Primary platforms"],
        "behaviors": ["Key fan behaviors"],
        "beautyInterests": ["Beauty and skincare interests"],
        "contentCreation": "How they create EIP content",
        "brandRelationship": "Relationship with beauty brands",
        "vaselineAlignment": "How they might align with ${params.brandPartner}"
      }
    ],
    "communitySegments": {
      "coreFans": "Description of core devoted fans",
      "casualViewers": "Description of casual content consumers", 
      "contentCreators": "Description of active content creators",
      "beautyEnthusiasts": "Description of beauty-focused fans"
    },
    "behaviorPatterns": {
      "contentConsumption": "How they consume EIP content",
      "socialSharing": "How they share and discuss the show",
      "brandEngagement": "How they engage with brands",
      "purchaseInfluence": "What influences their purchases"
    }
  },
  "thematicAnalysis": {
    "fashion": {
      "contentFormats": {
        "dominantFormats": ["Soft edits", "Side-by-side comparisons", "Outfit breakdowns", "GRWMs"],
        "bestPerforming": ["Highest engagement format types for saves, shares, comments"],
        "creatorExperimentation": ["Split screens", "Filters", "Overlays", "Caption techniques", "Audio choices"],
        "emergingTrends": ["New format innovations and trends"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Format preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["What sparks fashion conversations"],
        "terminology": ["Fashion-specific slang and vocabulary"],
        "toneCharacteristics": "How fans discuss fashion (aspirational, critical, etc.)",
        "inJokes": ["Fashion-related memes and community references"],
        "conversationTriggers": ["What events spark fashion discussions"],
        "originalVsCommentPatterns": "How original posts vs comment threads differ in fashion discussions"
      },
      "communityBehavior": {
        "unifyingThemes": ["What creates agreement in fashion discussions"],
        "divisiveTopics": ["Fashion topics that spark debate"],
        "highEngagementMoments": ["Most controversial or popular fashion moments"],
        "audienceSegments": "Who creates vs. consumes fashion content",
        "contentProductionRoles": "How different community segments contribute to fashion content"
      },
      "influenceMapping": {
        "topVoices": ["Most influential fashion voices by reach, engagement, authority"],
        "fandomVsInfluencerLed": "Differences between fan-led and influencer-led fashion conversations",
        "microCommunities": ["Fashion-focused micro-communities around specific aesthetics"],
        "hashtagEvolution": "How fashion hashtags develop and spread in this theme"
      },
      "sentimentAnalysis": {
        "overallSentiment": "General fan sentiment toward Emily's fashion choices",
        "parisVsRome": "Fashion sentiment differences between Paris and Rome settings",
        "aspirationalVsRelatable": "Balance of aspirational vs relatable engagement with fashion",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Cultural emphasis and sentiment in ${market} market"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "When fashion conversations spike (season drops, cast news, etc.)",
        "seasonalTrends": "How fashion discussions vary by season/episodes", 
        "realtimeVsEvergreen": "Real-time fashion moments vs evergreen fashion content performance",
        "viralMoments": "Recent viral fashion moments and their characteristics"
      },
      "crossFandomIntegration": {
        "crossReferences": ["References to Sex and the City, fashion weeks, cultural moments"],
        "brandMentions": "Luxury vs affordable brand mention patterns",
        "collaborationReception": "How official vs organic fashion brand collaborations are received",
        "vaselineOpportunities": "Specific ${params.brandPartner} integration opportunities in fashion content"
      },
      "sampleQuotes": ["Verbatim fashion-related fan quotes with platform attribution"]
    },
    "beauty": {
      "contentFormats": {
        "dominantFormats": ["GRWMs", "Product identification", "French girl tutorials", "Drugstore dupes"],
        "bestPerforming": ["Before/after glow-ups", "Morning routines", "Product recommendations"],
        "creatorExperimentation": ["No-makeup makeup looks", "Pharmacy hauls", "Glow enhancement techniques"],
        "emergingTrends": ["Beauty innovation trends specific to EIP fandom"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Beauty format preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Emily's natural glow", "French pharmacy products", "Effortless beauty"],
        "terminology": ["Glow-up", "French girl aesthetic", "No-makeup makeup", "Effortless chic"],
        "toneCharacteristics": "Aspirational but achievable, focused on natural enhancement",
        "inJokes": ["French pharmacy superiority", "American beauty vs Parisian simplicity"],
        "conversationTriggers": ["Skincare reveals", "Beauty brand partnerships", "Glow transformations"],
        "originalVsCommentPatterns": "How beauty discussions start vs evolve in comments"
      },
      "communityBehavior": {
        "unifyingThemes": ["Natural beauty appreciation", "French pharmacy love", "Effortless aesthetics"],
        "divisiveTopics": ["High-end vs drugstore", "Natural vs glam makeup debates"],
        "highEngagementMoments": ["Glow reveals", "Product discoveries", "Beauty transformations"],
        "audienceSegments": "Beauty enthusiasts vs casual fans creating beauty content",
        "contentProductionRoles": "Beauty creators vs general fans in beauty discussions"
      },
      "influenceMapping": {
        "topVoices": ["Most influential beauty voices in EIP fandom"],
        "fandomVsInfluencerLed": "Fan beauty discussions vs influencer beauty content differences",
        "microCommunities": ["French pharmacy enthusiasts", "Natural beauty advocates", "Emily glow recreators"],
        "hashtagEvolution": "How beauty hashtags develop and spread in EIP context"
      },
      "sentimentAnalysis": {
        "overallSentiment": "Fan sentiment toward Emily's beauty approach and natural aesthetics",
        "productTypes": "Sentiment toward different beauty product categories",
        "aspirationalVsRelatable": "Balance of aspirational beauty vs achievable looks",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Beauty cultural emphasis in ${market} market"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "When beauty conversations spike (glow reveals, product launches)",
        "seasonalTrends": "Seasonal beauty content patterns and product preferences",
        "realtimeVsEvergreen": "Trending beauty moments vs timeless beauty content",
        "viralMoments": "Recent viral beauty moments in EIP fandom"
      },
      "crossFandomIntegration": {
        "crossReferences": ["References to other beauty influencers, French beauty culture"],
        "brandMentions": "French pharmacy vs luxury vs drugstore brand discussions",
        "collaborationReception": "Reception of official beauty brand collaborations",
        "vaselineOpportunities": "Perfect integration points for ${params.brandPartner} Lip Oil in beauty content"
      },
      "lipOilSpecificOpportunities": "Detailed ${params.brandPartner} Lip Oil integration opportunities and natural usage scenarios",
      "sampleQuotes": ["Verbatim beauty-related fan quotes with platform attribution"]
    },
    "romance": {
      "contentFormats": {
        "dominantFormats": ["Team edits", "Romantic scene compilations", "Character analysis", "Ship content"],
        "bestPerforming": ["Emotional moment edits", "Character comparison videos", "Relationship timeline"],
        "creatorExperimentation": ["Soft romantic filters", "Music-driven storytelling", "Split loyalty edits"],
        "emergingTrends": ["Romance content innovations and viral relationship content"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Romance content preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Love triangle progression", "Character development", "Romantic chemistry"],
        "terminology": ["Team Gabriel", "Team Alfie", "Team Marcello", "Endgame", "Chemistry", "Red flags"],
        "toneCharacteristics": "Emotional, passionate, sometimes defensive of preferred character",
        "inJokes": ["Team war references", "Character defense mechanisms", "Romance predictions"],
        "conversationTriggers": ["Romantic scene releases", "Character development", "Love triangle progression"],
        "originalVsCommentPatterns": "Team allegiance posts vs emotional reactions and debates in comments"
      },
      "communityBehavior": {
        "unifyingThemes": ["Romance appreciation", "Character growth support", "Love story investment"],
        "divisiveTopics": ["Team allegiances", "Character worthiness debates", "Relationship predictions"],
        "highEngagementMoments": ["Love triangle developments", "Romantic confessions", "Relationship conflicts"],
        "audienceSegments": "Dedicated team members vs casual romance fans",
        "contentProductionRoles": "Team advocates vs relationship analyzers vs neutral observers"
      },
      "influenceMapping": {
        "topVoices": ["Most influential voices in romance discussions and team advocacy"],
        "fandomVsInfluencerLed": "Fan romance content vs relationship commentary influencers",
        "microCommunities": ["Team Gabriel supporters", "Team Alfie advocates", "Team Marcello fans", "Multi-ship communities"],
        "hashtagEvolution": "Evolution of team hashtags and romance-focused terminology"
      },
      "sentimentAnalysis": {
        "gabrielSupport": "High but declining - seen as complicated and inconsistent",
        "alfieSupport": "Moderate - appreciated for stability but seen as predictable",
        "marcelloSupport": "Growing - excitement for new dynamic and Italian charm",
        "overallRomance": "Passionate engagement with strong emotional investment",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Romance cultural perspectives and preferences in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Romance discussions peak during romantic episodes, relationship developments, team moments",
        "seasonalTrends": "Romance content intensity varies with relationship progression across seasons",
        "realtimeVsEvergreen": "Real-time episode reactions vs evergreen team advocacy content",
        "viralMoments": "Recent viral romance moments and team allegiance content"
      },
      "crossFandomIntegration": {
        "crossReferences": ["References to other love triangles, romantic shows, relationship archetypes"],
        "brandMentions": "How romance themes connect to beauty and confidence branding",
        "collaborationReception": "Reception of romance-themed brand collaborations",
        "vaselineOpportunities": "How ${params.brandPartner} can integrate with romantic confidence and date night content"
      },
      "sampleQuotes": ["Gabriel had his chance", "Marcello brings out Emily's adventurous side", "Team Alfie for stability"]
    },
    "locations": {
      "contentFormats": {
        "dominantFormats": ["Location identification", "Travel vlogs", "Paris vs Rome comparisons", "Filming spot visits"],
        "bestPerforming": ["Before/after location visits", "Travel inspiration posts", "City aesthetic content"],
        "creatorExperimentation": ["Location recreation", "Travel planning content", "City lifestyle vlogs"],
        "emergingTrends": ["Location content innovations and travel inspiration formats"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Location content preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Paris vs Rome debates", "Travel planning inspiration", "Location aesthetics"],
        "terminology": ["Parisian dreams", "Roman holiday", "Main character travel", "European summer", "City aesthetics"],
        "toneCharacteristics": "Aspirational and wanderlust-driven with aesthetic appreciation",
        "inJokes": ["Paris superiority", "Rome newness", "American tourist references"],
        "conversationTriggers": ["New location reveals", "Travel seasons", "Location aesthetic posts"],
        "originalVsCommentPatterns": "Location appreciation posts vs personal travel sharing and planning"
      },
      "communityBehavior": {
        "unifyingThemes": ["Travel inspiration", "Location aesthetics appreciation", "Wanderlust encouragement"],
        "divisiveTopics": ["Paris vs Rome superiority", "Travel accessibility", "Location authenticity"],
        "highEngagementMoments": ["New location reveals", "Travel transformation posts", "City comparison content"],
        "audienceSegments": "Travel enthusiasts vs aesthetic appreciators vs location researchers",
        "contentProductionRoles": "Travel content creators vs location researchers vs aesthetic curators"
      },
      "influenceMapping": {
        "topVoices": ["Most influential voices in travel and location discussions"],
        "fandomVsInfluencerLed": "Fan location content vs travel influencer content",
        "microCommunities": ["Paris enthusiasts", "Rome advocates", "Travel planners", "Location researchers"],
        "hashtagEvolution": "Evolution of location hashtags from #EmilyInParis to #ParisianStyle to #EmilyInRome"
      },
      "sentimentAnalysis": {
        "parisPreference": "Strong Paris loyalty but growing Rome curiosity and appreciation",
        "romeAppreciation": "Increasing appreciation for Rome's charm and new adventures",
        "travelInspiration": "High aspirational engagement with travel and location content",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Location and travel cultural perspectives in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Location discussions peak during travel seasons, episode location reveals, vacation planning periods",
        "seasonalTrends": "Summer travel inspiration spikes, winter cozy location content, spring travel planning",
        "realtimeVsEvergreen": "Real-time location discoveries vs evergreen travel inspiration content",
        "viralMoments": "Viral location recreation posts and travel transformation content"
      },
      "crossFandomIntegration": {
        "crossReferences": ["References to other travel shows, European lifestyle content, travel influencers"],
        "brandMentions": "How travel and location themes connect to lifestyle and beauty branding",
        "collaborationReception": "Reception of travel and location-focused brand collaborations",
        "vaselineOpportunities": "Travel-ready beauty routines and on-the-go confidence boosters for ${params.brandPartner}"
      },
      "sampleQuotes": ["Rome Emily hits different", "Still team Paris but Rome is stunning", "Need that European summer energy"]
    },
    "characterTraits": {
      "contentFormats": {
        "dominantFormats": ["Character analysis videos", "Inspirational quote posts", "Personal growth content"],
        "bestPerforming": ["Confidence transformation posts", "Empowerment messaging", "Relatable struggle content"],
        "creatorExperimentation": ["Character deep-dives", "Personal development parallels"],
        "emergingTrends": ["Character trait content innovations and empowerment formats"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Character content preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Emily's growth moments", "Confidence displays", "Character development"],
        "terminology": ["Main character energy", "Growth mindset", "Confidence boost", "Empowerment"],
        "toneCharacteristics": "Inspirational and motivational with personal reflection",
        "inJokes": ["Emily's optimism", "American confidence", "Growth journey references"],
        "conversationTriggers": ["Character growth moments", "Confidence scenes", "Personal development episodes"],
        "originalVsCommentPatterns": "Character analysis posts vs personal growth sharing"
      },
      "communityBehavior": {
        "unifyingThemes": ["Personal growth appreciation", "Confidence building", "Empowerment support"],
        "divisiveTopics": ["Character realism vs idealization", "Confidence vs privilege debates"],
        "highEngagementMoments": ["Major character development scenes", "Confidence transformations"],
        "audienceSegments": "Personal development enthusiasts vs general character fans",
        "contentProductionRoles": "Motivational content creators vs personal story sharers"
      },
      "influenceMapping": {
        "topVoices": ["Self-help influencers", "Personal development coaches", "Empowerment advocates"],
        "fandomVsInfluencerLed": "Fans share personal growth stories, influencers create motivational content",
        "microCommunities": ["Confidence builders", "Personal development enthusiasts", "Emily growth trackers"],
        "hashtagEvolution": "#EmilyConfidence to #MainCharacterEnergy to #EmilysGrowthJourney"
      },
      "sentimentAnalysis": {
        "confidencePerception": "Emily's confidence both inspiring and criticized as unrealistic",
        "empowermentImpact": "Strong themes of trying new things and self-advocacy resonate",
        "relatabilityBalance": "Mix of relatable struggles and aspirational traits",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Character perception cultural differences in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Character discussions peak during character development episodes, empowerment moments",
        "seasonalTrends": "New Year personal development peaks, summer confidence content",
        "realtimeVsEvergreen": "Real-time character reactions vs evergreen empowerment content",
        "viralMoments": "Major confidence displays, character growth revelations"
      },
      "crossFandomIntegration": {
        "crossReferences": ["Other empowering characters", "Personal development content", "Self-help themes"],
        "brandMentions": "Empowerment and confidence themes connect naturally to brand messaging",
        "collaborationReception": "Strong reception of empowerment-focused brand collaborations",
        "vaselineOpportunities": "Confidence and empowerment messaging through natural beauty confidence"
      },
      "sampleQuotes": ["Need Emily's confidence energy", "She makes mistakes but keeps trying", "Main character energy activated"]
    },
    "friendships": {
      "contentFormats": {
        "dominantFormats": ["Friendship goal posts", "Dynamic analysis videos", "Relationship breakdowns"],
        "bestPerforming": ["Emily-Mindy content", "Friendship evolution posts", "Loyalty discussions"],
        "creatorExperimentation": ["Friendship dynamic analysis", "Relationship timelines"],
        "emergingTrends": ["Friendship content innovations in EIP fandom"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Friendship content preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Emily-Mindy bond", "Camille relationship complexity", "Friendship loyalty"],
        "terminology": ["Friendship goals", "Ride or die", "Toxic friendship", "Growth together"],
        "toneCharacteristics": "Emotional and relationship-focused with loyalty emphasis",
        "inJokes": ["Mindy's loyalty", "Camille's complexity", "Friendship drama"],
        "conversationTriggers": ["Friendship conflicts", "Loyalty tests", "Relationship evolution"],
        "originalVsCommentPatterns": "Friendship analysis posts vs personal friendship sharing"
      },
      "communityBehavior": {
        "unifyingThemes": ["Friendship appreciation", "Loyalty values", "Growth together"],
        "divisiveTopics": ["Camille's actions", "Friendship priorities", "Loyalty vs growth"],
        "highEngagementMoments": ["Friendship conflicts", "Loyalty moments", "Relationship evolution"],
        "audienceSegments": "Relationship analyzers vs personal story sharers",
        "contentProductionRoles": "Friendship content creators vs experience sharers"
      },
      "influenceMapping": {
        "topVoices": ["Relationship content creators", "Friendship bloggers", "Psychology influencers"],
        "fandomVsInfluencerLed": "Fans share personal friendship experiences, influencers analyze relationships",
        "microCommunities": ["Emily-Mindy fans", "Friendship analyzers", "Relationship growth advocates"],
        "hashtagEvolution": "#FriendshipGoals to #ToxicFriends to #HealthyBoundaries"
      },
      "sentimentAnalysis": {
        "overallSentiment": "Positive toward Emily-Mindy bond, complex toward Camille relationship",
        "emilyMindyBond": "Universally beloved as authentic friendship representation",
        "camilleComplexity": "Divisive - understanding vs disappointment in her choices",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Friendship cultural perspectives in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Friendship drama episodes, bonding moments, loyalty tests",
        "seasonalTrends": "Friend breakup content peaks during relationship episodes",
        "realtimeVsEvergreen": "Real-time friendship reactions vs evergreen relationship advice",
        "viralMoments": "Major friendship conflicts, loyalty demonstrations"
      },
      "crossFandomIntegration": {
        "crossReferences": ["Other friendship dynamics in media", "Relationship psychology content"],
        "brandMentions": "Friendship and bonding themes connect to shared experiences",
        "collaborationReception": "Strong reception of friendship-focused brand content",
        "vaselineOpportunities": "Shared beauty moments and friend bonding experiences"
      },
      "sampleQuotes": ["Mindy is the friend we all need", "Camille's friendship is complicated but real", "Emily-Mindy forever"]
    },
    "workRelationships": {
      "contentFormats": {
        "dominantFormats": ["Workplace dynamic analysis", "Professional growth content", "Career inspiration posts"],
        "bestPerforming": ["Luc-Julien-Sylvie content", "Professional development discussions", "Workplace culture analysis"],
        "creatorExperimentation": ["Workplace storytelling", "Professional development parallels"],
        "emergingTrends": ["Work relationship content innovations"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Work content preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Sylvie's leadership", "Team dynamics", "Professional growth"],
        "terminology": ["Boss energy", "Team dynamics", "Professional growth", "Workplace culture"],
        "toneCharacteristics": "Professional and aspirational with respect for growth",
        "inJokes": ["Sylvie's wisdom", "Luc and Julien dynamic", "American work culture"],
        "conversationTriggers": ["Professional development moments", "Workplace conflicts", "Career inspiration"],
        "originalVsCommentPatterns": "Professional analysis vs personal career sharing"
      },
      "communityBehavior": {
        "unifyingThemes": ["Professional growth appreciation", "Team dynamic respect", "Career inspiration"],
        "divisiveTopics": ["Work-life balance debates", "Professional boundary discussions"],
        "highEngagementMoments": ["Professional development scenes", "Workplace culture clashes"],
        "audienceSegments": "Career-focused fans vs general workplace content consumers",
        "contentProductionRoles": "Professional development content creators vs career story sharers"
      },
      "influenceMapping": {
        "topVoices": ["Career coaches", "Professional development influencers", "Workplace culture experts"],
        "fandomVsInfluencerLed": "Fans share work experiences, influencers provide career advice",
        "microCommunities": ["Career inspiration seekers", "Workplace culture analyzers", "Professional growth advocates"],
        "hashtagEvolution": "#BossLady to #WorkplaceCulture to #ProfessionalGrowth"
      },
      "sentimentAnalysis": {
        "overallSentiment": "Positive toward professional growth themes, respect for French work culture",
        "sylvieLeadership": "High admiration for leadership style and mentorship",
        "teamDynamics": "Appreciation for collaborative yet competitive environment",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Workplace cultural perspectives in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Professional development scenes, career milestone episodes",
        "seasonalTrends": "Career content peaks in January and September",
        "realtimeVsEvergreen": "Real-time workplace reactions vs evergreen career advice",
        "viralMoments": "Sylvie's leadership moments, professional development scenes"
      },
      "crossFandomIntegration": {
        "crossReferences": ["Other workplace dramas", "Professional development content"],
        "brandMentions": "Professional confidence and workplace wellness themes",
        "collaborationReception": "Strong reception of career-focused brand collaborations",
        "vaselineOpportunities": "Professional confidence and workplace wellness integration"
      },
      "sampleQuotes": ["Sylvie is the boss we all want", "French work culture is so different", "Need that professional confidence"]
    },
    "sceneCutDowns": {
      "contentFormats": {
        "dominantFormats": ["Iconic moment compilations", "Romantic scene edits", "Dramatic breakdowns"],
        "bestPerforming": ["Emotional moment edits", "Character development compilations", "Viral scene recreations"],
        "creatorExperimentation": ["Advanced editing techniques", "Music-driven storytelling", "Visual effects"],
        "emergingTrends": ["Scene editing innovations and viral formats"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Scene editing preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Iconic scenes", "Emotional moments", "Character development"],
        "terminology": ["Scene queen", "Edit queen", "Viral moment", "Iconic scene"],
        "toneCharacteristics": "Creative and emotional with appreciation for storytelling",
        "inJokes": ["Scene recreations", "Edit skills", "Moment capturing"],
        "conversationTriggers": ["New episodes", "Iconic scenes", "Viral edits"],
        "originalVsCommentPatterns": "Scene analysis vs emotional reactions in comments"
      },
      "communityBehavior": {
        "unifyingThemes": ["Scene appreciation", "Creative editing respect", "Storytelling value"],
        "divisiveTopics": ["Scene interpretation debates", "Editing style preferences"],
        "highEngagementMoments": ["Viral scene edits", "Emotional compilations", "Creative innovations"],
        "audienceSegments": "Creative editors vs scene appreciators",
        "contentProductionRoles": "Video editors vs scene commentators and reactors"
      },
      "influenceMapping": {
        "topVoices": ["Video editing creators", "Fan compilation channels", "Cinematic analysis accounts"],
        "fandomVsInfluencerLed": "Fans create emotional edits, professional editors create technical content",
        "microCommunities": ["Scene editors", "Moment compilators", "Viral content creators"],
        "hashtagEvolution": "#EmilyEdits to #EIPMoments to #SceneQueens"
      },
      "sentimentAnalysis": {
        "overallSentiment": "High appreciation for emotional storytelling and creative editing",
        "scenePreferences": "Romantic moments most beloved, dramatic conflicts most shared",
        "editingAppreciation": "Respect for technical skill and emotional storytelling",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Scene content preferences in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "New episode releases, anniversaries, viral moments",
        "seasonalTrends": "Romantic content in spring, nostalgic compilations in winter",
        "realtimeVsEvergreen": "Real-time scene reactions vs evergreen compilation content",
        "viralMoments": "Major plot twists, emotional confessions, season finales"
      },
      "crossFandomIntegration": {
        "crossReferences": ["Other show editing techniques", "Film appreciation content"],
        "brandMentions": "Scene content incorporates lifestyle and beauty elements",
        "collaborationReception": "Organic brand integration in scenes appreciated",
        "vaselineOpportunities": "Scene recreation content with beauty focus"
      },
      "sampleQuotes": ["This edit captured the emotion perfectly", "Need a compilation of Emily's growth moments", "That scene hit different with this music"]
    },
    "brandCollaborations": {
      "contentFormats": {
        "dominantFormats": ["Partnership announcements", "Collaboration reviews", "Brand integration analysis"],
        "bestPerforming": ["Authentic collaboration content", "Brand discovery posts", "Partnership critiques"],
        "creatorExperimentation": ["Brand integration techniques", "Authenticity assessments"],
        "emergingTrends": ["Brand collaboration content innovations"],
        "marketVariations": {
          ${params.markets.map(market => `"${market}": "Brand collaboration preferences in ${market} market"`).join(',\n          ')}
        }
      },
      "conversationDynamics": {
        "keyDiscussionDrivers": ["Partnership authenticity", "Brand fit assessment", "Collaboration quality"],
        "terminology": ["Brand fit", "Authentic collab", "Sell out", "Perfect partnership"],
        "toneCharacteristics": "Critical but appreciative of authentic partnerships",
        "inJokes": ["Brand partnership jokes", "Collaboration expectations", "Authenticity tests"],
        "conversationTriggers": ["New partnerships", "Brand launches", "Collaboration announcements"],
        "originalVsCommentPatterns": "Partnership analysis vs personal brand preferences"
      },
      "communityBehavior": {
        "unifyingThemes": ["Authenticity appreciation", "Quality partnerships", "Brand alignment respect"],
        "divisiveTopics": ["Partnership authenticity debates", "Brand fit disagreements"],
        "highEngagementMoments": ["Major partnership announcements", "Controversial collaborations"],
        "audienceSegments": "Brand analyzers vs partnership enthusiasts",
        "contentProductionRoles": "Brand content creators vs collaboration reviewers"
      },
      "influenceMapping": {
        "topVoices": ["Brand partnership analysts", "Authenticity advocates", "Marketing experts"],
        "fandomVsInfluencerLed": "Fans focus on authenticity, influencers analyze business strategy",
        "microCommunities": ["Brand collaboration analyzers", "Partnership enthusiasts", "Authenticity advocates"],
        "hashtagEvolution": "#BrandPartnership to #AuthenticCollab to #BrandAlignment"
      },
      "sentimentAnalysis": {
        "overallSentiment": "Cautiously optimistic toward partnerships with emphasis on authenticity",
        "partnershipAuthenticity": "High standards for authentic integration vs obvious product placement",
        "brandFitAppreciation": "Strong appreciation for well-aligned brand partnerships",
        "culturalDifferences": {
          ${params.markets.map(market => `"${market}": "Brand collaboration cultural perspectives in ${market}"`).join(',\n          ')}
        }
      },
      "temporalPatterns": {
        "peakTimes": "Partnership announcements, product launches, collaboration reveals",
        "seasonalTrends": "Fashion partnerships peak during fashion weeks",
        "realtimeVsEvergreen": "Real-time partnership reactions vs evergreen brand analysis",
        "viralMoments": "Major brand announcements, controversial partnerships"
      },
      "crossFandomIntegration": {
        "crossReferences": ["Other successful entertainment partnerships", "Brand collaboration best practices"],
        "brandMentions": "Analysis of different brand approaches and success factors",
        "collaborationReception": "Framework for evaluating partnership authenticity and success",
        "vaselineOpportunities": "Perfect partnership model with authentic beauty integration and fandom respect"
      },
      "sampleQuotes": ["This partnership actually makes sense", "Finally a brand that fits Emily's vibe", "Hope this collab stays authentic"]
    }
  },
  "conversationAnalysis": {
    "overallTone": "General tone across all Emily in Paris discussions",
    "crossFandomReferences": ["References to other shows and cultural moments"],
    "temporalPatterns": {
      "peakTimes": "When conversations spike",
      "seasonalTrends": "How discussions vary by season",
      "viralMoments": "Recent viral conversation moments"
    },
    "culturalDifferences": {
      ${params.markets.map(market => `"${market}": "Cultural emphasis in ${market} market"`).join(',\n      ')}
    },
    "influenceMapping": {
      "topVoices": ["Most influential community voices"],
      "microCommunities": ["Specialized fan communities"],
      "hashtagEvolution": "How hashtags develop and spread"
    }
  },
  "languageVoice": {
    "tonalCharacteristics": {
      "primaryTone": "Dominant tone of fan conversations",
      "emotionalRange": "Range of emotions expressed",
      "sophisticationLevel": "Communication sophistication level",
      "brandAlignment": "How fan tone aligns with ${params.brandPartner} brand voice"
    },
    "vocabularyPatterns": {
      "commonWords": ["Most frequently used words"],
      "slangTerms": ["Fan-specific slang and terminology"],
      "beautyTerms": ["Beauty/skincare specific vocabulary"],
      "fashionLanguage": ["Fashion and style terminology"],
      "positiveDescriptors": ["Positive descriptive words used"],
      "negativeIndicators": ["Words indicating negative sentiment"]
    },
    "communicationStyle": {
      "contentFormats": ["Preferred content formats for communication"],
      "preferredPlatforms": ["Primary platforms for fan discussions"],
      "engagementStyle": "How fans engage with content and each other",
      "visualElements": "Visual communication preferences and patterns"
    },
    "brandVoiceAlignment": {
      "vaselineCompatibility": "How fan communication style aligns with ${params.brandPartner}",
      "toneMatching": "Areas where tones naturally align",
      "languageOpportunities": ["Language opportunities for brand integration"],
      "messagingGuidance": "Guidance for authentic brand messaging to fans"
    }
  },
  "contentPatterns": {
    "postTypes": {
      "outfitRecreations": "Fashion recreation content patterns",
      "beautyTutorials": "Beauty and makeup tutorial trends",
      "sceneReactions": "Reaction content to show episodes",
      "characterAnalysis": "Character discussion content",
      "locationContent": "Paris/Rome location-focused content"
    },
    "contentFormats": {
      "videoContent": "Dominant video format trends",
      "staticPosts": "Image-based content patterns",
      "storiesEphemeral": "Stories and ephemeral content usage",
      "livestreaming": "Live content creation patterns",
      "collaborativeContent": "Multi-creator content trends"
    },
    "creationPatterns": {
      "postingFrequency": "How often fans create EIP content",
      "seasonalContent": "Content creation tied to show seasons",
      "trendParticipation": "How fans participate in viral trends",
      "originalityVsRecreation": "Balance of original vs recreated content"
    },
    "visualAesthetics": {
      "colorPalettes": ["Popular color schemes in EIP fan content"],
      "filttersEffects": ["Common filters and visual effects used"],
      "compositionStyles": ["Visual composition preferences"],
      "brandingElements": ["How fans incorporate show branding"]
    }
  },
  "brandSynergy": {
    "vaselineAlignment": {
      "brandValues": "How ${params.brandPartner} values align with EIP fandom values",
      "productSynergy": "Natural connection points between Lip Oil and EIP aesthetic",
      "visualSynergy": "Visual brand alignment opportunities",
      "messagingAlignment": "Messaging strategy alignment potential"
    },
    "partnershipOpportunities": [
      {
        "category": "Content partnership type",
        "description": "Detailed partnership opportunity",
        "targetAudience": "Specific audience segment",
        "expectedImpact": "Anticipated results",
        "implementationApproach": "How to execute this partnership"
      }
    ],
    "riskAssessment": {
      "brandSafetyRisks": ["Potential brand safety concerns"],
      "audienceReactionRisks": ["Potential negative audience reactions"],
      "competitorRisks": ["Competitive landscape risks"],
      "mitigationStrategies": ["Risk mitigation approaches"]
    },
    "synergyScore": {
      "overallCompatibility": "High/Medium/Low with reasoning",
      "audienceOverlap": "Degree of audience alignment",
      "valueProportion": "Value proposition alignment",
      "executionFeasibility": "How feasible partnership execution would be"
    }
  },
  "strategicInsights": {
    "keyInsights": [
      "Most important strategic insight for ${params.brandPartner}",
      "Second key insight",
      "Third key insight"
    ],
    "marketOpportunities": [
      {
        "opportunity": "Market opportunity description",
        "market": "Specific market/region",
        "potential": "Revenue/engagement potential",
        "timeframe": "Implementation timeframe",
        "requirements": "What would be needed to capture this opportunity"
      }
    ],
    "competitiveAdvantage": {
      "uniquePositioning": "How ${params.brandPartner} can uniquely position in EIP space",
      "differentiationFactors": ["Key differentiation opportunities"],
      "competitorGaps": ["Gaps in competitor EIP strategies"],
      "brandStrengths": ["${params.brandPartner} strengths relevant to EIP partnership"]
    },
    "campaignRecommendations": [
      {
        "campaignType": "Type of campaign recommended",
        "objective": "Primary campaign objective",
        "targetAudience": "Specific target audience",
        "channels": ["Recommended channels"],
        "timeline": "Recommended timeline",
        "keyMessages": ["Core messages"],
        "successMetrics": ["How to measure success"]
      }
    ],
    "riskMitigation": {
      "identifiedRisks": ["Key risks for ${params.brandPartner} in EIP space"],
      "mitigationStrategies": ["Specific mitigation approaches"],
      "contingencyPlans": ["Backup strategies if primary approach fails"]
    },
    "successMetrics": {
      "brandAwareness": "How to measure brand awareness impact",
      "engagement": "Engagement metrics to track",
      "conversion": "Conversion and sales metrics",
      "brandPerception": "Brand perception measurement approaches",
      "communityGrowth": "Community growth and retention metrics"
    }
  },
  "influencerIntelligence": {
    "organicFandomCreators": {
      "byRegion": {
        "${params.markets[0] || 'US'}": {
          "microInfluencers": [
            {
              "name": "@creatorhandle",
              "platform": "Primary platform",
              "followers": "Follower count",
              "engagement": "Engagement rate %",
              "fandomConnection": "How they connect to EIP",
              "contentStyle": "Description of content style",
              "beautyFocus": "Beauty content percentage and focus",
              "audienceDemographics": "Audience description",
              "recentEIPContent": "Recent EIP-related content examples",
              "lipOilAlignment": "Fit for ${params.brandPartner} Lip Oil partnership",
              "contentQuality": "Content quality assessment",
              "brandSafety": "Brand safety assessment",
              "collaborationPotential": "Partnership potential rating",
              "contactInfo": "Contact information or agency",
              "regionalRelevance": "Relevance to this specific market"
            }
          ],
          "nanoInfluencers": [
            {
              "name": "@creatorhandle",
              "platform": "Primary platform",
              "followers": "Follower count",
              "engagement": "Engagement rate %",
              "uniqueAngle": "What makes them unique",
              "fandomRole": "Role in EIP community",
              "viralPotential": "Potential for viral content",
              "lipOilOpportunity": "Specific ${params.brandPartner} opportunity",
              "regionalRelevance": "Market-specific relevance"
            }
          ],
          "emergingVoices": [
            {
              "name": "@creatorhandle",
              "platform": "Primary platform",
              "followers": "Follower count",
              "engagement": "Engagement rate %",
              "growthTrend": "Growth trajectory",
              "contentFocus": "Primary content focus",
              "fandomDepth": "Depth of EIP engagement",
              "futureP potential": "Future partnership potential"
            }
          ]
        }
      }
    },
    "creatorBriefingFramework": {
      "lipOilIntegrationStrategy": {
        "productPositioning": "How to position ${params.brandPartner} Lip Oil in EIP context",
        "keyMessages": ["Core messages for creators to communicate"],
        "contentFormats": ["Recommended content formats for integration"],
        "tonalGuidance": "Tone and style recommendations for creators"
      },
      "contentBriefs": {
        "microInfluencerBrief": "Detailed brief for micro-influencer partnerships",
        "nanoInfluencerBrief": "Brief for nano-influencer collaborations",
        "emergingVoiceBrief": "Brief for emerging creator partnerships"
      },
      "campaignActivations": {
        "launchActivation": "Creator involvement in product launch",
        "ongoingEngagement": "Sustained creator engagement strategy",
        "exclusiveAccess": "Exclusive content and access opportunities",
        "ugcStrategy": "User-generated content strategy leveraging creators"
      }
    }
  }
}

CRITICAL: Your response must be VALID JSON starting with { and ending with } - ready to copy and paste into the system!

NOTE: Replace "TARGET_MARKETS" in the JSON with actual regions: ${params.markets.join(', ')}
Create separate objects for each market (e.g., "Spain": {...}, "Netherlands": {...}, etc.)`
}

export default function AdminApp() {
  const router = useRouter()
  const [website, setWebsite] = useState('')
  const [brandName, setBrandName] = useState('')
  const [category, setCategory] = useState('')
  const [timeframe, setTimeframe] = useState('6 months')
  const [pitchContext, setPitchContext] = useState('')
  const [markets, setMarkets] = useState(['US'])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  
  // Manual workflow state
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualWorkflowData, setManualWorkflowData] = useState<any>(null)

  // Check admin access
  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const userResponse = await fetch('/api/user')
      if (!userResponse.ok) {
        router.push('/')
        return
      }

      const userData = await userResponse.json()
      if (!userData.user) {
        router.push('/')
        return
      }

      const roleResponse = await fetch('/api/user-role')
      if (!roleResponse.ok) {
        router.push('/')
        return
      }

      const roleData = await roleResponse.json()
      if (roleData.role !== 'admin') {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/')
    }
  }

  const addMarket = () => {
    setMarkets([...markets, ''])
  }

  const removeMarket = (index: number) => {
    setMarkets(markets.filter((_, i) => i !== index))
  }

  const updateMarket = (index: number, value: string) => {
    const newMarkets = [...markets]
    newMarkets[index] = value
    setMarkets(newMarkets)
  }

  // Automated OpenAI Deep Research Analysis
  const handleAnalysis = async () => {
    if (!website) {
      toast.error('Please enter a website URL')
      return
    }

    if (!category) {
      toast.error('Please specify the brand category')
      return
    }

    if (!pitchContext) {
      toast.error('Please specify the pitch context/purpose')
      return
    }

    // Basic fandom validation
    if (!website.trim()) {
      toast.error('Please enter a fandom/series name')
      return
    }

    setIsAnalyzing(true)
    const loadingToast = toast.loading('🚀 Starting automated OpenAI Deep Research...', { 
      duration: 0,
      style: {
        background: '#2d2d2d',
        color: '#e8e5e0',
      }
    })

    try {
      setTimeout(() => {
        toast.loading('🔬 Using o3 Deep Research with background processing for reliability...', { 
          id: loadingToast,
          duration: 0
        })
      }, 2000)

      setTimeout(() => {
        toast.loading('🌐 Analyzing sources in background mode (avoids infrastructure timeouts)...', { 
          id: loadingToast,
          duration: 0
        })
      }, 8000)

      setTimeout(() => {
        toast.loading('🎯 Deep research running in background, polling every 30 seconds...', { 
          id: loadingToast,
          duration: 0
        })
      }, 15000)

      setTimeout(() => {
        toast.loading('⏳ Background deep research in progress... may take up to 2 hours...', { 
          id: loadingToast,
          duration: 0
        })
      }, 30000)

      // Call the Emily in Paris specialized analysis API
      const response = await fetch('/api/analyze-eip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fandomName: website.trim() || "Emily in Paris",
          brandPartner: "Vaseline",
          category: category.trim() || "Beauty & Entertainment Partnership",
          timeframe: timeframe,
          pitchContext: pitchContext.trim(),
          markets: markets.filter(m => m.trim() !== '')
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Deep Research analysis failed')
      }

      const result = await response.json()
      
      if (result.success) {
        // Handle regular automated analysis response
        setAnalysisData(result.data)
        
        // IMPORTANT: Save the real analysis data to session storage immediately
        sessionStorage.setItem('discoveryFlowAnalysis', JSON.stringify(result.data))
        
        setShowDashboard(true)
        toast.success('🎉 OpenAI Deep Research analysis complete! Advanced insights ready.', { 
          id: loadingToast,
          duration: 3000
        })
      } else {
        throw new Error('Deep Research analysis failed')
      }
    } catch (error) {
      console.error('OpenAI Deep Research analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'OpenAI Deep Research analysis failed. Please try again.', { 
        id: loadingToast 
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Manual Analysis Workflow
  const handleManualAnalysis = async () => {
    if (!website) {
      toast.error('Please enter a website URL')
      return
    }

    if (!category) {
      toast.error('Please specify the brand category')
      return
    }

    if (!pitchContext) {
      toast.error('Please specify the pitch context/purpose')
      return
    }

    // Basic fandom validation
    if (!website.trim()) {
      toast.error('Please enter a fandom/series name')
      return
    }

    setIsAnalyzing(true)
    const loadingToast = toast.loading('Preparing manual analysis workflow...', { 
      duration: 0,
      style: {
        background: '#2d2d2d',
        color: '#e8e5e0',
      }
    })

    try {
      // Call the Emily in Paris specialized analysis API for manual workflow
      const response = await fetch('/api/analyze-eip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fandomName: website.trim() || "Emily in Paris",
          brandPartner: "Vaseline",
          category: category.trim() || "Beauty & Entertainment Partnership",
          timeframe: timeframe,
          pitchContext: pitchContext.trim(),
          markets: markets.filter(m => m.trim() !== '')
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Manual workflow preparation failed')
      }

      const result = await response.json()
      
      if (result.success) {
        // Create manual workflow data using the same prompt as automated workflow
        const manualData = {
          success: true,
          workflowType: 'eip_manual',
          perplexityPrompt: generateManualWorkflowPrompt({
            fandomName: website.trim() || 'Emily in Paris',
            brandPartner: 'Vaseline',
            category: category.trim() || 'Beauty & Entertainment Partnership',
            timeframe: timeframe,
            pitchContext: pitchContext.trim(),
            markets: markets.filter(m => m.trim() !== '')
          }),
          
          instructions: `Emily in Paris × Vaseline Fandom Research Instructions:

1. 📱 SOCIAL LISTENING RESEARCH
   - Search hashtags: #EmilyInParis #EmilysStyle #EmilyInParisFashion #ParisianStyle
   - Platform focus: TikTok, Instagram, YouTube, Reddit r/EmilyInParis
   - Look for: Fan discussions, style recreations, beauty content, creator profiles

2. 🌍 REGIONAL CREATOR IDENTIFICATION  
   - US Market: American creators doing Emily-inspired content, study abroad themes
   - UK Market: British creators with Parisian aspirations, London vs Paris content
   - France Market: Authentic French creators providing cultural perspective
   - Document: Follower counts, engagement rates, content style, contact info

3. 💄 BEAUTY BRAND ALIGNMENT
   - Analyze: How fans discuss Emily's beauty looks and Parisian aesthetic
   - Identify: Natural integration points for Vaseline Lip Oil
   - Map: French girl beauty trends and lip care conversations

4. 📋 CONTENT STRATEGY DEVELOPMENT
   - Create briefing templates for different creator types
   - Develop seasonal campaign concepts
   - Design authentic integration approaches

5. 📊 COMPILE FINDINGS
   - Organize by region and creator tier
   - Include specific creator recommendations with rationale
   - Provide actionable next steps for partnership activation`,

          perplexityUrl: 'https://www.perplexity.ai',
          brandName: website.trim() || 'Emily in Paris',
          category: category.trim() || 'Beauty & Entertainment Partnership',
          website: website.trim(),
          timeframe: timeframe,
          pitchContext: pitchContext.trim(),
          markets: markets.filter(m => m.trim() !== '')
        }
        
        setManualWorkflowData(manualData)
        setShowManualModal(true)
        toast.success('Emily in Paris manual research workflow ready! Follow the instructions to conduct fandom analysis.', { 
          id: loadingToast,
          duration: 5000
        })
      } else {
        throw new Error('Failed to prepare Emily in Paris research workflow')
      }
    } catch (error) {
      console.error('Manual analysis error:', error)
      toast.error(error instanceof Error ? error.message : 'Manual workflow preparation failed. Please try again.', { 
        id: loadingToast 
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Fandom Deep Dive",
      description: "Comprehensive analysis of Emily in Paris fan communities, behaviors, and engagement patterns across all platforms"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Language & Content Analysis", 
      description: "Deep dive into fan language patterns, tone of voice, content creation behaviors, and organic brand integration"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Brand Synergy Mapping",
      description: "Strategic analysis of Vaseline × Emily in Paris partnership opportunities and audience alignment"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Influencer Intelligence",
      description: "Identification of key community voices, micro-influencers, and collaboration opportunities within the fandom"
    }
  ]

  if (showDashboard && analysisData) {
    return <AnalysisDashboard data={analysisData} onBack={() => setShowDashboard(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back to Dashboard
              </button>
            </div>
            <h1 className="flex-1 text-4xl md:text-6xl font-bold text-center tracking-tight leading-none">
              Discover.<span className="text-[#efede9] bg-[#2d2d2d] px-2 py-1 rounded">Flow</span>
            </h1>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => router.push('/history')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive brand intelligence powered by AI research and social listening
          </p>
          <div className="mt-4 text-sm text-blue-600 font-medium">
            Admin Access - Full Application
          </div>
        </motion.div>

        {/* Main Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-brand-dark mb-6 text-center">
              Emily in Paris × Vaseline Fandom Analysis
            </h2>
            
            {/* Basic Fields */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Fandom/Series Reference *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Emily in Paris, Bridgerton, Wednesday"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="input-field"
                    disabled={isAnalyzing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Fandom Name
                  </label>
                  <input
                    type="text"
                    placeholder="Emily in Paris"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="input-field"
                    disabled={isAnalyzing}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Partnership Category *
                  </label>
                  <input
                    type="text"
                    placeholder="Beauty & Entertainment Partnership"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                    disabled={isAnalyzing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Timeframe
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="input-field"
                    disabled={isAnalyzing}
                  >
                    <option value="3 months">Last 3 months</option>
                    <option value="6 months">Last 6 months</option>
                    <option value="12 months">Last 12 months</option>
                    <option value="2 years">Last 2 years</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Research Objective *
                </label>
                <textarea
                  placeholder="e.g., Deep dive into Emily in Paris fandom for Year 2 Vaseline partnership launch, Understanding fan language and content patterns for creative development, Identifying influencer collaboration opportunities"
                  value={pitchContext}
                  onChange={(e) => setPitchContext(e.target.value)}
                  className="input-field h-20"
                  disabled={isAnalyzing}
                />
              </div>

              {/* Markets */}
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Target Markets
                </label>
                {markets.map((market, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g., US, UK, Germany, Asia-Pacific"
                      value={market}
                      onChange={(e) => updateMarket(index, e.target.value)}
                      className="input-field flex-1"
                      disabled={isAnalyzing}
                    />
                    {markets.length > 1 && (
                      <button
                        onClick={() => removeMarket(index)}
                        className="px-3 py-2 text-brand-error hover:bg-brand-error/10 rounded-lg transition-colors"
                        disabled={isAnalyzing}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addMarket}
                  className="flex items-center text-brand-accent hover:text-brand-accent/80 text-sm"
                  disabled={isAnalyzing}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Market
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing}
                  className="btn-primary flex items-center justify-center min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Start Fandom Analysis
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleManualAnalysis}
                  disabled={isAnalyzing}
                  className="btn-secondary flex items-center justify-center min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Manual Workflow
                </button>
              </div>

              {isAnalyzing && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>🎬 Analyzing Emily in Paris fandom with deep social listening research</p>
                  <p className="mt-1">Examining fan communities, language patterns, and Vaseline brand synergy • up to 30 minutes</p>
                </div>
              )}

              {!isAnalyzing && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  <p>🎯 Specialized fandom research for Emily in Paris × Vaseline partnership</p>
                  <p className="mt-1"><strong>Focus:</strong> Fan behavior, content patterns, brand alignment, and influencer opportunities</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="card p-6 text-center"
            >
              <div className="text-brand-accent mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-brand-dark mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Perplexity Workflow Modal */}
      {manualWorkflowData && (
        <PerplexityWorkflowModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          prompt={manualWorkflowData.perplexityPrompt || manualWorkflowData.geminiPrompt}
          instructions={manualWorkflowData.instructions}
          perplexityUrl={manualWorkflowData.perplexityUrl || manualWorkflowData.geminiUrl}
          brandName={brandName || website}
          category={category}
          website={website}
          timeframe={timeframe}
          pitchContext={pitchContext}
          markets={markets}
          onProcessResults={(results: string) => {
            // Handle the processed results - could save to state or trigger a refresh
            console.log('Perplexity results processed:', results)
          }}
        />
      )}
    </div>
  )
}
