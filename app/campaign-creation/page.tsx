'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  MessageCircle, 
  Loader2, 
  ArrowRight, 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign,
  Lightbulb,
  CheckCircle,
  Building,
  Globe,
  Heart,
  Star,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react'

interface CampaignData {
  campaignSummary: {
    overview: string
    rationale: string
    approach: string
  }
  businessChallenge: {
    objectives: string[]
    challenges: string[]
    kpis: string[]
  }
  audience: {
    primary: {
      demographics: string
      psychographics: string
      behaviors: string
    }
    secondary: {
      demographics: string
      psychographics: string
      behaviors: string
    }
  }
  category: {
    landscape: string
    competitors: string[]
    trends: string[]
    opportunities: string[]
  }
  productBrand: {
    positioning: string
    uniqueValue: string
    brandPersonality: string[]
    coreMessage: string
  }
  culture: {
    culturalMoments: string[]
    socialTrends: string[]
    relevantMovements: string[]
    timelyOpportunities: string[]
  }
  strategy: {
    approach: string
    channels: string[]
    timeline: string
    phases: {
      phase: string
      duration: string
      focus: string
      tactics: string[]
    }[]
  }
  propositionPlatform: {
    bigIdea: string
    coreMessage: string
    supportingMessages: string[]
    tonalAttributes: string[]
  }
  keyDetails: {
    budget: string
    timeline: string
    team: string[]
    resources: string[]
    constraints: string[]
  }
  ambition: {
    primaryGoal: string
    successMetrics: string[]
    longTermVision: string
    competitiveAdvantage: string
  }
  thoughtStarters: {
    creativeDirections: string[]
    activationIdeas: string[]
    partnershipOpportunities: string[]
    innovativeApproaches: string[]
  }
  keyDeliverables: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    measurables: string[]
  }
}

interface GuidedAnswers {
  objectives: string
  homerun: string
  thoughts: string
}

function CampaignCreationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [campaignName, setCampaignName] = useState('')

  // Extract parameters from URL
  const mode = searchParams.get('mode') as 'auto' | 'guided' || 'auto'
  const brandName = searchParams.get('brandName') || 'Unknown Brand'

  // Save campaign states
  const [saveCampaignModal, setSaveCampaignModal] = useState(false)

  // Guided mode states  
  const [currentQuestion, setCurrentQuestion] = useState(0)

  // Guided form state
  const [guidedAnswers, setGuidedAnswers] = useState({
    objectives: '',
    homerun: '',
    thoughts: ''
  })

  const questions = [
    {
      id: 'objectives',
      question: 'What would you like to achieve? What metric(s) do you want to improve?',
      placeholder: 'e.g., Increase brand awareness by 25%, improve customer acquisition, boost social engagement...'
    },
    {
      id: 'homerun',
      question: "What's a homerun situation for the client? What would need to happen for it to be a success?",
      placeholder: 'e.g., Viral campaign that generates 10M+ impressions, increases sales by 30%, wins industry awards...'
    },
    {
      id: 'thoughts',
      question: 'Throw in all your disorganized thoughts here.',
      placeholder: 'Ideas, audiences, products, goals, and anything that will help the AI help you!',
      description: 'Ideas, audiences, products, goals, and anything that will help the AI help you!'
    }
  ]

  // Auto mode - immediate generation with proper dependency management
  useEffect(() => {
    if (mode === 'auto' && !campaign && !loading && !error) {
      // Add a small delay to prevent race conditions during component initialization
      const timer = setTimeout(() => {
        generateCampaign(false)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [mode]) // ✅ Only depend on mode to prevent unnecessary re-runs

  // Add a ref to track if generation has been initiated to prevent duplicate calls
  const generationInitiated = useRef(false)
  const guidedGenerationInitiated = useRef(false)

  // Reset the generation flag when mode changes
  useEffect(() => {
    generationInitiated.current = false
    guidedGenerationInitiated.current = false
  }, [mode])

  const retryGeneration = () => {
    // Reset flags and try again
    generationInitiated.current = false
    guidedGenerationInitiated.current = false
    setError(null)
    setCampaign(null)
    generateCampaign(mode === 'guided')
  }

  const generateCampaign = async (isGuided: boolean = false) => {
    // Prevent multiple simultaneous requests
    if (loading) {
      console.log('Campaign generation already in progress, ignoring request')
      return
    }

    // Additional protection against duplicate generation for both auto and guided modes
    if (isGuided && guidedGenerationInitiated.current) {
      console.log('Guided campaign generation already initiated, ignoring duplicate request')
      return
    }
    
    if (!isGuided && generationInitiated.current) {
      console.log('Auto campaign generation already initiated, ignoring duplicate request')
      return
    }

    // Set the appropriate flag
    if (isGuided) {
      guidedGenerationInitiated.current = true
    } else {
      generationInitiated.current = true
    }

    setLoading(true)
    setError(null)
    
    try {
      console.log(`🚀 Starting ${isGuided ? 'guided' : 'auto'} campaign generation for brand: ${brandName}...`)
      console.log('⏱️ Note: o4-mini is a reasoning model and takes 30-60+ seconds to think and respond')
      
      const response = await fetch('/api/campaign-creation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: isGuided ? 'guided' : 'auto',
          brandName: brandName, // Include the specific brand name
          guidedAnswers: isGuided ? guidedAnswers : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`Campaign generation failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Handle both successful and fallback responses
      if (data.campaign) {
        // Sanitize campaign data to prevent React rendering errors
        const sanitizedCampaign = sanitizeCampaignData(data.campaign)
        console.log('✅ Campaign generation completed')
        setCampaign(sanitizedCampaign)
        
        // Show warning if it was a fallback
        if (data.mode === 'fallback' || !data.success) {
          console.warn('⚠️ Using fallback campaign due to AI generation issue')
          setError('AI generation had issues, showing fallback campaign. You can try again for a fresh result.')
        }
      } else {
        throw new Error('No campaign data received')
      }
    } catch (err) {
      console.error('❌ Campaign generation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate campaign'
      setError(errorMessage)
      setCampaign(null)
      
      // Reset generation flags on error so retry is possible
      if (isGuided) {
        guidedGenerationInitiated.current = false
      } else {
        generationInitiated.current = false
      }
    } finally {
      setLoading(false)
    }
  }

  const saveCampaign = async () => {
    if (!campaign || !campaignName.trim()) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandName: brandName,
          campaignName: campaignName.trim(),
          campaignData: campaign,
          mode: mode || 'auto',
          status: 'draft'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSaveCampaignModal(false)
        setCampaignName('')
        // Show success message with brand context
        alert(`Campaign "${campaignName.trim()}" saved successfully for ${brandName}!`)
        
        // Set a flag in session storage to trigger refresh when returning to analysis
        sessionStorage.setItem('refreshCampaigns', 'true')
      } else {
        throw new Error(data.error || 'Failed to save campaign')
      }
    } catch (err) {
      console.error('Failed to save campaign:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save campaign'
      
      // Show specific error message for authentication issues
      if (errorMessage.includes('authentication') || errorMessage.includes('credentials') || errorMessage.includes('service account')) {
        alert('❌ BigQuery Authentication Error\n\nThe service account credentials are not properly configured. Please check:\n\n1. Service account JSON file exists\n2. GOOGLE_APPLICATION_CREDENTIALS environment variable is set\n3. Service account has BigQuery permissions\n\nContact your administrator to set up BigQuery access.')
      } else {
        alert(`Failed to save campaign: ${errorMessage}`)
      }
    } finally {
      setSaving(false)
    }
  }

  // Function to sanitize campaign data and prevent object rendering errors
  const sanitizeCampaignData = (campaignData: any): CampaignData => {
    if (!campaignData || typeof campaignData !== 'object') {
      throw new Error('Invalid campaign data received')
    }

    // Helper function to ensure string format
    const ensureString = (value: any): string => {
      if (typeof value === 'string') return value
      if (typeof value === 'number') return value.toString()
      if (value && typeof value === 'object') {
        // If it's an object, try to extract a meaningful value
        if (Object.keys(value).length === 1) {
          // If object has only one key, use its value
          const singleValue = Object.values(value)[0]
          return typeof singleValue === 'string' ? singleValue : String(singleValue)
        }
        // If multiple keys, try common property names
        if (value.value) return String(value.value)
        if (value.text) return String(value.text)
        if (value.content) return String(value.content)
        if (value.description) return String(value.description)
        // Fallback to first value
        const firstValue = Object.values(value)[0]
        return firstValue ? String(firstValue) : 'Not specified'
      }
      if (value == null) return 'Not specified'
      return String(value)
    }

    // Helper function to ensure array format
    const ensureArray = (value: any): any[] => {
      if (Array.isArray(value)) return value.map(item => ensureString(item))
      if (value && typeof value === 'object') {
        // Convert object values to array of strings
        return Object.values(value).map(v => ensureString(v)).filter(v => v !== 'Not specified')
      }
      if (value != null) {
        // Single value, convert to array
        return [ensureString(value)]
      }
      return []
    }

    // Ensure phases are properly formatted
    let phases: any[] = []
    if (campaignData.strategy?.phases) {
      if (Array.isArray(campaignData.strategy.phases)) {
        phases = campaignData.strategy.phases
      } else if (typeof campaignData.strategy.phases === 'object') {
        // Convert object phases to array
        const phasesObj = campaignData.strategy.phases
        phases = Object.keys(phasesObj)
          .sort()
          .map(key => {
            if (phasesObj[key] && typeof phasesObj[key] === 'object') {
              return {
                phase: ensureString(phasesObj[key].phase),
                duration: ensureString(phasesObj[key].duration),
                focus: ensureString(phasesObj[key].focus),
                tactics: ensureArray(phasesObj[key].tactics)
              }
            }
            return null
          })
          .filter(Boolean)
      }
    }

    return {
      campaignSummary: {
        overview: ensureString(campaignData.campaignSummary?.overview),
        rationale: ensureString(campaignData.campaignSummary?.rationale),
        approach: ensureString(campaignData.campaignSummary?.approach)
      },
      businessChallenge: {
        objectives: ensureArray(campaignData.businessChallenge?.objectives),
        challenges: ensureArray(campaignData.businessChallenge?.challenges),
        kpis: ensureArray(campaignData.businessChallenge?.kpis)
      },
      audience: {
        primary: {
          demographics: ensureString(campaignData.audience?.primary?.demographics),
          psychographics: ensureString(campaignData.audience?.primary?.psychographics),
          behaviors: ensureString(campaignData.audience?.primary?.behaviors)
        },
        secondary: {
          demographics: ensureString(campaignData.audience?.secondary?.demographics),
          psychographics: ensureString(campaignData.audience?.secondary?.psychographics),
          behaviors: ensureString(campaignData.audience?.secondary?.behaviors)
        }
      },
      category: {
        landscape: ensureString(campaignData.category?.landscape),
        competitors: ensureArray(campaignData.category?.competitors),
        trends: ensureArray(campaignData.category?.trends),
        opportunities: ensureArray(campaignData.category?.opportunities)
      },
      productBrand: {
        positioning: ensureString(campaignData.productBrand?.positioning),
        uniqueValue: ensureString(campaignData.productBrand?.uniqueValue),
        brandPersonality: ensureArray(campaignData.productBrand?.brandPersonality),
        coreMessage: ensureString(campaignData.productBrand?.coreMessage)
      },
      culture: {
        culturalMoments: ensureArray(campaignData.culture?.culturalMoments),
        socialTrends: ensureArray(campaignData.culture?.socialTrends),
        relevantMovements: ensureArray(campaignData.culture?.relevantMovements),
        timelyOpportunities: ensureArray(campaignData.culture?.timelyOpportunities)
      },
      strategy: {
        approach: ensureString(campaignData.strategy?.approach),
        channels: ensureArray(campaignData.strategy?.channels),
        timeline: ensureString(campaignData.strategy?.timeline),
        phases: phases
      },
      propositionPlatform: {
        bigIdea: ensureString(campaignData.propositionPlatform?.bigIdea),
        coreMessage: ensureString(campaignData.propositionPlatform?.coreMessage),
        supportingMessages: ensureArray(campaignData.propositionPlatform?.supportingMessages),
        tonalAttributes: ensureArray(campaignData.propositionPlatform?.tonalAttributes)
      },
      keyDetails: {
        budget: ensureString(campaignData.keyDetails?.budget),
        timeline: ensureString(campaignData.keyDetails?.timeline),
        team: ensureArray(campaignData.keyDetails?.team),
        resources: ensureArray(campaignData.keyDetails?.resources),
        constraints: ensureArray(campaignData.keyDetails?.constraints)
      },
      ambition: {
        primaryGoal: ensureString(campaignData.ambition?.primaryGoal),
        successMetrics: ensureArray(campaignData.ambition?.successMetrics),
        longTermVision: ensureString(campaignData.ambition?.longTermVision),
        competitiveAdvantage: ensureString(campaignData.ambition?.competitiveAdvantage)
      },
      thoughtStarters: {
        creativeDirections: ensureArray(campaignData.thoughtStarters?.creativeDirections),
        activationIdeas: ensureArray(campaignData.thoughtStarters?.activationIdeas),
        partnershipOpportunities: ensureArray(campaignData.thoughtStarters?.partnershipOpportunities),
        innovativeApproaches: ensureArray(campaignData.thoughtStarters?.innovativeApproaches)
      },
      keyDeliverables: {
        immediate: ensureArray(campaignData.keyDeliverables?.immediate),
        shortTerm: ensureArray(campaignData.keyDeliverables?.shortTerm),
        longTerm: ensureArray(campaignData.keyDeliverables?.longTerm),
        measurables: ensureArray(campaignData.keyDeliverables?.measurables)
      }
    }
  }

  const handleGuidedNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      generateCampaign(true)
    }
  }

  const handleGuidedAnswerChange = (questionId: string, value: string) => {
    setGuidedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const CampaignSection = ({ title, icon, children, className = "" }: {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    className?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }} />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 border border-blue-100/20 rounded-full"
              initial={{ 
                x: `${(i * 20) % 100}%`,
                y: `${(i * 25) % 100}%`,
                scale: 0.5 + (i * 0.1)
              }}
              animate={{ 
                x: `${((i * 20) + 30) % 100}%`,
                y: `${((i * 25) + 20) % 100}%`,
                rotate: 360
              }}
              transition={{ 
                duration: 20 + (i * 5),
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
          {/* Central Loading Animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative mb-12"
          >
            {/* Outer Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 border-2 border-blue-200/30 rounded-full flex items-center justify-center mx-auto"
            >
              {/* Middle Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-2 border-blue-300/50 rounded-full flex items-center justify-center"
              >
                {/* Inner Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-2 border-blue-500/70 border-t-blue-600 rounded-full"
                />
              </motion.div>
            </motion.div>
            
            {/* Pulsing Effect */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 w-32 h-32 border border-blue-300/40 rounded-full mx-auto"
            />
          </motion.div>

          {/* Professional Title */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
              Generating Campaign
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto max-w-xs"
            />
          </motion.div>

          {/* Professional Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mb-10"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
              <p className="text-xl text-slate-700 mb-4 font-medium">
                Campaign Creation Engine in Progress
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our AI is creating the coolest campaign for your brand. 
                <span className="font-semibold text-slate-700"> This typically takes 30-60 seconds.</span>
              </p>
            </div>
          </motion.div>

          {/* Elegant Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative max-w-lg mx-auto">
              <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 45, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative"
                >
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
              
              {/* Progress Indicator */}
              <motion.div
                animate={{ x: [0, 380] }}
                transition={{ duration: 45, ease: "easeOut" }}
                className="absolute -top-8 left-0 flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg" />
              </motion.div>
            </div>
          </motion.div>

          {/* Professional Process Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="space-y-4"
          >
            {[
              { text: "Analyzing brand positioning and market context", delay: 0 },
              { text: "Identifying target audience segments and behaviors", delay: 8 },
              { text: "Developing strategic messaging framework", delay: 16 },
              { text: "Optimizing channel mix and campaign tactics", delay: 24 },
              { text: "Finalizing comprehensive strategy blueprint", delay: 32 }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay / 8 + 1.5, duration: 0.6 }}
                className="flex items-center justify-center space-x-4"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0)",
                      "0 0 0 8px rgba(59, 130, 246, 0.1)",
                      "0 0 0 0 rgba(59, 130, 246, 0)"
                    ]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: step.delay / 8
                  }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <span className="text-slate-600 font-medium">
                  {step.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Subtle Bottom Elements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="mt-12 flex justify-center space-x-8 opacity-60"
          >
            {['Analytics', 'Strategy', 'Optimization', 'Insights'].map((item, index) => (
              <motion.div
                key={index}
                animate={{ 
                  y: [0, -8, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: index * 0.5 
                }}
                className="text-sm font-medium text-slate-500"
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    // Real error with no campaign
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Campaign Generation Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={retryGeneration}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/analysis/campaigns')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Guided mode questions
  if (mode === 'guided' && !campaign) {
    const currentQ = questions[currentQuestion]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Guide AI Campaign Creation</h1>
              <p className="text-gray-600">Help us understand your goals to create the perfect campaign</p>
              
              {/* Progress */}
              <div className="flex items-center justify-center space-x-2 mt-6">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index <= currentQuestion ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            {/* Question Card */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {currentQ.question}
              </h2>
              
              {currentQ.description && (
                <p className="text-gray-600 mb-4">{currentQ.description}</p>
              )}
              
              <textarea
                value={guidedAnswers[currentQ.id as keyof GuidedAnswers]}
                onChange={(e) => handleGuidedAnswerChange(currentQ.id, e.target.value)}
                placeholder={currentQ.placeholder}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button
                  onClick={handleGuidedNext}
                  disabled={!guidedAnswers[currentQ.id as keyof GuidedAnswers].trim() || loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && currentQuestion === questions.length - 1 ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentQuestion === questions.length - 1 ? 'Generate Campaign' : 'Next'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Campaign Results
  if (campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Warning Banner for Fallback Campaigns */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                      <strong>Notice:</strong> {error}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={retryGeneration}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Retry for Fresh Result
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Header with Back Button */}
            <div className="relative mb-8">
              {/* Back Button - positioned in top left */}
              <button
                onClick={() => {
                  // Set refresh flag for campaigns list instead of triggering focus
                  sessionStorage.setItem('refreshCampaigns', 'true')
                  // Navigate back to campaigns
                  router.push('/analysis/campaigns')
                }}
                className="absolute top-0 left-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 border border-gray-300 z-10"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Back</span>
              </button>
              
              {/* Centered Header Content */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Your AI-Generated Campaign</h1>
                <p className="text-gray-600">Comprehensive marketing strategy powered by advanced AI analysis</p>
              </div>
            </div>

            <div className="grid gap-8">
              {/* Campaign Summary */}
              <CampaignSection title="Campaign Summary" icon={<FileText className="w-6 h-6 text-orange-600" />}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-800 mb-3">Overview</h3>
                    <p className="text-orange-700">{campaign.campaignSummary?.overview || 'Campaign overview not available'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">Why We're Doing This</h3>
                    <p className="text-blue-700">{campaign.campaignSummary?.rationale || 'Campaign rationale not available'}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-3">How We'll Do It</h3>
                    <p className="text-green-700">{campaign.campaignSummary?.approach || 'Campaign approach not available'}</p>
                  </div>
                </div>
              </CampaignSection>

              {/* Business Challenge */}
              <CampaignSection title="Business Challenge" icon={<Target className="w-6 h-6 text-blue-600" />}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Objectives</h3>
                    <ul className="space-y-2">
                      {(campaign.businessChallenge?.objectives || []).map((obj, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Challenges</h3>
                    <ul className="space-y-2">
                      {(campaign.businessChallenge?.challenges || []).map((challenge, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Key KPIs</h3>
                    <ul className="space-y-2">
                      {(campaign.businessChallenge?.kpis || []).map((kpi, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{kpi}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CampaignSection>

              {/* Audience */}
              <CampaignSection title="Target Audience" icon={<Users className="w-6 h-6 text-green-600" />}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-4">Primary Audience</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-green-700">Demographics</h4>
                        <p className="text-green-600">{campaign.audience?.primary?.demographics || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700">Psychographics</h4>
                        <p className="text-green-600">{campaign.audience?.primary?.psychographics || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700">Behaviors</h4>
                        <p className="text-green-600">{campaign.audience?.primary?.behaviors || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-4">Secondary Audience</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-blue-700">Demographics</h4>
                        <p className="text-blue-600">{campaign.audience?.secondary?.demographics || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700">Psychographics</h4>
                        <p className="text-blue-600">{campaign.audience?.secondary?.psychographics || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700">Behaviors</h4>
                        <p className="text-blue-600">{campaign.audience?.secondary?.behaviors || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CampaignSection>

              {/* Strategy & Big Idea */}
              <div className="grid md:grid-cols-2 gap-8">
                <CampaignSection title="Strategy" icon={<BarChart3 className="w-6 h-6 text-purple-600" />}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Approach</h3>
                      <p className="text-gray-700">{campaign.strategy?.approach || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Key Channels</h3>
                      <div className="flex flex-wrap gap-2">
                        {(campaign.strategy?.channels || []).map((channel, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
                      <p className="text-gray-700">{campaign.strategy?.timeline || 'Not specified'}</p>
                    </div>
                    {/* Campaign Phases */}
                    {campaign.strategy?.phases && Array.isArray(campaign.strategy.phases) && campaign.strategy.phases.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Campaign Phases</h3>
                        <div className="space-y-3">
                          {campaign.strategy.phases.map((phase, index) => (
                            <div key={index} className="bg-purple-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-purple-800">{String(phase?.phase || `Phase ${index + 1}`)}</h4>
                                <span className="text-sm text-purple-600">{String(phase?.duration || 'Duration TBD')}</span>
                              </div>
                              <p className="text-purple-700 text-sm mb-2">{String(phase?.focus || 'Strategic focus')}</p>
                              {phase?.tactics && Array.isArray(phase.tactics) && (
                                <div className="flex flex-wrap gap-1">
                                  {phase.tactics.map((tactic, tacticIndex) => (
                                    <span key={tacticIndex} className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">
                                      {String(tactic)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CampaignSection>

                <CampaignSection title="Big Idea & Platform" icon={<Lightbulb className="w-6 h-6 text-yellow-600" />}>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Big Idea</h3>
                      <p className="text-yellow-700 font-medium">{campaign.propositionPlatform?.bigIdea || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Core Message</h3>
                      <p className="text-gray-700">{campaign.propositionPlatform?.coreMessage || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tonal Attributes</h3>
                      <div className="flex flex-wrap gap-2">
                        {(campaign.propositionPlatform?.tonalAttributes || []).map((attr, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CampaignSection>
              </div>

              {/* Culture & Context */}
              <CampaignSection title="Culture & Context" icon={<Globe className="w-6 h-6 text-pink-600" />}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Cultural Moments</h3>
                    <ul className="space-y-2">
                      {(campaign.culture?.culturalMoments || []).map((moment, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Star className="w-4 h-4 text-pink-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{moment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Timely Opportunities</h3>
                    <ul className="space-y-2">
                      {(campaign.culture?.timelyOpportunities || []).map((opp, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Clock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CampaignSection>

              {/* Key Details & Budget */}
              <div className="grid md:grid-cols-2 gap-8">
                <CampaignSection title="Key Details" icon={<Building className="w-6 h-6 text-indigo-600" />}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Budget</h3>
                      <p className="text-gray-700">{campaign.keyDetails?.budget || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
                      <p className="text-gray-700">{campaign.keyDetails?.timeline || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Required Resources</h3>
                      <ul className="space-y-1">
                        {(campaign.keyDetails?.resources || []).map((resource, index) => (
                          <li key={index} className="text-gray-700 text-sm">• {resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CampaignSection>

                <CampaignSection title="Ambition & Success" icon={<Heart className="w-6 h-6 text-red-600" />}>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h3 className="font-semibold text-red-800 mb-2">Primary Goal</h3>
                      <p className="text-red-700">{campaign.ambition?.primaryGoal || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Success Metrics</h3>
                      <ul className="space-y-1">
                        {(campaign.ambition?.successMetrics || []).map((metric, index) => (
                          <li key={index} className="text-gray-700 text-sm">• {metric}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CampaignSection>
              </div>

              {/* Thought Starters & Deliverables */}
              <div className="grid md:grid-cols-2 gap-8">
                <CampaignSection title="Creative Thought Starters" icon={<Lightbulb className="w-6 h-6 text-orange-600" />}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Creative Directions</h3>
                      <ul className="space-y-1">
                        {(campaign.thoughtStarters?.creativeDirections || []).map((direction, index) => (
                          <li key={index} className="text-gray-700 text-sm">💡 {direction}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Activation Ideas</h3>
                      <ul className="space-y-1">
                        {(campaign.thoughtStarters?.activationIdeas || []).map((idea, index) => (
                          <li key={index} className="text-gray-700 text-sm">🚀 {idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CampaignSection>

                <CampaignSection title="Key Deliverables" icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Immediate (0-30 days)</h3>
                      <ul className="space-y-1">
                        {(campaign.keyDeliverables?.immediate || []).map((item, index) => (
                          <li key={index} className="text-gray-700 text-sm">⚡ {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Short Term (1-3 months)</h3>
                      <ul className="space-y-1">
                        {(campaign.keyDeliverables?.shortTerm || []).map((item, index) => (
                          <li key={index} className="text-gray-700 text-sm">📈 {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Long Term (3+ months)</h3>
                      <ul className="space-y-1">
                        {(campaign.keyDeliverables?.longTerm || []).map((item, index) => (
                          <li key={index} className="text-gray-700 text-sm">🎯 {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CampaignSection>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-12">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setSaveCampaignModal(true)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Campaign</span>
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => generateCampaign(mode === 'guided')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate New Campaign
                </button>
              </div>
            </div>

            {/* Save Campaign Modal */}
            {saveCampaignModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Save Campaign</h2>
                  <p className="text-gray-600 mb-6">Give your campaign a name to save it for future reference.</p>
                  
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-6"
                    autoFocus
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setSaveCampaignModal(false)
                        setCampaignName('')
                      }}
                      disabled={saving}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveCampaign}
                      disabled={!campaignName.trim() || saving}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Save Campaign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Return fallback for unhandled states
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Campaign Creation - {mode || 'Loading'}
        </h2>
        <p className="text-gray-600">
          Campaign creation interface is being prepared...
        </p>
      </div>
    </div>
  )
}

export default function CampaignCreation() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Campaign Creation
          </h2>
          <p className="text-gray-600">
            Preparing your campaign creation interface...
          </p>
        </div>
      </div>
    }>
      <CampaignCreationContent />
    </Suspense>
  )
} 