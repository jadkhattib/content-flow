'use client'

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, MessageCircle, TrendingUp, Trash2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CampaignCreationProps {
  data: {
    brandName: string
    category: string
    executiveSummary: string
    structuredAnalysis?: any
    socialData: any
  }
}

interface SavedCampaign {
  campaign_id: string
  brand_name: string
  campaign_name: string
  campaign_data: any
  created_at: string
  mode: 'auto' | 'guided'
  status: 'draft' | 'active' | 'completed'
}

// Helper function to extract campaign overview
const getCampaignOverview = (campaign: SavedCampaign): string => {
  try {
    const campaignData = typeof campaign.campaign_data === 'string' 
      ? JSON.parse(campaign.campaign_data) 
      : campaign.campaign_data
    
    return campaignData?.campaignSummary?.overview || 
           campaignData?.strategy?.approach || 
           'AI-generated marketing campaign with strategic insights and recommendations'
  } catch {
    return 'Marketing campaign strategy'
  }
}

const CampaignCreation = memo(function CampaignCreation({ data }: CampaignCreationProps) {
  const router = useRouter()
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const lastFetchTimeRef = useRef<number>(0)

  // Debounced fetch function to prevent excessive API calls
  const fetchSavedCampaigns = useCallback(async (force: boolean = false) => {
    const now = Date.now()
    // Prevent fetching if less than 2 seconds have passed since last fetch (unless forced)
    if (!force && now - lastFetchTimeRef.current < 2000) {
      console.log('⏭️ Skipping campaign fetch - too recent')
      return
    }

    try {
      setLoadingCampaigns(true)
      lastFetchTimeRef.current = now
      console.log(`🔍 Fetching campaigns for brand: ${data.brandName}`)
      
      const response = await fetch(`/api/campaigns?brandName=${encodeURIComponent(data.brandName)}`)
      const result = await response.json()
      
      console.log('📊 Campaigns API response:', result)
      
      if (result.success) {
        console.log(`✅ Found ${result.campaigns?.length || 0} campaigns for ${data.brandName}`)
        setSavedCampaigns(result.campaigns || [])
      } else {
        console.error('❌ Failed to fetch campaigns:', result.error)
        setSavedCampaigns([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch saved campaigns:', error)
      setSavedCampaigns([])
    } finally {
      setLoadingCampaigns(false)
    }
  }, [data.brandName])

  // Consolidated useEffect for initial load and brand name changes
  useEffect(() => {
    fetchSavedCampaigns(true) // Force initial fetch
  }, [data.brandName, fetchSavedCampaigns])

  // Separate useEffect for handling window focus/visibility events with debouncing
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout

    const handleFocus = () => {
      // Clear any existing timeout to debounce the focus events
      if (focusTimeout) {
        clearTimeout(focusTimeout)
      }
      
      focusTimeout = setTimeout(() => {
        // Check if we need to refresh campaigns
        const shouldRefresh = sessionStorage.getItem('refreshCampaigns')
        if (shouldRefresh) {
          console.log('🔄 Refreshing campaigns due to session storage flag')
          sessionStorage.removeItem('refreshCampaigns')
          // Call fetchSavedCampaigns directly to avoid closure issues
          const refreshCampaigns = async () => {
            try {
              setLoadingCampaigns(true)
              lastFetchTimeRef.current = Date.now()
              console.log(`🔍 Refreshing campaigns for brand: ${data.brandName}`)
              
              const response = await fetch(`/api/campaigns?brandName=${encodeURIComponent(data.brandName)}`)
              const result = await response.json()
              
              if (result.success) {
                console.log(`✅ Found ${result.campaigns?.length || 0} campaigns for ${data.brandName}`)
                setSavedCampaigns(result.campaigns || [])
              } else {
                console.error('❌ Failed to fetch campaigns:', result.error)
                setSavedCampaigns([])
              }
            } catch (error) {
              console.error('❌ Failed to fetch saved campaigns:', error)
              setSavedCampaigns([])
            } finally {
              setLoadingCampaigns(false)
            }
          }
          refreshCampaigns()
        }
      }, 300) // 300ms debounce
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && document.visibilityState === 'visible') {
        handleFocus()
      }
    }

    // Add event listeners
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup function
    return () => {
      if (focusTimeout) {
        clearTimeout(focusTimeout)
      }
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [data.brandName]) // Include brandName as dependency

  const deleteCampaign = useCallback(async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return
    }

    try {
      const response = await fetch(`/api/campaigns?campaignId=${campaignId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        // Update state immediately for better UX, no need to refetch
        setSavedCampaigns(prev => prev.filter(c => c.campaign_id !== campaignId))
      } else {
        alert('Failed to delete campaign')
      }
    } catch (error) {
      console.error('Failed to delete campaign:', error)
      alert('Failed to delete campaign')
    }
  }, [])

  const handleCampaignClick = useCallback((campaignId: string) => {
    router.push(`/campaign-view/${campaignId}`)
  }, [router])

  const handleCreateCampaign = useCallback((mode: 'auto' | 'guided') => {
    router.push(`/campaign-creation?mode=${mode}&brandName=${encodeURIComponent(data.brandName)}`)
  }, [router, data.brandName])

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
            <h1 className="text-3xl font-bold text-brand-dark">Campaign Creation</h1>
            <p className="text-gray-600">Create data-driven marketing campaigns using AI insights from your {data.brandName} analysis</p>
          </div>
        </div>

        {/* Campaign Options */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 cursor-pointer group transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCreateCampaign('auto')}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">
                Let AI do the work
              </h2>
            </div>
            <p className="text-blue-700 mb-6 text-lg leading-relaxed">
              AI analyzes all your {data.brandName} data and creates a comprehensive marketing campaign automatically using insights from:
            </p>
            <ul className="text-blue-600 mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Brand analysis & competitive landscape
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Audience insights & demographics
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Cultural trends & opportunities
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Social media performance data
              </li>
            </ul>
            <div className="flex items-center text-blue-600 group-hover:text-blue-800 transition-colors font-semibold">
              <span>Generate Campaign</span>
              <TrendingUp className="w-5 h-5 ml-2" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100 cursor-pointer group transition-all duration-300 hover:shadow-lg"
            onClick={() => handleCreateCampaign('guided')}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-purple-800 group-hover:text-purple-900 transition-colors">
                Guide AI to do the work
              </h2>
            </div>
            <p className="text-purple-700 mb-6 text-lg leading-relaxed">
              Answer strategic questions to help AI create a more targeted campaign for your specific goals and objectives:
            </p>
            <ul className="text-purple-600 mb-6 space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                What metrics do you want to improve?
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                What defines success for this campaign?
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Additional context & strategic insights
              </li>
            </ul>
            <div className="flex items-center text-purple-600 group-hover:text-purple-800 transition-colors font-semibold">
              <span>Start Guided Creation</span>
              <TrendingUp className="w-5 h-5 ml-2" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Campaigns Created Section */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Campaigns Created</h2>
        
        {loadingCampaigns ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-500">Loading saved campaigns...</p>
          </div>
        ) : savedCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-600 mb-2">No campaigns saved yet</h3>
            <p className="text-gray-500 text-sm">Create and save campaigns to see them here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedCampaigns.map((campaign) => (
              <div 
                key={campaign.campaign_id} 
                className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer hover:bg-gray-100"
                onClick={() => handleCampaignClick(campaign.campaign_id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="font-semibold text-gray-800 text-lg">{campaign.campaign_name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.mode === 'auto' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {campaign.mode === 'auto' ? 'AI Generated' : 'Guided'}
                      </span>
                    </div>
                    {/* Campaign Overview Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {getCampaignOverview(campaign)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click when clicking the button
                        handleCampaignClick(campaign.campaign_id)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View Campaign"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation() // Prevent card click when clicking the delete button
                        deleteCampaign(campaign.campaign_id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
})

export default CampaignCreation 