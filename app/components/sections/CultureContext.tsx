'use client'

import { motion } from 'framer-motion'
import { Globe, Zap, Calendar, Users, Sparkles, Compass, Clock, TrendingUp, Hash, Quote } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface CultureContextProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      cultureContext: {
        culturalWhiteSpace: string
        relevantMoments: string[]
        culturalTrends: string[]
        generationalInsights: {
          genZ: string
          millennial: string
          genX: string
          boomer: string
        }
        culturalSignals: {
          emerging: string[]
          mainstream: string[]
          declining: string[]
        }
        memeMoments: string[]
        socialMovements: string[]
        culturalArchetypes: string[]
        timelyOpportunities: {
          title: string
          description: string
          urgency: 'HIGH' | 'MEDIUM' | 'LOW'
          timeline: string
        }[]
      }
    }
  }
}

export default function CultureContext({ data }: CultureContextProps) {
  const analysis = data.structuredAnalysis?.cultureContext

  const renderList = (items: string[], className = "text-gray-700") => (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, index) => (
        <li key={index} className={`text-sm ${className}`}>{formatAllCitations(item)}</li>
      ))}
    </ul>
  )

  const CulturalSignalCard = ({ category, items, color, icon }: {
    category: string
    items: string[]
    color: string
    icon: React.ReactNode
  }) => (
    <div className={`${color} p-6 rounded-xl border border-opacity-20`}>
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h4 className="font-semibold text-gray-800">{category}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
            <span className="text-sm text-gray-700">{formatAllCitations(item)}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const GenerationCard = ({ generation, insight, emoji }: {
    generation: string
    insight: string
    emoji: string
  }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-3">
        <span className="text-2xl">{emoji}</span>
        <h4 className="font-semibold text-gray-800">{generation}</h4>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{formatAllCitations(insight)}</p>
    </div>
  )

  const TimelyOpportunityCard = ({ opportunity, index }: {
    opportunity: {
      title: string
      description: string
      urgency: 'HIGH' | 'MEDIUM' | 'LOW'
      timeline: string
    }
    index: number
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.15,
          duration: 0.6,
          type: "spring",
          bounce: 0.3
        }}
        whileHover={{ 
          scale: 1.02,
          y: -5,
          transition: { duration: 0.2 }
        }}
        className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 transition-all duration-300 cursor-pointer group hover:border-indigo-300 shadow-lg hover:shadow-xl"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-gradient-to-tr from-purple-300 to-pink-300 opacity-30"></div>
        </div>

        <div className="relative p-6">
          {/* Header with Icon */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="text-2xl">⚡</div>
            <h4 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-gray-900 transition-colors flex-1">
              {opportunity.title}
            </h4>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed text-sm group-hover:text-gray-800 transition-colors">
              {formatAllCitations(opportunity.description)}
            </p>
          </div>

          {/* Timeline with Enhanced Visual */}
          <div className="flex items-center space-x-2 text-gray-600 group-hover:text-gray-700 transition-colors">
            <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{opportunity.timeline}</span>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]"></div>
      </motion.div>
    )
  }

  const CulturalMomentCard = ({ moment, index }: {
    moment: string
    index: number
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        bounce: 0.2
      }}
      whileHover={{ 
        scale: 1.02,
        y: -3,
        transition: { duration: 0.2 }
      }}
      className="relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 group hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-300 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl">📅</div>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
          {formatAllCitations(moment)}
        </p>
      </div>

      {/* Hover Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]"></div>
    </motion.div>
  )

  const CulturalTrendCard = ({ trend, index }: {
    trend: string
    index: number
  }) => (
    <motion.div
      initial={{ opacity: 0, x: 30, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        bounce: 0.2
      }}
      whileHover={{ 
        scale: 1.02,
        y: -3,
        transition: { duration: 0.2 }
      }}
      className="relative overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5 group hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-18 h-18 bg-green-300 rounded-full transform translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Icon with Trending Animation */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:animate-pulse" />
          </div>
          <div className="text-2xl">📈</div>
        </div>

        {/* Content */}
        <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
          {formatAllCitations(trend)}
        </p>
      </div>

      {/* Trending Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]"></div>
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Globe className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Culture & Context</h1>
            <p className="text-gray-600">{data.brandName} Cultural Landscape & Zeitgeist</p>
          </div>
        </div>

        {analysis ? (
          <>
            {/* Cultural White Space */}
            <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <Compass className="w-5 h-5 text-brand-accent" />
                <h3 className="font-semibold text-brand-dark">Cultural White Space</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{formatAllCitations(analysis.culturalWhiteSpace)}</p>
            </div>

            {/* Cultural Signals Grid */}
            {analysis.culturalSignals && (
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Zap className="w-6 h-6 text-brand-accent" />
                  <h3 className="text-xl font-semibold text-brand-dark">Cultural Signals</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <CulturalSignalCard
                    category="Emerging"
                    items={analysis.culturalSignals.emerging}
                    color="bg-green-50"
                    icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                  />
                  <CulturalSignalCard
                    category="Mainstream"
                    items={analysis.culturalSignals.mainstream}
                    color="bg-blue-50"
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                  />
                  <CulturalSignalCard
                    category="Declining"
                    items={analysis.culturalSignals.declining}
                    color="bg-gray-50"
                    icon={<Clock className="w-5 h-5 text-gray-600" />}
                  />
                </div>
              </div>
            )}

            {/* Generational Insights */}
            {analysis.generationalInsights && (
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-6 h-6 text-brand-accent" />
                  <h3 className="text-xl font-semibold text-brand-dark">Generational Perspectives</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <GenerationCard
                    generation="Gen Z"
                    insight={analysis.generationalInsights.genZ}
                    emoji="📱"
                  />
                  <GenerationCard
                    generation="Millennial"
                    insight={analysis.generationalInsights.millennial}
                    emoji="💻"
                  />
                  <GenerationCard
                    generation="Gen X"
                    insight={analysis.generationalInsights.genX}
                    emoji="📺"
                  />
                  <GenerationCard
                    generation="Boomer"
                    insight={analysis.generationalInsights.boomer}
                    emoji="📰"
                  />
                </div>
              </div>
            )}

            {/* Meme Moments & Social Movements */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {analysis.memeMoments && (
                <div className="card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Hash className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-brand-dark">Viral Moments & Memes</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.memeMoments.map((meme, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600 mt-0.5">#</span>
                        <span className="text-sm text-gray-700">{meme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.socialMovements && (
                <div className="card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Sparkles className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-brand-dark">Social Movements</h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.socialMovements.map((movement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-600 mt-0.5">✊</span>
                        <span className="text-sm text-gray-700">{movement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cultural Archetypes */}
            {analysis.culturalArchetypes && (
              <div className="card p-6 mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Quote className="w-5 h-5 text-brand-accent" />
                  <h4 className="font-semibold text-brand-dark">Cultural Archetypes</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {analysis.culturalArchetypes.map((archetype, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-4 py-2 bg-brand-accent/10 text-brand-accent rounded-full font-medium text-sm"
                    >
                      {archetype}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Timely Opportunities */}
            {analysis.timelyOpportunities && (
              <div className="mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative mb-8"
                >
                  {/* Enhanced Header */}
                  <div className="relative bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl border border-indigo-200 p-6 mb-8 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 left-1/4 w-24 h-24 bg-indigo-300 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 right-0 w-20 h-20 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Timely Opportunities</h3>
                            <p className="text-gray-600 text-sm">Cultural moments ready for activation</p>
                          </div>
                        </div>
                        
                        {/* Opportunity Count */}
                        <div className="text-right">
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20">
                            <div className="text-2xl font-bold text-indigo-600">{analysis.timelyOpportunities.length}</div>
                            <div className="text-xs text-gray-600 uppercase tracking-wide">Opportunities</div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>

                  {/* Enhanced Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.timelyOpportunities.map((opportunity, index) => (
                      <TimelyOpportunityCard key={index} opportunity={opportunity} index={index} />
                  ))}
                </div>
                </motion.div>
              </div>
            )}

            {/* Relevant Moments */}
            {analysis.relevantMoments && analysis.relevantMoments.length > 0 && (
              <div className="mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative mb-8"
                >
                  {/* Enhanced Header */}
                  <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 p-6 mb-6 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-1/4 w-20 h-20 bg-blue-300 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 left-0 w-16 h-16 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Cultural Moments</h3>
                            <p className="text-gray-600 text-sm">Key moments shaping cultural conversation</p>
                          </div>
                        </div>
                        
                        {/* Moment Count */}
                        <div className="text-right">
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20">
                            <div className="text-2xl font-bold text-blue-600">{analysis.relevantMoments.length}</div>
                            <div className="text-xs text-gray-600 uppercase tracking-wide">Moments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.relevantMoments.map((moment, index) => (
                      <CulturalMomentCard key={index} moment={moment} index={index} />
                    ))}
                </div>
                </motion.div>
              </div>
            )}

            {/* Cultural Trends */}
            {analysis.culturalTrends && analysis.culturalTrends.length > 0 && (
              <div className="mb-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative mb-8"
                >
                  {/* Enhanced Header */}
                  <div className="relative bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-200 p-6 mb-6 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 left-1/3 w-28 h-28 bg-emerald-300 rounded-full animate-pulse"></div>
                      <div className="absolute bottom-0 right-1/3 w-22 h-22 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute top-1/2 right-0 w-18 h-18 bg-teal-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-bounce"></div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Cultural Trends</h3>
                            <p className="text-gray-600 text-sm">Emerging patterns in cultural behavior</p>
                          </div>
                        </div>
                        
                        {/* Trend Count */}
                        <div className="text-right">
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-white/20">
                            <div className="text-2xl font-bold text-emerald-600">{analysis.culturalTrends.length}</div>
                            <div className="text-xs text-gray-600 uppercase tracking-wide">Trends</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.culturalTrends.map((trend, index) => (
                      <CulturalTrendCard key={index} trend={trend} index={index} />
                    ))}
                </div>
                </motion.div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Cultural context and trends analysis is being processed...</p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 