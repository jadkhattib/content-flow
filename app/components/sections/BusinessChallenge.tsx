'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Target, ArrowUp, ArrowDown, AlertTriangle, CheckCircle, XCircle, Shield, Zap } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface BusinessChallengeProps {
  data: {
    brandName: string
    category: string
    timeframe: string
    pitchContext: string
    structuredAnalysis?: {
      communityDeepDive?: {
        fanPersonas: Array<{
          name: string
          percentage: string
          age: string
          description: string
          platforms: string[]
          behaviors: string[]
          beautyInterests: string[]
          contentCreation: string
          brandRelationship: string
          vaselineAlignment: string
        }>
        communitySegments: {
          coreFans: string
          casualViewers: string
          contentCreators: string
          beautyEnthusiasts: string
        }
        behaviorPatterns: {
          contentConsumption: string
          socialSharing: string
          brandEngagement: string
          purchaseInfluence: string
        }
        fanQuotes?: Array<{
          quote: string
          platform: string
          context: string
          relevance: string
        }>
      }
      // Legacy fallback
      businessChallenge?: {
        commercialObjective: string
        topChallenges: string[]
        strengths: string[]
        weaknesses: string[]
        macroFactors: {
          headwinds: string[]
          tailwinds: string[]
        }
      }
    }
  }
}

export default function BusinessChallenge({ data }: BusinessChallengeProps) {
  const analysis = data.structuredAnalysis?.communityDeepDive || data.structuredAnalysis?.businessChallenge

  // Helper function to format currency values with £ symbol
  const formatCurrencyValue = (value: string): string => {
    // Replace $ with £ for any dollar amounts
    let formatted = value.replace(/\$([0-9.,]+)/g, '£$1')
    
    // Replace USD references with GBP
    formatted = formatted.replace(/USD/g, 'GBP')
    
    // If it contains billion/million indicators, ensure £ symbol
    if (formatted.match(/[0-9.,]+[BMK]/i) && !formatted.includes('£')) {
      formatted = formatted.replace(/([0-9.,]+[BMK])/i, '£$1')
    }
    
    return formatted
  }

  const renderList = (items: string[], className = "text-gray-700") => (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, index) => (
        <li key={index} className={`text-sm ${className}`}>{formatAllCitations(formatCurrencyValue(item))}</li>
      ))}
    </ul>
  )

  // Challenge card component
  const ChallengeCard = ({ challenge, index }: { challenge: string, index: number }) => {
    const colors = [
      { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: 'text-red-600' },
      { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' },
      { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', icon: 'text-yellow-600' }
    ]
    const color = colors[index % 3]

    return (
      <div className={`${color.bg} ${color.border} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg bg-white shadow-sm`}>
            <AlertTriangle className={`w-5 h-5 ${color.icon}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Challenge {index + 1}</span>
            </div>
            <p className={`font-medium leading-relaxed ${color.text}`}>{formatAllCitations(challenge)}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Community Deep Dive</h1>
            <p className="text-gray-600">{data.brandName} Fan Community Analysis & Insights</p>
          </div>
        </div>

        {/* Community Context */}
        {data.structuredAnalysis?.communityDeepDive ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl mb-8">
            <h3 className="font-semibold text-brand-dark mb-3">Community Overview</h3>
            <p className="text-lg text-gray-700">Deep analysis of the Emily in Paris fandom community, exploring fan personas, behavior patterns, and engagement dynamics to understand how Vaseline can authentically connect with this passionate audience.</p>
          </div>
        ) : analysis?.commercialObjective ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl mb-8">
            <h3 className="font-semibold text-brand-dark mb-3">Commercial Objective</h3>
            <p className="text-lg text-gray-700">{formatAllCitations(analysis.commercialObjective)}</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl mb-8">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">{formatAllCitations(data.pitchContext)}</p>
          </div>
        )}

        {/* Fan Personas */}
        {data.structuredAnalysis?.communityDeepDive?.fanPersonas && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-brand-accent" />
              <h3 className="text-xl font-semibold text-brand-dark">Fan Personas</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {data.structuredAnalysis.communityDeepDive.fanPersonas.map((persona, index) => {
                const colors = [
                  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: 'text-blue-600' },
                  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: 'text-green-600' },
                  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: 'text-purple-600' },
                  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: 'text-orange-600' }
                ]
                const color = colors[index % 4]
                
                return (
                  <div key={index} className={`${color.bg} ${color.border} border rounded-xl p-6 hover:shadow-md transition-shadow`}>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${color.text}`}>{persona.name}</h4>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full bg-white ${color.text}`}>{persona.percentage}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{persona.age}</p>
                      <p className="text-sm text-gray-700 mb-4">{persona.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Platforms</h5>
                        <div className="flex flex-wrap gap-1">
                          {persona.platforms.map((platform, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-white rounded text-gray-600">{platform}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Vaseline Alignment</h5>
                        <p className="text-xs text-gray-700">{persona.vaselineAlignment}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Community Segments */}
      {data.structuredAnalysis?.communityDeepDive?.communitySegments && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
            <span>Community Segments</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data.structuredAnalysis.communityDeepDive.communitySegments).map(([key, description], index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6 hover:shadow-md transition-shadow`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Behavior Patterns */}
      {data.structuredAnalysis?.communityDeepDive?.behaviorPatterns && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Fan Behavior Patterns</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data.structuredAnalysis.communityDeepDive.behaviorPatterns).map(([key, description], index) => {
              const icons = [
                { icon: CheckCircle, color: 'green' },
                { icon: TrendingUp, color: 'blue' },
                { icon: Target, color: 'purple' },
                { icon: Zap, color: 'orange' }
              ]
              const iconInfo = icons[index % 4]
              
              return (
                <div key={key} className={`bg-${iconInfo.color}-50 border-l-4 border-${iconInfo.color}-400 p-6 rounded-r-lg hover:shadow-md transition-shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-${iconInfo.color}-100`}>
                      <iconInfo.icon className={`w-5 h-5 text-${iconInfo.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-${iconInfo.color}-800 mb-3 capitalize`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
} 