'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Import strategic section components
import ExecutiveSnapshot from '@/app/components/sections/ExecutiveSnapshot'
import ThematicAnalysis from '@/app/components/sections/ThematicAnalysis'
import ContentFormats from '@/app/components/sections/ContentFormats'
import CommunityDynamics from '@/app/components/sections/CommunityDynamics'
import CulturalIntelligence from '@/app/components/sections/CulturalIntelligence'
import InfluencerIntelligence from '@/app/components/sections/InfluencerIntelligence'
import BrandSynergy from '@/app/components/sections/BrandSynergy'
import StrategicInsights from '@/app/components/sections/StrategicInsights'
import CampaignCreation from '@/app/components/sections/CampaignCreation'
import AnalysisNavigation from '@/app/components/AnalysisNavigation'
import ChatBubble from '@/app/components/ChatBubble'

const sections = [
  { id: 'strategic-overview', title: 'Strategic Overview', component: ExecutiveSnapshot, description: 'Executive summary and key fandom insights' },
  { id: 'thematic-deep-dive', title: 'Thematic Deep Dive', component: ThematicAnalysis, description: '9 core themes: Fashion, Beauty, Romance & more' },
  { id: 'content-formats', title: 'Content & Formats', component: ContentFormats, description: 'Content creation patterns and performance analysis' },
  { id: 'community-dynamics', title: 'Community Dynamics', component: CommunityDynamics, description: 'Conversation patterns and community behavior' },
  { id: 'cultural-intelligence', title: 'Cultural Intelligence', component: CulturalIntelligence, description: 'Language, voice, and regional differences' },
  { id: 'influence-mapping', title: 'Influence Mapping', component: InfluencerIntelligence, description: 'Influencer intelligence and community leaders' },
  { id: 'brand-integration', title: 'Brand Integration', component: BrandSynergy, description: 'Brand synergy and partnership opportunities' },
  { id: 'campaign-strategy', title: 'Campaign Strategy', component: StrategicInsights, description: 'Strategic insights and recommendations' },
  { id: 'campaign-creation', title: 'Campaign Creation', component: CampaignCreation, description: 'Campaign development and execution tools' },
]

interface AnalysisData {
  website: string
  brandName: string
  category: string
  timeframe: string
  pitchContext: string
  executiveSummary: string
  structuredAnalysis?: any
  fullAnalysis: string
  socialData: any
  analysisDate: string
}

export default function AnalysisSection() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)

  const sectionParam = params.section as string[]
  const requestedSectionId = sectionParam?.[0] || 'strategic-overview'
  
  // Redirect old routes to strategic overview section
  const currentSectionId = requestedSectionId === 'chat' || requestedSectionId === 'fandom-overview' ? 'strategic-overview' : requestedSectionId
  const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId)
  const currentSection = sections[currentSectionIndex]

  useEffect(() => {
    // Redirect old routes to strategic overview section
    if (requestedSectionId === 'chat' || requestedSectionId === 'fandom-overview') {
      const currentParams = new URLSearchParams(searchParams.toString())
      router.replace(`/analysis/strategic-overview?${currentParams.toString()}`)
      return
    }
    
    // Try to get data from sessionStorage first
    const savedData = sessionStorage.getItem('discoveryFlowAnalysis')
    if (savedData) {
      setData(JSON.parse(savedData))
      setLoading(false)
    } else {
      // If no saved data, redirect to home
      router.push('/')
    }
  }, [router, requestedSectionId, searchParams])

  const navigateToSection = (sectionId: string) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    router.push(`/analysis/${sectionId}?${currentParams.toString()}`)
  }

  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      navigateToSection(sections[currentSectionIndex - 1].id)
    }
  }

  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      navigateToSection(sections[currentSectionIndex + 1].id)
    }
  }

  const goBack = () => {
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No analysis data found</p>
          <button onClick={goBack} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!currentSection) {
    router.push('/analysis/strategic-overview')
    return null
  }

  const Component = currentSection.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="flex items-center space-x-2 text-brand-dark hover:text-brand-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">
                  {data.brandName} Analysis
                </h1>
                <p className="text-sm text-gray-600">{currentSection.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentSectionIndex > 0 && (
                <button 
                  onClick={goToPreviousSection}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
              {currentSectionIndex < sections.length - 1 && (
                <button 
                  onClick={goToNextSection}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <AnalysisNavigation 
              sections={sections}
              currentSection={currentSectionId}
              onNavigate={navigateToSection}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentSectionId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Component data={data} />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* AI Chat Bubble Overlay */}
      <ChatBubble data={data} />
    </div>
  )
} 