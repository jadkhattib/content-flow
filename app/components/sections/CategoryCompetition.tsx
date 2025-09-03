'use client'

import { motion } from 'framer-motion'
import { BarChart3, Target, TrendingUp, AlertTriangle, Shield, Zap, DollarSign, Truck, MessageSquare, Lightbulb, Sparkles, ArrowUpRight, Clock } from 'lucide-react'
import { useState } from 'react'
import { formatAllCitations } from '@/lib/citationUtils'

interface CategoryCompetitionProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      categoryCompetition: {
        overview: string
        marketSize: {
          yoyTrends: string
          marketValue: string | { value: number | null; unit: string; confidence: number; dataStatus: string }
          marketDescription: string
        }
        topCompetitors: {
          name: string
          marketShare: string | { value: number | null; unit: string; confidence: number; dataStatus: string }
          revenue: string | { value: number | null; unit: string; confidence: number; dataStatus: string }
          position: string
          strengths: string[]
          weaknesses: string[]
          strategy: string
          recentMoves: string[]
          threat: string
          threatLevel?: string
          threatDescription?: string
          differentiation: string
        }[]
        establishedNorms: {
          pricing: string
          distribution: string
          communication: string
          innovation: string
        }
        emergingTrends: string[]
        breakthroughs: {
          technology: string
          sustainability: string
          regulation: string
          culture: string
        }
        whitespace: string
      }
    }
  }
}

export default function CategoryCompetition({ data }: CategoryCompetitionProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState(0)
  const analysis = data.structuredAnalysis?.categoryCompetition

  // Helper function to render list items
  const renderList = (items: string[], className = "text-gray-700") => (
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, index) => (
        <li key={index} className={`text-sm ${className}`}>{formatAllCitations(item)}</li>
      ))}
    </ul>
  )

  // Helper function to extract threat level from threat string
  const extractThreatLevel = (threat: string): string => {
    if (!threat) return 'UNKNOWN'
    
    // Check if it's already just a threat level
    const upperThreat = threat.toUpperCase()
    if (upperThreat === 'HIGH' || upperThreat === 'MEDIUM' || upperThreat === 'LOW') {
      return upperThreat
    }
    
    // Extract from format like "High - description" or "HIGH - description"
    const match = threat.match(/^(HIGH|MEDIUM|LOW|High|Medium|Low)\s*[-–—]\s*(.+)$/i)
    if (match) {
      return match[1].toUpperCase()
    }
    
    // Fallback: look for threat level at the beginning
    if (threat.toLowerCase().startsWith('high')) return 'HIGH'
    if (threat.toLowerCase().startsWith('medium')) return 'MEDIUM'
    if (threat.toLowerCase().startsWith('low')) return 'LOW'
    
    return 'UNKNOWN'
  }

  // Helper function to extract threat description from threat string
  const extractThreatDescription = (threat: string): string => {
    if (!threat) return ''
    
    // Extract from format like "High - description"
    const match = threat.match(/^(HIGH|MEDIUM|LOW|High|Medium|Low)\s*[-–—]\s*(.+)$/i)
    if (match) {
      return match[2]
    }
    
    // If no match, return the original string if it's not just a threat level
    const upperThreat = threat.toUpperCase()
    if (upperThreat === 'HIGH' || upperThreat === 'MEDIUM' || upperThreat === 'LOW') {
      return ''
    }
    
    return threat
  }

  // Get threat level styling
  const getThreatStyling = (threat: string) => {
    const threatLevel = extractThreatLevel(threat)
    switch (threatLevel) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get position icon
  const getPositionIcon = (position: string) => {
    if (position.toLowerCase().includes('leader')) return <Target className="w-4 h-4" />
    if (position.toLowerCase().includes('challenger')) return <TrendingUp className="w-4 h-4" />
    if (position.toLowerCase().includes('disruptor')) return <Zap className="w-4 h-4" />
    return <Shield className="w-4 h-4" />
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Category & Competition</h1>
            <p className="text-gray-600">{data.brandName} Competitive Landscape Analysis</p>
          </div>
        </div>

        {/* Overview Section */}
        {analysis?.overview && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8">
            <h3 className="font-semibold text-blue-800 mb-3">Competitive Landscape Overview</h3>
            <p className="text-blue-700 leading-relaxed">{formatAllCitations(analysis.overview)}</p>
          </div>
        )}

        {/* Market Growth Section */}
        {analysis?.marketSize && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-r-xl mb-8">
            <h3 className="font-semibold text-orange-800 mb-3">Market Growth</h3>
            <div className="text-sm text-orange-600 font-medium mb-3">Year-over-Year Trends</div>
            <p className="text-orange-700 leading-relaxed">{formatAllCitations(analysis.marketSize.yoyTrends)}</p>
          </div>
        )}

        {/* Market Value */}
        {analysis?.marketSize.marketValue && (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-2">Total Market Value</h3>
            <p className="text-3xl font-bold text-brand-dark mb-3">{renderMetricValue(analysis.marketSize.marketValue)}</p>
            {analysis.marketSize.marketDescription && (
              <p className="text-gray-700 leading-relaxed">{formatAllCitations(analysis.marketSize.marketDescription)}</p>
            )}
          </div>
        )}
      </div>

      {/* Market White Space - Moved to Top */}
      {analysis?.whitespace && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-4">Market White Space Opportunity</h2>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">{formatAllCitations(analysis.whitespace)}</p>
          </div>
        </div>
      )}

      {/* Competitor Analysis */}
      {analysis?.topCompetitors && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Competitive Analysis</h2>
          <p className="text-sm text-gray-600 mb-6">* Market shares and revenue figures are well-researched estimates based on industry analysis</p>
          
          {/* Competitor Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
            {analysis.topCompetitors.map((competitor, index) => (
              <button
                key={index}
                onClick={() => setSelectedCompetitor(index)}
                className={`p-5 rounded-xl text-left transition-all min-h-[140px] flex flex-col ${
                  selectedCompetitor === index
                    ? 'bg-brand-accent text-white shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {/* Threat Level Label at Top */}
                <div className={`text-xs px-3 py-1 rounded-full mb-3 self-center font-medium border ${getThreatStyling(competitor.threat)}`}>
                  {extractThreatLevel(competitor.threat)} THREAT
                </div>
                
                {/* Competitor Info */}
                <div className="flex items-center space-x-2 mb-3">
                  {getPositionIcon(competitor.position)}
                  <div className="font-semibold text-sm leading-tight">{competitor.name}</div>
                </div>
                
                {/* Threat Description */}
                {extractThreatDescription(competitor.threat) && (
                  <div className="text-xs opacity-75 mb-2 leading-tight">
                    {formatAllCitations(extractThreatDescription(competitor.threat))}
                  </div>
                )}
                
                {/* Market Share */}
                <div className="text-sm opacity-90 mt-auto">
                  <span className="text-xs opacity-75">Market Share:</span><br/>
                  <span className="font-medium">{renderMetricValue(competitor.marketShare)}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Competitor Details */}
          {analysis.topCompetitors[selectedCompetitor] && (
            <motion.div
              key={selectedCompetitor}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 rounded-xl p-8"
            >
              <div className="grid md:grid-cols-3 gap-8">
                {/* Competitor Overview */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      {getPositionIcon(analysis.topCompetitors[selectedCompetitor].position)}
                      <div>
                        <h3 className="text-xl font-bold text-brand-dark">
                          {analysis.topCompetitors[selectedCompetitor].name}
                        </h3>
                        <p className="text-gray-600">{formatAllCitations(analysis.topCompetitors[selectedCompetitor].position)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-gray-600">Market Share:</span>
                        <p className="text-2xl font-bold text-brand-dark">{renderMetricValue(analysis.topCompetitors[selectedCompetitor].marketShare)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Revenue:</span>
                        <p className="font-semibold text-gray-800">{renderMetricValue(analysis.topCompetitors[selectedCompetitor].revenue)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Threat Level:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getThreatStyling(analysis.topCompetitors[selectedCompetitor].threat)}`}>
                          {extractThreatLevel(analysis.topCompetitors[selectedCompetitor].threat)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-dark mb-3">Core Strategy</h4>
                    <p className="text-gray-700">{formatAllCitations(analysis.topCompetitors[selectedCompetitor].strategy)}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3 flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Strengths</span>
                      </h4>
                      {renderList(analysis.topCompetitors[selectedCompetitor].strengths, "text-green-700")}
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h4 className="font-semibold text-brand-dark mb-3 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Weaknesses</span>
                      </h4>
                      {renderList(analysis.topCompetitors[selectedCompetitor].weaknesses, "text-red-700")}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-dark mb-3">Recent Strategic Moves</h4>
                    {renderList(analysis.topCompetitors[selectedCompetitor].recentMoves)}
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h4 className="font-semibold text-brand-dark mb-3">Differentiation vs {data.brandName}</h4>
                    <p className="text-gray-700">{formatAllCitations(analysis.topCompetitors[selectedCompetitor].differentiation)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Market Norms & Trends */}
      {analysis && (
        <div className="space-y-8">
          {/* Established Market Norms */}
          <div className="card p-8">
            <div className="flex items-center space-x-3 mb-8">
              <Clock className="w-6 h-6 text-brand-accent" />
              <h3 className="text-2xl font-bold text-brand-dark">Established Market Norms</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Pricing */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <DollarSign className="w-8 h-8 text-green-500 opacity-20" />
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">Pricing</h4>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">{formatAllCitations(analysis.establishedNorms.pricing)}</p>
              </motion.div>

              {/* Distribution */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <Truck className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Distribution</h4>
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">{formatAllCitations(analysis.establishedNorms.distribution)}</p>
              </motion.div>

              {/* Communication */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <MessageSquare className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-purple-800">Communication</h4>
                </div>
                <p className="text-purple-700 text-sm leading-relaxed">{formatAllCitations(analysis.establishedNorms.communication)}</p>
              </motion.div>

              {/* Innovation */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <Lightbulb className="w-8 h-8 text-orange-500 opacity-20" />
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-orange-800">Innovation</h4>
                </div>
                <p className="text-orange-700 text-sm leading-relaxed">{formatAllCitations(analysis.establishedNorms.innovation)}</p>
              </motion.div>
            </div>
          </div>

          {/* Emerging Trends */}
          <div className="card p-8">
            <div className="flex items-center space-x-3 mb-8">
              <Sparkles className="w-6 h-6 text-brand-accent" />
              <h3 className="text-2xl font-bold text-brand-dark">Emerging Trends</h3>
              <div className="flex-1"></div>
              <div className="px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-medium">
                Shaping the Future
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.emergingTrends.map((trend, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border border-indigo-200 rounded-xl p-6 relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-indigo-200 to-cyan-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute top-4 right-4">
                    <ArrowUpRight className="w-5 h-5 text-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-lg flex items-center justify-center mt-1 flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                          Trend #{index + 1}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed font-medium group-hover:text-indigo-800 transition-colors">
                        {formatAllCitations(trend)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
                </motion.div>
              ))}
            </div>

            {/* Trends Summary */}
            {analysis.emergingTrends.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-200 rounded-xl"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-indigo-800">Market Evolution</h4>
                </div>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  These {analysis.emergingTrends.length} emerging trends are reshaping the competitive landscape and creating new opportunities for forward-thinking brands to differentiate and capture market share.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Breakthrough Areas */}
      {analysis?.breakthroughs && (
        <div className="card p-8">
          <h3 className="font-semibold text-brand-dark mb-6">Breakthrough Opportunities</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-3">Technology</h4>
              <p className="text-blue-700 text-sm">{formatAllCitations(analysis.breakthroughs.technology)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">Sustainability</h4>
              <p className="text-green-700 text-sm">{formatAllCitations(analysis.breakthroughs.sustainability)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-3">Regulation</h4>
              <p className="text-purple-700 text-sm">{formatAllCitations(analysis.breakthroughs.regulation)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-3">Culture</h4>
              <p className="text-orange-700 text-sm">{formatAllCitations(analysis.breakthroughs.culture)}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
} 