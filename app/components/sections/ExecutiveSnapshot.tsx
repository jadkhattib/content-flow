'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, Users, Eye, Building2, Briefcase, Megaphone, PoundSterling, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { formatTextWithCitations, formatAllCitations } from '@/lib/citationUtils'

// LinkedIn icon component
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

// Function to extract LinkedIn URL from executive description
const extractLinkedInUrl = (executiveText: string): string | null => {
  // Look for LinkedIn URL patterns in the text
  const linkedinPatterns = [
    /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
    /linkedin\.com\/pub\/([a-zA-Z0-9-]+)/i,
  ]
  
  for (const pattern of linkedinPatterns) {
    const match = executiveText.match(pattern)
    if (match) {
      return `https://www.linkedin.com/in/${match[1]}`
    }
  }
  
  // If no direct LinkedIn URL, try to construct one from name
  // Look for patterns like "Name - Title" or "Name, Title"
  const nameMatch = executiveText.match(/^([A-Z][a-z]+ [A-Z][a-z]+)(?:\s*[-,]\s*|$)/i)
  if (nameMatch) {
    const name = nameMatch[1].toLowerCase().replace(/\s+/g, '-')
    // Return a search URL instead of assuming the profile exists
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(nameMatch[1])}`
  }
  
  return null
}

// Function to clean executive name from description
const cleanExecutiveName = (executiveText: string): string => {
  // Extract just the name and title, removing additional context
  const cleanMatch = executiveText.match(/^([^,\-]+(?:\s*[-,]\s*[^,\-]+)?)/i)
  return cleanMatch ? cleanMatch[1].trim() : executiveText
}

interface ExecutiveSnapshotProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      fandomOverview?: {
        keyInsight: string
        fandomSize: {
          totalCommunitySize: string
          activeCommunitySize: string
          growthTrend: string
          platformDistribution: {
            tiktok: string
            instagram: string
            reddit: string
            twitter: string
            other?: string
          }
        }
        demographicSnapshot: {
          primaryAge: string
          secondaryAge?: string
          genderSplit: string
          geography: string
          incomeLevel?: string
        }
        fandomHealth: {
          engagementLevel: string
          contentVolume: string
          communityGrowth: string
          seasonality: string
        }
        vaselineRelevance: {
          currentMentions: string
          brandAffinity: string
          productInterest: string
          partnershipAwareness: string
        }
      }
      // Legacy fallback
      executiveSnapshot?: {
        keyInsight: string
        summary: string
        metrics: any
        companyInfo?: any
        businessModel?: any
        marketingMethods?: any
      }
    }
    socialData: {
      mentions: number
      sentiment: {
        positive: number
        negative: number
        neutral: number
      }
      engagementRate: string
      shareOfVoice: string
    }
    executiveSummary: string
  }
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

// Helper function to get confidence indicator
const getConfidenceIndicator = (metric: string | { value: number | null; unit: string; confidence: number; dataStatus: string }): string => {
  if (typeof metric === 'object' && metric && metric.confidence) {
    if (metric.confidence >= 8) return '🟢';
    if (metric.confidence >= 6) return '🟡';
    if (metric.confidence >= 4) return '🟠';
    return '🔴';
  }
  return '';
}

export default function ExecutiveSnapshot({ data }: ExecutiveSnapshotProps) {
  const socialData = data.socialData
  const analysis = data.structuredAnalysis?.fandomOverview || data.structuredAnalysis?.executiveSnapshot

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
            <h1 className="text-3xl font-bold text-brand-dark">Fandom Overview</h1>
            <p className="text-gray-600">{data.brandName} Fandom Analysis & Insights</p>
          </div>
        </div>

        {/* Key Insight */}
        {analysis ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-8 rounded-r-xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-brand-dark mb-3">Key Insight</h3>
                <p className="text-xl font-medium text-brand-dark leading-relaxed">
                  {formatAllCitations(analysis.keyInsight)}
                </p>
              </div>
              
              {/* Show either Emily in Paris or legacy content */}
              {data.structuredAnalysis?.fandomOverview ? (
                <div>
                  <h3 className="text-lg font-semibold text-brand-dark mb-3">Fandom Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive analysis explores the Emily in Paris fandom community, examining engagement patterns, 
                    demographics, and brand alignment opportunities specifically for the Vaseline partnership.
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-brand-dark mb-3">Executive Summary</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {formatAllCitations(analysis.summary)}
                  </p>
                </div>
              )}

              {/* Fandom Metrics or Brand Metrics */}
              {data.structuredAnalysis?.fandomOverview?.fandomSize ? (
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Total Community</span>
                    </div>
                    <p className="text-lg font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.totalCommunitySize}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Active Fans</span>
                    </div>
                    <p className="text-lg font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.activeCommunitySize}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Growth Trend</span>
                    </div>
                    <p className="text-sm font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.growthTrend}</p>
                  </div>
                </div>
              ) : analysis?.metrics && (
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Market Share</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark">{renderMetricValue(analysis.metrics.marketShare)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Eye className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Brand Value</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark">{renderMetricValue(analysis.metrics.brandValue)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-5 h-5 text-brand-accent" />
                      <span className="font-medium text-gray-700">Growth Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark">{renderMetricValue(analysis.metrics.growthRate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-8 rounded-r-xl">
            <h3 className="text-lg font-semibold text-brand-dark mb-3">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">
              {formatAllCitations(data.executiveSummary)}
            </p>
          </div>
        )}
      </div>

      {/* Fandom Demographics and Health */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Demographics */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-brand-accent" />
            <h3 className="text-xl font-semibold text-brand-dark">Fandom Demographics</h3>
          </div>
          
          {data.structuredAnalysis?.fandomOverview?.demographicSnapshot ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Primary Age</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{data.structuredAnalysis.fandomOverview.demographicSnapshot.primaryAge}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Gender Split</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{data.structuredAnalysis.fandomOverview.demographicSnapshot.genderSplit}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-brand-accent" />
                  <div>
                    <span className="text-sm font-medium text-gray-600">Geography</span>
                    <p className="text-gray-800">{data.structuredAnalysis.fandomOverview.demographicSnapshot.geography}</p>
                  </div>
                </div>
                {data.structuredAnalysis.fandomOverview.demographicSnapshot.secondaryAge && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-brand-accent" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Secondary Age Group</span>
                      <p className="text-gray-800">{data.structuredAnalysis.fandomOverview.demographicSnapshot.secondaryAge}</p>
                    </div>
                  </div>
                )}
                {data.structuredAnalysis.fandomOverview.demographicSnapshot.incomeLevel && (
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-4 h-4 text-brand-accent" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Income Level</span>
                      <p className="text-gray-800">{data.structuredAnalysis.fandomOverview.demographicSnapshot.incomeLevel}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Platform Distribution could go here in future */}
              {false && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Key Leadership</h4>
                  <div className="space-y-3">
                    {analysis.companyInfo.keyExecutives.slice(0, 3).map((executive, index) => {
                      const linkedinUrl = extractLinkedInUrl(executive)
                      const cleanName = cleanExecutiveName(executive)
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 font-medium">{formatAllCitations(cleanName)}</p>
                          </div>
                          {linkedinUrl && (
                            <a
                              href={linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors group"
                              title={`View ${cleanName.split(' - ')[0] || cleanName.split(',')[0]} on LinkedIn`}
                            >
                              <LinkedInIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Demographics analysis in progress</p>
              <p className="text-sm mt-1">Detailed demographic data will be available after research completion</p>
            </div>
          )}
        </div>

        {/* Fandom Health */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-brand-accent" />
            <h3 className="text-xl font-semibold text-brand-dark">Fandom Health</h3>
          </div>
          
          {data.structuredAnalysis?.fandomOverview?.fandomHealth ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Engagement Level</h4>
                <p className="text-blue-700 text-sm">{data.structuredAnalysis.fandomOverview.fandomHealth.engagementLevel}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Content Volume</h4>
                <p className="text-green-700 text-sm">{data.structuredAnalysis.fandomOverview.fandomHealth.contentVolume}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Community Growth</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{data.structuredAnalysis.fandomOverview.fandomHealth.communityGrowth}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Seasonality</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{data.structuredAnalysis.fandomOverview.fandomHealth.seasonality}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Fandom health analysis in progress</p>
              <p className="text-sm mt-1">Engagement metrics and community insights coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Vaseline Brand Relevance */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Target className="w-6 h-6 text-brand-accent" />
          <h3 className="text-xl font-semibold text-brand-dark">Vaseline Brand Relevance</h3>
        </div>
        
        {data.structuredAnalysis?.fandomOverview?.vaselineRelevance ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Current Mentions</h4>
                <p className="text-blue-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.currentMentions}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Brand Affinity</h4>
                <p className="text-green-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.brandAffinity}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Product Interest</h4>
                <p className="text-yellow-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.productInterest}</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Partnership Awareness</h4>
                <p className="text-purple-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.partnershipAwareness}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Brand relevance analysis in progress</p>
            <p className="text-sm mt-1">Partnership alignment insights will be detailed after research</p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 