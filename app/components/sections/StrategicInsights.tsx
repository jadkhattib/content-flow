'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Target, TrendingUp, Zap, Calendar, Users, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface StrategicInsightsProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      strategicInsights?: {
        keyInsights: string[]
        marketOpportunities: Array<{
          opportunity: string
          market: string
          potential: string
          timeframe: string
          requirements: string
        }>
        competitiveAdvantage: {
          uniquePositioning: string
          differentiationFactors: string[]
          competitorGaps: string[]
          brandStrengths: string[]
        }
        campaignRecommendations: Array<{
          campaignType: string
          objective: string
          targetAudience: string
          channels: string[]
          timeline: string
          keyMessages: string[]
          successMetrics: string[]
        }>
        riskMitigation: {
          identifiedRisks: string[]
          mitigationStrategies: string[]
          contingencyPlans: string[]
        }
        successMetrics: {
          [key: string]: string
        }
      }
    }
  }
}

export default function StrategicInsights({ data }: StrategicInsightsProps) {
  const analysis = data.structuredAnalysis?.strategicInsights

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Strategic Insights</h1>
            <p className="text-gray-600">{data.brandName} Partnership Strategy</p>
          </div>
        </div>

        {analysis ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Strategic Overview</h3>
            <p className="text-lg text-gray-700">Data-driven strategic insights for Vaseline's Emily in Paris partnership, covering market opportunities, competitive positioning, campaign recommendations, and success metrics.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">Strategic insights are being prepared to guide partnership decision-making and campaign development.</p>
          </div>
        )}
      </div>

      {/* Key Insights */}
      {analysis?.keyInsights && analysis.keyInsights.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Zap className="w-6 h-6 text-brand-accent" />
            <span>Key Strategic Insights</span>
          </h2>
          
          <div className="space-y-4">
            {analysis.keyInsights.map((insight, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Opportunities */}
      {analysis?.marketOpportunities && analysis.marketOpportunities.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Target className="w-6 h-6 text-brand-accent" />
            <span>Market Opportunities</span>
          </h2>
          
          <div className="grid gap-6">
            {analysis.marketOpportunities.map((opportunity, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-green-800 text-lg">{opportunity.opportunity}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    {opportunity.market}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 text-xs mb-2">Potential</h4>
                    <p className="text-green-800 text-sm">{opportunity.potential}</p>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 text-xs mb-2">Timeframe</h4>
                    <p className="text-green-800 text-sm">{opportunity.timeframe}</p>
                  </div>
                  
                  <div className="bg-green-100 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 text-xs mb-2">Requirements</h4>
                    <p className="text-green-800 text-sm">{opportunity.requirements}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantage */}
      {analysis?.competitiveAdvantage && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
            <span>Competitive Advantage</span>
          </h2>
          
          <div className="space-y-6">
            {/* Unique Positioning */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-semibold text-purple-800 mb-3">Unique Positioning</h3>
              <p className="text-purple-700 text-sm">{analysis.competitiveAdvantage.uniquePositioning}</p>
            </div>

            {/* Differentiation Factors */}
            {analysis.competitiveAdvantage.differentiationFactors && analysis.competitiveAdvantage.differentiationFactors.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                <h3 className="font-semibold text-indigo-800 mb-4">Differentiation Factors</h3>
                <div className="space-y-2">
                  {analysis.competitiveAdvantage.differentiationFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <p className="text-indigo-700 text-sm">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitor Gaps */}
            {analysis.competitiveAdvantage.competitorGaps && analysis.competitiveAdvantage.competitorGaps.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="font-semibold text-orange-800 mb-4">Competitor Gaps</h3>
                <div className="space-y-2">
                  {analysis.competitiveAdvantage.competitorGaps.map((gap, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-orange-700 text-sm">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Brand Strengths */}
            {analysis.competitiveAdvantage.brandStrengths && analysis.competitiveAdvantage.brandStrengths.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                <h3 className="font-semibold text-emerald-800 mb-4">Brand Strengths</h3>
                <div className="space-y-2">
                  {analysis.competitiveAdvantage.brandStrengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <p className="text-emerald-700 text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Campaign Recommendations */}
      {analysis?.campaignRecommendations && analysis.campaignRecommendations.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Users className="w-6 h-6 text-brand-accent" />
            <span>Campaign Recommendations</span>
          </h2>
          
          <div className="space-y-6">
            {analysis.campaignRecommendations.map((campaign, index) => (
              <div key={index} className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-cyan-800 text-lg">{campaign.campaignType}</h3>
                  <Calendar className="w-5 h-5 text-cyan-600" />
                </div>
                
                <p className="text-cyan-700 text-sm mb-4">{campaign.objective}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-cyan-100 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 text-xs mb-2">Target Audience</h4>
                    <p className="text-cyan-800 text-sm">{campaign.targetAudience}</p>
                  </div>
                  
                  <div className="bg-cyan-100 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 text-xs mb-2">Timeline</h4>
                    <p className="text-cyan-800 text-sm">{campaign.timeline}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-cyan-100 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 text-xs mb-2">Channels</h4>
                    <div className="flex flex-wrap gap-1">
                      {campaign.channels.map((channel, i) => (
                        <span key={i} className="px-2 py-1 bg-cyan-200 text-cyan-800 text-xs rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-cyan-100 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 text-xs mb-2">Key Messages</h4>
                    <div className="space-y-1">
                      {campaign.keyMessages.map((message, i) => (
                        <p key={i} className="text-cyan-800 text-xs">• {message}</p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-cyan-100 rounded-lg p-4">
                    <h4 className="font-medium text-cyan-900 text-xs mb-2">Success Metrics</h4>
                    <div className="space-y-1">
                      {campaign.successMetrics.map((metric, i) => (
                        <p key={i} className="text-cyan-800 text-xs">• {metric}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Mitigation */}
      {analysis?.riskMitigation && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-brand-accent" />
            <span>Risk Mitigation</span>
          </h2>
          
          <div className="space-y-6">
            {/* Identified Risks */}
            {analysis.riskMitigation.identifiedRisks && analysis.riskMitigation.identifiedRisks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-4">Identified Risks</h3>
                <div className="space-y-2">
                  {analysis.riskMitigation.identifiedRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mitigation Strategies */}
            {analysis.riskMitigation.mitigationStrategies && analysis.riskMitigation.mitigationStrategies.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-4">Mitigation Strategies</h3>
                <div className="space-y-2">
                  {analysis.riskMitigation.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-700 text-sm">{strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contingency Plans */}
            {analysis.riskMitigation.contingencyPlans && analysis.riskMitigation.contingencyPlans.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-800 mb-4">Contingency Plans</h3>
                <div className="space-y-2">
                  {analysis.riskMitigation.contingencyPlans.map((plan, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-blue-700 text-sm">{plan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Metrics */}
      {analysis?.successMetrics && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-brand-accent" />
            <span>Success Metrics</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.successMetrics).map(([metric, description], index) => {
              const colors = [
                { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800' },
                { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
                { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' },
                { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' }
              ]
              const color = colors[index % 5]
              
              return (
                <div key={metric} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`${color.text} text-sm`}>{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}