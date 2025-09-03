// Domain utility for handling main domain vs analysis subdomains

export interface DomainInfo {
  isAnalysisSubdomain: boolean
  isMainDomain: boolean
  shareId: string | null
  fullDomain: string
  baseDomain: string
}

export function getDomainInfo(): DomainInfo {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      isAnalysisSubdomain: false,
      isMainDomain: true,
      shareId: null,
      fullDomain: '',
      baseDomain: ''
    }
  }

  const hostname = window.location.hostname
  const parts = hostname.split('.')
  
  // Check if this is an analysis subdomain (format: analysis-{shareId}.domain.com)
  if (parts.length >= 3 && parts[0].startsWith('analysis-')) {
    const shareId = parts[0].replace('analysis-', '')
    const baseDomain = parts.slice(1).join('.')
    
    return {
      isAnalysisSubdomain: true,
      isMainDomain: false,
      shareId,
      fullDomain: hostname,
      baseDomain
    }
  }
  
  // This is the main domain
  return {
    isAnalysisSubdomain: false,
    isMainDomain: true,
    shareId: null,
    fullDomain: hostname,
    baseDomain: hostname
  }
}

export function generateAnalysisSubdomain(shareId: string, baseDomain?: string): string {
  const domain = baseDomain || getDomainInfo().baseDomain || 'localhost:3000'
  
  // For local development
  if (domain.includes('localhost')) {
    return `http://analysis-${shareId}.localhost:3000`
  }
  
  // For production
  return `https://analysis-${shareId}.${domain}`
}

export function getMainDomainUrl(baseDomain?: string): string {
  const domain = baseDomain || getDomainInfo().baseDomain || 'localhost:3000'
  
  // For local development  
  if (domain.includes('localhost')) {
    return 'http://localhost:3000'
  }
  
  // For production
  return `https://${domain}`
} 