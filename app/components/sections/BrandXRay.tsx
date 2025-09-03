'use client'

import { motion } from 'framer-motion'
import { Eye, MessageSquare, Hash, TrendingUp, Users, Clock, Globe, BarChart3 } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface BrandXRayProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      conversationAnalysis?: {
        overallTone: string
        crossFandomReferences: string[]
        temporalPatterns: {
          peakTimes: string
          seasonalTrends: string
          viralMoments: string
        }
        culturalDifferences: {
          [region: string]: string
        }
        influenceMapping: {
          topVoices: string[]
          microCommunities: string[]
          hashtagEvolution: string
        }
      }
    }
  }
}

export default function BrandXRay({ data }: BrandXRayProps) {
  const analysis = data.structuredAnalysis?.conversationAnalysis

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Eye className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Conversation Analysis</h1>
            <p className="text-gray-600">{data.brandName} Community Conversations & Trends</p>
          </div>
        </div>

        {analysis ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Community Overview</h3>
            <p className="text-lg text-gray-700">Analysis of trending conversations, language patterns, and content themes within the Emily in Paris fandom community to understand engagement dynamics and brand opportunities.</p>
            {analysis.overallTone && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Overall Tone</h4>
                <p className="text-gray-700">{analysis.overallTone}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">Deep conversation analysis is being prepared to understand community discussions and trending topics.</p>
          </div>
        )}
      </div>

      {/* Cross-Fandom References */}
      {analysis?.crossFandomReferences && analysis.crossFandomReferences.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Hash className="w-6 h-6 text-brand-accent" />
            <span>Cross-Fandom References</span>
          </h2>
          
          <div className="space-y-4">
            {analysis.crossFandomReferences.map((reference, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800">{reference}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temporal Patterns */}
      {analysis?.temporalPatterns && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Clock className="w-6 h-6 text-brand-accent" />
            <span>Temporal Patterns</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-purple-800 mb-3">Peak Times</h3>
              <p className="text-purple-700 text-sm">{analysis.temporalPatterns.peakTimes}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-800 mb-3">Seasonal Trends</h3>
              <p className="text-green-700 text-sm">{analysis.temporalPatterns.seasonalTrends}</p>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h3 className="font-semibold text-orange-800 mb-3">Viral Moments</h3>
              <p className="text-orange-700 text-sm">{analysis.temporalPatterns.viralMoments}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cultural Differences */}
      {analysis?.culturalDifferences && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Globe className="w-6 h-6 text-brand-accent" />
            <span>Regional Cultural Differences</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.culturalDifferences).map(([region, description], index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
                { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' }
              ]
              const color = colors[index % 5]
              
              return (
                <div key={region} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3`}>{region}</h3>
                  <p className={`${color.text} text-sm`}>{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Influence Mapping */}
      {analysis?.influenceMapping && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-brand-accent" />
            <span>Influence Mapping</span>
          </h2>
          
          <div className="space-y-6">
            {/* Top Voices */}
            {analysis.influenceMapping.topVoices && analysis.influenceMapping.topVoices.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h3 className="font-semibold text-indigo-800 mb-4">Top Voices</h3>
                <div className="space-y-2">
                  {analysis.influenceMapping.topVoices.map((voice, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <span className="text-indigo-700 text-sm">{voice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Micro Communities */}
            {analysis.influenceMapping.microCommunities && analysis.influenceMapping.microCommunities.length > 0 && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
                <h3 className="font-semibold text-cyan-800 mb-4">Micro Communities</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.influenceMapping.microCommunities.map((community, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-100 text-cyan-800 text-sm rounded-full">
                      {community}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hashtag Evolution */}
            {analysis.influenceMapping.hashtagEvolution && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                <h3 className="font-semibold text-teal-800 mb-3">Hashtag Evolution</h3>
                <p className="text-teal-700 text-sm">{analysis.influenceMapping.hashtagEvolution}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}