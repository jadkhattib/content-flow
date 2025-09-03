'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Clock, Target, AlertCircle } from 'lucide-react'

interface StrategicOpportunitiesProps {
  data: {
    brandName: string
    structuredAnalysis?: {
      strategicOpportunities: {
        priority: string
        title: string
        description: string
        impact: string
        feasibility: string
        timeline: string
        resources: string
        risks: string
      }[]
    }
  }
}

export default function StrategicOpportunities({ data }: StrategicOpportunitiesProps) {
  const analysis = data.structuredAnalysis?.strategicOpportunities

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="card p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Lightbulb className="w-8 h-8 text-brand-accent" />
          <div>
            <h1 className="text-3xl font-bold text-brand-dark">Strategic Opportunities</h1>
            <p className="text-gray-600">{data.brandName} Growth & Innovation Pathways</p>
          </div>
        </div>

        {analysis ? (
          <div className="space-y-6">
            {analysis.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPriorityStyle(opportunity.priority)}`}>
                      {opportunity.priority} PRIORITY
                    </span>
                    <h3 className="text-xl font-bold text-brand-dark">{opportunity.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{opportunity.timeline}</span>
                  </div>
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed">{opportunity.description}</p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Expected Impact</h4>
                    </div>
                    <p className="text-blue-700 text-sm">{opportunity.impact}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-800">Feasibility</h4>
                    </div>
                    <p className="text-green-700 text-sm">{opportunity.feasibility}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <h4 className="font-medium text-purple-800">Resources Needed</h4>
                    </div>
                    <p className="text-purple-700 text-sm">{opportunity.resources}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <h4 className="font-medium text-orange-800">Key Risks</h4>
                    </div>
                    <p className="text-orange-700 text-sm">{opportunity.risks}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Strategic opportunities and recommendations...</p>
        )}
      </div>
    </motion.div>
  )
} 