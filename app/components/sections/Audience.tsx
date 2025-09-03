'use client'

import { motion } from 'framer-motion'
import { Users, Heart, MapPin, Calendar, TrendingUp, UserCheck, MessageSquare, Target } from 'lucide-react'
import { useState } from 'react'
import { formatAllCitations } from '@/lib/citationUtils'

interface AudienceProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      languageVoice?: {
        tonalCharacteristics: {
          primaryTone: string
          emotionalRange: string
          sophisticationLevel: string
          brandAlignment: string
        }
        vocabularyPatterns: {
          commonWords: string[]
          slangTerms: string[]
          beautyTerms: string[]
          fashionLanguage: string[]
          positiveDescriptors: string[]
          negativeIndicators?: string[]
        }
        communicationStyle: {
          contentFormats: string[]
          preferredPlatforms: string[]
          engagementStyle: string
          visualElements: string
        }
        brandVoiceAlignment?: {
          vaselineCompatibility: string
          toneMatching: string
          languageOpportunities: string[]
          messagingGuidance: string
        }
      }
      // Legacy fallback
      audience?: {
        corePersonas: {
          name: string
          percentage: string | { value: number | null; unit: string; confidence: number; dataStatus: string }
          age: string
          title: string
          description: string
          demographics: {
            income: string
            location: string
            education: string
            familyStatus: string
          }
          psychographics: {
            values: string[]
            lifestyle: string
            interests: string[]
            aspirations: string[]
          }
          needs: string[]
          painPoints: string[]
          behaviors: string[]
          mediaConsumption: {
            platforms: string[]
            content: string[]
            influencers: string[]
            channels: string[]
          }
          brandRelationship: {
            currentPerception: string
            desiredRelationship: string
            touchpoints: string[]
          }
        }[]
        marketDifferences: string
        subCultures: string[]
        adjacentAudiences: string[]
        consumerQuotes: string[]
        dayInLife: string
      }
    }
    socialData: {
      demographics: {
        gender: { female: number; male: number; nonbinary: number }
        age: {
          '13-17': number
          '18-24': number
          '25-34': number
          '35-44': number
          '45-54': number
          '55+': number
        }
      }
    }
  }
}

export default function Audience({ data }: AudienceProps) {
  const [selectedPersona, setSelectedPersona] = useState(0)
  const analysis = data.structuredAnalysis?.languageVoice || data.structuredAnalysis?.audience
  const socialData = data.socialData

  // Helper function to safely render metric values
  const renderMetricValue = (metric: string | { value: number | null; unit: string; confidence: number; dataStatus: string }) => {
    if (typeof metric === 'string') {
      // Handle both old format strings and new currency format strings
      const formattedValue = formatCurrencyValue(metric)
      return formatAllCitations(formattedValue)
    }
    
    if (typeof metric === 'object' && metric !== null) {
      if (metric.value === null || metric.dataStatus === 'missing') {
        return 'Data not available'
      }
      
      const formattedValue = metric.unit.includes('GBP') 
        ? `£${metric.value}${metric.unit.replace('GBP-', '')}`
        : `${metric.value}${metric.unit}`
      
      return formatAllCitations(formattedValue)
    }
    
    return 'N/A'
  }

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

  // Helper function to render list items safely
  const renderList = (items: string[] | undefined, className = "text-gray-700") => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500 text-sm">No data available</p>
    }
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, index) => (
          <li key={index} className={`text-sm ${className}`}>{formatAllCitations(item)}</li>
        ))}
      </ul>
    )
  }

  // Helper function to safely get persona data
  const getPersonaData = (persona: any, path: string, fallback: string = "Not specified") => {
    const keys = path.split('.')
    let current = persona
    for (const key of keys) {
      if (!current || current[key] === undefined) {
        return fallback
      }
      current = current[key]
    }
    return current || fallback
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
          <Users className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Language & Voice</h1>
            <p className="text-gray-600">{data.brandName} Community Communication Patterns</p>
          </div>
        </div>

        {data.structuredAnalysis?.languageVoice ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Communication Analysis</h3>
            <p className="text-lg text-gray-700">Deep analysis of how the Emily in Paris fandom communicates, their language patterns, tone, and vocabulary to guide authentic brand voice development for Vaseline partnerships.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">Language and voice analysis is being prepared to understand community communication patterns.</p>
          </div>
        )}
      </div>
      {/* Core Personas */}
      {analysis?.audience?.corePersonas && analysis.audience.corePersonas.length > 0 ? (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Core Personas</h2>
          
          {/* Persona Navigation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {analysis.audience.corePersonas.map((persona, index) => (
              <button
                key={index}
                onClick={() => setSelectedPersona(index)}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedPersona === index
                    ? 'bg-brand-accent text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-semibold">{persona?.name || `Persona ${index + 1}`}</div>
                <div className="text-sm opacity-90">{persona?.age || 'Age not specified'}</div>
                <div className="text-xs opacity-75 mt-1">{persona?.title || 'Title not specified'}</div>
                {persona?.percentage && (
                  <div className={`text-xs font-medium mt-2 px-2 py-1 rounded-full ${
                    selectedPersona === index ? 'bg-white/20 text-white' : 'bg-brand-accent/10 text-brand-accent'
                  }`}>
                    {renderMetricValue(persona.percentage)} of customers
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Persona Details */}
          {analysis.audience?.corePersonas?.[selectedPersona] && (
            <motion.div
              key={selectedPersona}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Persona Overview */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <UserCheck className="w-8 h-8 text-brand-accent" />
                      <div>
                        <h3 className="text-xl font-bold text-brand-dark">
                          {getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'name', `Persona ${selectedPersona + 1}`)}
                        </h3>
                        <p className="text-gray-600">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'title')}</p>
                        {analysis.audience?.corePersonas?.[selectedPersona]?.percentage && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-medium">
                              {renderMetricValue(analysis.audience?.corePersonas?.[selectedPersona]?.percentage)} of customer base
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'description', 'Detailed persona description not available')}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'age')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'demographics.location')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'demographics.income')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'demographics.familyStatus')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3">Core Values</h4>
                      {renderList(analysis.audience?.corePersonas?.[selectedPersona]?.psychographics?.values)}
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3">Key Interests</h4>
                      {renderList(analysis.audience?.corePersonas?.[selectedPersona]?.psychographics?.interests)}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3">Needs & Motivations</h4>
                      {renderList(analysis.audience?.corePersonas?.[selectedPersona]?.needs, "text-green-700")}
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3">Pain Points</h4>
                      {renderList(analysis.audience?.corePersonas?.[selectedPersona]?.painPoints, "text-red-700")}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-dark mb-3">Media Consumption</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Platforms:</p>
                        <div className="flex flex-wrap gap-2">
                          {(analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.platforms || []).map((platform, idx) => (
                            <span key={idx} className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-xs">
                              {platform}
                            </span>
                          ))}
                          {(!analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.platforms || analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.platforms?.length === 0) && (
                            <span className="text-gray-500 text-sm">No platform data available</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Content Types:</p>
                        <div className="flex flex-wrap gap-2">
                          {(analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.content || []).map((content, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                              {content}
                            </span>
                          ))}
                          {(!analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.content || analysis.audience?.corePersonas?.[selectedPersona]?.mediaConsumption?.content?.length === 0) && (
                            <span className="text-gray-500 text-sm">No content data available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-dark mb-3">Brand Relationship</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Current Perception:</p>
                        <p className="text-gray-700">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'brandRelationship.currentPerception')}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Desired Relationship:</p>
                        <p className="text-gray-700">{getPersonaData(analysis.audience?.corePersonas?.[selectedPersona], 'brandRelationship.desiredRelationship')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Core Personas</h2>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Persona analysis is being processed. This data will be available shortly.</p>
          </div>
        </div>
      )}

      {/* Additional Insights */}
      {analysis && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-brand-dark mb-4">Sub-cultures & Communities</h3>
            {renderList(analysis.subCultures)}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-brand-dark mb-4">Adjacent Audiences</h3>
            {renderList(analysis.adjacentAudiences)}
          </div>
        </div>
      )}

      {/* Consumer Quotes */}
      {analysis?.consumerQuotes && analysis.consumerQuotes.length > 0 && (
        <div className="card p-8">
          <h3 className="font-semibold text-brand-dark mb-6">Consumer Voice</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {analysis.consumerQuotes.map((quote, index) => (
              <blockquote key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-brand-accent">
                <p className="text-gray-700 italic">"{formatAllCitations(quote)}"</p>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
} 