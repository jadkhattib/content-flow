'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Users,
  Zap,
  RefreshCw,
  X
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { logger } from '../../../lib/logger'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface MediaSpendRecord {
  advertiser: string
  brand_root: string
  brand_major: string
  brand_minor: string
  brand_leaf: string
  publisher: string
  date: string
  device: string
  direct_indirect: string
  category_level_1: string
  category_level_2: string
  category_level_3: string
  category_level_4: string
  category_level_5: string
  category_level_6: string
  category_level_7: string
  category_level_8: string
  region: string
  width: number
  height: number
  type: string
  first_seen: string
  last_seen: string
  video_duration: number
  creative_text: string
  landing_page: string
  link_to_creative: string
  creative_id: number
  sales_channel: string
  sales_channel_type: string
  purchase_channel: string
  purchase_channel_type: string
  gaming_franchise: string
  gaming_title: string
  spend_usd: number
  impressions: number
}

interface MediaSpendData {
  records: MediaSpendRecord[]
  summary: {
    total_records: number
    total_spend: number
    total_impressions: number
    unique_publishers: number
    unique_devices: number
    channel_types: number
  }
  topPublishers: Array<{
    Publisher: string
    total_spend: number
    total_impressions: number
    campaign_count: number
  }>
  deviceSpend: Array<{
    Device: string
    total_spend: number
    total_impressions: number
    campaign_count: number
  }>
  purchaseChannelSpend: Array<{
    purchase_channel_type: string
    total_spend: number
    total_impressions: number
    campaign_count: number
  }>
  timeSeries: Array<{
    month: string
    total_spend: number
    total_impressions: number
    campaign_count: number
  }>
  brandMonthlySpend?: Array<{
    brand_leaf: string
    month: string
    total_spend: number
    total_impressions: number
  }>
  brandTotals?: Array<{
    brand_leaf: string
    total_spend: number
    total_impressions: number
    campaign_count: number
  }>
}

interface MediaActivityProps {
  data: {
    brandName: string
    [key: string]: any
  }
}

// Cache for storing media spend data to prevent unnecessary API calls
const mediaDataCache = new Map<string, {
  data: MediaSpendData | null
  allBrandsData: MediaSpendData | null
  preloadedBrandData?: Map<string, MediaSpendData>
  timestamp: number
  expiryTime: number // 30 minutes cache expiry
}>()

const CACHE_EXPIRY_MS = 30 * 60 * 1000 // 30 minutes

// Helper function to generate cache key
const getCacheKey = (brandName: string | null, dateRange: { start: string, end: string }) => {
  return `${brandName || 'all-brands'}_${dateRange.start}_${dateRange.end}`
}

// Helper function to check if cache is valid
const isCacheValid = (cacheEntry: any): boolean => {
  return cacheEntry && Date.now() < cacheEntry.expiryTime
}

const CHART_COLORS = {
  // Device colors
  'Desktop Display': '#3b82f6',
  'Mobile Display': '#10b981', 
  'Tablet Display': '#f59e0b',
  'Connected TV': '#8b5cf6',
  'Video': '#ef4444',
  'Audio': '#06b6d4',
  'Desktop': '#3b82f6',
  'Mobile': '#10b981',
  'Tablet': '#f59e0b',
  'CTV': '#8b5cf6',
  'OTT': '#ec4899',
  'Radio': '#14b8a6',
  'Podcast': '#f97316',
  'Digital': '#6366f1',
  'Social': '#84cc16',
  'Search': '#eab308',
  'Display': '#6b7280',
  'Native': '#a855f7',
  'Programmatic': '#059669',
  'Direct': '#dc2626',
  'YouTube': '#ff0000',
  'Facebook': '#1877f2',
  'Instagram': '#e4405f',
  'Twitter': '#1da1f2',
  'LinkedIn': '#0077b5',
  'TikTok': '#000000',
  'Snapchat': '#fffc00',
  'Pinterest': '#bd081c',
  'Streaming': '#9333ea',
  'Gaming': '#16a34a',
  
  // Purchase Channel Type colors
  'E-commerce': '#3b82f6',
  'Retail': '#10b981',
  'Online': '#f59e0b',
  'In-Store': '#8b5cf6',
  'Marketplace': '#ef4444',
  'Direct to Consumer': '#06b6d4',
  'Wholesale': '#ec4899',
  'Subscription': '#14b8a6',
  'Mobile App': '#f97316',
  'Website': '#6366f1',
  'Physical Store': '#84cc16',
  'Third Party': '#eab308',
  'Partner': '#a855f7',
  'Affiliate': '#059669',
  'Reseller': '#dc2626',
  
  // Chart-specific colors
  'Media Spend': '#3b82f6',
  'Impressions': '#10b981'
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  } else {
    return `$${value.toFixed(0)}`
  }
}

const formatNumber = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2).replace(/\.?0+$/, '')}B`
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(/\.?0+$/, '')}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.?0+$/, '')}K`
  } else {
    return value.toLocaleString()
  }
}

// Round to nearest thousand with lowercase 'k' (e.g., 39789 -> 40k)
const formatRoundedK = (value: number) => {
  if (!value || value < 1000) return (value || 0).toString()
  const rounded = Math.round(value / 1000)
  return `${rounded}k`
}

export default function MediaActivity({ data }: MediaActivityProps) {
  const [mediaData, setMediaData] = useState<MediaSpendData | null>(null)
  const [allBrandsData, setAllBrandsData] = useState<MediaSpendData | null>(null)
  const [preloadedBrandData, setPreloadedBrandData] = useState<Map<string, MediaSpendData>>(new Map())
  const [preloadProgress, setPreloadProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('all')
  const [selectedPublisher, setSelectedPublisher] = useState<string>('all')
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState({ start: '2023-01-01', end: '2023-12-31' })
  const [viewMode, setViewMode] = useState<'overview' | 'publishers' | 'creative' | 'trends'>('overview')
  const [selectedCreative, setSelectedCreative] = useState<MediaSpendRecord | null>(null)
  const [showCreativeModal, setShowCreativeModal] = useState(false)
  const [showPointCreativesModal, setShowPointCreativesModal] = useState(false)
  const [pointCreatives, setPointCreatives] = useState<MediaSpendRecord[]>([])
  const [pointCreativesLoading, setPointCreativesLoading] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [brandSelectionMode, setBrandSelectionMode] = useState(true)
  const [sortColumn, setSortColumn] = useState<string>('spend_usd')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [brandOverview, setBrandOverview] = useState<{ tldr: string[]; paragraph: string } | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [aiOverviewCollapsed, setAiOverviewCollapsed] = useState(true)
  const [marketOverview, setMarketOverview] = useState<{ tldr: string[]; paragraph: string } | null>(null)
  const [marketOverviewLoading, setMarketOverviewLoading] = useState(false)
  const [marketAiOverviewCollapsed, setMarketAiOverviewCollapsed] = useState(true)
  const [selectedTrendBrands, setSelectedTrendBrands] = useState<Set<string>>(new Set())
  
  // Cache for monthly creative data to speed up chart clicks
  const [monthlyCreativeCache, setMonthlyCreativeCache] = useState<Map<string, { data: MediaSpendRecord[]; timestamp: number }>>(new Map())
  
  // Helper to fetch creatives for a specific YYYY-MM window for the current brand
  const openCreativesForMonth = async (monthKey: string) => {
    try {
      if (!selectedBrand) return
      
      const cacheKey = `${selectedBrand}-${monthKey}`
      const now = Date.now()
      const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
      
      // Check cache first
      const cachedData = monthlyCreativeCache.get(cacheKey)
      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        logger.info('Using cached monthly creative data:', { brand: selectedBrand, month: monthKey })
        setPointCreatives(cachedData.data)
        setPointCreativesLoading(false)
        setShowPointCreativesModal(true)
        return
      }
      
      // Show modal immediately with loading state
      setPointCreatives([])
      setPointCreativesLoading(true)
      setShowPointCreativesModal(true)
      
      // Try to filter from current data first for instant results
      if (mediaData?.records && mediaData.records.length > 0) {
        const [yearStr, monthStr] = monthKey.split('-')
        const year = parseInt(yearStr)
        const month = parseInt(monthStr)
        
        if (year && month) {
          const filteredFromCurrent = mediaData.records.filter(record => {
            const recordDate = new Date(safeValue(record.date) as string)
            return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month
          })
          
          if (filteredFromCurrent.length > 0) {
            logger.info('Using filtered current data for month:', { brand: selectedBrand, month: monthKey, count: filteredFromCurrent.length })
            setPointCreatives(filteredFromCurrent)
            setPointCreativesLoading(false)
            
            // Cache the filtered results
            const newCache = new Map(monthlyCreativeCache)
            newCache.set(cacheKey, { data: filteredFromCurrent, timestamp: now })
            setMonthlyCreativeCache(newCache)
            return
          }
        }
      }
      
      // Fallback to API call for complete data
      const [yearStr, monthStr] = monthKey.split('-')
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)
      if (!year || !month) return
      
      const lastDay = new Date(year, month, 0).getDate()
      const startDate = `${yearStr}-${monthStr}-01`
      const endDate = `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`
      const params = new URLSearchParams({ brandName: selectedBrand, startDate, endDate, limit: '2000' })
      
      logger.info('Fetching fresh creatives for month:', { brand: selectedBrand, startDate, endDate })
      const resp = await fetch(`/api/media-spend?${params}`)
      const json = await resp.json()
      
      if (json.success) {
        const freshData = json.data?.records || []
        setPointCreatives(freshData)
        setPointCreativesLoading(false)
        
        // Cache the fresh results
        const newCache = new Map(monthlyCreativeCache)
        newCache.set(cacheKey, { data: freshData, timestamp: now })
        setMonthlyCreativeCache(newCache)
      } else {
        setPointCreatives([])
        setPointCreativesLoading(false)
      }
    } catch (e) {
      logger.error('Failed to fetch creatives for month:', e)
      setPointCreatives([])
      setPointCreativesLoading(false)
    }
  }

  useEffect(() => {
    const cacheKey = getCacheKey(selectedBrand, dateRange)
    const cachedEntry = mediaDataCache.get(cacheKey)
    
    // Check if we have valid cached data
    if (isCacheValid(cachedEntry)) {
      logger.info(`Using cached data for key: ${cacheKey}`)
      if (brandSelectionMode) {
        setAllBrandsData(cachedEntry!.allBrandsData)
        // Also restore preloaded brand data if available
        if (cachedEntry!.preloadedBrandData) {
          setPreloadedBrandData(cachedEntry!.preloadedBrandData)
        }
      } else {
        setMediaData(cachedEntry!.data)
      }
      setLoading(false)
      return
    }
    
    // No valid cache, fetch fresh data
    if (brandSelectionMode) {
      fetchAllBrandsData()
    } else if (selectedBrand) {
      fetchBrandSpecificData(selectedBrand)
    }
  }, [dateRange, brandSelectionMode, selectedBrand])

  // Fetch market overview when component mounts
  useEffect(() => {
    const fetchMarketOverview = async () => {
      try {
        setMarketOverviewLoading(true)
        const resp = await fetch('/api/brand-overview?type=market')
        const json = await resp.json()
        if (json.success && json.overview) {
          setMarketOverview({ tldr: json.overview.tldr || [], paragraph: json.overview.paragraph || '' })
        } else {
          setMarketOverview(null)
        }
      } catch (e) {
        logger.error('Failed to load market overview:', e)
        setMarketOverview(null)
      } finally {
        setMarketOverviewLoading(false)
      }
    }
    fetchMarketOverview()
  }, [])

  const fetchAllBrandsData = async () => {
    const cacheKey = getCacheKey(null, dateRange)
    
    try {
      setLoading(true)
      setError(null)
      
      logger.info(`Fetching fresh all brands data for cache key: ${cacheKey}`)
      
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: '1000'
      })

      const response = await fetch(`/api/media-spend?${params}`)
      const result = await response.json()

      if (result.success) {
        setAllBrandsData(result.data)
        
        // Get unique brands from the data to preload their individual data
        const brandCounts = new Map<string, { spend: number; campaigns: number }>()
        
        result.data.records.forEach((record: MediaSpendRecord) => {
          const brand = safeValue(record.brand_leaf) || 'Unknown'
          if (!brandCounts.has(brand.toString())) {
            brandCounts.set(brand.toString(), { spend: 0, campaigns: 0 })
          }
        })
        
        const uniqueBrands = Array.from(brandCounts.keys()).filter(brand => brand !== 'Unknown' && brand.trim() !== '')
        
        logger.info(`Preloading data for ${uniqueBrands.length} brands`)
        
        // Initialize progress tracking
        setPreloadProgress({ loaded: 0, total: uniqueBrands.length })
        
        // Preload data for each brand
        const preloadedData = new Map<string, MediaSpendData>()
        let loadedCount = 0
        
        // Fetch data for all brands in parallel
        const brandDataPromises = uniqueBrands.map(async (brandName) => {
          try {
            const brandParams = new URLSearchParams({
              brandName: brandName,
              startDate: dateRange.start,
              endDate: dateRange.end,
              limit: '1000'
            })

            const brandResponse = await fetch(`/api/media-spend?${brandParams}`)
            const brandResult = await brandResponse.json()

            if (brandResult.success) {
              preloadedData.set(brandName, brandResult.data)
              
              // Also cache this individual brand data
              const brandCacheKey = getCacheKey(brandName, dateRange)
              mediaDataCache.set(brandCacheKey, {
                data: brandResult.data,
                allBrandsData: null,
                timestamp: Date.now(),
                expiryTime: Date.now() + CACHE_EXPIRY_MS
              })
              
              // Update progress
              loadedCount++
              setPreloadProgress({ loaded: loadedCount, total: uniqueBrands.length })
              
              // Update preloaded data in real-time
              setPreloadedBrandData(new Map(preloadedData))
            }
          } catch (err) {
            logger.error(`Error preloading data for brand ${brandName}:`, err)
            // Still update progress even if there's an error
            loadedCount++
            setPreloadProgress({ loaded: loadedCount, total: uniqueBrands.length })
          }
        })
        
        // Wait for all brand data to be loaded
        await Promise.all(brandDataPromises)
        
        // Update the preloaded data state
        setPreloadedBrandData(preloadedData)
        
        // Cache the all brands data
        mediaDataCache.set(cacheKey, {
          data: null,
          allBrandsData: result.data,
          preloadedBrandData: preloadedData,
          timestamp: Date.now(),
          expiryTime: Date.now() + CACHE_EXPIRY_MS
        })
        
        logger.info(`All brands media spend data loaded and cached successfully for key: ${cacheKey}. Preloaded ${preloadedData.size} brand datasets.`)
      } else {
        setError(result.error || 'Failed to load media spend data')
      }
    } catch (err) {
      logger.error('Error fetching all brands media spend data:', err)
      setError('Failed to load media spend data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBrandSpecificData = async (brandName: string) => {
    const cacheKey = getCacheKey(brandName, dateRange)
    
    try {
      setLoading(true)
      setError(null)
      
      logger.info(`Fetching fresh brand-specific data for: ${brandName}, cache key: ${cacheKey}`)
      
      const params = new URLSearchParams({
        brandName: brandName,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: '1000'
      })

      const response = await fetch(`/api/media-spend?${params}`)
      const result = await response.json()

      if (result.success) {
        setMediaData(result.data)
        
        // Cache the data
        mediaDataCache.set(cacheKey, {
          data: result.data,
          allBrandsData: null,
          timestamp: Date.now(),
          expiryTime: Date.now() + CACHE_EXPIRY_MS
        })
        
        logger.info(`Brand-specific media spend data loaded and cached for: ${brandName}, key: ${cacheKey}`)
      } else {
        setError(result.error || 'Failed to load brand-specific data')
      }
    } catch (err) {
      logger.error('Error fetching brand-specific media spend data:', err)
      setError('Failed to load brand-specific data')
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />
    if (device.toLowerCase().includes('tablet')) return <Tablet className="w-4 h-4" />
    if (device.toLowerCase().includes('desktop')) return <Monitor className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  const openCreativeModal = (creative: MediaSpendRecord) => {
    setSelectedCreative(creative)
    setShowCreativeModal(true)
  }

  const closeCreativeModal = () => {
    setSelectedCreative(null)
    setShowCreativeModal(false)
  }

  // Helper function to safely extract value from object or return primitive
  const safeValue = (value: any): string | number => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object' && value.value !== undefined) {
      return value.value
    }
    return value
  }

  // Sort function for table data
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  // Sort data based on current sort column and direction
  const sortData = (data: MediaSpendRecord[]) => {
    return [...data].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortColumn) {
        case 'creative_text':
          aValue = safeValue(a.creative_text)?.toString().toLowerCase() || ''
          bValue = safeValue(b.creative_text)?.toString().toLowerCase() || ''
          break
        case 'publisher':
          aValue = safeValue(a.publisher)?.toString().toLowerCase() || ''
          bValue = safeValue(b.publisher)?.toString().toLowerCase() || ''
          break
        case 'device':
          aValue = safeValue(a.device)?.toString().toLowerCase() || ''
          bValue = safeValue(b.device)?.toString().toLowerCase() || ''
          break
        case 'spend_usd':
          aValue = Number(safeValue(a.spend_usd)) || 0
          bValue = Number(safeValue(b.spend_usd)) || 0
          break
        case 'impressions':
          aValue = Number(safeValue(a.impressions)) || 0
          bValue = Number(safeValue(b.impressions)) || 0
          break
        case 'cpm':
          aValue = Number(safeValue(a.impressions)) > 0 ? (Number(safeValue(a.spend_usd)) / Number(safeValue(a.impressions))) * 1000 : 0
          bValue = Number(safeValue(b.impressions)) > 0 ? (Number(safeValue(b.spend_usd)) / Number(safeValue(b.impressions))) * 1000 : 0
          break
        default:
          return 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      } else {
        const comparison = aValue - bValue
        return sortDirection === 'asc' ? comparison : -comparison
      }
    })
  }

  // Render sort icon for table headers
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l9 16 9-16H3z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20l-9-16-9 16h18z" />
      </svg>
    )
  }

  const selectBrand = (brandName: string) => {
    setSelectedBrand(brandName)
    setBrandSelectionMode(false)
    setViewMode('overview') // Reset to overview when selecting a brand
    
    // Clear monthly creative cache when switching brands
    setMonthlyCreativeCache(new Map())
    
    // Use preloaded data if available
    if (preloadedBrandData.has(brandName)) {
      const brandData = preloadedBrandData.get(brandName)!
      setMediaData(brandData)
      logger.info(`Using preloaded data for brand: ${brandName}`)
    } else {
      // Fallback to fetching if preloaded data is not available
      logger.warn(`Preloaded data not found for brand: ${brandName}, fetching fresh data`)
      fetchBrandSpecificData(brandName)
    }

    // Fetch brand overview asynchronously
    ;(async () => {
      try {
        setOverviewLoading(true)
        const resp = await fetch(`/api/brand-overview?brand=${encodeURIComponent(brandName)}`)
        const json = await resp.json()
        if (json.success && json.overview) {
          setBrandOverview({ tldr: json.overview.tldr || [], paragraph: json.overview.paragraph || '' })
        } else {
          setBrandOverview(null)
        }
      } catch (e) {
        logger.error('Failed to load brand overview:', e)
        setBrandOverview(null)
      } finally {
        setOverviewLoading(false)
      }
    })()
  }

  const goBackToBrandSelection = () => {
    setSelectedBrand(null)
    setBrandSelectionMode(true)
    // Don't clear mediaData - let cache handle it
  }

  // Function to manually refresh data and clear cache
  const refreshData = () => {
    const cacheKey = getCacheKey(selectedBrand, dateRange)
    
    // Clear the specific cache entry
    mediaDataCache.delete(cacheKey)
    
    // Clear preloaded data when refreshing
    if (brandSelectionMode) {
      setPreloadedBrandData(new Map())
    }
    
    logger.info(`Cache cleared for key: ${cacheKey}, fetching fresh data`)
    
    // Fetch fresh data
    if (brandSelectionMode) {
      fetchAllBrandsData()
    } else if (selectedBrand) {
      fetchBrandSpecificData(selectedBrand)
    }
  }

  // Function to clear all cache (for debugging or major updates)
  const clearAllCache = () => {
    mediaDataCache.clear()
    logger.info('All media spend cache cleared')
  }

  // Creative Modal Component
  const CreativeModal = () => {
    if (!showCreativeModal || !selectedCreative) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Creative Preview</h3>
              <p className="text-sm text-gray-600">{safeValue(selectedCreative.publisher)} • {safeValue(selectedCreative.device)}</p>
            </div>
            <button
              onClick={closeCreativeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Creative Image/Video */}
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                  {safeValue(selectedCreative.link_to_creative) ? (
                    (() => {
                      const creativeUrl = safeValue(selectedCreative.link_to_creative).toString()
                      const isVideo = safeValue(selectedCreative.type).toString().toLowerCase().includes('video') || 
                                     creativeUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
                                     Number(safeValue(selectedCreative.video_duration)) > 0
                      
                      return isVideo ? (
                        <video
                          src={creativeUrl}
                          controls
                          className="max-w-full max-h-[400px] rounded"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : (
                        <img
                          src={creativeUrl}
                          alt="Creative"
                          className="max-w-full max-h-[400px] object-contain rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEgxNDBWMTQwSDYwVjYwWiIgZmlsbD0iI0Q1RDlERCIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjU3Mzg4Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+'
                          }}
                        />
                      )
                    })()
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>No media available</p>
                    </div>
                  )}
                  {/* Fallback for video errors */}
                  <div className="text-center text-gray-500 hidden">
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p>Video not available</p>
                  </div>
                </div>
                
                {/* Creative Actions */}
                {safeValue(selectedCreative.link_to_creative) && (
                  <div className="flex space-x-2">
                    <a
                      href={safeValue(selectedCreative.link_to_creative).toString()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                    >
                      View Original
                    </a>
                    {safeValue(selectedCreative.landing_page) && (
                      <a
                        href={safeValue(selectedCreative.landing_page).toString()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-sm"
                      >
                        Landing Page
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Creative Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Creative Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advertiser:</span>
                      <span className="font-medium">{safeValue(selectedCreative.advertiser)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Publisher:</span>
                      <span className="font-medium">{safeValue(selectedCreative.publisher)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device:</span>
                      <span className="font-medium">{safeValue(selectedCreative.device)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{safeValue(selectedCreative.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{safeValue(selectedCreative.width)}x{safeValue(selectedCreative.height)}</span>
                    </div>
                    {Number(safeValue(selectedCreative.video_duration)) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{safeValue(selectedCreative.video_duration)}s</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Region:</span>
                      <span className="font-medium">{safeValue(selectedCreative.region)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spend:</span>
                      <span className="font-bold text-green-600">{formatCurrency(Number(safeValue(selectedCreative.spend_usd)))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <span className="font-medium">{formatNumber(Number(safeValue(selectedCreative.impressions)))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CPM:</span>
                      <span className="font-medium">
                        {Number(safeValue(selectedCreative.impressions)) > 0 
                          ? formatCurrency((Number(safeValue(selectedCreative.spend_usd)) / Number(safeValue(selectedCreative.impressions))) * 1000)
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Creative Text */}
                {safeValue(selectedCreative.creative_text) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Creative Text</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                      {safeValue(selectedCreative.creative_text)}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign Period</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">First Seen:</span>
                      <span className="font-medium">{safeValue(selectedCreative.first_seen)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Seen:</span>
                      <span className="font-medium">{safeValue(selectedCreative.last_seen)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Modal for creatives at a specific trend point
  const PointCreativesModal = () => {
    if (!showPointCreativesModal) return null
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Creatives for Selected Month</h3>
            <button onClick={() => setShowPointCreativesModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto">
            {pointCreativesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-sm text-gray-600">Loading creatives for this month...</p>
                </div>
              </div>
            ) : pointCreatives.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">No creatives found for this month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Thumbnail</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Creative</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Spend</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPM</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pointCreatives.slice(0, 50).map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {safeValue(record.link_to_creative) ? (
                              (() => {
                                const creativeUrl = safeValue(record.link_to_creative).toString()
                                const isVideo = safeValue(record.type).toString().toLowerCase().includes('video') ||
                                  creativeUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
                                  Number(safeValue(record.video_duration)) > 0
                                return isVideo ? (
                                  <video src={creativeUrl} className="w-full h-full object-cover rounded-lg" muted playsInline preload="metadata" />
                                ) : (
                                  <img src={creativeUrl} alt="Creative thumb" className="w-full h-full object-cover rounded-lg" />
                                )
                              })()
                            ) : (
                              <div className="text-center text-gray-400">
                                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="max-w-[250px]">
                            <p className="text-sm font-medium text-gray-900 truncate">{safeValue(record.creative_text) || 'No text available'}</p>
                            <p className="text-xs text-gray-500 truncate">{safeValue(record.type)} • {safeValue(record.width)}x{safeValue(record.height)}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{safeValue(record.publisher)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{safeValue(record.device)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{formatCurrency(Number(safeValue(record.spend_usd)))}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(Number(safeValue(record.impressions)))}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{Number(safeValue(record.impressions)) > 0 ? formatCurrency((Number(safeValue(record.spend_usd)) / Number(safeValue(record.impressions))) * 1000) : 'N/A'}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => { setSelectedCreative(record); setShowCreativeModal(true) }} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">View</button>
                            {safeValue(record.link_to_creative) && (
                              <a href={safeValue(record.link_to_creative).toString()} target="_blank" rel="noopener noreferrer" className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors">Original</a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Brand Selection Component
  const BrandSelectionView = () => {
    if (!allBrandsData || !allBrandsData.records || allBrandsData.records.length === 0) {
      return (
        <div className="card p-8">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Brand Data Available</h3>
            <p className="text-gray-600 mb-4">
              No media spend data found to analyze brands.
            </p>
          </div>
        </div>
      )
    }

    // Use backend brandTotals when available to ensure accuracy over full date range
    const computeSortedBrands = () => {
      if (allBrandsData.brandTotals && allBrandsData.brandTotals.length > 0) {
        return allBrandsData.brandTotals
          .filter(b => b.brand_leaf && b.brand_leaf.trim() !== '')
          .sort((a, b) => (b.total_spend || 0) - (a.total_spend || 0))
          .map(b => [b.brand_leaf, { 
            spend: Number(b.total_spend) || 0, 
            campaigns: Number(b.campaign_count) || 0,
            impressions: Number(b.total_impressions) || 0
          }]) as Array<[string, {spend: number; campaigns: number; impressions: number}]>
      }
      // Fallback to client aggregation from records
      const brandCounts = new Map<string, { spend: number; campaigns: number; impressions: number }>()
      allBrandsData.records.forEach(record => {
        const brand = safeValue(record.brand_leaf) || 'Unknown'
        if (!brandCounts.has(brand.toString())) {
          brandCounts.set(brand.toString(), { spend: 0, campaigns: 0, impressions: 0 })
        }
        const current = brandCounts.get(brand.toString())!
        current.spend += Number(safeValue(record.spend_usd)) || 0
        current.campaigns += 1
        current.impressions += Number(safeValue(record.impressions)) || 0
      })
      return Array.from(brandCounts.entries())
        .sort((a, b) => b[1].spend - a[1].spend)
        .filter(([brand]) => brand !== 'Unknown' && brand.trim() !== '')
    }

    const sortedBrands = computeSortedBrands()
    
    // Function to get brand logo URL
    const getBrandLogoUrl = (brandName: string) => {
      const cleanName = brandName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .replace(/llc|inc|corp|corporation|company|co$/g, '')
        .trim()
      
      const possibleDomains = [
        `${cleanName}.com`,
        `${cleanName}.net`,
        `${cleanName}.org`
      ]
      
      return `https://logo.clearbit.com/${possibleDomains[0]}`
    }


    return (
      <div className="space-y-6">
        {/* Market Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Market Overview</h3>
              <p className="text-sm text-gray-600">
                Comprehensive view of the competitive media landscape
              </p>
            </div>
            
            {/* Right-side controls: Date Range + Refresh */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {(() => {
                  const start = new Date(dateRange.start)
                  const end = new Date(dateRange.end)
                  const startLabel = isNaN(start.getTime()) ? dateRange.start : start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  const endLabel = isNaN(end.getTime()) ? dateRange.end : end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  return `${startLabel} — ${endLabel}`
                })()}
              </div>
              <button 
                onClick={refreshData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh brand data"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {(() => {
            // Pre-compute additional overview metrics
            const totalCampaigns = allBrandsData.summary.total_records || 0
            const totalCreatives = (() => {
              const ids = new Set<string | number>()
              allBrandsData.records.forEach(r => {
                const id = safeValue(r.creative_id)
                if (id !== '' && id !== null && id !== undefined) ids.add(id as any)
              })
              return ids.size
            })()
            const avgCpm = (allBrandsData.summary.total_impressions > 0)
              ? (allBrandsData.summary.total_spend / allBrandsData.summary.total_impressions) * 1000
              : 0

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <div className="text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">
                      {sortedBrands.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Active Brands</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(allBrandsData.summary.total_spend || 0)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Market Spend</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">
                      {formatNumber(allBrandsData.summary.total_impressions || 0)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Impressions</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-orange-600">
                      {allBrandsData.summary.unique_publishers || 0}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Publishers</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-indigo-600">
                      {formatNumber(totalCampaigns)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Campaigns</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-rose-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-rose-600">
                      {formatNumber(totalCreatives)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total Creatives</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-xl font-bold text-teal-600">
                      {formatCurrency(avgCpm)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Average CPM</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Brand Selection Grid */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Choose Brand to Analyze</h3>
              <p className="text-sm text-gray-600">
                {sortedBrands.length} competing brands available for analysis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedBrands.map(([brand, stats], index) => {
              const isTopPerformer = index < 3
              
              return (
                <button
                  key={index}
                  onClick={() => selectBrand(brand)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-105 text-left ${
                    isTopPerformer 
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {isTopPerformer && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        #{index + 1}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getBrandLogoUrl(brand)}
                          alt={`${brand} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <div 
                          className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded text-white text-xs font-bold items-center justify-center hidden"
                        >
                          {brand.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Brand Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate text-sm mb-2">{brand}</h4>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600">
                          <span className="font-bold text-gray-900">{formatCurrency(stats.spend)}</span> spend
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">{formatRoundedK(stats.campaigns)}</span> campaigns
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Brand Performance Chart */}
          <div className="mt-8">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Brand Performance Comparison</h4>
              <p className="text-sm text-gray-600">Spend and impressions comparison across competing brands</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <Chart
              options={{
                   chart: {
                     type: 'bar',
                     height: 500,
                     stacked: false,
                     toolbar: {
                       show: false
                     },
                     zoom: {
                       enabled: false
                     },
                     // Disable all auto-formatting
                     locales: [{
                       name: 'en',
                       options: {
                         toolbar: {
                           exportToSVG: "Download SVG",
                           exportToPNG: "Download PNG", 
                           exportToCSV: "Download CSV",
                           selection: "Selection",
                           selectionZoom: "Selection Zoom",
                           zoomIn: "Zoom In",
                           zoomOut: "Zoom Out",
                           pan: "Panning",
                           reset: "Reset Zoom"
                         }
                       }
                     }],
                     defaultLocale: 'en'
                   },
                   plotOptions: {
                     bar: {
                       horizontal: false,
                       dataLabels: {
                         position: 'top'
                       },
                       columnWidth: '60%'
                     }
                   },
                   dataLabels: {
                     enabled: true,
                     offsetY: -20,
                     style: {
                       fontSize: '10px',
                       colors: ['#304758']
                     },
                     formatter: function(val: number, opts: any) {
                        // Series 1 is impressions; show compact units (K/M/B)
                        if (opts && opts.seriesIndex === 1) {
                          return `${formatNumber(val)}`
                        }
                        return formatNumber(val)
                     }
                   },
                    xaxis: {
                      categories: sortedBrands.slice(0, 15).map(([brand]) => brand),
                      labels: {
                        style: {
                          fontSize: '10px',
                          colors: '#6b7280'
                        },
                        rotate: -45,
                        maxHeight: 120,
                        trim: true,
                        formatter: function(value: string) {
                          // Show brand names, truncate if too long
                          return value.length > 12 ? value.substring(0, 12) + '...' : value
                        }
                      },
                     axisBorder: {
                       show: false
                     },
                     axisTicks: {
                       show: false
                     }
                   },
                   yaxis: [
                     {
                       title: {
                         text: 'Media Spend',
                         style: {
                           color: '#3b82f6',
                           fontSize: '11px'
                         }
                       },
                       labels: {
                         style: {
                           fontSize: '10px',
                           colors: '#6b7280'
                         },
                         formatter: function(val: number) {
                           return formatCurrency(val);
                         }
                       }
                     },
                     {
                       opposite: true,
                       title: {
                         text: 'Impressions',
                         style: {
                           color: '#10b981',
                           fontSize: '11px'
                         }
                       },
                       labels: {
                         style: {
                           fontSize: '10px',
                           colors: '#6b7280'
                         },
                         formatter: function(val: number) {
                           return formatNumber(val)
                         }
                       },
                       decimalsInFloat: 0,
                       forceNiceScale: false,
                       floating: false
                     }
                   ],
                    tooltip: {
                      shared: true,
                      intersect: false,
                      custom: function({ series, dataPointIndex, w }: any) {
                        const rawLabel = w?.config?.xaxis?.categories?.[dataPointIndex] || ''
                        const brandName = typeof rawLabel === 'string' ? rawLabel.replace('\n', ' ') : ''
                        
                        // Get the brand from sortedBrands to match the chart data
                        const brandData = sortedBrands[dataPointIndex]
                        if (!brandData) {
                          return `<div class="px-3 py-2 text-sm">
                            <div class="font-semibold text-gray-900 mb-1">${brandName}</div>
                            <div class="text-gray-700">No data available</div>
                          </div>`
                        }
                        
                        const [brand, stats] = brandData
                        const spend = stats.spend
                        const totalImpressions = stats.impressions
                        
                        // Use the same CPM calculation as in the brand overview: (spend / impressions) * 1000
                        const cpm = totalImpressions > 0 ? (spend / totalImpressions) * 1000 : 0
                        
                        // Debug: Check if values make sense
                        console.log('Debug CPM calculation:', { 
                          brand, 
                          spend: formatCurrency(spend), 
                          impressions: formatNumber(totalImpressions), 
                          cpm: formatCurrency(cpm),
                          rawCpm: cpm 
                        })
                        
                        return `<div class="px-3 py-2 text-sm">
                          <div class="font-semibold text-gray-900 mb-1">${brandName}</div>
                          <div class="text-gray-700">Spend: <span class="font-medium">${formatCurrency(spend)}</span></div>
                          <div class="text-gray-700">Impressions: <span class="font-medium">${formatNumber(totalImpressions)}</span></div>
                          <div class="text-gray-700">CPM: <span class="font-medium">${formatCurrency(cpm)}</span></div>
                        </div>`
                      }
                    },
                   legend: {
                     position: 'top',
                     horizontalAlign: 'center',
                     offsetY: -10,
                     fontSize: '12px'
                   },
                   fill: {
                     opacity: 0.9
                   },
                   colors: ['#3b82f6', '#10b981'],
                   grid: {
                     borderColor: '#f1f5f9',
                     strokeDashArray: 3
                   }
                 }}
                  series={[
                   {
                     name: 'Media Spend',
                     data: sortedBrands.slice(0, 15).map(([_, stats]) => stats.spend)
                   },
                   {
                     name: 'Impressions',
                     data: sortedBrands.slice(0, 15).map(([_, stats]) => stats.impressions)
                   }
                 ]}
                 type="bar"
                 height={500}
               />
              
               {/* Logos removed per request; using textual axis labels above */}
            </div>
          </div>
        </div>

        {/* Multi-Brand Spend Trends Chart */}
         <div className="card p-6">
           <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Brand Spend Trends Over Time</h3>
            <p className="text-sm text-gray-600">Competitive spending patterns across all brands in the market</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 md:flex md:items-start md:gap-6">
            <div className="flex-1">
              <Chart
              options={{
                chart: {
                  type: 'line',
                  height: 500,
                  toolbar: {
                    show: false
                  },
                  zoom: {
                    enabled: false
                  }
                },
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  curve: 'smooth',
                  width: 3
                },
                xaxis: {
                  type: 'category',
                  categories: (() => {
                    // Prefer backend aggregated months if available
                    if (allBrandsData.brandMonthlySpend && allBrandsData.brandMonthlySpend.length > 0) {
                      const months = Array.from(new Set(allBrandsData.brandMonthlySpend.map(r => r.month))).sort()
                      return months
                    }
                    // Fallback to deriving from raw records
                    const months = new Set<string>()
                    allBrandsData.records.forEach(record => {
                      const dateValue = safeValue(record.date)
                      if (dateValue) {
                        const date = new Date(dateValue.toString())
                        if (!isNaN(date.getTime())) {
                          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                          months.add(monthKey)
                        }
                      }
                    })
                    const sortedMonths = Array.from(months).sort()
                    return sortedMonths.length > 0 ? sortedMonths : ['2023-01']
                  })(),
                  labels: {
                    style: {
                      fontSize: '12px',
                      colors: '#6b7280'
                    },
                    rotate: -45,
                    formatter: function(value: string) {
                      if (!value || typeof value !== 'string') {
                        return value || ''
                      }
                      const [year, month] = value.split('-')
                      if (!year || !month) {
                        return value
                      }
                      const date = new Date(parseInt(year), parseInt(month) - 1)
                      if (isNaN(date.getTime())) {
                        return value
                      }
                      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: false
                  }
                },
                yaxis: {
                  title: {
                    text: 'Media Spend',
                    style: {
                      color: '#6b7280',
                      fontSize: '12px'
                    }
                  },
                  labels: {
                    style: {
                      fontSize: '11px',
                      colors: '#6b7280'
                    },
                    formatter: function(val: number) {
                      return formatCurrency(val);
                    }
                  }
                },
                tooltip: {
                  shared: true,
                  intersect: false,
                  x: {
                    formatter: function(val: number, opts?: any) {
                      // val is the index, get the actual category value
                      const monthKey = opts?.w?.config?.xaxis?.categories?.[val] || ''
                      if (!monthKey || typeof monthKey !== 'string') {
                        return monthKey || ''
                      }
                      const [year, month] = monthKey.split('-')
                      if (year && month) {
                        const date = new Date(parseInt(year), parseInt(month) - 1)
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        }
                      }
                      return monthKey
                    }
                  },
                  y: {
                    formatter: function(val: number) {
                      return formatCurrency(val);
                    }
                  }
                },
                legend: {
                  show: false
                },
                colors: [
                  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
                  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
                  '#84cc16', '#eab308', '#a855f7', '#059669', '#dc2626',
                  '#0891b2', '#be185d', '#0d9488', '#ea580c', '#4f46e5'
                ],
                grid: {
                  borderColor: '#f1f5f9',
                  strokeDashArray: 3
                }
              }}
              series={(() => {
                // Build series using backend aggregation if available
                const buildFromBackend = () => {
                  const dataset = allBrandsData.brandMonthlySpend || []
                  if (dataset.length === 0) return null
                  // Collect months
                  const months = Array.from(new Set(dataset.map(r => r.month))).sort()
                  // Aggregate by brand
                  const brandToMonthSpend = new Map<string, Map<string, number>>()
                  for (const r of dataset) {
                    const brand = (r.brand_leaf || '').toString()
                    if (!brand || brand === 'Unknown') continue
                    if (!brandToMonthSpend.has(brand)) brandToMonthSpend.set(brand, new Map())
                    brandToMonthSpend.get(brand)!.set(r.month, (brandToMonthSpend.get(brand)!.get(r.month) || 0) + (Number(r.total_spend) || 0))
                  }
                  const brandTotals = Array.from(brandToMonthSpend.entries())
                    .map(([brand, monthMap]) => ({ brand, totalSpend: Array.from(monthMap.values()).reduce((s, v) => s + v, 0) }))
                    .sort((a, b) => b.totalSpend - a.totalSpend)
                    .slice(0, 10)
                  let seriesToShow = brandTotals.map(({ brand }) => ({
                    name: brand.length > 15 ? brand.substring(0, 15) + '...' : brand,
                    fullName: brand,
                    data: months.map(m => ({ x: m, y: brandToMonthSpend.get(brand)?.get(m) || 0 }))
                  }))
                  
                  // Filter by selected brands if any are selected
                  if (selectedTrendBrands.size > 0) {
                    seriesToShow = seriesToShow.filter(series => selectedTrendBrands.has(series.fullName))
                  }
                  
                  return seriesToShow
                }

                const backendSeries = buildFromBackend()
                if (backendSeries) return backendSeries

                // Fallback to client aggregation
                const brandTimeData = new Map<string, Map<string, number>>()
                const allMonths = new Set<string>()
                allBrandsData.records.forEach(record => {
                  const brand = safeValue(record.brand_leaf).toString()
                  const dateValue = safeValue(record.date)
                  if (dateValue && brand && brand !== 'Unknown' && brand.trim() !== '') {
                    const date = new Date(dateValue.toString())
                    if (!isNaN(date.getTime())) {
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                      allMonths.add(monthKey)
                      if (!brandTimeData.has(brand)) brandTimeData.set(brand, new Map())
                      const brandData = brandTimeData.get(brand)!
                      brandData.set(monthKey, (brandData.get(monthKey) || 0) + (Number(safeValue(record.spend_usd)) || 0))
                    }
                  }
                })
                const sortedMonths = Array.from(allMonths).sort()
                const brandTotals = Array.from(brandTimeData.entries())
                  .map(([brand, timeData]) => ({ brand, totalSpend: Array.from(timeData.values()).reduce((sum, s) => sum + s, 0) }))
                  .sort((a, b) => b.totalSpend - a.totalSpend)
                  .slice(0, 10)
                let seriesToShow = brandTotals.map(({ brand }) => ({
                  name: brand.length > 15 ? brand.substring(0, 15) + '...' : brand,
                  fullName: brand,
                  data: sortedMonths.map(month => ({ x: month, y: brandTimeData.get(brand)?.get(month) || 0 }))
                }))
                
                // Filter by selected brands if any are selected
                if (selectedTrendBrands.size > 0) {
                  seriesToShow = seriesToShow.filter(series => selectedTrendBrands.has(series.fullName))
                }
                
                return seriesToShow
              })()}
              type="line"
              height={500}
            />
            </div>
            {/* Custom legend with logos and full names */}
            <div className="mt-6 md:mt-0 md:w-64">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Top Brands</h4>
                {selectedTrendBrands.size > 0 && (
                  <button
                    onClick={() => setSelectedTrendBrands(new Set())}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2">
                {(() => {
                  // Compute top brands similar to series logic
                  const dataset = allBrandsData.brandMonthlySpend || []
                  const brandTotalsMap = new Map<string, number>()
                  if (dataset.length > 0) {
                    dataset.forEach(r => {
                      const brand = (r.brand_leaf || '').toString()
                      if (!brand || brand === 'Unknown') return
                      brandTotalsMap.set(brand, (brandTotalsMap.get(brand) || 0) + (Number(r.total_spend) || 0))
                    })
                  } else {
                    allBrandsData.records.forEach(rec => {
                      const brand = safeValue(rec.brand_leaf).toString()
                      if (!brand || brand === 'Unknown') return
                      brandTotalsMap.set(brand, (brandTotalsMap.get(brand) || 0) + (Number(safeValue(rec.spend_usd)) || 0))
                    })
                  }
                  const topBrands = Array.from(brandTotalsMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([brand]) => brand)
                  return topBrands.map((brand, idx) => {
                    const cleanName = brand.toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '')
                      .replace(/llc|inc|corp|corporation|company|co$/g, '')
                      .trim()
                    const logoUrl = `https://logo.clearbit.com/${cleanName}.com`
                    const color = [
                      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', 
                      '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
                      '#84cc16'
                    ][idx % 11]
                    const isSelected = selectedTrendBrands.has(brand)
                    const isFiltered = selectedTrendBrands.size > 0 && !isSelected
                    
                    const toggleBrandFilter = () => {
                      const newSelected = new Set(selectedTrendBrands)
                      if (isSelected) {
                        newSelected.delete(brand)
                      } else {
                        newSelected.add(brand)
                      }
                      setSelectedTrendBrands(newSelected)
                    }
                    
                    return (
                        <button
                          key={brand}
                          onClick={toggleBrandFilter}
                          className={`flex items-center space-x-3 w-full text-left p-2 rounded-md transition-all duration-200 hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50 border border-blue-200' : isFiltered ? 'opacity-40' : ''
                          }`}
                        >
                          <span 
                            className="inline-block w-2 h-2 rounded-full" 
                            style={{ backgroundColor: isFiltered ? '#d1d5db' : color }}
                          ></span>
                          <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={logoUrl} 
                              alt={`${brand} logo`} 
                              className={`w-5 h-5 object-contain ${isFiltered ? 'grayscale' : ''}`}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          </div>
                          <span className={`text-sm leading-5 ${isFiltered ? 'text-gray-400' : 'text-gray-800'}`}>
                            {brand}
                          </span>
                        </button>
                      )
                    })
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Creatives Hero Section */}
        <div className="card p-6 mt-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Top Performing Creatives</h3>
            <p className="text-sm text-gray-600">Best performing creative assets across all brands in the market</p>
          </div>
          
          <div className="grid gap-6">
            {(() => {
              // Calculate top creatives based on duration (days running)
              const creativePerformance = new Map<string, {
                creative_id: string
                total_spend: number
                total_impressions: number
                duration_days: number
                creative_text: string
                link_to_creative: string
                brand: string
                publisher: string
                device: string
                type: string
                width: number
                height: number
                video_duration: number
                cpm: number
                first_seen: string
                last_seen: string
              }>()

              allBrandsData.records.forEach(record => {
                const creativeId = safeValue(record.creative_id)?.toString()
                if (!creativeId || creativeId === '0') return

                const spend = Number(safeValue(record.spend_usd)) || 0
                const impressions = Number(safeValue(record.impressions)) || 0
                // Calculate duration in days
                const firstSeen = safeValue(record.first_seen)?.toString() || ''
                const lastSeen = safeValue(record.last_seen)?.toString() || ''
                const durationDays = firstSeen && lastSeen ? 
                  Math.max(1, Math.round((new Date(lastSeen).getTime() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24))) : 0

                if (!creativePerformance.has(creativeId)) {
                  creativePerformance.set(creativeId, {
                    creative_id: creativeId,
                    total_spend: 0,
                    total_impressions: 0,
                    duration_days: 0,
                    creative_text: safeValue(record.creative_text)?.toString() || '',
                    link_to_creative: safeValue(record.link_to_creative)?.toString() || '',
                    brand: safeValue(record.brand_leaf)?.toString() || 'Unknown',
                    publisher: safeValue(record.publisher)?.toString() || 'Unknown',
                    device: safeValue(record.device)?.toString() || 'Unknown',
                    type: safeValue(record.type)?.toString() || 'Unknown',
                    width: Number(safeValue(record.width)) || 0,
                    height: Number(safeValue(record.height)) || 0,
                    video_duration: Number(safeValue(record.video_duration)) || 0,
                    cpm: 0,
                    first_seen: safeValue(record.first_seen)?.toString() || '',
                    last_seen: safeValue(record.last_seen)?.toString() || ''
                  })
                }

                const current = creativePerformance.get(creativeId)!
                current.total_spend += spend
                current.total_impressions += impressions
                // Set duration for this creative (same across all records for same creative_id)
                if (durationDays > current.duration_days) {
                  current.duration_days = durationDays
                }
                current.cpm = current.total_impressions > 0 ? (current.total_spend / current.total_impressions) * 1000 : 0
              })

              const allCreatives = Array.from(creativePerformance.values())
              console.log('Total unique creatives found:', allCreatives.length)
              
              const creativesWithLinks = allCreatives.filter(creative => creative.link_to_creative && creative.link_to_creative !== '')
              console.log('Creatives with valid links:', creativesWithLinks.length)
              
              // If we have fewer than 5 creatives with links, also include ones with good performance but no link
              let topCreatives = creativesWithLinks
                .sort((a, b) => b.total_impressions - a.total_impressions)
                .slice(0, 5)
              
              if (topCreatives.length < 5) {
                console.log('Not enough creatives with links, including creatives without links')
                const creativesWithoutLinks = allCreatives
                  .filter(creative => !creative.link_to_creative || creative.link_to_creative === '')
                  .filter(creative => creative.total_spend > 0 || creative.total_impressions > 0)
                  .sort((a, b) => b.total_impressions - a.total_impressions)
                  .slice(0, 5 - topCreatives.length)
                
                topCreatives = [...topCreatives, ...creativesWithoutLinks]
              }
              
              console.log('Top 5 creatives selected:', topCreatives.length)

              return topCreatives.map((creative, index) => {
                const isVideo = creative.type?.toLowerCase() === 'video' || creative.video_duration > 0
                const getBrandLogoUrl = (brandName: string) => {
                  const cleanName = brandName.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '')
                    .replace(/llc|inc|corp|corporation|company|co$/g, '')
                    .trim()
                  return `https://logo.clearbit.com/${cleanName}.com`
                }

                return (
                  <div key={creative.creative_id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Creative Display */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Top Performer</h4>
                              <p className="text-sm text-gray-600">{creative.type} • {creative.device}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                              <img 
                                src={getBrandLogoUrl(creative.brand)} 
                                alt={`${creative.brand} logo`} 
                                className="w-5 h-5 object-contain" 
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} 
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">{creative.brand}</span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden aspect-video max-w-md mx-auto">
                          {!creative.link_to_creative || creative.link_to_creative === '' ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                                </svg>
                                <p className="text-sm text-gray-500">Creative not available</p>
                                <p className="text-xs text-gray-400 mt-1">Performance data only</p>
                              </div>
                            </div>
                          ) : isVideo ? (
                            <video
                              src={creative.link_to_creative}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                              muted
                              playsInline
                              onError={(e) => {
                                (e.target as HTMLVideoElement).style.display = 'none'
                                const fallback = e.target as HTMLVideoElement
                                fallback.insertAdjacentHTML('afterend', 
                                  `<div class="w-full h-full flex items-center justify-center bg-gray-100">
                                    <div class="text-center">
                                      <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                                      </svg>
                                      <p class="text-sm text-gray-500">Video unavailable</p>
                                    </div>
                                  </div>`
                                )
                              }}
                            />
                          ) : (
                            <img
                              src={creative.link_to_creative}
                              alt="Creative"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                                const fallback = e.target as HTMLImageElement
                                fallback.insertAdjacentHTML('afterend', 
                                  `<div class="w-full h-full flex items-center justify-center bg-gray-100">
                                    <div class="text-center">
                                      <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                                      </svg>
                                      <p class="text-sm text-gray-500">Image unavailable</p>
                                    </div>
                                  </div>`
                                )
                              }}
                            />
                          )}
                        </div>

                        {creative.creative_text && (
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700 line-clamp-3">{creative.creative_text}</p>
                          </div>
                        )}
                      </div>

                      {/* Metrics and Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Total Spend</span>
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(creative.total_spend)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Impressions</span>
                              <Eye className="w-4 h-4 text-blue-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(creative.total_impressions)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">CPM</span>
                              <BarChart3 className="w-4 h-4 text-purple-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(creative.cpm)}</p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Duration</span>
                              <Calendar className="w-4 h-4 text-orange-500" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{creative.duration_days} days</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                          <h5 className="font-semibold text-gray-900">Creative Details</h5>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Publisher:</span>
                              <p className="font-medium text-gray-900">{creative.publisher}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Dimensions:</span>
                              <p className="font-medium text-gray-900">{creative.width}x{creative.height}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium text-gray-900">
                                {creative.video_duration > 0 ? `${creative.video_duration}s` : 'Static'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-600">Active Period:</span>
                              <p className="font-medium text-gray-900">
                                {creative.first_seen ? new Date(creative.first_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} - 
                                {creative.last_seen ? new Date(creative.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {creative.link_to_creative && creative.link_to_creative !== '' ? (
                          <button
                            onClick={() => {
                              window.open(creative.link_to_creative, '_blank')
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Full Creative</span>
                          </button>
                        ) : (
                          <div className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                            <Eye className="w-4 h-4" />
                            <span>Creative Link Unavailable</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loading Media Activity</h3>
            <p className="text-gray-600">
              {brandSelectionMode 
                ? preloadProgress.total > 0 
                  ? `Loading brand universe and preloading data... (${preloadProgress.loaded}/${preloadProgress.total} brands ready)`
                  : "Loading brand universe and preloading all brand data for instant access..."
                : `Analyzing media spend data for ${selectedBrand}...`
              }
            </p>
            {brandSelectionMode && preloadProgress.total > 0 && (
              <div className="mt-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(preloadProgress.loaded / preloadProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {preloadProgress.loaded === preloadProgress.total ? 'All brands ready for instant access!' : 'Preparing brands for instant access...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Media Activity</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            {brandSelectionMode 
              ? "Failed to load brand universe data for competitive analysis."
              : `Failed to load media spend data for ${selectedBrand}.`
            }
          </p>
          <button 
            onClick={refreshData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show brand selection view
  if (brandSelectionMode) {
    return (
      <div className="space-y-6">
        {/* Market AI Overview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Market Overview</h3>
                  <p className="text-purple-100 text-xs">Cross-competitor insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {marketOverviewLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span className="text-white text-xs font-medium">Analyzing...</span>
                  </div>
                )}
                <button
                  onClick={() => setMarketAiOverviewCollapsed(!marketAiOverviewCollapsed)}
                  className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                  title={marketAiOverviewCollapsed ? "Expand AI Market Overview" : "Collapse AI Market Overview"}
                >
                  <svg 
                    className={`w-4 h-4 text-white transform transition-transform duration-200 ${marketAiOverviewCollapsed ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {!marketAiOverviewCollapsed && (
            <div className="p-4">
              {marketOverview && marketOverview.tldr && marketOverview.tldr.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary */}
                  {marketOverview.paragraph && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-gray-900">Market Summary</h4>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800 leading-6 whitespace-pre-line">{marketOverview.paragraph}</p>
                      </div>
                    </div>
                  )}

                  {/* Strategic Insights */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <h4 className="text-sm font-semibold text-gray-900">Key Market Trends</h4>
                    </div>
                    <div className="space-y-2">
                      {marketOverview.tldr.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="group flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200">
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{idx + 1}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No Market Data Available</h3>
                  <p className="text-xs text-gray-500">Market intelligence is currently being processed.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <BrandSelectionView />
      </div>
    )
  }

  // Show brand analysis view
  if (!mediaData || !mediaData.records || mediaData.records.length === 0) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data for {selectedBrand}</h3>
          <p className="text-gray-600 mb-4">
            No media spend data found for this brand in the selected date range.
          </p>
          <p className="text-sm text-gray-500">
            Try adjusting the date range or check if the brand has media activity.
          </p>
          <button 
            onClick={goBackToBrandSelection}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Brand Selection
          </button>
        </div>
      </div>
    )
  }

  const filteredData = selectedDevice === 'all' 
    ? mediaData.records 
    : mediaData.records.filter(record => record.device === selectedDevice)

  // Apply additional filters for creative tab
  const creativeFilteredData = mediaData.records.filter(record => {
    const deviceMatch = selectedDeviceFilter === 'all' || safeValue(record.device) === selectedDeviceFilter
    const publisherMatch = selectedPublisher === 'all' || safeValue(record.publisher) === selectedPublisher
    return deviceMatch && publisherMatch
  })

  // Apply sorting to filtered data
  const sortedFilteredData = sortData(viewMode === 'creative' ? creativeFilteredData : filteredData)

  const cpmData = mediaData.records.map(record => ({
    ...record,
    cpm: record.impressions > 0 ? (record.spend_usd / record.impressions) * 1000 : 0
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBackToBrandSelection}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to Brand Selection"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedBrand} Analysis</h2>
                <p className="text-gray-600">Competitive media spend insights and performance metrics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setViewMode('publishers')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'publishers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Publishers
            </button>
            <button 
              onClick={() => setViewMode('creative')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'creative' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Creative
            </button>
            <button 
              onClick={() => setViewMode('trends')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'trends' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Trends
            </button>
            <div className="border-l border-gray-300 h-8"></div>
            <button 
              onClick={refreshData}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh data"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatCurrency(mediaData.summary.total_spend || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Media Spend</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Eye className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatNumber(mediaData.summary.total_impressions || 0)}
            </p>
            <p className="text-sm text-gray-600">Total Impressions</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <Globe className="w-8 h-8 text-purple-600" />
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {mediaData.summary.unique_publishers || 0}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {formatNumber(mediaData.summary.total_records || 0)}
            </p>
            <p className="text-sm text-gray-600">Active Campaigns</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {mediaData.summary.total_impressions && mediaData.summary.total_spend
                ? formatCurrency((mediaData.summary.total_spend / mediaData.summary.total_impressions) * 1000)
                : '$0'
              }
            </p>
            <p className="text-sm text-gray-600">Average CPM</p>
          </div>
        </div>


      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <>
          {/* AI Overview */}
          <div className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">AI Overview</h3>
                      <p className="text-indigo-100 text-xs">Strategic insights</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {overviewLoading && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        <span className="text-white text-xs font-medium">Analyzing...</span>
                      </div>
                    )}
                    <button
                      onClick={() => setAiOverviewCollapsed(!aiOverviewCollapsed)}
                      className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors"
                      title={aiOverviewCollapsed ? "Expand AI Overview" : "Collapse AI Overview"}
                    >
                      <svg 
                        className={`w-4 h-4 text-white transform transition-transform duration-200 ${aiOverviewCollapsed ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              {!aiOverviewCollapsed && (
                <div className="p-4">
                {brandOverview && brandOverview.tldr && brandOverview.tldr.length > 0 ? (
                  <div className="space-y-4">
                    {/* Summary */}
                    {brandOverview.paragraph && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                          <h4 className="text-sm font-semibold text-gray-900">Summary</h4>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-800 leading-6 whitespace-pre-line">{brandOverview.paragraph}</p>
                        </div>
                      </div>
                    )}

                    {/* Strategic Insights */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-gray-900">Key Insights</h4>
                      </div>
                      <div className="space-y-2">
                        {brandOverview.tldr.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="group flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{idx + 1}</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No AI Data Available</h3>
                    <p className="text-xs text-gray-500">Analysis for this brand is not yet available.</p>
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
          {/* Purchase Channel Breakdown */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend by Purchase Channel Type</h3>
              <Chart
                options={{
                  chart: {
                    type: 'pie',
                    height: 350,
                    toolbar: {
                      show: false
                    }
                  },
                  labels: mediaData.purchaseChannelSpend.map(channel => channel.purchase_channel_type),
                  colors: mediaData.purchaseChannelSpend.map((channel, index) => CHART_COLORS[channel.purchase_channel_type as keyof typeof CHART_COLORS] || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][index % 10]),
                  dataLabels: {
                    enabled: true,
                    formatter: function(val: number, opts: any) {
                      return formatNumber(opts.w.config.series[opts.seriesIndex]) + ' (' + val.toFixed(1) + '%)';
                    },
                    style: {
                      fontSize: '10px',
                      colors: ['#ffffff']
                    },
                    dropShadow: {
                      enabled: true
                    }
                  },
                  tooltip: {
                    y: {
                      formatter: function(val: number) {
                        return formatCurrency(val);
                      }
                    }
                  },
                  legend: {
                    position: 'bottom',
                    fontSize: '11px',
                    offsetY: 10,
                    markers: {
                      size: 12
                    }
                  },
                  responsive: [{
                    breakpoint: 480,
                    options: {
                      chart: {
                        height: 300
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }]
                }}
                series={mediaData.purchaseChannelSpend.map(channel => channel.total_spend)}
                type="pie"
                height={350}
              />
              <div className="mt-4 space-y-2">
                {mediaData.purchaseChannelSpend.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[channel.purchase_channel_type as keyof typeof CHART_COLORS] || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][index % 10] }}
                      />
                      <span>{channel.purchase_channel_type}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(channel.total_spend)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Publishers */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Publishers by Spend</h3>
              <div className="space-y-3">
                {mediaData.topPublishers.slice(0, 8).map((publisher, index) => {
                  // Function to get publisher logo URL
                  const getPublisherLogoUrl = (publisherName: string) => {
                    const cleanName = publisherName.toLowerCase()
                      .replace(/[^a-z0-9\s]/g, '')
                      .replace(/\s+/g, '')
                      .replace(/\(.*\)/g, '') // Remove content in parentheses
                      .replace(/llc|inc|corp|corporation|company|co$|media|network|interactive$/g, '')
                      .trim()
                    
                    return `https://logo.clearbit.com/${cleanName}.com`
                  }

                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 flex items-center space-x-3">
                        {/* Publisher Logo */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={getPublisherLogoUrl(publisher.Publisher)}
                              alt={`${publisher.Publisher} logo`}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            <div 
                              className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded text-white text-xs font-bold items-center justify-center hidden"
                              style={{ fontSize: '8px' }}
                            >
                              {publisher.Publisher.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Publisher Info */}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">{publisher.Publisher}</p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(publisher.total_impressions)} impressions • {publisher.campaign_count} campaigns
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(publisher.total_spend)}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency((publisher.total_spend / publisher.total_impressions) * 1000)} CPM
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Trends Mode */}
      {viewMode === 'trends' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spend Trends Over Time</h3>
          <Chart
            options={{
              chart: {
                type: 'area',
                height: 450,
                toolbar: {
                  show: false
                },
                zoom: {
                  enabled: false
                },
                events: {
                  dataPointSelection: (event: any, chartContext: any, config: any) => {
                    try {
                      const monthKey = config?.w?.config?.series?.[config.seriesIndex]?.data?.[config.dataPointIndex]?.x
                      if (!monthKey) return
                      openCreativesForMonth(monthKey)
                    } catch (e) {
                      logger.error('Error handling point selection:', e)
                    }
                  }
                }
              },
              dataLabels: {
                enabled: false
              },
              stroke: {
                curve: 'smooth',
                width: 3
              },
              markers: {
                size: 4,
                hover: { sizeOffset: 2 }
              },
              fill: {
                type: 'gradient',
                gradient: {
                  shadeIntensity: 1,
                  opacityFrom: 0.7,
                  opacityTo: 0.9,
                  stops: [0, 90, 100]
                }
              },
              xaxis: {
                type: 'category',
                categories: mediaData.timeSeries.map(ts => ts.month),
                labels: {
                  style: {
                    fontSize: '11px',
                    colors: '#6b7280'
                  },
                  rotate: -45
                },
                axisBorder: {
                  show: false
                },
                axisTicks: {
                  show: false
                }
              },
              yaxis: {
                title: {
                  text: 'Media Spend',
                  style: {
                    color: '#6b7280',
                    fontSize: '12px'
                  }
                },
                labels: {
                  style: {
                    fontSize: '11px',
                    colors: '#6b7280'
                  },
                  formatter: function(val: number) {
                    return formatCurrency(val);
                  }
                }
              },
              tooltip: {
                x: { format: 'MMM yyyy' },
                y: { formatter: function(val: number) { return formatCurrency(val); } },
                shared: false,
                intersect: true
              },
              legend: {
                position: 'top',
                horizontalAlign: 'center',
                offsetY: -10
              },
              colors: ['#3b82f6'],
              grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 3
              }
            }}
            series={[
              {
                name: 'Total Spend',
                data: mediaData.timeSeries.map(ts => ({
                  x: ts.month,
                  y: ts.total_spend
                }))
              }
            ]}
            type="area"
            height={450}
          />
        </div>
      )}

      {/* Publishers Mode */}
      {viewMode === 'publishers' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Publisher Performance Analysis</h3>
          <Chart
            options={{
              chart: {
                type: 'bar',
                height: 600,
                toolbar: {
                  show: false
                },
                zoom: {
                  enabled: false
                }
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                  dataLabels: {
                    position: 'top'
                  },
                  barHeight: '70%'
                }
              },
              dataLabels: {
                enabled: true,
                offsetX: 10,
                style: {
                  fontSize: '10px',
                  colors: ['#ffffff']
                },
                formatter: function(val: number) {
                  return formatCurrency(val);
                }
              },
              xaxis: {
                type: 'category',
                categories: mediaData.topPublishers.slice(0, 15).map(p => p.Publisher.length > 20 ? p.Publisher.substring(0, 20) + '...' : p.Publisher),
                labels: {
                  style: {
                    fontSize: '10px',
                    colors: '#6b7280'
                  },
                  formatter: function(val: string) {
                    return formatCurrency(Number(val));
                  }
                },
                axisBorder: {
                  show: false
                },
                axisTicks: {
                  show: false
                }
              },
              yaxis: {
                labels: {
                  style: {
                    fontSize: '10px',
                    colors: '#6b7280'
                  },
                  maxWidth: 150
                }
              },
              tooltip: {
                shared: true,
                intersect: false,
                y: {
                  formatter: function(val: number) {
                    return formatCurrency(val);
                  }
                }
              },
              legend: {
                position: 'top',
                horizontalAlign: 'center',
                offsetY: -10
              },
              fill: {
                opacity: 0.9
              },
              colors: ['#3b82f6'],
              grid: {
                borderColor: '#f1f5f9',
                strokeDashArray: 3
              }
            }}
            series={[
              {
                name: 'Total Spend',
                data: mediaData.topPublishers.slice(0, 15).map(p => ({
                  x: p.Publisher.length > 20 ? p.Publisher.substring(0, 20) + '...' : p.Publisher,
                  y: p.total_spend
                }))
              }
            ]}
            type="bar"
            height={600}
          />
        </div>
      )}

      {/* Creative Mode */}
      {viewMode === 'creative' && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Creative Performance</h3>
          
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Publisher:</label>
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Publishers</option>
                {Array.from(new Set(mediaData.records.map(record => safeValue(record.publisher))))
                  .filter(publisher => publisher && publisher.toString().trim() !== '')
                  .sort()
                  .map(publisher => (
                    <option key={publisher.toString()} value={publisher.toString()}>
                      {publisher.toString()}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Device:</label>
              <select
                value={selectedDeviceFilter}
                onChange={(e) => setSelectedDeviceFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Devices</option>
                {Array.from(new Set(mediaData.records.map(record => safeValue(record.device))))
                  .filter(device => device && device.toString().trim() !== '')
                  .sort()
                  .map(device => (
                    <option key={device.toString()} value={device.toString()}>
                      {device.toString()}
                    </option>
                  ))}
              </select>
            </div>
            
            {/* Clear Filters Button */}
            {(selectedPublisher !== 'all' || selectedDeviceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSelectedPublisher('all')
                  setSelectedDeviceFilter('all')
                }}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thumbnail
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('creative_text')}
                  >
                    <div className="flex items-center">
                      Creative
                      {renderSortIcon('creative_text')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('publisher')}
                  >
                    <div className="flex items-center">
                      Publisher
                      {renderSortIcon('publisher')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('device')}
                  >
                    <div className="flex items-center">
                      Device
                      {renderSortIcon('device')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('spend_usd')}
                  >
                    <div className="flex items-center">
                      Spend
                      {renderSortIcon('spend_usd')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('impressions')}
                  >
                    <div className="flex items-center">
                      Impressions
                      {renderSortIcon('impressions')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('cpm')}
                  >
                    <div className="flex items-center">
                      CPM
                      {renderSortIcon('cpm')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedFilteredData.slice(0, 20).map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Thumbnail Column */}
                    <td className="px-6 py-4">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {safeValue(record.link_to_creative) ? (
                          (() => {
                            const creativeUrl = safeValue(record.link_to_creative).toString()
                            const isVideo = safeValue(record.type).toString().toLowerCase().includes('video') || 
                                           creativeUrl.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
                                           Number(safeValue(record.video_duration)) > 0
                            
                            return isVideo ? (
                              <div className="relative w-full h-full">
                                <video
                                  src={creativeUrl}
                                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                                  onClick={() => openCreativeModal(record)}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  onError={(e) => {
                                    // Hide video and show fallback
                                    const target = e.target as HTMLVideoElement
                                    target.style.display = 'none'
                                    const fallback = target.nextElementSibling as HTMLElement
                                    if (fallback) fallback.style.display = 'flex'
                                  }}
                                />
                                {/* Fallback play icon */}
                                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hidden" onClick={() => openCreativeModal(record)}>
                                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14V10z" />
                                  </svg>
                                </div>
                                {/* Video overlay indicator */}
                                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => openCreativeModal(record)}>
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                                {/* Video badge */}
                                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                                  VIDEO
                                </div>
                              </div>
                            ) : (
                              <img
                                src={creativeUrl}
                                alt="Creative thumbnail"
                                className="w-full h-full object-cover rounded-lg cursor-pointer"
                                onClick={() => openCreativeModal(record)}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEgzNlYyOEgyMFYyMFoiIGZpbGw9IiNENUQ5REQiLz4KPHR5cGUgeD0iMzIiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzY1NzM4OCI+Tm88L3RleHQ+CjwvZ3M='
                                }}
                              />
                            )
                          })()
                        ) : (
                          <div className="text-center text-gray-400">
                            <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Creative Column */}
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <button
                          onClick={() => openCreativeModal(record)}
                          className="text-left hover:text-blue-600 transition-colors w-full"
                        >
                          <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                            {safeValue(record.creative_text) || 'No text available'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {safeValue(record.type)} • {safeValue(record.width)}x{safeValue(record.height)}
                          </p>
                        </button>
                      </div>
                    </td>
                    
                    {/* Publisher Column with Logo */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* Publisher Logo */}
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={(() => {
                                const publisherName = safeValue(record.publisher).toString()
                                const cleanName = publisherName.toLowerCase()
                                  .replace(/[^a-z0-9\s]/g, '')
                                  .replace(/\s+/g, '')
                                  .replace(/\(.*\)/g, '') // Remove content in parentheses
                                  .replace(/llc|inc|corp|corporation|company|co$|media|network|interactive$/g, '')
                                  .trim()
                                
                                return `https://logo.clearbit.com/${cleanName}.com`
                              })()}
                              alt={`${safeValue(record.publisher)} logo`}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            <div 
                              className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded text-white text-xs font-bold items-center justify-center hidden"
                              style={{ fontSize: '8px' }}
                            >
                              {safeValue(record.publisher).toString().split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Publisher Name */}
                        <span className="text-sm text-gray-900 truncate">{safeValue(record.publisher)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {getDeviceIcon(safeValue(record.device).toString())}
                        <span className="text-sm text-gray-900">{safeValue(record.device)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(Number(safeValue(record.spend_usd)))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatNumber(Number(safeValue(record.impressions)))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {Number(safeValue(record.impressions)) > 0 ? formatCurrency((Number(safeValue(record.spend_usd)) / Number(safeValue(record.impressions))) * 1000) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openCreativeModal(record)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                        {safeValue(record.link_to_creative) && (
                          <a
                            href={safeValue(record.link_to_creative).toString()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Original
                          </a>
                        )}
                        {safeValue(record.landing_page) && (
                          <a
                            href={safeValue(record.landing_page).toString()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Landing
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {Math.min(sortedFilteredData.length, 20)} of {sortedFilteredData.length} creatives. Click on any creative or thumbnail to view details.
          </div>
        </div>
      )}

      {/* Business Insights */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Business Insights</h3>
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Channel Strategy Chart */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Purchase Channel Strategy Distribution
            </h4>
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 250,
                  toolbar: {
                    show: false
                  },
                  zoom: {
                    enabled: false
                  }
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    dataLabels: {
                      position: 'center'
                    },
                    barHeight: '60%'
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: '10px',
                    colors: ['#ffffff']
                  },
                  formatter: function(val: number) {
                    return formatCurrency(val);
                  }
                },
                xaxis: {
                  type: 'category',
                  categories: mediaData.purchaseChannelSpend.map(channel => channel.purchase_channel_type),
                  labels: {
                    style: {
                      fontSize: '10px',
                      colors: '#6b7280'
                    },
                    formatter: function(val: string) {
                      return formatCurrency(Number(val));
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: false
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '10px',
                      colors: '#6b7280'
                    },
                    maxWidth: 100
                  }
                },
                tooltip: {
                  y: {
                    formatter: function(val: number) {
                      return formatCurrency(val);
                    }
                  }
                },
                legend: {
                  show: false
                },
                fill: {
                  opacity: 0.9
                },
                colors: mediaData.purchaseChannelSpend.map((channel, index) => CHART_COLORS[channel.purchase_channel_type as keyof typeof CHART_COLORS] || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][index % 10]),
                grid: {
                  borderColor: '#f1f5f9',
                  strokeDashArray: 3
                }
              }}
              series={[
                {
                  name: 'Total Spend',
                  data: mediaData.purchaseChannelSpend.map((channel, index) => ({
                    x: channel.purchase_channel_type,
                    y: channel.total_spend,
                    fillColor: CHART_COLORS[channel.purchase_channel_type as keyof typeof CHART_COLORS] || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][index % 10]
                  }))
                }
              ]}
              type="bar"
              height={250}
            />
            <div className="text-xs text-gray-500">
              E-commerce vs Retail vs Direct purchase channel spend distribution
            </div>
          </div>

          {/* Performance Metrics Chart */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Top Publisher Performance
            </h4>
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 250,
                  toolbar: {
                    show: false
                  },
                  zoom: {
                    enabled: false
                  }
                },
                plotOptions: {
                  bar: {
                    horizontal: true,
                    dataLabels: {
                      position: 'center'
                    },
                    barHeight: '60%'
                  }
                },
                dataLabels: {
                  enabled: true,
                  style: {
                    fontSize: '10px',
                    colors: ['#ffffff']
                  },
                  formatter: function(val: number) {
                    return formatCurrency(val);
                  }
                },
                xaxis: {
                  type: 'category',
                  categories: mediaData.topPublishers.slice(0, 5).map(p => p.Publisher.length > 15 ? p.Publisher.substring(0, 15) + '...' : p.Publisher),
                  labels: {
                    style: {
                      fontSize: '9px',
                      colors: '#6b7280'
                    },
                    formatter: function(val: string) {
                      return formatCurrency(Number(val));
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: false
                  }
                },
                yaxis: {
                  labels: {
                    style: {
                      fontSize: '9px',
                      colors: '#6b7280'
                    },
                    maxWidth: 100
                  }
                },
                tooltip: {
                  y: {
                    formatter: function(val: number) {
                      return formatCurrency(val);
                    }
                  }
                },
                legend: {
                  show: false
                },
                fill: {
                  opacity: 0.9
                },
                colors: ['#10b981'],
                grid: {
                  borderColor: '#f1f5f9',
                  strokeDashArray: 3
                }
              }}
              series={[
                {
                  name: 'Total Spend',
                  data: mediaData.topPublishers.slice(0, 5).map(p => ({
                    x: p.Publisher.length > 15 ? p.Publisher.substring(0, 15) + '...' : p.Publisher,
                    y: p.total_spend
                  }))
                }
              ]}
              type="bar"
              height={250}
            />
            <div className="text-xs text-gray-500">
              Top 5 publishers by total media spend
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(mediaData.summary.total_spend / mediaData.summary.total_records)}
              </p>
              <p className="text-xs text-gray-600">Avg Campaign Spend</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-lg font-bold text-purple-600">{mediaData.summary.unique_publishers}</p>
              <p className="text-xs text-gray-600">Publishers</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-lg font-bold text-green-600">{mediaData.summary.unique_devices}</p>
              <p className="text-xs text-gray-600">Device Types</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <p className="text-lg font-bold text-orange-600">{mediaData.summary.channel_types}</p>
              <p className="text-xs text-gray-600">Channel Types</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Creative Modals */}
      {showCreativeModal && <CreativeModal />}
      {showPointCreativesModal && <PointCreativesModal />}
    </div>
  )
} 