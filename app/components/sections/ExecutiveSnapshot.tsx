'use client'

import { Target, TrendingUp, Users, Eye, Building2, Briefcase, Megaphone, PoundSterling, MapPin, Calendar, ExternalLink } from 'lucide-react'
import { formatTextWithCitations, formatAllCitations } from '@/lib/citationUtils'

interface ExecutiveSnapshotProps {
  data: {
    brandName: string
    category: string
    timeframe: string
    pitchContext: string
    executiveSummary: string
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
          secondaryAge: string
          genderSplit: string
          geography: string
          incomeLevel: string
        }
        fandomHealth?: {
          engagementLevel: string
          contentVolume: string
          communityGrowth: string
          seasonality: string
        }
        vaselineRelevance?: {
          currentMentions: string
          brandAffinity: string
          productInterest: string
          partnershipAwareness: string
        }
      }
      executiveSnapshot?: any
    }
    fullAnalysis: string
    socialData: any
    analysisDate: string
  }
}

export default function ExecutiveSnapshot({ data }: ExecutiveSnapshotProps) {
  const analysis = data.structuredAnalysis?.fandomOverview || data.structuredAnalysis?.executiveSnapshot

  return (
    <div className="space-y-8">
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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-brand-dark mb-3">Key Insight</h2>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="text-gray-700 text-lg leading-relaxed">
              {analysis?.keyInsight || "Deep fandom analysis reveals significant brand partnership potential with authentic community engagement opportunities."}
            </p>
          </div>
        </div>
      </div>

      {/* Fandom Metrics */}
      {data.structuredAnalysis?.fandomOverview && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Community Metrics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-brand-accent" />
                <span className="font-medium text-gray-700">Total Community</span>
              </div>
              <p className="text-sm font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.totalCommunitySize}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                <span className="font-medium text-gray-700">Active Fans</span>
              </div>
              <p className="text-sm font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.activeCommunitySize}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-5 h-5 text-brand-accent" />
                <span className="font-medium text-gray-700">Growth Trend</span>
              </div>
              <p className="text-sm font-bold text-brand-dark">{data.structuredAnalysis.fandomOverview.fandomSize.growthTrend}</p>
            </div>
          </div>
        </div>
      )}

      {/* Demographics */}
      {data.structuredAnalysis?.fandomOverview?.demographicSnapshot && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Community Demographics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Primary Age</h3>
              <p className="text-blue-800 text-lg font-medium">{data.structuredAnalysis.fandomOverview.demographicSnapshot.primaryAge}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">Gender Split</h3>
              <p className="text-green-800 text-lg font-medium">{data.structuredAnalysis.fandomOverview.demographicSnapshot.genderSplit}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3">Geography</h3>
              <p className="text-purple-800 text-lg font-medium">{data.structuredAnalysis.fandomOverview.demographicSnapshot.geography}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-3">Income Level</h3>
              <p className="text-orange-800 text-lg font-medium">{data.structuredAnalysis.fandomOverview.demographicSnapshot.incomeLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Distribution */}
      {data.structuredAnalysis?.fandomOverview && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Platform Presence</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(data.structuredAnalysis.fandomOverview.fandomSize.platformDistribution).map(([platform, engagement], index) => {
              const colors = [
                { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200' },
                { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
                { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
                { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
                { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' }
              ]
              const color = colors[index % colors.length]
              
              return (
                <div key={platform} className={`${color.bg} rounded-lg p-4 border ${color.border}`}>
                  <h4 className={`font-medium ${color.text} mb-2 capitalize`}>{platform}</h4>
                  <p className={`${color.text} text-sm`}>{engagement}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vaseline Relevance */}
      {data.structuredAnalysis?.fandomOverview?.vaselineRelevance && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Vaseline Partnership Relevance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Current Brand Mentions</h4>
                <p className="text-blue-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.currentMentions}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Brand Affinity</h4>
                <p className="text-green-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.brandAffinity}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Product Interest</h4>
                <p className="text-yellow-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.productInterest}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">Partnership Awareness</h4>
                <p className="text-purple-700 text-sm">{data.structuredAnalysis.fandomOverview.vaselineRelevance.partnershipAwareness}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}