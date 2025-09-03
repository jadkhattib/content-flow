'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, TrendingUp, Clock, Hash, Zap, Eye, Shield, ChevronDown, ChevronRight, Globe } from 'lucide-react'

interface CommunityDynamicsProps {
  data: any
}

export default function CommunityDynamics({ data }: CommunityDynamicsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'temporal' | 'influence' | 'cultural'>('overview')
  const [expandedTopics, setExpandedTopics] = useState<{ [key: string]: boolean }>({})

  const analysis = data?.structuredAnalysis?.conversationAnalysis

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Dynamics</h2>
          <p className="text-gray-600 mb-6">
            Understanding conversation patterns, community behavior, and influence networks
          </p>
          <div className="text-left bg-green-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">This section will reveal:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span>Conversation triggers & patterns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Viral moment analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-green-600" />
                <span>Temporal engagement patterns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Globe className="w-4 h-4 text-green-600" />
                <span>Cultural differences by market</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }))
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'temporal', label: 'Temporal Patterns', icon: Clock },
    { id: 'influence', label: 'Influence Mapping', icon: TrendingUp },
    { id: 'cultural', label: 'Cultural Intelligence', icon: Globe }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Tone */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
          Overall Community Tone
        </h3>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-700">{analysis.overallTone || 'Community tone analysis in progress...'}</p>
        </div>
      </div>

      {/* Cross-Fandom References */}
      {analysis.crossFandomReferences && analysis.crossFandomReferences.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-purple-600" />
            Cross-Fandom Connections
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.crossFandomReferences.map((reference: string, idx: number) => (
              <div key={idx} className="bg-purple-50 rounded-lg p-3">
                <p className="text-sm text-purple-800">{reference}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTemporalPatterns = () => (
    <div className="space-y-6">
      {analysis.temporalPatterns && (
        <>
          {/* Peak Times */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Peak Conversation Times
            </h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700">{analysis.temporalPatterns.peakTimes}</p>
            </div>
          </div>

          {/* Seasonal Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              Seasonal Trends
            </h3>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-gray-700">{analysis.temporalPatterns.seasonalTrends}</p>
            </div>
          </div>

          {/* Viral Moments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-red-600" />
              Recent Viral Moments
            </h3>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-gray-700">{analysis.temporalPatterns.viralMoments}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderInfluenceMapping = () => (
    <div className="space-y-6">
      {analysis.influenceMapping && (
        <>
          {/* Top Voices */}
          {analysis.influenceMapping.topVoices && analysis.influenceMapping.topVoices.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-indigo-600" />
                Most Influential Voices
              </h3>
              <div className="grid gap-3">
                {analysis.influenceMapping.topVoices.map((voice: string, idx: number) => (
                  <div key={idx} className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-400">
                    <p className="text-sm text-indigo-800">{voice}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Micro Communities */}
          {analysis.influenceMapping.microCommunities && analysis.influenceMapping.microCommunities.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                Micro-Communities
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {analysis.influenceMapping.microCommunities.map((community: string, idx: number) => (
                  <div key={idx} className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-green-800">{community}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Evolution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-purple-600" />
              Hashtag Evolution
            </h3>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-gray-700">{analysis.influenceMapping.hashtagEvolution}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderCulturalIntelligence = () => (
    <div className="space-y-6">
      {analysis.culturalDifferences && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-teal-600" />
            Cultural Market Differences
          </h3>
          <div className="space-y-4">
            {Object.entries(analysis.culturalDifferences).map(([market, emphasis]) => (
              <div key={market} className="border-l-4 border-teal-400 pl-4 bg-teal-50 rounded-r-lg p-4">
                <h4 className="font-medium text-teal-900 mb-2">{market} Market</h4>
                <p className="text-sm text-teal-700">{emphasis as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'temporal':
        return renderTemporalPatterns()
      case 'influence':
        return renderInfluenceMapping()
      case 'cultural':
        return renderCulturalIntelligence()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Community Dynamics</h1>
            <p className="text-green-100">
              Understanding conversation patterns, community behavior, and influence networks
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-green-100">
            Dive deep into how the Emily in Paris community engages, what triggers conversations, 
            when they're most active, and how influence flows through different networks and regions.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Key Insights Summary */}
      <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 border border-teal-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-teal-600" />
          Strategic Community Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Engagement Triggers</h4>
            <p className="text-sm text-gray-600">
              New episode releases, cast announcements, and fashion reveals drive the highest community engagement.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Influence Distribution</h4>
            <p className="text-sm text-gray-600">
              Community power is distributed across fashion recreators, cultural commentators, and beauty tutorial creators.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
