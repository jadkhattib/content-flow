'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Calendar, Building2, Tag, Eye, Loader, Filter, Share2, History } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ShareManagement from '../components/ShareManagement'

interface AnalysisRecord {
  client_name: string
  analysis: string
  created_at: string
  brand_name?: string
  category?: string
  website?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'history' | 'shares'>('history')

  // Mock user email - replace with actual user email from your auth system
  const userEmail = 'admin@company.com' // TODO: Replace with actual user email

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('brandName', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)
      if (clientFilter) params.append('clientName', clientFilter)
      
      const response = await fetch(`/api/analyses?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalyses(result.data)
        setError('')
      } else {
        setError('Failed to load analyses')
        setAnalyses([])
      }
    } catch (err) {
      setError('BigQuery not configured or unavailable')
    } finally {
      setLoading(false)
    }
  }

  const searchAnalyses = async () => {
    if (!searchTerm.trim()) {
      fetchAnalyses()
      return
    }
    await fetchAnalyses()
  }

  const loadAnalysis = async (record: AnalysisRecord) => {
    try {
      // Parse the analysis data
      let analysisData
      try {
        analysisData = JSON.parse(record.analysis)
      } catch (e) {
        // If parsing fails, create a basic structure
        analysisData = {
          executiveSnapshot: {
            keyInsight: 'Legacy analysis format',
            summary: record.analysis.substring(0, 500) + '...'
          }
        }
      }

      // Create a mock combined analysis object
      const combinedAnalysis = {
        website: record.website || '',
        brandName: record.brand_name || 'Unknown Brand',
        category: record.category || 'Unknown Category',
        timeframe: '6 months',
        pitchContext: 'Historical analysis',
        executiveSummary: analysisData.executiveSnapshot?.keyInsight || 'Analysis loaded from history',
        structuredAnalysis: analysisData,
        fullAnalysis: typeof analysisData === 'string' ? analysisData : JSON.stringify(analysisData, null, 2),
        socialData: {
          mentions: 0,
          sentiment: { positive: 50, negative: 25, neutral: 25 },
          engagementRate: '2.5',
          shareOfVoice: '5.2'
        },
        analysisDate: record.created_at
      }

      // Save to sessionStorage and navigate to analysis view
      sessionStorage.setItem('discoveryFlowAnalysis', JSON.stringify(combinedAnalysis))
      router.push('/analysis/executive')
      
      toast.success('Analysis loaded successfully!')
      
    } catch (error) {
      console.error('Error loading analysis:', error)
      toast.error('Failed to load analysis')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getAnalysisPreview = (analysisText: string) => {
    try {
      const parsed = JSON.parse(analysisText)
      return parsed.executiveSnapshot?.summary || parsed.executiveSnapshot?.keyInsight || 'Structured analysis data'
    } catch (e) {
      return analysisText.substring(0, 150) + '...'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-2xl font-bold text-brand-dark">
                {activeTab === 'history' ? 'Analysis History' : 'Share Management'}
              </h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Analysis History</span>
              </button>
              <button
                onClick={() => setActiveTab('shares')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'shares'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Share Management</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'history' ? (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by Brand Name
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchAnalyses()}
                      placeholder="Search brand analyses..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Filter
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder="Category..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Filter
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={clientFilter}
                      onChange={(e) => setClientFilter(e.target.value)}
                      placeholder="Client..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={fetchAnalyses}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-brand-dark">
                  Saved brand analyses from BigQuery
                </h2>
                <span className="text-sm text-gray-500">
                  {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} found
                </span>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin text-brand-accent mx-auto mb-4" />
                    <p className="text-gray-600">Loading analysis history...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <p className="text-gray-500 text-sm">
                    Make sure BigQuery is configured with the correct environment variables.
                  </p>
                </div>
              )}

              {!loading && !error && analyses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-2">
                    {searchTerm || categoryFilter || clientFilter 
                      ? 'No analyses match your search criteria.' 
                      : 'No saved analyses in BigQuery yet.'
                    }
                  </p>
                  <p className="text-gray-500 text-sm">
                    Analyses are automatically saved when you process Gemini results.
                  </p>
                </div>
              )}

              {!loading && !error && analyses.length > 0 && (
                <div className="space-y-4">
                  {analyses.map((analysis, index) => (
                    <motion.div
                      key={`${analysis.created_at}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-brand-dark">
                              {analysis.brand_name || 'Unknown Brand'}
                            </span>
                            {analysis.website && (
                              <a
                                href={analysis.website.startsWith('http') ? analysis.website : `https://${analysis.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-500 hover:text-gray-700 hover:underline mt-1"
                              >
                                {analysis.website}
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => loadAnalysis(analysis)}
                          className="flex items-center space-x-2 px-3 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition-colors ml-4"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <ShareManagement 
            userEmail={userEmail}
            analyses={analyses.filter(a => a.brand_name && a.category).map(a => ({
              client_name: a.client_name,
              brand_name: a.brand_name!,
              category: a.category!,
              created_at: a.created_at,
              website: a.website || ''
            }))}
          />
        )}
      </div>
    </div>
  )
} 