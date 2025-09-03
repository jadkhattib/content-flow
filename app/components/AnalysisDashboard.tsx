'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Target, 
  Users, 
  TrendingUp, 
  Globe, 
  Lightbulb,
  Eye,
  Heart,
  MessageCircle,
  BarChart3,
  Calendar,
  MapPin,
  Music
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface AnalysisDashboardProps {
  data: {
    website: string
    brandName: string
    category: string
    timeframe: string
    pitchContext: string
    executiveSummary: string
    structuredAnalysis?: any
    fullAnalysis: string
    socialData: any
    analysisDate: string
  }
  onBack: () => void
  isSharedView?: boolean
}

// Helper function to parse the Perplexity analysis into sections
function parseAnalysisSections(fullAnalysis: string) {
  const sections: { [key: string]: string } = {}
  
  // Split by common section headers
  const sectionRegexes = [
    { key: 'executive', regex: /##?\s*(?:0\.?\s*)?Executive Snapshot([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'challenge', regex: /##?\s*(?:1\.?\s*)?Business Challenge([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'xray', regex: /##?\s*(?:2\.?\s*)?Brand X-Ray([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'audience', regex: /##?\s*(?:3\.?\s*)?Audience([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'category', regex: /##?\s*(?:4\.?\s*)?Category & Competitive Field([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'culture', regex: /##?\s*(?:5\.?\s*)?Culture & Context([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'opportunities', regex: /##?\s*(?:6\.?\s*)?Strategic Opportunities([\s\S]*?)(?=##?\s*(?:\d+\.?\s*)?[A-Z]|$)/i },
    { key: 'appendix', regex: /##?\s*(?:7\.?\s*)?Appendix([\s\S]*?)$/i }
  ]

  sectionRegexes.forEach(({ key, regex }) => {
    const match = fullAnalysis.match(regex)
    if (match) {
      sections[key] = match[1].trim()
    }
  })

  return sections
}

// Helper function to render markdown-like content
function renderContent(content: string) {
  if (!content) return null
  
  return (
    <div className="space-y-2">
      {content.split('\n').map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <br key={index} />
        
        // Handle bold text safely using React elements
        if (trimmed.includes('**')) {
          const parts = trimmed.split(/(\*\*.*?\*\*)/)
          return (
            <p key={index} className="text-gray-700">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  const boldText = part.slice(2, -2)
                  return (
                    <strong key={partIndex} className="font-semibold text-brand-dark">
                      {boldText}
                    </strong>
                  )
                }
                return part
              })}
            </p>
          )
        }
        
        // Handle bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return (
            <li key={index} className="text-gray-700 ml-4">
              {trimmed.substring(1).trim()}
            </li>
          )
        }
        
        // Handle numbered lists
        if (/^\d+\./.test(trimmed)) {
          return (
            <li key={index} className="text-gray-700 ml-4">
              {trimmed.replace(/^\d+\.\s*/, '')}
            </li>
          )
        }
        
        // Regular paragraph
        return (
          <p key={index} className="text-gray-700">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

export default function AnalysisDashboard({ data, onBack, isSharedView = false }: AnalysisDashboardProps) {
  const router = useRouter()

  useEffect(() => {
    // Save analysis data to sessionStorage for the new page structure
    sessionStorage.setItem('discoveryFlowAnalysis', JSON.stringify(data))
    
    // Redirect to the new analysis structure
    router.push('/analysis/executive')
  }, [data, router])

  const sections = [
    { id: 'executive', title: 'Executive Snapshot', icon: <Target className="w-5 h-5" /> },
    { id: 'challenge', title: 'Business Challenge', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'xray', title: 'Brand X-Ray', icon: <Eye className="w-5 h-5" /> },
    { id: 'audience', title: 'Audience', icon: <Users className="w-5 h-5" /> },
    { id: 'category', title: 'Category & Competition', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'culture', title: 'Culture & Context', icon: <Globe className="w-5 h-5" /> },
    { id: 'opportunities', title: 'Strategic Opportunities', icon: <Lightbulb className="w-5 h-5" /> },
  ]

  // Use structured analysis if available, otherwise fall back to parsing
  const analysis = data.structuredAnalysis || parseAnalysisSections(data.fullAnalysis)
  
  // Social data for charts
  const socialData = data.socialData || {}
  const sentiment = socialData.sentiment || { positive: 50, negative: 25, neutral: 25 }
  const sentimentData = [
    { name: 'Positive', value: sentiment.positive || 0, color: '#10b981' },
    { name: 'Negative', value: sentiment.negative || 0, color: '#ef4444' },
    { name: 'Neutral', value: sentiment.neutral || 0, color: '#6b7280' },
  ]

  // Helper function to render array content
  const renderList = (items: string[] | undefined, type: 'ul' | 'ol' = 'ul') => {
    if (!items || items.length === 0) return <p className="text-gray-600">No data available</p>
    
    const ListComponent = type === 'ul' ? 'ul' : 'ol'
    return (
      <ListComponent className={`${type === 'ul' ? 'list-disc' : 'list-decimal'} list-inside ml-4 space-y-1`}>
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ListComponent>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light/50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2">Analysis Complete</h2>
        <p className="text-gray-600">Redirecting to comprehensive dashboard...</p>
      </motion.div>
    </div>
  )
} 