'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
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
  FileText,
  Loader2
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

interface SavedCampaign {
  campaign_id: string
  brand_name: string
  campaign_name: string
  campaign_data: CampaignData
  created_at: string
  mode: 'auto' | 'guided'
  status: 'draft' | 'active' | 'completed'
}

function CampaignViewContent() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.campaignId as string
  
  const [campaign, setCampaign] = useState<SavedCampaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      setLoading(true)
      console.log(`🔍 Fetching campaign: ${campaignId}`)
      
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Campaign fetched successfully:', result.campaign)
        setCampaign(result.campaign)
      } else {
        setError(result.error || 'Failed to fetch campaign')
      }
    } catch (err) {
      console.error('❌ Failed to fetch campaign:', err)
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Campaign
          </h2>
          <p className="text-gray-600">
            Fetching your saved campaign details...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Campaign not found</h2>
        </div>
      </div>
    )
  }

  const campaignData = campaign.campaign_data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Back Button */}
          <div className="relative mb-8">
            {/* Back Button - positioned in top left */}
            <button
              onClick={() => router.back()}
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{campaign.campaign_name}</h1>
              <p className="text-gray-600 mb-2">Campaign for {campaign.brand_name}</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span>Created {formatDate(campaign.created_at)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.mode === 'auto' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {campaign.mode === 'auto' ? 'AI Generated' : 'Guided'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.status === 'draft' 
                    ? 'bg-gray-100 text-gray-700'
                    : campaign.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Campaign Summary */}
            <CampaignSection title="Campaign Summary" icon={<FileText className="w-6 h-6 text-orange-600" />}>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-3">Overview</h3>
                  <p className="text-orange-700">{campaignData?.campaignSummary?.overview || 'Campaign overview not available'}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Why We're Doing This</h3>
                  <p className="text-blue-700">{campaignData?.campaignSummary?.rationale || 'Campaign rationale not available'}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-3">How We'll Do It</h3>
                  <p className="text-green-700">{campaignData?.campaignSummary?.approach || 'Campaign approach not available'}</p>
                </div>
              </div>
            </CampaignSection>

            {/* Business Challenge */}
            <CampaignSection title="Business Challenge" icon={<Target className="w-6 h-6 text-blue-600" />}>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Objectives</h3>
                  <ul className="space-y-2">
                    {(campaignData?.businessChallenge?.objectives || []).map((obj, index) => (
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
                    {(campaignData?.businessChallenge?.challenges || []).map((challenge, index) => (
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
                    {(campaignData?.businessChallenge?.kpis || []).map((kpi, index) => (
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
                      <p className="text-green-600">{campaignData?.audience?.primary?.demographics || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-700">Psychographics</h4>
                      <p className="text-green-600">{campaignData?.audience?.primary?.psychographics || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-700">Behaviors</h4>
                      <p className="text-green-600">{campaignData?.audience?.primary?.behaviors || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">Secondary Audience</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-blue-700">Demographics</h4>
                      <p className="text-blue-600">{campaignData?.audience?.secondary?.demographics || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700">Psychographics</h4>
                      <p className="text-blue-600">{campaignData?.audience?.secondary?.psychographics || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700">Behaviors</h4>
                      <p className="text-blue-600">{campaignData?.audience?.secondary?.behaviors || 'Not specified'}</p>
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
                    <p className="text-gray-700">{campaignData?.strategy?.approach || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Key Channels</h3>
                    <div className="flex flex-wrap gap-2">
                      {(campaignData?.strategy?.channels || []).map((channel, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
                    <p className="text-gray-700">{campaignData?.strategy?.timeline || 'Not specified'}</p>
                  </div>
                  {/* Campaign Phases */}
                  {campaignData?.strategy?.phases && Array.isArray(campaignData.strategy.phases) && campaignData.strategy.phases.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Campaign Phases</h3>
                      <div className="space-y-3">
                        {campaignData.strategy.phases.map((phase, index) => (
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
                    <p className="text-yellow-700 font-medium">{campaignData?.propositionPlatform?.bigIdea || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Core Message</h3>
                    <p className="text-gray-700">{campaignData?.propositionPlatform?.coreMessage || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Tonal Attributes</h3>
                    <div className="flex flex-wrap gap-2">
                      {(campaignData?.propositionPlatform?.tonalAttributes || []).map((attr, index) => (
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
                    {(campaignData?.culture?.culturalMoments || []).map((moment, index) => (
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
                    {(campaignData?.culture?.timelyOpportunities || []).map((opp, index) => (
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
                    <p className="text-gray-700">{campaignData?.keyDetails?.budget || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
                    <p className="text-gray-700">{campaignData?.keyDetails?.timeline || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Required Resources</h3>
                    <ul className="space-y-1">
                      {(campaignData?.keyDetails?.resources || []).map((resource, index) => (
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
                    <p className="text-red-700">{campaignData?.ambition?.primaryGoal || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Success Metrics</h3>
                    <ul className="space-y-1">
                      {(campaignData?.ambition?.successMetrics || []).map((metric, index) => (
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
                      {(campaignData?.thoughtStarters?.creativeDirections || []).map((direction, index) => (
                        <li key={index} className="text-gray-700 text-sm">💡 {direction}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Activation Ideas</h3>
                    <ul className="space-y-1">
                      {(campaignData?.thoughtStarters?.activationIdeas || []).map((idea, index) => (
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
                      {(campaignData?.keyDeliverables?.immediate || []).map((item, index) => (
                        <li key={index} className="text-gray-700 text-sm">⚡ {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Short Term (1-3 months)</h3>
                    <ul className="space-y-1">
                      {(campaignData?.keyDeliverables?.shortTerm || []).map((item, index) => (
                        <li key={index} className="text-gray-700 text-sm">📈 {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Long Term (3+ months)</h3>
                    <ul className="space-y-1">
                      {(campaignData?.keyDeliverables?.longTerm || []).map((item, index) => (
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
                onClick={() => router.back()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CampaignView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Campaign
          </h2>
          <p className="text-gray-600">
            Fetching campaign details...
          </p>
        </div>
      </div>
    }>
      <CampaignViewContent />
    </Suspense>
  )
} 