'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Languages, MessageCircle, Volume2, Zap, Users, Eye, ChevronDown, ChevronRight, Hash } from 'lucide-react'

interface CulturalIntelligenceProps {
  data: any
}

export default function CulturalIntelligence({ data }: CulturalIntelligenceProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const analysis = data?.structuredAnalysis?.languageVoice
  const conversationAnalysis = data?.structuredAnalysis?.conversationAnalysis

  const regions = ['All', 'US', 'UK', 'France', 'Spain', 'Netherlands', 'Thailand', 'Mexico', 'Saudi Arabia']

  if (!analysis && !conversationAnalysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cultural Intelligence</h2>
          <p className="text-gray-600 mb-6">
            Language patterns, cultural nuances, and regional communication differences
          </p>
          <div className="text-left bg-purple-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">This section will analyze:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Languages className="w-4 h-4 text-purple-600" />
                <span>Language & vocabulary patterns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Volume2 className="w-4 h-4 text-purple-600" />
                <span>Tonal characteristics</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <Globe className="w-4 h-4 text-purple-600" />
                <span>Cultural differences by region</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <span>Communication style analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderLanguagePatterns = () => (
    <div className="space-y-6">
      {/* Tonal Characteristics */}
      {analysis?.tonalCharacteristics && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-purple-600" />
            Tonal Characteristics
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.tonalCharacteristics.primaryTone && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Primary Tone</h4>
                <p className="text-sm text-purple-700">{analysis.tonalCharacteristics.primaryTone}</p>
              </div>
            )}
            {analysis.tonalCharacteristics.emotionalRange && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-2">Emotional Range</h4>
                <p className="text-sm text-indigo-700">{analysis.tonalCharacteristics.emotionalRange}</p>
              </div>
            )}
            {analysis.tonalCharacteristics.sophisticationLevel && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Sophistication Level</h4>
                <p className="text-sm text-blue-700">{analysis.tonalCharacteristics.sophisticationLevel}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vocabulary Patterns */}
      {analysis?.vocabularyPatterns && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Languages className="w-5 h-5 mr-2 text-green-600" />
            Vocabulary Patterns
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.vocabularyPatterns.commonPhrases && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">Common Phrases</h4>
                <div className="space-y-2">
                  {analysis.vocabularyPatterns.commonPhrases.map((phrase: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-green-800">"{phrase}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.vocabularyPatterns.slangTerms && (
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-medium text-teal-900 mb-3">Slang & Terminology</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.vocabularyPatterns.slangTerms.map((term: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Communication Style */}
      {analysis?.communicationStyle && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-orange-600" />
            Communication Style
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(analysis.communicationStyle).map(([key, value], index) => {
              const colors = [
                { bg: 'bg-orange-50', text: 'text-orange-800' },
                { bg: 'bg-amber-50', text: 'text-amber-800' },
                { bg: 'bg-yellow-50', text: 'text-yellow-800' },
                { bg: 'bg-red-50', text: 'text-red-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} rounded-lg p-4`}>
                  <h4 className={`font-medium ${color.text} mb-2 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white rounded text-gray-600 border border-gray-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{String(value)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Brand Voice Alignment */}
      {analysis?.brandVoiceAlignment && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-pink-600" />
            Vaseline Brand Voice Alignment
          </h3>
          <div className="space-y-4">
            {Object.entries(analysis.brandVoiceAlignment).map(([key, value], index) => {
              const colors = [
                { bg: 'bg-pink-50', text: 'text-pink-800' },
                { bg: 'bg-purple-50', text: 'text-purple-800' },
                { bg: 'bg-rose-50', text: 'text-rose-800' },
                { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} rounded-lg p-4 border border-gray-200`}>
                  <h4 className={`font-medium ${color.text} mb-2 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  {Array.isArray(value) ? (
                    <div className="space-y-1">
                      {value.map((item: string, i: number) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{String(value)}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  const renderCulturalDifferences = () => (
    <div className="space-y-6">
      {conversationAnalysis?.culturalDifferences && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-indigo-600" />
            Regional Cultural Emphasis
          </h3>
          <div className="space-y-4">
            {Object.entries(conversationAnalysis.culturalDifferences).map(([region, emphasis]) => (
              <div key={region} className="border-l-4 border-indigo-400 pl-4 bg-indigo-50 rounded-r-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-2">{region} Market</h4>
                <p className="text-sm text-indigo-700">{emphasis as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Region Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-600" />
          Regional Analysis Focus
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedRegion === region
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {selectedRegion !== 'All' && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Focus: {selectedRegion} Market</h4>
            <p className="text-sm text-purple-700">
              Language patterns, cultural references, and communication styles specific to {selectedRegion}.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderHashtagAnalysis = () => {
    if (!conversationAnalysis?.influenceMapping?.hashtagEvolution) return null

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2 text-teal-600" />
          Hashtag Evolution & Language Trends
        </h3>
        <div className="bg-teal-50 rounded-lg p-4">
          <p className="text-gray-700">{conversationAnalysis.influenceMapping.hashtagEvolution}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Globe className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Cultural Intelligence</h1>
            <p className="text-purple-100">
              Language patterns, cultural nuances, and regional communication styles
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-purple-100">
            Understand how the Emily in Paris community communicates across different regions, 
            what language patterns define their conversations, and how cultural contexts shape their engagement.
          </p>
        </div>
      </div>

      {/* Language & Voice Analysis */}
      <div>
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer"
          onClick={() => toggleSection('language')}
        >
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Languages className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Language & Voice Patterns</h2>
                  <p className="text-sm text-gray-600">Tonal characteristics, vocabulary, and communication style</p>
                </div>
              </div>
              {expandedSections.language ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          {expandedSections.language && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 p-6"
            >
              {renderLanguagePatterns()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Cultural Differences */}
      <div>
        <div
          className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer"
          onClick={() => toggleSection('cultural')}
        >
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-indigo-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Cultural Differences by Region</h2>
                  <p className="text-sm text-gray-600">Regional variations in emphasis, topics, and communication</p>
                </div>
              </div>
              {expandedSections.cultural ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          {expandedSections.cultural && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 p-6"
            >
              {renderCulturalDifferences()}
            </motion.div>
          )}
        </div>
      </div>

      {/* Hashtag Evolution */}
      {renderHashtagAnalysis()}

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-indigo-600" />
          Strategic Cultural Insights for Vaseline
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Universal Language</h4>
            <p className="text-sm text-gray-600">
              Confidence, authenticity, and aspiration are universal themes that transcend regional differences.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Regional Adaptation</h4>
            <p className="text-sm text-gray-600">
              Messaging should adapt to local cultural contexts while maintaining core brand voice consistency.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
