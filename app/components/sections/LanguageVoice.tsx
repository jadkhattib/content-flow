'use client'

import { motion } from 'framer-motion'
import { Users, Heart, MessageSquare, Target } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface LanguageVoiceProps {
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
    }
  }
}

export default function LanguageVoice({ data }: LanguageVoiceProps) {
  const analysis = data.structuredAnalysis?.languageVoice

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

        {analysis ? (
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

      {/* Tonal Characteristics */}
      {analysis?.tonalCharacteristics && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Heart className="w-6 h-6 text-brand-accent" />
            <span>Tonal Characteristics</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.tonalCharacteristics).map(([key, description], index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vocabulary Patterns */}
      {analysis?.vocabularyPatterns && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-brand-accent" />
            <span>Vocabulary Patterns</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analysis.vocabularyPatterns).map(([key, terms], index) => {
              if (!Array.isArray(terms)) return null
              
              const colors = [
                { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
                { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
                { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800' },
                { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' },
                { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800' },
                { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' }
              ]
              const color = colors[index % 6]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-4 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {terms.slice(0, 8).map((term, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-white rounded text-gray-600 border border-gray-200">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Communication Style */}
      {analysis?.communicationStyle && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Users className="w-6 h-6 text-brand-accent" />
            <span>Communication Style</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.communicationStyle).map(([key, value], index) => {
              const colors = [
                { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
                { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800' },
                { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-white rounded text-gray-600 border border-gray-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Brand Voice Alignment */}
      {analysis?.brandVoiceAlignment && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Target className="w-6 h-6 text-brand-accent" />
            <span>Vaseline Brand Voice Alignment</span>
          </h2>
          
          <div className="space-y-6">
            {Object.entries(analysis.brandVoiceAlignment).map(([key, value], index) => {
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', accent: 'bg-blue-100' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', accent: 'bg-green-100' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', accent: 'bg-purple-100' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', accent: 'bg-orange-100' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  {Array.isArray(value) ? (
                    <div className="space-y-2">
                      {value.map((item, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className={`w-2 h-2 ${color.accent} rounded-full mt-2 flex-shrink-0`}></div>
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
