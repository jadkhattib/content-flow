'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Loader, Users, Shield, Database, Settings, Eye, Plus, FileText, Calendar, User, LogOut, Search, Globe, TrendingUp, BarChart3, Minus, History, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import AnalysisDashboard from './components/AnalysisDashboard'
import PerplexityWorkflowModal from './components/PerplexityWorkflowModal'
import { useRouter } from 'next/navigation'
import { AnalysisRecord } from '../lib/bigquery'
import { logger } from '../lib/logger'

interface User {
  email: string
  name?: string
  picture?: string
  role: 'admin' | 'regular'
  isAdmin: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      logger.info('Checking authentication via Cloud Run...')

      // Check user role directly (this will also validate authentication)
      const roleResponse = await fetch('/api/user-role')
      
      if (!roleResponse.ok) {
        logger.error('Role check failed:', roleResponse.status)
        const errorText = await roleResponse.text()
        logger.error('Error details:', errorText)
        setAuthState({ user: null, loading: false, error: 'Not authenticated via Cloud Run' })
        return
      }

      const roleData = await roleResponse.json()
      logger.info('Role data received:', roleData)

      if (!roleData.userEmail) {
        logger.warn('No user email in role response')
        setAuthState({ user: null, loading: false, error: 'No user email found' })
        return
      }

      // Create user object from role data
      const user: User = {
        email: roleData.userEmail,
        name: roleData.userEmail.split('@')[0], // Use part before @ as name
        picture: undefined,
        role: roleData.role,
        isAdmin: roleData.isAdmin
      }

      logger.info('User authenticated with role:', roleData.role)
      setAuthState({ user, loading: false, error: null })

    } catch (error) {
      logger.error('Auth check failed:', error)
      setAuthState({ user: null, loading: false, error: 'Authentication failed' })
    }
  }

  // Remove login function since we use Cloud Run auth
  const login = async () => {
    // Cloud Run handles authentication automatically
    toast.error('Authentication is handled by Cloud Run. Please ensure you are logged into Google Cloud.')
  }

  return {
    ...authState,
    login,
    refresh: checkAuthStatus
  }
}

// Admin Dashboard Component
function AdminDashboard({ user }: { user: User }) {
  const router = useRouter()
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [showUserRoleModal, setShowUserRoleModal] = useState(false)
  const [targetUserEmail, setTargetUserEmail] = useState<string>('')
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('')
  const [newUserEmail, setNewUserEmail] = useState<string>('')
  const [newUserRole, setNewUserRole] = useState<'admin' | 'regular'>('regular')

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analysis-permissions')
      const data = await response.json()
      
      // Debug: Log the first analysis to see the date format
      if (data.analyses && data.analyses.length > 0) {
        logger.info('Sample analysis data:', data.analyses[0])
        logger.info('created_at field:', data.analyses[0].created_at, 'type:', typeof data.analyses[0].created_at)
        
        // If it's an object, let's see what's inside it
        if (typeof data.analyses[0].created_at === 'object') {
          logger.info('created_at object keys:', Object.keys(data.analyses[0].created_at))
          logger.info('created_at object values:', Object.values(data.analyses[0].created_at))
          logger.info('created_at object full:', JSON.stringify(data.analyses[0].created_at, null, 2))
        }
      }
      
      setAnalyses(data.analyses || [])
    } catch (error) {
      logger.error('Failed to load analyses:', error)
      toast.error('Failed to load analyses')
    } finally {
      setLoading(false)
    }
  }

  const grantPermission = async () => {
    if (!selectedAnalysisId || !targetUserEmail) {
      alert("Please select an analysis and enter a user email")
      return
    }

    try {
      const analysis = analyses.find(a => {
        const analysisId = a.brand_name
        return analysisId === selectedAnalysisId
      })

      if (!analysis) {
        toast.error('Selected analysis not found')
        return
      }

      const response = await fetch('/api/analysis-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId: selectedAnalysisId,
          userEmail: targetUserEmail,
          brandName: analysis.brand_name,
          category: analysis.category
        })
      })

      if (response.ok) {
        toast.success('Permission granted successfully!')
        setShowGrantModal(false)
        ""
        setTargetUserEmail('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to grant permission')
      }
    } catch (error) {
      logger.error('Failed to grant permission:', error)
      toast.error('Failed to grant permission')
    }
  }

  const setUserRole = async () => {
    if (!newUserEmail || !newUserRole) {
      toast.error('Please enter user email and select a role')
      return
    }

    try {
      const response = await fetch('/api/user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userEmail: newUserEmail,
          role: newUserRole
        })
      })

      if (response.ok) {
        toast.success('User role set successfully!')
        setShowUserRoleModal(false)
        setNewUserEmail('')
        setNewUserRole('regular')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to set user role')
      }
    } catch (error) {
      logger.error('Failed to set user role:', error)
      toast.error('Failed to set user role')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/google?action=logout')
      window.location.href = '/'
    } catch (error) {
      logger.error('Logout failed:', error)
    }
  }

  const formatDate = (dateString: string | number | any): string => {
    try {
      if (!dateString) return 'No date'
      
      logger.info('Formatting date:', dateString, 'type:', typeof dateString)
      
      let date: Date
      
      // Handle BigQuery date objects
      if (typeof dateString === 'object' && dateString !== null) {
        logger.info('Date object keys:', Object.keys(dateString))
        logger.info('Date object values:', Object.values(dateString))
        
        // Try common BigQuery date object properties
        if (dateString.value) {
          logger.info('Using dateString.value:', dateString.value)
          return formatDate(dateString.value) // Recursive call with the value
        } else if (dateString.seconds || dateString.nanos) {
          // Handle Firestore/BigQuery timestamp object
          const seconds = dateString.seconds || 0
          const nanos = dateString.nanos || 0
          const timestamp = (seconds * 1000) + (nanos / 1000000)
          logger.info('Using timestamp from seconds/nanos:', timestamp)
          date = new Date(timestamp)
        } else if (dateString.toString && dateString.toString() !== '[object Object]') {
          // Try toString() if it returns something meaningful
          logger.info('Using toString():', dateString.toString())
          return formatDate(dateString.toString())
        } else {
          // Last resort: JSON stringify and look for date patterns
          const jsonStr = JSON.stringify(dateString)
          logger.info('Object JSON:', jsonStr)
          const dateMatch = jsonStr.match(/(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}[^"]*)/i)
          if (dateMatch) {
            logger.info('Found date pattern in JSON:', dateMatch[1])
            return formatDate(dateMatch[1])
          }
          logger.warn('Cannot parse date object:', dateString)
          return 'Invalid Date'
        }
      }
      // Handle BigQuery timestamp (milliseconds since epoch)
      else if (typeof dateString === 'number' || (typeof dateString === 'string' && /^\d+$/.test(dateString))) {
        const timestamp = typeof dateString === 'string' ? parseInt(dateString) : dateString
        date = new Date(timestamp)
      } 
      // Handle BigQuery DATETIME string with microseconds and UTC (e.g., "2025-07-17 14:28:01.884000 UTC")
      else if (typeof dateString === 'string' && dateString.includes(' ') && dateString.includes('UTC')) {
        // Remove UTC suffix and microseconds, convert to ISO format
        const cleanedDate = dateString.replace(' UTC', '').replace(/\.\d+/, '')
        const isoString = cleanedDate.replace(' ', 'T') + 'Z'
        logger.info('Converted BigQuery UTC format to ISO:', isoString)
        date = new Date(isoString)
      }
      // Handle BigQuery DATETIME string (YYYY-MM-DD HH:MM:SS)
      else if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
        // Convert BigQuery DATETIME format to ISO format
        const isoString = dateString.replace(' ', 'T') + 'Z'
        logger.info('Converted BigQuery DATETIME to ISO:', isoString)
        date = new Date(isoString)
      }
      // Handle ISO string or other standard formats
      else {
        logger.info('Using standard Date parsing for:', dateString)
        date = new Date(dateString)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        logger.warn('Invalid date format:', dateString)
        return 'Invalid Date'
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      logger.info('Successfully formatted date:', formatted)
      return formatted
    } catch (error) {
      logger.warn('Date parsing error:', error, 'Input:', dateString)
      return 'Invalid Date'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4 inline mr-1" />
                Admin
              </span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Full App
            </button>
            <button
              onClick={() => setShowGrantModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Grant Access
            </button>
            <button
              onClick={() => setShowUserRoleModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Set User Role
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">All Analyses</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyses.map((analysis, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {analysis.brand_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {analysis.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(analysis.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            const analysisId = analysis.brand_name || analysis.category || "unknown"
                            ""
                            setSelectedAnalysisId(analysisId)
                            setShowGrantModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Grant Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
            
      {/* Grant Permission Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Grant Analysis Access</h3>
            
            <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Analysis
                  </label>
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an analysis...</option>
                  {analyses.map((analysis, index) => {
                    const analysisId = analysis.brand_name || analysis.category || "unknown"
                    return (
                      <option key={index} value={analysisId}>
                        {analysis.brand_name} - {analysis.category} ({formatDate(analysis.created_at)})
                      </option>
                    )
                  })}
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                  </label>
                  <input
                  type="email"
                  value={targetUserEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={grantPermission}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Grant Access
              </button>
              <button
                onClick={() => {
                  setShowGrantModal(false)
                  ""
                  setTargetUserEmail('')
                  setSelectedAnalysisId('')
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
                </div>
                </div>
              </div>
      )}

      {/* Set User Role Modal */}
      {showUserRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Set User Role</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'regular')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                  <option value="regular">Regular User</option>
                  <option value="admin">Admin</option>
                </select>
                  </div>
              </div>

            <div className="flex space-x-3 mt-6">
                <button
                onClick={setUserRole}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Set Role
                </button>
                <button
                onClick={() => {
                  setShowUserRoleModal(false)
                  setNewUserEmail('')
                  setNewUserRole('regular')
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                Cancel
                </button>
              </div>
          </div>
                </div>
              )}
    </div>
  )
}

// Regular User Dashboard Component
function RegularUserDashboard({ user }: { user: User }) {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analysis-permissions')
      const data = await response.json()
      
      // Debug: Log the first analysis to see the date format
      if (data.analyses && data.analyses.length > 0) {
        logger.info('Sample analysis data:', data.analyses[0])
        logger.info('created_at field:', data.analyses[0].created_at, 'type:', typeof data.analyses[0].created_at)
        
        // If it's an object, let's see what's inside it
        if (typeof data.analyses[0].created_at === 'object') {
          logger.info('created_at object keys:', Object.keys(data.analyses[0].created_at))
          logger.info('created_at object values:', Object.values(data.analyses[0].created_at))
          logger.info('created_at object full:', JSON.stringify(data.analyses[0].created_at, null, 2))
        }
      }
      
      setAnalyses(data.analyses || [])
    } catch (error) {
      logger.error('Failed to load analyses:', error)
      toast.error('Failed to load analyses')
    } finally {
      setLoading(false)
    }
  }

  const viewAnalysis = (analysis: AnalysisRecord) => {
    try {
      // Use the EXACT same method as the history page
      // Parse the analysis data
      let analysisData
      try {
        analysisData = JSON.parse(analysis.analysis)
      } catch (e) {
        // If parsing fails, create a basic structure
        analysisData = {
          executiveSnapshot: {
            keyInsight: 'Legacy analysis format',
            summary: analysis.analysis.substring(0, 500) + '...'
          }
        }
      }

      // Create the EXACT same combined analysis object as history page
      const combinedAnalysis = {
        website: analysis.website || '',
        brandName: analysis.brand_name || 'Unknown Brand',
        category: analysis.category || 'Unknown Category',
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
        analysisDate: analysis.created_at
      }

      // Save to sessionStorage (like the main platform does)
      sessionStorage.setItem('discoveryFlowAnalysis', JSON.stringify(combinedAnalysis))
      
      // Navigate to analysis view (like the main platform does)
      window.location.href = '/analysis/executive'
      
    } catch (error) {
      logger.error('Error loading analysis:', error)
      alert('Failed to load analysis')
    }
  }
  const logout = async () => {
    try {
      await fetch('/api/auth/google?action=logout')
      window.location.href = '/'
    } catch (error) {
      logger.error('Logout failed:', error)
    }
  }

  const formatDate = (dateString: string | number | any): string => {
    try {
      if (!dateString) return 'No date'
      
      logger.info('Regular formatting date:', dateString, 'type:', typeof dateString)
      
      let date: Date
      
      // Handle BigQuery date objects
      if (typeof dateString === 'object' && dateString !== null) {
        logger.info('Regular date object keys:', Object.keys(dateString))
        logger.info('Regular date object values:', Object.values(dateString))
        
        // Try common BigQuery date object properties
        if (dateString.value) {
          logger.info('Regular using dateString.value:', dateString.value)
          return formatDate(dateString.value) // Recursive call with the value
        } else if (dateString.seconds || dateString.nanos) {
          // Handle Firestore/BigQuery timestamp object
          const seconds = dateString.seconds || 0
          const nanos = dateString.nanos || 0
          const timestamp = (seconds * 1000) + (nanos / 1000000)
          logger.info('Regular using timestamp from seconds/nanos:', timestamp)
          date = new Date(timestamp)
        } else if (dateString.toString && dateString.toString() !== '[object Object]') {
          // Try toString() if it returns something meaningful
          logger.info('Regular using toString():', dateString.toString())
          return formatDate(dateString.toString())
        } else {
          // Last resort: JSON stringify and look for date patterns
          const jsonStr = JSON.stringify(dateString)
          logger.info('Regular object JSON:', jsonStr)
          const dateMatch = jsonStr.match(/(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}[^"]*)/i)
          if (dateMatch) {
            logger.info('Regular found date pattern in JSON:', dateMatch[1])
            return formatDate(dateMatch[1])
          }
          logger.warn('Regular cannot parse date object:', dateString)
          return 'Invalid Date'
        }
      }
      // Handle BigQuery timestamp (milliseconds since epoch)
      else if (typeof dateString === 'number' || (typeof dateString === 'string' && /^\d+$/.test(dateString))) {
        const timestamp = typeof dateString === 'string' ? parseInt(dateString) : dateString
        date = new Date(timestamp)
      } 
      // Handle BigQuery DATETIME string with microseconds and UTC (e.g., "2025-07-17 14:28:01.884000 UTC")
      else if (typeof dateString === 'string' && dateString.includes(' ') && dateString.includes('UTC')) {
        // Remove UTC suffix and microseconds, convert to ISO format
        const cleanedDate = dateString.replace(' UTC', '').replace(/\.\d+/, '')
        const isoString = cleanedDate.replace(' ', 'T') + 'Z'
        logger.info('Regular converted BigQuery UTC format to ISO:', isoString)
        date = new Date(isoString)
      }
      // Handle BigQuery DATETIME string (YYYY-MM-DD HH:MM:SS)
      else if (typeof dateString === 'string' && dateString.includes(' ') && !dateString.includes('T')) {
        // Convert BigQuery DATETIME format to ISO format
        const isoString = dateString.replace(' ', 'T') + 'Z'
        logger.info('Regular converted BigQuery DATETIME to ISO:', isoString)
        date = new Date(isoString)
      }
      // Handle ISO string or other standard formats
      else {
        logger.info('Regular using standard Date parsing for:', dateString)
        date = new Date(dateString)
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        logger.warn('Regular invalid date format:', dateString)
        return 'Invalid Date'
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      logger.info('Regular successfully formatted date:', formatted)
      return formatted
    } catch (error) {
      logger.warn('Regular date parsing error:', error, 'Input:', dateString)
      return 'Invalid Date'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Analyses</h1>
              <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
                </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <User className="w-4 h-4 inline mr-1" />
                Regular User
              </span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Analyses</h2>
          <p className="text-gray-600">Analyses that have been shared with you by administrators.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyses Available</h3>
            <p className="text-gray-600">
              You don't have access to any analyses yet. Contact your administrator to get access.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {analyses.map((analysis, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {analysis.brand_name || 'Unknown Brand'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {analysis.category || 'Unknown Category'}
                    </p>
                    {analysis.website && (
                      <p className="text-xs text-gray-500 truncate">
                        {analysis.website}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(analysis.created_at)}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => viewAnalysis(analysis)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Analysis
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main App Router
export default function Home() {
  const { user, loading, error, login } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
            >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Perception.Flow</h1>
            <p className="text-gray-600 mb-6">
              AI-Powered Brand Analysis Platform
            </p>
            
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                🔐 This app uses Cloud Run authentication
              </p>
              <p className="text-xs text-blue-600">
                You should be automatically logged in via Google Cloud
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center mb-3"
            >
              <Loader className="w-5 h-5 mr-2" />
              Refresh & Check Authentication
            </button>

            <button
              onClick={login}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Troubleshoot Authentication
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Try refreshing the page or ensure you're logged into Google Cloud
                </p>
              </div>
            )}
          </div>
        </motion.div>
    </div>
  )
  }

  // Route based on user role
  if (user.role === 'admin') {
    return <AdminDashboard user={user} />
  } else {
    return <RegularUserDashboard user={user} />
  }
} 