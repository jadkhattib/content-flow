'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Plus, 
  Copy, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'
import { generateAnalysisSubdomain } from '../../lib/domain'

interface ShareRecord {
  share_id: string
  analysis_id: string
  shared_by: string
  shared_with: string
  brand_name: string
  created_at: string
  expires_at: string
  is_active: boolean
  view_count: number
  last_viewed: string | null
}

interface Analysis {
  client_name: string
  brand_name: string
  category: string
  created_at: string
  website: string
}

interface ShareManagementProps {
  userEmail: string
  analyses: Analysis[]
}

export default function ShareManagement({ userEmail, analyses }: ShareManagementProps) {
  const [shares, setShares] = useState<ShareRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  
  // Create share form state
  const [shareForm, setShareForm] = useState({
    sharedWith: '',
    expiresInDays: 30
  })

  useEffect(() => {
    loadShares()
  }, [userEmail])

  const loadShares = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shares?userEmail=${encodeURIComponent(userEmail)}`)
      const data = await response.json()
      
      if (data.success) {
        setShares(data.data)
      } else {
        console.error('Failed to load shares:', data.error)
      }
    } catch (error) {
      console.error('Error loading shares:', error)
    } finally {
      setLoading(false)
    }
  }

  const createShare = async () => {
    if (!selectedAnalysis || !shareForm.sharedWith.trim()) {
      toast.error('Please select an analysis and enter an email address')
      return
    }

    try {
      // Create a more robust analysisId
      const timestamp = new Date(selectedAnalysis.created_at).getTime()
      const analysisId = isNaN(timestamp) 
        ? `${selectedAnalysis.brand_name}_${Date.now()}` 
        : `${selectedAnalysis.brand_name}_${timestamp}`

      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysisId,
          sharedBy: userEmail,
          sharedWith: shareForm.sharedWith.trim(),
          brandName: selectedAnalysis.brand_name,
          expiresInDays: shareForm.expiresInDays
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Share created successfully!')
        
        // Copy share URL to clipboard
        await navigator.clipboard.writeText(data.data.shareUrl)
        toast.success('Share URL copied to clipboard!')
        
        // Reset form and close modal
        setShareForm({ sharedWith: '', expiresInDays: 30 })
        setSelectedAnalysis(null)
        setShowCreateModal(false)
        
        // Reload shares
        loadShares()
      } else {
        toast.error(data.error || 'Failed to create share')
      }
    } catch (error) {
      console.error('Error creating share:', error)
      toast.error('Failed to create share')
    }
  }

  const revokeShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to revoke this share? The recipient will no longer be able to access the analysis.')) {
      return
    }

    try {
      const response = await fetch(`/api/shares/${shareId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Share revoked successfully')
        loadShares()
      } else {
        toast.error(data.error || 'Failed to revoke share')
      }
    } catch (error) {
      console.error('Error revoking share:', error)
      toast.error('Failed to revoke share')
    }
  }

  const copyShareUrl = async (shareId: string) => {
    try {
      const shareUrl = generateAnalysisSubdomain(shareId)
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Share URL copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid Date'
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expireDate = new Date(expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Share2 className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Share Management</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Share</span>
        </button>
      </div>

      {shares.length === 0 ? (
        <div className="text-center py-12">
          <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shares Yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first share to give someone secure access to an analysis
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Share
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => (
            <div
              key={share.share_id}
              className={`border rounded-lg p-4 ${
                !share.is_active 
                  ? 'border-gray-200 bg-gray-50' 
                  : isExpired(share.expires_at)
                  ? 'border-red-200 bg-red-50'
                  : isExpiringSoon(share.expires_at)
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{share.brand_name}</h3>
                    <div className="flex items-center space-x-2">
                      {!share.is_active ? (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Revoked
                        </span>
                      ) : isExpired(share.expires_at) ? (
                        <span className="px-2 py-1 bg-red-200 text-red-700 text-xs rounded-full">
                          Expired
                        </span>
                      ) : isExpiringSoon(share.expires_at) ? (
                        <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs rounded-full">
                          Expires Soon
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-200 text-green-700 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{share.shared_with}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Expires {formatDate(share.expires_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{share.view_count} views</span>
                    </div>
                    {share.last_viewed && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Last viewed {formatDate(share.last_viewed)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {share.is_active && !isExpired(share.expires_at) && (
                    <button
                      onClick={() => copyShareUrl(share.share_id)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy share URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  
                  {share.is_active && (
                    <button
                      onClick={() => revokeShare(share.share_id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Revoke share"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Share Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Share</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Analysis to Share
                </label>
                <select
                  value={selectedAnalysis ? analyses.findIndex(a => a === selectedAnalysis).toString() : ''}
                  onChange={(e) => {
                    const index = parseInt(e.target.value)
                    if (!isNaN(index) && index >= 0 && index < analyses.length) {
                      setSelectedAnalysis(analyses[index])
                    } else {
                      setSelectedAnalysis(null)
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose an analysis...</option>
                  {analyses.map((analysis, index) => (
                    <option 
                      key={index} 
                      value={index.toString()}
                    >
                      {analysis.brand_name || 'Unknown Brand'} - {formatDate(analysis.created_at)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={shareForm.sharedWith}
                  onChange={(e) => setShareForm({ ...shareForm, sharedWith: e.target.value })}
                  placeholder="colleague@company.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expires In (Days)
                </label>
                <select
                  value={shareForm.expiresInDays}
                  onChange={(e) => setShareForm({ ...shareForm, expiresInDays: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedAnalysis(null)
                  setShareForm({ sharedWith: '', expiresInDays: 30 })
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createShare}
                disabled={!selectedAnalysis || !shareForm.sharedWith.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Share
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 