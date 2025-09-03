'use client'

import { motion } from 'framer-motion'
import { Target, Heart, TrendingUp, Sparkles, CheckCircle, ArrowRight, AlertTriangle, BarChart3 } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface BrandSynergyProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      brandSynergy?: {
        vaselineAlignment: {
          brandValues: string
          productSynergy: string
          visualSynergy: string
          messagingAlignment: string
        }
        partnershipOpportunities: Array<{
          category: string
          description: string
          targetAudience: string
          expectedImpact: string
          implementationApproach: string
        }>
        riskAssessment: {
          brandSafetyRisks: string[]
          audienceReactionRisks: string[]
          competitorRisks: string[]
          mitigationStrategies: string[]
        }
        synergyScore: {
          overallCompatibility: string
          audienceOverlap: string
          valueProportion: string
          executionFeasibility: string
        }
      }
    }
  }
}

export default function BrandSynergy({ data }: BrandSynergyProps) {
  const analysis = data.structuredAnalysis?.brandSynergy

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Brand Synergy</h1>
            <p className="text-gray-600">{data.brandName} × Vaseline Partnership Analysis</p>
          </div>
        </div>

        {analysis ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Synergy Overview</h3>
            <p className="text-lg text-gray-700">Comprehensive analysis of brand alignment between Vaseline and Emily in Paris fandom, exploring partnership opportunities, risk factors, and strategic fit for authentic collaboration.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">Brand synergy analysis is being prepared to evaluate partnership compatibility and opportunities.</p>
          </div>
        )}
      </div>

      {/* Vaseline Alignment */}
      {analysis?.vaselineAlignment && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Heart className="w-6 h-6 text-brand-accent" />
            <span>Vaseline Brand Alignment</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.vaselineAlignment).map(([key, value], index) => {
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
                  <p className={`${color.text} text-sm`}>{value}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Partnership Opportunities */}
      {analysis?.partnershipOpportunities && analysis.partnershipOpportunities.length > 0 && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
            <span>Partnership Opportunities</span>
          </h2>
          
          <div className="space-y-6">
            {analysis.partnershipOpportunities.map((opportunity, index) => {
              const colors = [
                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', accent: 'bg-emerald-100' },
                { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', accent: 'bg-indigo-100' }
              ]
              const color = colors[index % 2]
              
              return (
                <div key={index} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`font-semibold ${color.text} text-lg`}>{opportunity.category}</h3>
                    <CheckCircle className={`w-5 h-5 ${color.text}`} />
                  </div>
                  
                  <p className={`${color.text} text-sm mb-4`}>{opportunity.description}</p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`${color.accent} rounded-lg p-3`}>
                      <h4 className={`font-medium ${color.text} text-xs mb-1`}>Target Audience</h4>
                      <p className={`${color.text} text-xs`}>{opportunity.targetAudience}</p>
                    </div>
                    
                    <div className={`${color.accent} rounded-lg p-3`}>
                      <h4 className={`font-medium ${color.text} text-xs mb-1`}>Expected Impact</h4>
                      <p className={`${color.text} text-xs`}>{opportunity.expectedImpact}</p>
                    </div>
                    
                    <div className={`${color.accent} rounded-lg p-3`}>
                      <h4 className={`font-medium ${color.text} text-xs mb-1`}>Implementation</h4>
                      <p className={`${color.text} text-xs`}>{opportunity.implementationApproach}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {analysis?.riskAssessment && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-brand-accent" />
            <span>Risk Assessment</span>
          </h2>
          
          <div className="space-y-6">
            {/* Brand Safety Risks */}
            {analysis.riskAssessment.brandSafetyRisks && analysis.riskAssessment.brandSafetyRisks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-4">Brand Safety Risks</h3>
                <div className="space-y-2">
                  {analysis.riskAssessment.brandSafetyRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-red-700 text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audience Reaction Risks */}
            {analysis.riskAssessment.audienceReactionRisks && analysis.riskAssessment.audienceReactionRisks.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-4">Audience Reaction Risks</h3>
                <div className="space-y-2">
                  {analysis.riskAssessment.audienceReactionRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-yellow-700 text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Competitor Risks */}
            {analysis.riskAssessment.competitorRisks && analysis.riskAssessment.competitorRisks.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <h3 className="font-semibold text-orange-800 mb-4">Competitor Risks</h3>
                <div className="space-y-2">
                  {analysis.riskAssessment.competitorRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-orange-700 text-sm">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mitigation Strategies */}
            {analysis.riskAssessment.mitigationStrategies && analysis.riskAssessment.mitigationStrategies.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-800 mb-4">Mitigation Strategies</h3>
                <div className="space-y-2">
                  {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-green-700 text-sm">{strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Synergy Score */}
      {analysis?.synergyScore && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-brand-accent" />
            <span>Synergy Score</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.synergyScore).map(([key, value], index) => {
              const colors = [
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={key} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`${color.text} text-sm`}>{value}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}