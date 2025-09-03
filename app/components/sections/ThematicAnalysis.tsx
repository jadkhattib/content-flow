'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Heart, Star, Palette, MapPin, Camera, Users, Briefcase, Sparkles, Building2, ExternalLink, Search, Loader2 } from 'lucide-react'

interface ThematicAnalysisProps {
  data: any
}

interface ExampleUrl {
  url: string
  description: string
}

interface Examples {
  [key: string]: ExampleUrl[]
}

const themeIcons = {
  fashion: Palette,
  beauty: Sparkles, 
  romance: Heart,
  friendships: Users,
  workRelationships: Briefcase,
  characterTraits: Star,
  locations: MapPin,
  sceneCutDowns: Camera,
  brandCollaborations: Building2
}

const themeLabels = {
  fashion: 'Fashion & Style',
  beauty: 'Beauty & Skincare',
  romance: 'Romance & Relationships',
  friendships: 'Friendships & Bonds',
  workRelationships: 'Work Relationships',
  characterTraits: 'Emily\'s Character Traits',
  locations: 'Locations & Travel',
  sceneCutDowns: 'Scene Cut-downs & Edits',
  brandCollaborations: 'Brand Collaborations'
}

export default function ThematicAnalysis({ data }: ThematicAnalysisProps) {
  const [expandedThemes, setExpandedThemes] = useState<{ [key: string]: boolean }>({})
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const [showingExamples, setShowingExamples] = useState<{ [key: string]: boolean }>({})
  const [loadingExamples, setLoadingExamples] = useState<{ [key: string]: boolean }>({})
  const [examples, setExamples] = useState<{ [key: string]: Examples }>({})

  const analysis = data?.structuredAnalysis?.thematicAnalysis

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thematic Deep Dive</h2>
          <p className="text-gray-600 mb-6">
            Comprehensive analysis across 9 core Emily in Paris fandom themes
          </p>
          <div className="text-left bg-purple-50 rounded-lg p-6">
            <p className="text-gray-600 mb-4">This section will provide deep insights into:</p>
            <div className="grid md:grid-cols-2 gap-3">
              {Object.entries(themeLabels).map(([key, label]) => {
                const Icon = themeIcons[key as keyof typeof themeIcons]
                return (
                  <div key={key} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Icon className="w-4 h-4 text-purple-600" />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const findExamples = async (sectionKey: string, items: string[], theme: string, context: string) => {
    const loadingKey = `${theme}-${sectionKey}`
    
    setLoadingExamples(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      const response = await fetch('/api/find-examples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          context: `${context} for ${themeLabels[theme as keyof typeof themeLabels]} in Emily in Paris`,
          theme: themeLabels[theme as keyof typeof themeLabels]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to find examples')
      }

      const data = await response.json()
      
      setExamples(prev => ({
        ...prev,
        [loadingKey]: data.examples
      }))
      
      setShowingExamples(prev => ({
        ...prev,
        [loadingKey]: true
      }))
      
    } catch (error) {
      console.error('Error finding examples:', error)
    } finally {
      setLoadingExamples(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const toggleTheme = (theme: string) => {
    setExpandedThemes(prev => ({
      ...prev,
      [theme]: !prev[theme]
    }))
  }

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const renderThemeSection = (themeKey: string, themeData: any) => {
    if (!themeData) return null

    const Icon = themeIcons[themeKey as keyof typeof themeIcons]
    const label = themeLabels[themeKey as keyof typeof themeLabels]
    const isExpanded = expandedThemes[themeKey]

    return (
      <motion.div
        key={themeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleTheme(themeKey)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
                <p className="text-sm text-gray-600">Content formats, dynamics, and insights</p>
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
              {/* A. Content Formats & Performance */}
              {themeData.contentFormats && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Camera className="w-4 h-4 mr-2 text-purple-600" />
                      Content Formats & Performance
                    </h4>
                    <button
                      onClick={() => {
                        const allFormats = [
                          ...(themeData.contentFormats.dominantFormats || []),
                          ...(themeData.contentFormats.bestPerforming || []),
                          ...(themeData.contentFormats.creatorExperimentation || []),
                          ...(themeData.contentFormats.emergingTrends || [])
                        ];
                        findExamples('contentFormats', allFormats, themeKey, 'Content creation formats and performance trends');
                      }}
                      disabled={loadingExamples[`${themeKey}-contentFormats`]}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs rounded-lg transition-colors"
                    >
                      {loadingExamples[`${themeKey}-contentFormats`] ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>Show Examples</span>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.contentFormats.dominantFormats && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-medium text-purple-900 mb-2">Dominant Formats</h5>
                        <ul className="space-y-1">
                          {themeData.contentFormats.dominantFormats.map((format: string, idx: number) => (
                            <li key={idx} className="text-sm text-purple-700">• {format}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.contentFormats.bestPerforming && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-medium text-green-900 mb-2">Best Performing</h5>
                        <ul className="space-y-1">
                          {themeData.contentFormats.bestPerforming.map((format: string, idx: number) => (
                            <li key={idx} className="text-sm text-green-700">• {format}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.contentFormats.creatorExperimentation && (
                      <div className="bg-amber-50 rounded-lg p-4">
                        <h5 className="font-medium text-amber-900 mb-2">Creator Experimentation</h5>
                        <ul className="space-y-1">
                          {themeData.contentFormats.creatorExperimentation.map((experiment: string, idx: number) => (
                            <li key={idx} className="text-sm text-amber-700">• {experiment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.contentFormats.emergingTrends && (
                      <div className="bg-pink-50 rounded-lg p-4">
                        <h5 className="font-medium text-pink-900 mb-2">Emerging Trends</h5>
                        <ul className="space-y-1">
                          {themeData.contentFormats.emergingTrends.map((trend: string, idx: number) => (
                            <li key={idx} className="text-sm text-pink-700">• {trend}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Examples Section */}
                  {showingExamples[`${themeKey}-contentFormats`] && examples[`${themeKey}-contentFormats`] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                        Live Examples
                      </h5>
                      <div className="space-y-3">
                        {Object.entries(examples[`${themeKey}-contentFormats`]).map(([format, urls]) => (
                          <div key={format} className="border-l-3 border-blue-400 pl-3">
                            <h6 className="font-medium text-gray-700 text-sm mb-2">{format}</h6>
                            <div className="space-y-1">
                              {urls.map((example, idx) => (
                                <a
                                  key={idx}
                                  href={example.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{example.description}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* B. Conversation Dynamics */}
              {themeData.conversationDynamics && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      Conversation Dynamics
                    </h4>
                    <button
                      onClick={() => {
                        const conversationItems = [
                          ...(themeData.conversationDynamics.terminology || []),
                          ...(themeData.conversationDynamics.keyDiscussionDrivers || []),
                          ...(themeData.conversationDynamics.conversationTriggers || [])
                        ];
                        findExamples('conversationDynamics', conversationItems, themeKey, 'Conversation patterns and discussion dynamics');
                      }}
                      disabled={loadingExamples[`${themeKey}-conversationDynamics`]}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs rounded-lg transition-colors"
                    >
                      {loadingExamples[`${themeKey}-conversationDynamics`] ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>Show Examples</span>
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.conversationDynamics.terminology && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-2">Key Terminology</h5>
                        <div className="flex flex-wrap gap-2">
                          {themeData.conversationDynamics.terminology.map((term: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {themeData.conversationDynamics.toneCharacteristics && (
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h5 className="font-medium text-indigo-900 mb-2">Tone Characteristics</h5>
                        <p className="text-sm text-indigo-700">{themeData.conversationDynamics.toneCharacteristics}</p>
                      </div>
                    )}
                    {themeData.conversationDynamics.keyDiscussionDrivers && (
                      <div className="bg-cyan-50 rounded-lg p-4">
                        <h5 className="font-medium text-cyan-900 mb-2">Discussion Drivers</h5>
                        <ul className="space-y-1">
                          {themeData.conversationDynamics.keyDiscussionDrivers.map((driver: string, idx: number) => (
                            <li key={idx} className="text-sm text-cyan-700">• {driver}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.conversationDynamics.conversationTriggers && (
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h5 className="font-medium text-teal-900 mb-2">Conversation Triggers</h5>
                        <ul className="space-y-1">
                          {themeData.conversationDynamics.conversationTriggers.map((trigger: string, idx: number) => (
                            <li key={idx} className="text-sm text-teal-700">• {trigger}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Examples Section for Conversation Dynamics */}
                  {showingExamples[`${themeKey}-conversationDynamics`] && examples[`${themeKey}-conversationDynamics`] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                        <ExternalLink className="w-4 h-4 mr-2 text-blue-600" />
                        Conversation Examples
                      </h5>
                      <div className="space-y-3">
                        {Object.entries(examples[`${themeKey}-conversationDynamics`]).map(([item, urls]) => (
                          <div key={item} className="border-l-3 border-blue-400 pl-3">
                            <h6 className="font-medium text-gray-700 text-sm mb-2">{item}</h6>
                            <div className="space-y-1">
                              {urls.map((example, idx) => (
                                <a
                                  key={idx}
                                  href={example.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{example.description}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* C. Community Behavior */}
              {themeData.communityBehavior && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      Community Behavior
                    </h4>
                    <button
                      onClick={() => {
                        const behaviorItems = [
                          ...(themeData.communityBehavior.unifyingThemes || []),
                          ...(themeData.communityBehavior.divisiveTopics || []),
                          ...(themeData.communityBehavior.highEngagementMoments || [])
                        ];
                        findExamples('communityBehavior', behaviorItems, themeKey, 'Community behavior patterns and fan engagement');
                      }}
                      disabled={loadingExamples[`${themeKey}-communityBehavior`]}
                      className="flex items-center space-x-2 px-3 py-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs rounded-lg transition-colors"
                    >
                      {loadingExamples[`${themeKey}-communityBehavior`] ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Search className="w-3 h-3" />
                      )}
                      <span>Show Examples</span>
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.communityBehavior.unifyingThemes && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-medium text-green-900 mb-2">Unifying Themes</h5>
                        <ul className="space-y-1">
                          {themeData.communityBehavior.unifyingThemes.map((theme: string, idx: number) => (
                            <li key={idx} className="text-sm text-green-700">• {theme}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.communityBehavior.divisiveTopics && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-medium text-red-900 mb-2">Divisive Topics</h5>
                        <ul className="space-y-1">
                          {themeData.communityBehavior.divisiveTopics.map((topic: string, idx: number) => (
                            <li key={idx} className="text-sm text-red-700">• {topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.communityBehavior.highEngagementMoments && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h5 className="font-medium text-yellow-900 mb-2">High Engagement Moments</h5>
                        <ul className="space-y-1">
                          {themeData.communityBehavior.highEngagementMoments.map((moment: string, idx: number) => (
                            <li key={idx} className="text-sm text-yellow-700">• {moment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.communityBehavior.audienceSegments && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h5 className="font-medium text-orange-900 mb-2">Audience Segments</h5>
                        <p className="text-sm text-orange-700">{themeData.communityBehavior.audienceSegments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* D. Influence Mapping */}
              {themeData.influenceMapping && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-600" />
                    Influence Mapping
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.influenceMapping.topVoices && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h5 className="font-medium text-yellow-900 mb-2">Top Influential Voices</h5>
                        <ul className="space-y-1">
                          {themeData.influenceMapping.topVoices.map((voice: string, idx: number) => (
                            <li key={idx} className="text-sm text-yellow-700">• {voice}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.influenceMapping.microCommunities && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-medium text-purple-900 mb-2">Micro-Communities</h5>
                        <ul className="space-y-1">
                          {themeData.influenceMapping.microCommunities.map((community: string, idx: number) => (
                            <li key={idx} className="text-sm text-purple-700">• {community}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.influenceMapping.fandomVsInfluencerLed && (
                      <div className="bg-indigo-50 rounded-lg p-4 md:col-span-2">
                        <h5 className="font-medium text-indigo-900 mb-2">Fan vs Influencer-Led Differences</h5>
                        <p className="text-sm text-indigo-700">{themeData.influenceMapping.fandomVsInfluencerLed}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* E. Sentiment & Cultural Analysis */}
              {themeData.sentimentAnalysis && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Sentiment & Cultural Analysis
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {typeof themeData.sentimentAnalysis === 'string' ? (
                      <div className="bg-pink-50 rounded-lg p-4 md:col-span-2">
                        <h5 className="font-medium text-pink-900 mb-2">Overall Sentiment</h5>
                        <p className="text-sm text-pink-700">{themeData.sentimentAnalysis}</p>
                      </div>
                    ) : (
                      <>
                        {themeData.sentimentAnalysis.overallSentiment && (
                          <div className="bg-pink-50 rounded-lg p-4">
                            <h5 className="font-medium text-pink-900 mb-2">Overall Sentiment</h5>
                            <p className="text-sm text-pink-700">{themeData.sentimentAnalysis.overallSentiment}</p>
                          </div>
                        )}
                        {themeData.sentimentAnalysis.aspirationalVsRelatable && (
                          <div className="bg-rose-50 rounded-lg p-4">
                            <h5 className="font-medium text-rose-900 mb-2">Aspirational vs Relatable</h5>
                            <p className="text-sm text-rose-700">{themeData.sentimentAnalysis.aspirationalVsRelatable}</p>
                          </div>
                        )}
                        {themeData.sentimentAnalysis.culturalDifferences && (
                          <div className="bg-violet-50 rounded-lg p-4 md:col-span-2">
                            <h5 className="font-medium text-violet-900 mb-2">Cultural Differences by Market</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Object.entries(themeData.sentimentAnalysis.culturalDifferences).map(([market, insight]) => (
                                <div key={market} className="bg-violet-100 rounded p-3">
                                  <div className="font-medium text-violet-900 text-sm">{market}</div>
                                  <div className="text-xs text-violet-700 mt-1">{insight as string}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* F. Temporal Patterns */}
              {themeData.temporalPatterns && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Camera className="w-4 h-4 mr-2 text-green-600" />
                    Temporal Patterns
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.temporalPatterns.peakTimes && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-medium text-green-900 mb-2">Peak Conversation Times</h5>
                        <p className="text-sm text-green-700">{themeData.temporalPatterns.peakTimes}</p>
                      </div>
                    )}
                    {themeData.temporalPatterns.seasonalTrends && (
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <h5 className="font-medium text-emerald-900 mb-2">Seasonal Trends</h5>
                        <p className="text-sm text-emerald-700">{themeData.temporalPatterns.seasonalTrends}</p>
                      </div>
                    )}
                    {themeData.temporalPatterns.viralMoments && (
                      <div className="bg-lime-50 rounded-lg p-4">
                        <h5 className="font-medium text-lime-900 mb-2">Recent Viral Moments</h5>
                        <p className="text-sm text-lime-700">{themeData.temporalPatterns.viralMoments}</p>
                      </div>
                    )}
                    {themeData.temporalPatterns.realtimeVsEvergreen && (
                      <div className="bg-teal-50 rounded-lg p-4">
                        <h5 className="font-medium text-teal-900 mb-2">Real-time vs Evergreen</h5>
                        <p className="text-sm text-teal-700">{themeData.temporalPatterns.realtimeVsEvergreen}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* G. Cross-Fandom & Brand Integration */}
              {themeData.crossFandomIntegration && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-purple-600" />
                    Cross-Fandom & Brand Integration
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {themeData.crossFandomIntegration.crossReferences && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="font-medium text-purple-900 mb-2">Cross-References</h5>
                        <ul className="space-y-1">
                          {themeData.crossFandomIntegration.crossReferences.map((ref: string, idx: number) => (
                            <li key={idx} className="text-sm text-purple-700">• {ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {themeData.crossFandomIntegration.brandMentions && (
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h5 className="font-medium text-indigo-900 mb-2">Brand Mention Patterns</h5>
                        <p className="text-sm text-indigo-700">{themeData.crossFandomIntegration.brandMentions}</p>
                      </div>
                    )}
                    {(themeData.crossFandomIntegration.vaselineOpportunities || themeData.vaselineOpportunities) && (
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 md:col-span-2">
                        <h5 className="font-medium text-gray-800 mb-2">🌟 Vaseline Integration Opportunities</h5>
                        <p className="text-sm text-gray-700">
                          {themeData.crossFandomIntegration.vaselineOpportunities || themeData.vaselineOpportunities || themeData.brandIntegration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sample Quotes */}
              {themeData.sampleQuotes && themeData.sampleQuotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Authentic Fan Voices</h4>
                  <div className="space-y-2">
                    {themeData.sampleQuotes.slice(0, 3).map((quote: string, idx: number) => (
                      <blockquote key={idx} className="border-l-4 border-pink-400 pl-4 italic text-gray-600 text-sm">
                        "{quote}"
                      </blockquote>
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

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Palette className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Thematic Deep Dive</h1>
            <p className="text-purple-100">
              Strategic analysis across 9 core Emily in Paris fandom themes
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-purple-100">
            Explore how fans engage with different aspects of Emily in Paris, from fashion and beauty 
            to romance and locations. Each theme reveals unique content formats, conversation patterns, 
            and Vaseline integration opportunities.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {analysis && Object.entries(analysis).map(([themeKey, themeData]) => 
          renderThemeSection(themeKey, themeData)
        )}
      </div>
    </div>
  )
}
