'use client'

import { 
  Target, 
  Palette, 
  Video, 
  Users, 
  Globe, 
  TrendingUp,
  Building2,
  Lightbulb,
  Plus
} from 'lucide-react'


interface Section {
  id: string
  title: string
  component: React.ComponentType<any>
}

interface AnalysisNavigationProps {
  sections: Section[]
  currentSection: string
  onNavigate: (sectionId: string) => void
}

const sectionIcons: { [key: string]: React.ReactNode } = {
  'strategic-overview': <Target className="w-5 h-5" />,
  'thematic-deep-dive': <Palette className="w-5 h-5" />,
  'content-formats': <Video className="w-5 h-5" />,
  'community-dynamics': <Users className="w-5 h-5" />,
  'cultural-intelligence': <Globe className="w-5 h-5" />,
  'influence-mapping': <TrendingUp className="w-5 h-5" />,
  'brand-integration': <Building2 className="w-5 h-5" />,
  'campaign-strategy': <Lightbulb className="w-5 h-5" />,
  'campaign-creation': <Plus className="w-5 h-5" />,
}

export default function AnalysisNavigation({ 
  sections, 
  currentSection, 
  onNavigate
}: AnalysisNavigationProps) {
  return (
    <div className="card p-6 sticky top-24">
      <h3 className="font-semibold text-brand-dark mb-4">Analysis Sections</h3>
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onNavigate(section.id)}
            className={`w-full text-left p-3 rounded-md transition-colors ${
              currentSection === section.id
                ? 'bg-brand-light text-brand-dark'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className={`${currentSection === section.id ? 'text-brand-dark' : 'text-gray-400'}`}>
                {sectionIcons[section.id]}
              </span>
              <span className="text-sm font-medium">
                {section.title}
              </span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  )
} 