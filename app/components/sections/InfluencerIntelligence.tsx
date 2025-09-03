'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  TrendingUp, 
  Star, 
  MessageCircle, 
  Instagram, 
  ExternalLink,
  Crown,
  Zap,
  Heart,
  CheckCircle,
  AlertCircle,
  Target,
  Video,
  Palette,
  Coffee,
  MapPin,
  Calendar,
  Award,
  Filter,
  Globe,
  Sparkles
} from 'lucide-react'

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
)

// YouTube icon component  
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

interface InfluencerIntelligenceProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      influencerIntelligence?: {
        organicFandomCreators?: {
          byRegion?: {
            [region: string]: {
              microInfluencers?: any[]
              nanoInfluencers?: any[]
              emergingVoices?: any[]
            }
          }
          // Legacy fallback structure
          microInfluencers?: any[]
          nanoInfluencers?: any[]
          emergingVoices?: any[]
        }
        creatorBriefingFramework?: {
          lipOilIntegrationStrategy?: any
          contentBriefs?: any
          campaignActivations?: any
        }
        selectionCriteria?: any
        recommendedApproach?: any
      }
    }
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return <TikTokIcon className="w-5 h-5" />
    case 'instagram':
      return <Instagram className="w-5 h-5" />
    case 'youtube':
      return <YouTubeIcon className="w-5 h-5" />
    default:
      return <Users className="w-5 h-5" />
  }
}

const getEngagementColor = (engagement: string) => {
  const rate = parseFloat(engagement.replace('%', ''))
  if (rate >= 10) return 'text-green-600 bg-green-50'
  if (rate >= 5) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

const getCollaborationScore = (score: string) => {
  const num = parseInt(score.split('/')[0])
  if (num >= 9) return 'text-green-600 bg-green-50'
  if (num >= 7) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

const InfluencerIntelligence: React.FC<InfluencerIntelligenceProps> = ({ data }) => {
  const influencerData = data.structuredAnalysis?.influencerIntelligence
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  
  if (!influencerData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Influencer Data Available</h3>
          <p className="text-gray-500">Run an analysis to discover organic fandom creators and influencer opportunities.</p>
        </div>
      </div>
    )
  }

  const { organicFandomCreators, creatorBriefingFramework, selectionCriteria, recommendedApproach } = influencerData

  // Determine available regions and current data structure
  const hasRegionalData = organicFandomCreators?.byRegion
  const availableRegions = hasRegionalData ? Object.keys(organicFandomCreators.byRegion) : []
  const allRegions = ['All', ...availableRegions]

  // Get current data based on selected region
  const getCurrentCreatorData = () => {
    if (!hasRegionalData) {
      // Legacy fallback
      return {
        microInfluencers: organicFandomCreators?.microInfluencers || [],
        nanoInfluencers: organicFandomCreators?.nanoInfluencers || [],
        emergingVoices: organicFandomCreators?.emergingVoices || []
      }
    }

    if (selectedRegion === 'All') {
      // Combine all regions
      const combined = {
        microInfluencers: [] as any[],
        nanoInfluencers: [] as any[],
        emergingVoices: [] as any[]
      }
      
      Object.values(organicFandomCreators.byRegion!).forEach(regionData => {
        combined.microInfluencers.push(...(regionData.microInfluencers || []))
        combined.nanoInfluencers.push(...(regionData.nanoInfluencers || []))
        combined.emergingVoices.push(...(regionData.emergingVoices || []))
      })
      
      return combined
    } else {
      // Single region
      const regionData = organicFandomCreators.byRegion![selectedRegion]
      return {
        microInfluencers: regionData?.microInfluencers || [],
        nanoInfluencers: regionData?.nanoInfluencers || [],
        emergingVoices: regionData?.emergingVoices || []
      }
    }
  }

  const currentData = getCurrentCreatorData()

  // Get flag emoji for region
  const getRegionFlag = (region: string) => {
    const flags: { [key: string]: string } = {
      'Spain': '🇪🇸',
      'Netherlands': '🇳🇱', 
      'Saudi Arabia': '🇸🇦',
      'Thailand': '🇹🇭',
      'Mexico': '🇲🇽',
      'US': '🇺🇸',
      'UK': '🇬🇧', 
      'France': '🇫🇷',
      'Germany': '🇩🇪',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺'
    }
    return flags[region] || '🌍'
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          className="text-4xl font-bold text-brand-dark mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Users className="w-10 h-10 inline-block mr-3 text-brand-primary" />
          Influencer Intelligence
        </motion.h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
          Organic fandom creators and strategic briefing frameworks for {data.brandName} partnerships
        </p>

        {/* Region Filter */}
        {hasRegionalData && (
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Target Market:</span>
                </div>
                <div className="flex space-x-2">
                  {allRegions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedRegion === region
                          ? 'bg-brand-primary text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {region === 'All' ? (
                        <>
                          <Globe className="w-4 h-4 inline-block mr-1" />
                          All Markets
                        </>
                      ) : (
                        <>
                          <span className="mr-1">{getRegionFlag(region)}</span>
                          {region}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {selectedRegion !== 'All' && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Showing influencers and content specifically for the {selectedRegion} market
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Organic Fandom Creators */}
      {organicFandomCreators && (
        <motion.section 
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
            <Crown className="w-6 h-6 mr-2 text-yellow-500" />
            Organic Fandom Creators
          </h2>

          {/* Micro-Influencers */}
          {currentData.microInfluencers && currentData.microInfluencers.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Micro-Influencers</h3>
                    <p className="text-sm text-gray-600">100K+ followers • Premium tier creators</p>
                  </div>
                </div>
                {selectedRegion !== 'All' && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                    <span className="text-lg">{getRegionFlag(selectedRegion)}</span>
                    <span className="text-sm font-medium text-blue-800">{selectedRegion} Market</span>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {currentData.microInfluencers.map((creator: any, index: number) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            {getPlatformIcon(creator.platform)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{creator.name}</h4>
                            <div className="flex items-center space-x-1 text-blue-100 text-sm">
                              {getPlatformIcon(creator.platform)}
                              <span className="capitalize">{creator.platform}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{creator.followers}</div>
                          <div className="text-blue-100 text-xs">followers</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 ${
                          creator.engagement.includes('High') || parseFloat(creator.engagement.replace('%', '')) >= 8 
                            ? 'text-green-200' : 'text-yellow-200'
                        }`}>
                          {creator.engagement} engagement
                        </span>
                        <span className="text-xs text-blue-100">
                          ⭐ {creator.collaborationPotential || 'High potential'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Fandom Connection */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Heart className="w-4 h-4 text-pink-500 mr-2" />
                          Fandom Connection
                        </h5>
                        <p className="text-sm text-gray-700 leading-relaxed">{creator.fandomConnection}</p>
                      </div>

                      {/* Content Style & Beauty Focus */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-purple-50 rounded-lg p-3">
                          <h6 className="font-medium text-purple-900 text-xs mb-1">Content Style</h6>
                          <p className="text-purple-700 text-xs leading-tight">{creator.contentStyle}</p>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-3">
                          <h6 className="font-medium text-pink-900 text-xs mb-1">Beauty Focus</h6>
                          <p className="text-pink-700 text-xs">{creator.beautyFocus || '50%'}</p>
                        </div>
                      </div>

                      {/* Vaseline Alignment */}
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                        <h6 className="font-medium text-green-900 text-xs mb-1 flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          Vaseline Lip Oil Alignment
                        </h6>
                        <p className="text-green-700 text-xs leading-tight">{creator.vaselineAlignment}</p>
                      </div>

                      {/* Audience & Quality Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium">Audience</div>
                          <div className="text-xs text-blue-800 mt-1">{creator.audienceDemographics}</div>
                        </div>
                        <div className="text-center p-2 bg-indigo-50 rounded-lg">
                          <div className="text-xs text-indigo-600 font-medium">Content Quality</div>
                          <div className="text-xs text-indigo-800 mt-1">{creator.contentQuality}</div>
                        </div>
                        <div className="text-center p-2 bg-emerald-50 rounded-lg">
                          <div className="text-xs text-emerald-600 font-medium">Brand Safety</div>
                          <div className="text-xs text-emerald-800 mt-1">{creator.brandSafety}</div>
                        </div>
                      </div>

                      {/* Regional Relevance */}
                      {creator.regionalRelevance && selectedRegion !== 'All' && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <h6 className="font-medium text-yellow-900 text-xs mb-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Regional Relevance
                          </h6>
                          <p className="text-yellow-700 text-xs">{creator.regionalRelevance}</p>
                        </div>
                      )}

                      {/* Contact & Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {creator.contactInfo && (
                          <div className="flex items-center text-xs text-gray-600">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            <span className="truncate">{creator.contactInfo}</span>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            creator.collaborationPotential === 'High' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {creator.collaborationPotential || 'High'} Potential
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Nano-Influencers */}
          {currentData.nanoInfluencers && currentData.nanoInfluencers.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Nano-Influencers</h3>
                    <p className="text-sm text-gray-600">10-50K followers • High engagement creators</p>
                  </div>
                </div>
                {selectedRegion !== 'All' && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
                    <span className="text-lg">{getRegionFlag(selectedRegion)}</span>
                    <span className="text-sm font-medium text-green-800">{selectedRegion} Market</span>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentData.nanoInfluencers.map((creator: any, index: number) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {getPlatformIcon(creator.platform)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{creator.name}</h4>
                            <span className="text-green-100 text-xs capitalize">{creator.platform}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{creator.followers}</div>
                          <div className="text-green-100 text-xs">followers</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold bg-white/20 ${
                          creator.engagement.includes('High') || parseFloat(creator.engagement.replace('%', '')) >= 8 
                            ? 'text-green-200' : 'text-yellow-200'
                        }`}>
                          {creator.engagement}
                        </span>
                        <span className="text-xs text-green-100">
                          {creator.viralPotential}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Unique Angle */}
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-1 flex items-center text-xs">
                          <Sparkles className="w-3 h-3 text-green-500 mr-1" />
                          Unique Angle
                        </h5>
                        <p className="text-xs text-gray-700 leading-relaxed">{creator.uniqueAngle}</p>
                      </div>

                      {/* Fandom Role & Lip Oil Opportunity */}
                      <div className="space-y-2 mb-3">
                        <div className="bg-emerald-50 rounded-lg p-2">
                          <h6 className="font-medium text-emerald-900 text-xs mb-1">Fandom Role</h6>
                          <p className="text-emerald-700 text-xs leading-tight">{creator.fandomRole}</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-2">
                          <h6 className="font-medium text-teal-900 text-xs mb-1">Lip Oil Fit</h6>
                          <p className="text-teal-700 text-xs leading-tight">{creator.lipOilOpportunity}</p>
                        </div>
                      </div>

                      {/* Regional Relevance */}
                      {creator.regionalRelevance && selectedRegion !== 'All' && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                          <h6 className="font-medium text-yellow-900 text-xs mb-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Regional Relevance
                          </h6>
                          <p className="text-yellow-700 text-xs">{creator.regionalRelevance}</p>
                        </div>
                      )}

                      {/* Bottom metrics */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <div className={`w-2 h-2 rounded-full ${
                            creator.viralPotential === 'High' ? 'bg-green-400' : 
                            creator.viralPotential === 'Medium' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs">{creator.viralPotential} Viral Potential</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active Creator
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Emerging Voices */}
          {currentData.emergingVoices && currentData.emergingVoices.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Emerging Voices</h3>
                    <p className="text-sm text-gray-600">5-20K followers • Rising stars with potential</p>
                  </div>
                </div>
                {selectedRegion !== 'All' && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg">
                    <span className="text-lg">{getRegionFlag(selectedRegion)}</span>
                    <span className="text-sm font-medium text-purple-800">{selectedRegion} Market</span>
                  </div>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentData.emergingVoices.map((creator: any, index: number) => (
                  <motion.div 
                    key={index}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-100 overflow-hidden transition-all duration-300"
                    whileHover={{ y: -2, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 text-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                            {getPlatformIcon(creator.platform)}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">{creator.name}</h4>
                            <span className="text-purple-100 text-xs capitalize">{creator.platform}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-100 font-medium">
                          {creator.followers}
                        </span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-white/20 ${
                          creator.growthTrend.includes('Rapid') ? 'text-green-200' : 'text-yellow-200'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          <span>{creator.growthTrend}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      {/* Content Focus */}
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-1 flex items-center text-xs">
                          <Video className="w-3 h-3 text-purple-500 mr-1" />
                          Content Focus
                        </h5>
                        <p className="text-xs text-gray-700 leading-relaxed">{creator.contentFocus}</p>
                      </div>

                      {/* Fandom Depth & Future Potential */}
                      <div className="space-y-2 mb-3">
                        <div className="bg-purple-50 rounded-lg p-2">
                          <h6 className="font-medium text-purple-900 text-xs mb-1">Fandom Depth</h6>
                          <p className="text-purple-700 text-xs leading-tight">{creator.fandomDepth}</p>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-2">
                          <h6 className="font-medium text-pink-900 text-xs mb-1">Future Potential</h6>
                          <p className="text-pink-700 text-xs leading-tight">{creator.futureP || creator.futurePotential}</p>
                        </div>
                      </div>

                      {/* Engagement Metrics */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Engagement:</span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            creator.engagement.includes('High') || parseFloat(creator.engagement.replace('%', '')) >= 7 
                              ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {creator.engagement}
                          </span>
                        </div>
                      </div>

                      {/* Regional Relevance */}
                      {creator.regionalRelevance && selectedRegion !== 'All' && (
                        <div className="mb-3 p-2 bg-yellow-50 rounded-lg">
                          <h6 className="font-medium text-yellow-900 text-xs mb-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Regional Relevance
                          </h6>
                          <p className="text-yellow-700 text-xs">{creator.regionalRelevance}</p>
                        </div>
                      )}

                      {/* Bottom Status */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <div className={`w-2 h-2 rounded-full ${
                            creator.growthTrend.includes('Rapid') ? 'bg-green-400 animate-pulse' : 
                            creator.growthTrend.includes('Steady') ? 'bg-blue-400' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-xs">Rising Creator</span>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {creator.viralPotential || 'Growth Potential'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Creator Briefing Framework */}
      {creatorBriefingFramework && (
        <motion.section 
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-red-500" />
            Creator Briefing Framework
          </h2>

          {/* Lip Oil Integration Strategy */}
          {creatorBriefingFramework.lipOilIntegrationStrategy && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Vaseline Lip Oil Integration Strategy</h3>
              <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-lg p-6 border border-pink-100">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Product Positioning</h4>
                  <p className="text-gray-700">{creatorBriefingFramework.lipOilIntegrationStrategy.productPositioning}</p>
                </div>
                
                {creatorBriefingFramework.lipOilIntegrationStrategy.keyMessages && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Key Messages</h4>
                    <div className="space-y-2">
                      {creatorBriefingFramework.lipOilIntegrationStrategy.keyMessages.map((message: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {creatorBriefingFramework.lipOilIntegrationStrategy.contentFormats && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Content Formats</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(creatorBriefingFramework.lipOilIntegrationStrategy.contentFormats).map(([format, description]: [string, any], index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-pink-200">
                          <h5 className="font-medium text-gray-800 mb-1 capitalize">{format.replace(/([A-Z])/g, ' $1').trim()}</h5>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Briefs */}
          {creatorBriefingFramework.contentBriefs && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Content Briefs by Creator Type</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(creatorBriefingFramework.contentBriefs).map(([creatorType, brief]: [string, any], index: number) => (
                  <motion.div 
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center mb-4">
                      {creatorType.includes('fashion') ? <Palette className="w-5 h-5 mr-2 text-purple-500" /> :
                       creatorType.includes('beauty') ? <Heart className="w-5 h-5 mr-2 text-pink-500" /> :
                       <Coffee className="w-5 h-5 mr-2 text-brown-500" />}
                      <h4 className="font-semibold text-gray-800 capitalize">
                        {creatorType.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{brief.brief}</p>
                    <div className="text-xs text-gray-600">
                      <strong>Integration:</strong> {brief.lipOilIntegration}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Campaign Activations */}
          {creatorBriefingFramework.campaignActivations && (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Campaign Activations</h3>
              <div className="space-y-4">
                {creatorBriefingFramework.campaignActivations.seasonalCampaigns && (
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                      Seasonal Campaigns
                    </h4>
                    {creatorBriefingFramework.campaignActivations.seasonalCampaigns.map((campaign: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                        <h5 className="font-medium text-gray-800 mb-2">{campaign.season}</h5>
                        <p className="text-sm text-gray-700 mb-2"><strong>Concept:</strong> {campaign.concept}</p>
                        <p className="text-sm text-gray-700"><strong>Timeline:</strong> {campaign.timeline}</p>
                      </div>
                    ))}
                  </div>
                )}

                {creatorBriefingFramework.campaignActivations.productLaunchCampaign && (
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-500" />
                      Product Launch Campaign
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(creatorBriefingFramework.campaignActivations.productLaunchCampaign).map(([phase, description]: [string, any], index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                          <h5 className="font-medium text-gray-800 mb-1 capitalize">{phase.replace(/([A-Z])/g, ' $1').trim()}</h5>
                          <p className="text-sm text-gray-700">{description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Selection Criteria & Recommended Approach */}
      <div className="grid md:grid-cols-2 gap-8">
        {selectionCriteria && (
          <motion.section 
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
              Selection Criteria
            </h2>
            
            {Object.entries(selectionCriteria).map(([category, criteria]: [string, any], index: number) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="space-y-2">
                  {Object.entries(criteria).map(([criterion, description]: [string, any], criterionIndex: number) => (
                    <div key={criterionIndex} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-800">{criterion.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-gray-700 ml-1">{description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {recommendedApproach && (
          <motion.section 
            className="bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-purple-500" />
              Recommended Approach
            </h2>
            
            {Object.entries(recommendedApproach).map(([strategy, details]: [string, any], index: number) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                  {strategy.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="space-y-2">
                  {Object.entries(details).map(([item, description]: [string, any], itemIndex: number) => (
                    <div key={itemIndex} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <h4 className="font-medium text-gray-800 mb-1">{item.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <p className="text-sm text-gray-700">{description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}
      </div>
    </div>
  )
}

export default InfluencerIntelligence
