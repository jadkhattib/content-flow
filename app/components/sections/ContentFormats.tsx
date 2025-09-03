'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Video, TrendingUp, Users, Eye, Heart, Share, MessageCircle, ChevronDown, ChevronRight, Globe, BarChart3 } from 'lucide-react'

interface ContentFormatsProps {
  data: any
}

export default function ContentFormats({ data }: ContentFormatsProps) {
  const [expandedFormats, setExpandedFormats] = useState<{ [key: string]: boolean }>({})
  const [selectedRegion, setSelectedRegion] = useState<string>('All')

  const analysis = data?.structuredAnalysis?.thematicAnalysis
  const regions = ['All', 'US', 'UK', 'France', 'Spain', 'Netherlands', 'Thailand', 'Mexico', 'Saudi Arabia']

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Content & Formats</h2>
          <p className="text-gray-600 mb-6">
            Deep dive into content creation patterns, format performance, and creator innovations
          </p>
          <div className="text-left bg-blue-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">This section will analyze:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Video className="w-4 h-4 text-blue-600" />
                <span>Dominant content formats</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Performance metrics</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Creator experimentation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Regional variations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const toggleFormat = (formatKey: string) => {
    setExpandedFormats(prev => ({
      ...prev,
      [formatKey]: !prev[formatKey]
    }))
  }

  const getEngagementMetrics = (theme: any) => {
    if (!theme?.contentFormats) return null

    return {
      dominant: theme.contentFormats.dominantFormats || [],
      bestPerforming: theme.contentFormats.bestPerforming || [],
      experimentation: theme.contentFormats.creatorExperimentation || [],
      marketVariations: theme.contentFormats.marketVariations || {}
    }
  }

  const getRegionData = (marketVariations: any, region: string) => {
    if (region === 'All') return 'Global trends and patterns'
    return marketVariations?.[region] || `No specific data available for ${region}`
  }

  const renderThemeFormats = (themeKey: string, themeData: any, themeLabel: string, icon: any) => {
    const metrics = getEngagementMetrics(themeData)
    if (!metrics) return null

    const Icon = icon
    const isExpanded = expandedFormats[themeKey]

    return (
      <motion.div
        key={themeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleFormat(themeKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{themeLabel}</h3>
                <p className="text-sm text-gray-600">
                  {metrics.dominant.length} formats • {metrics.bestPerforming.length} top performers
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-6 space-y-6">
              {/* Format Performance Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Dominant Formats */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Dominant Formats
                  </h4>
                  <div className="space-y-2">
                    {metrics.dominant.map((format: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-blue-800">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Performing */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Best Performing
                  </h4>
                  <div className="space-y-2">
                    {metrics.bestPerforming.map((format: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-800">{format}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Creator Innovation */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Innovation Trends
                  </h4>
                  <div className="space-y-2">
                    {metrics.experimentation.map((trend: string, idx: number) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-sm text-purple-800">{trend}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Regional Insights */}
              {Object.keys(metrics.marketVariations).length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Regional Format Preferences
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(metrics.marketVariations).map(([region, preference]) => (
                      <div key={region} className="border-l-4 border-indigo-400 pl-4">
                        <h5 className="font-medium text-gray-800 text-sm">{region}</h5>
                        <p className="text-sm text-gray-600">{preference as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }

  const themeIcons = {
    fashion: Video,
    beauty: TrendingUp,
    romance: Heart,
    friendships: Users,
    workRelationships: BarChart3,
    characterTraits: Eye,
    locations: Globe,
    sceneCutDowns: Video,
    brandCollaborations: Share
  }

  const themeLabels = {
    fashion: 'Fashion Content',
    beauty: 'Beauty Tutorials',
    romance: 'Romance Edits',
    friendships: 'Friendship Content',
    workRelationships: 'Workplace Stories',
    characterTraits: 'Character Analysis',
    locations: 'Location Features',
    sceneCutDowns: 'Scene Compilations',
    brandCollaborations: 'Brand Content'
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Content & Formats</h1>
            <p className="text-blue-100">
              Strategic analysis of content creation patterns and performance
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-blue-100">
            Understand which content formats dominate each theme, how they perform across different 
            engagement metrics, and how creators are innovating with new techniques and styles.
          </p>
        </div>
      </div>

      {/* Region Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2 text-indigo-600" />
          Regional Analysis
        </h3>
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedRegion === region
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {selectedRegion !== 'All' && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Regional Focus: {selectedRegion}</h4>
            <p className="text-sm text-indigo-700">
              Content format preferences and trends specific to the {selectedRegion} market.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {analysis && Object.entries(analysis).map(([themeKey, themeData]) => {
          const icon = themeIcons[themeKey as keyof typeof themeIcons] || Video
          const label = themeLabels[themeKey as keyof typeof themeLabels] || themeKey
          return renderThemeFormats(themeKey, themeData, label, icon)
        })}
      </div>

      {/* Summary Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
          Key Content Format Insights
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Universal High-Performers</h4>
            <p className="text-sm text-gray-600">
              Transformation videos, outfit recreations, and GRWM content consistently drive high engagement across all themes.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Innovation Opportunities</h4>
            <p className="text-sm text-gray-600">
              Split-screen editing, before/after transitions, and interactive elements are emerging as key differentiators.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
