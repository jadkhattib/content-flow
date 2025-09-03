'use client'

import { motion } from 'framer-motion'
import { BarChart3, Camera, Sparkles, TrendingUp, Users, Clock, Palette } from 'lucide-react'
import { formatAllCitations } from '@/lib/citationUtils'

interface ContentPatternsProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      contentPatterns?: {
        postTypes: {
          [key: string]: string
        }
        contentFormats: {
          [key: string]: string
        }
        creationPatterns: {
          [key: string]: string
        }
        visualAesthetics: {
          [key: string]: string[] | string
        }
      }
    }
  }
}

export default function ContentPatterns({ data }: ContentPatternsProps) {
  const analysis = data.structuredAnalysis?.contentPatterns

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
            <h1 className="text-3xl font-bold text-brand-dark">Content Creation Patterns</h1>
            <p className="text-gray-600">{data.brandName} Community Content Analysis</p>
          </div>
        </div>

        {analysis ? (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Content Pattern Overview</h3>
            <p className="text-lg text-gray-700">Analysis of how Emily in Paris fans create and engage with content, from outfit recreations to beauty tutorials, revealing optimal content strategies for Vaseline integration.</p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-accent/10 to-brand-light border-l-4 border-brand-accent p-6 rounded-r-xl">
            <h3 className="font-semibold text-brand-dark mb-3">Analysis Context</h3>
            <p className="text-lg text-gray-700">Content pattern analysis is being prepared to understand fan creation behaviors and engagement trends.</p>
          </div>
        )}
      </div>

      {/* Post Types */}
      {analysis?.postTypes && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Camera className="w-6 h-6 text-brand-accent" />
            <span>Popular Post Types</span>
          </h2>
          
          <div className="grid gap-6">
            {Object.entries(analysis.postTypes).map(([type, description], index) => {
              const colors = [
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
                { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' }
              ]
              const color = colors[index % 5]
              
              return (
                <div key={type} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`${color.text} text-sm`}>{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Content Formats */}
      {analysis?.contentFormats && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-brand-accent" />
            <span>Content Formats</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.contentFormats).map(([format, description], index) => {
              const colors = [
                { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800' },
                { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-800' },
                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
                { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
                { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800' }
              ]
              const color = colors[index % 5]
              
              return (
                <div key={format} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {format.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`${color.text} text-sm`}>{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Creation Patterns */}
      {analysis?.creationPatterns && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Clock className="w-6 h-6 text-brand-accent" />
            <span>Creation Patterns</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(analysis.creationPatterns).map(([pattern, description], index) => {
              const colors = [
                { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
                { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-800' },
                { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800' },
                { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={pattern} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-3 capitalize`}>
                    {pattern.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className={`${color.text} text-sm`}>{description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Visual Aesthetics */}
      {analysis?.visualAesthetics && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center space-x-3">
            <Palette className="w-6 h-6 text-brand-accent" />
            <span>Visual Aesthetics</span>
          </h2>
          
          <div className="space-y-6">
            {Object.entries(analysis.visualAesthetics).map(([aesthetic, content], index) => {
              const colors = [
                { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' }
              ]
              const color = colors[index % 4]
              
              return (
                <div key={aesthetic} className={`${color.bg} ${color.border} border rounded-xl p-6`}>
                  <h3 className={`font-semibold ${color.text} mb-4 capitalize`}>
                    {aesthetic.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  {Array.isArray(content) ? (
                    <div className="flex flex-wrap gap-2">
                      {content.map((item, i) => (
                        <span key={i} className={`px-3 py-1 ${color.bg} border ${color.border} ${color.text} text-sm rounded-full`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className={`${color.text} text-sm`}>{content}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}