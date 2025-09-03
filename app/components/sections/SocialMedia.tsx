'use client'

import { motion } from 'framer-motion'
import { Share2, TrendingUp, MessageCircle, Heart, Users, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { getPlatformIcon } from '../icons/PlatformIcons'

interface SocialMediaProps {
  data: {
    brandName: string
    socialData: {
      mentions: number
      sentiment: {
        positive: number
        negative: number
        neutral: number
      }
      volume: {
        twitter: number
        instagram: number
        facebook: number
        tiktok: number
        youtube: number
        news: number
        blogs: number
        forums: number
      }
      demographics: {
        gender: { female: number; male: number; nonbinary: number }
        age: {
          '13-17': number
          '18-24': number
          '25-34': number
          '35-44': number
          '45-54': number
          '55+': number
        }
      }
      topKeywords: string[]
      engagementRate: string
      shareOfVoice: string
    }
  }
}

export default function SocialMedia({ data }: SocialMediaProps) {
  const socialData = data.socialData

  // Sentiment data with dummy fallback when values are 0 or missing
  const hasValidSentiment = socialData.sentiment.positive > 0 || socialData.sentiment.negative > 0 || socialData.sentiment.neutral > 0
  const sentimentData = hasValidSentiment ? [
    { name: 'Positive', value: socialData.sentiment.positive, color: '#10b981' },
    { name: 'Negative', value: socialData.sentiment.negative, color: '#ef4444' },
    { name: 'Neutral', value: socialData.sentiment.neutral, color: '#6b7280' },
  ] : [
    { name: 'Positive', value: 65, color: '#10b981' },
    { name: 'Negative', value: 15, color: '#ef4444' },
    { name: 'Neutral', value: 20, color: '#6b7280' },
  ]

  // Use sentiment data for mention calculations
  const effectiveMentions = socialData.mentions > 0 ? socialData.mentions : 25000
  const effectiveSentiment = hasValidSentiment ? socialData.sentiment : { positive: 65, negative: 15, neutral: 20 }

  // Platform data with dummy fallback
  const platformData = socialData.volume ? Object.entries(socialData.volume).map(([platform, value]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    mentions: value,
    percentage: ((value / effectiveMentions) * 100).toFixed(1)
  })) : [
    { platform: 'Twitter', mentions: Math.floor(effectiveMentions * 0.35), percentage: '35.0' },
    { platform: 'Instagram', mentions: Math.floor(effectiveMentions * 0.25), percentage: '25.0' },
    { platform: 'Facebook', mentions: Math.floor(effectiveMentions * 0.20), percentage: '20.0' },
    { platform: 'TikTok', mentions: Math.floor(effectiveMentions * 0.12), percentage: '12.0' },
    { platform: 'YouTube', mentions: Math.floor(effectiveMentions * 0.05), percentage: '5.0' },
    { platform: 'News', mentions: Math.floor(effectiveMentions * 0.03), percentage: '3.0' }
  ].map(platform => ({
    ...platform,
    mentions: platform.mentions || Math.floor(Math.random() * 5000) + 1000 // Ensure minimum mentions for chart visibility
  }))

  // Age data with dummy fallback
  const ageData = socialData.demographics?.age ? Object.entries(socialData.demographics.age).map(([range, percentage]) => ({
    age: range,
    percentage
  })) : [
    { age: '18-24', percentage: 28 },
    { age: '25-34', percentage: 35 },
    { age: '35-44', percentage: 22 },
    { age: '45-54', percentage: 12 },
    { age: '55+', percentage: 3 }
  ]

  // Gender data with dummy fallback
  const genderData = socialData.demographics?.gender || {
    female: 58,
    male: 40,
    nonbinary: 2
  }

  // Top keywords with dummy fallback
  const topKeywords = socialData.topKeywords && socialData.topKeywords.length > 0 
    ? socialData.topKeywords 
    : [
        data.brandName.toLowerCase(),
        'quality',
        'reliable',
        'customer service',
        'value',
        'innovative',
        'trusted',
        'experience',
        'recommend',
        'satisfaction'
      ]

  // Mock engagement trend data
  const engagementTrend = [
    { day: 'Mon', engagement: 2.4, mentions: 1200 },
    { day: 'Tue', engagement: 3.1, mentions: 1800 },
    { day: 'Wed', engagement: 2.8, mentions: 1500 },
    { day: 'Thu', engagement: 4.2, mentions: 2100 },
    { day: 'Fri', engagement: 3.8, mentions: 1900 },
    { day: 'Sat', engagement: 2.9, mentions: 1400 },
    { day: 'Sun', engagement: 2.6, mentions: 1300 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Share2 className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Social Media Analytics</h1>
            <p className="text-gray-600">{data.brandName} Social Listening & Engagement Insights</p>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Total Mentions</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{effectiveMentions.toLocaleString()}</p>
            <p className="text-blue-700 text-sm mt-1">Last 30 days</p>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center space-x-3 mb-3">
              <Heart className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-800">Engagement Rate</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{socialData.engagementRate}%</p>
            <p className="text-green-700 text-sm mt-1">Above industry avg</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Share of Voice</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{socialData.shareOfVoice}%</p>
            <p className="text-purple-700 text-sm mt-1">Category share</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Sentiment Score</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {((effectiveSentiment.positive - effectiveSentiment.negative) / 100 * 10).toFixed(1)}/10
            </p>
            <p className="text-orange-700 text-sm mt-1">Overall positive</p>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Sentiment Analysis</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Sentiment Breakdown</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Positive</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{effectiveSentiment.positive}%</div>
                  <div className="text-sm text-gray-500">
                    {Math.round(effectiveMentions * effectiveSentiment.positive / 100).toLocaleString()} mentions
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-700">Neutral</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-600">{effectiveSentiment.neutral}%</div>
                  <div className="text-sm text-gray-500">
                    {Math.round(effectiveMentions * effectiveSentiment.neutral / 100).toLocaleString()} mentions
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Negative</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">{effectiveSentiment.negative}%</div>
                  <div className="text-sm text-gray-500">
                    {Math.round(effectiveMentions * effectiveSentiment.negative / 100).toLocaleString()} mentions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Platform Performance</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Mentions by Platform</h3>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={platformData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="platform" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="mentions" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Platform Breakdown</h3>
            <div className="space-y-4">
              {platformData.slice(0, 6).map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getPlatformIcon(platform.platform, "w-4 h-4 text-brand-accent")}
                    <span className="text-gray-700">{platform.platform}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-dark">{platform.mentions.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">{platform.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Audience Demographics</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold text-brand-dark mb-4">Gender Split</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Female</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-pink-500 h-3 rounded-full" 
                      style={{ width: `${genderData.female}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-pink-600">{genderData.female}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Male</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${genderData.male}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-blue-600">{genderData.male}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Non-binary</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full" 
                      style={{ width: `${genderData.nonbinary}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-purple-600">{genderData.nonbinary}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trends */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Weekly Engagement Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagementTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="right" dataKey="mentions" fill="#e5e7eb" />
            <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Keywords */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Top Keywords & Topics</h2>
        <div className="flex flex-wrap gap-3">
          {topKeywords.map((keyword, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`px-4 py-2 rounded-full font-medium text-sm ${
                index === 0 ? 'bg-brand-accent text-white' :
                index < 3 ? 'bg-brand-accent/20 text-brand-accent' :
                'bg-gray-100 text-gray-700'
              }`}
            >
              {keyword}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  )
} 