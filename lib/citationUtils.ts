import React from 'react'

// Utility functions for formatting citations in analysis text

/**
 * Converts embedded URLs in text to proper hyperlinks
 * Detects patterns like "textdomain.comother.domain.com" and converts to hyperlinks
 */
export function formatCitations(text: string): React.ReactElement[] {
  if (!text) return [React.createElement('span', { key: 'empty' }, '')]
  
  // Regular expression to match URLs that are concatenated to text
  // Looks for domain patterns like: word.com, word.domain.com, etc.
  const urlPattern = /([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-z]{2,})([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-z]{2,})?([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-z]{2,})?/g
  
  const parts: React.ReactElement[] = []
  let lastIndex = 0
  let match
  let citationIndex = 1
  
  while ((match = urlPattern.exec(text)) !== null) {
    const fullMatch = match[0]
    const matchStart = match.index
    
    // Add text before the URL
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart)
      if (beforeText.trim()) {
        parts.push(React.createElement('span', { key: `text-${lastIndex}` }, beforeText))
      }
    }
    
    // Split the concatenated URLs
    const urls = extractIndividualUrls(fullMatch)
    
    // Create citation links
    urls.forEach((url, index) => {
      const citationKey = `citation-${citationIndex}-${index}`
      parts.push(
        React.createElement('a', {
          key: citationKey,
          href: url.startsWith('http') ? url : `https://${url}`,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'inline-flex items-center ml-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors',
          title: `Source: ${url}`
        }, `[${citationIndex + index}]`)
      )
    })
    
    citationIndex += urls.length
    lastIndex = matchStart + fullMatch.length
  }
  
  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    if (remainingText.trim()) {
      parts.push(React.createElement('span', { key: `text-${lastIndex}` }, remainingText))
    }
  }
  
  // If no URLs were found, return the original text
  if (parts.length === 0) {
    return [React.createElement('span', { key: 'original' }, text)]
  }
  
  return parts
}

/**
 * Extracts individual URLs from concatenated URL string
 * Example: "travelfreely.comblog.telegeography.com" → ["travelfreely.com", "blog.telegeography.com"]
 */
function extractIndividualUrls(concatenatedUrls: string): string[] {
  const urls: string[] = []
  
  // Common domain patterns to help split concatenated URLs
  const domainSuffixes = ['.com', '.org', '.net', '.co.uk', '.io', '.ai', '.gov', '.edu']
  
  let currentUrl = ''
  let i = 0
  
  while (i < concatenatedUrls.length) {
    currentUrl += concatenatedUrls[i]
    
    // Check if we hit a domain suffix
    const foundSuffix = domainSuffixes.find(suffix => 
      currentUrl.endsWith(suffix) && 
      i + 1 < concatenatedUrls.length && 
      concatenatedUrls[i + 1].match(/[a-zA-Z]/) // Next char is a letter (start of new domain)
    )
    
    if (foundSuffix) {
      urls.push(currentUrl)
      currentUrl = ''
    }
    
    i++
  }
  
  // Add the last URL if there's content remaining
  if (currentUrl.length > 0) {
    urls.push(currentUrl)
  }
  
  // Filter out invalid URLs (too short, etc.)
  return urls.filter(url => 
    url.length > 3 && 
    url.includes('.') && 
    !url.startsWith('.') && 
    !url.endsWith('.')
  )
}

/**
 * Simple text formatter for components that need plain text with formatted citations
 */
export function formatTextWithCitations(text: string): React.ReactElement {
  const parts = formatCitations(text)
  return React.createElement(React.Fragment, {}, ...parts)
}

/**
 * Fixes malformed markdown citations and converts them to proper clickable links
 * Handles patterns like: ([[1]](https://[2]/forecasts/...)) 
 * Converts to clean text with proper citation links
 */
export function fixMalformedCitations(text: string): React.ReactElement {
  if (!text) return React.createElement('span', { key: 'empty' }, '')
  
  // Pattern to match malformed citation format: ([[number]](url with placeholders))
  const malformedCitationPattern = /\(\[\[(\d+)\]\]\((https?:\/\/[^\)]+)\)\)/g
  
  const parts: React.ReactElement[] = []
  let lastIndex = 0
  let match
  let citationCounter = 1
  
  while ((match = malformedCitationPattern.exec(text)) !== null) {
    const fullMatch = match[0]
    const matchStart = match.index
    const citationNumber = match[1]
    let url = match[2]
    
    // Add text before the citation
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart)
      parts.push(React.createElement('span', { key: `text-${lastIndex}` }, beforeText))
    }
    
    // Clean up the URL by removing placeholder numbers like [2], [4], etc.
    url = url.replace(/\[\d+\]/g, '')
    
    // Try to reconstruct proper URL if it's missing domain parts
    if (url.includes('//forecasts/') || url.includes('//content/')) {
      // These look like statista.com URLs
      if (!url.includes('statista.com')) {
        url = url.replace(/https?:\/\//, 'https://www.statista.com')
      }
    }
    
    // Ensure URL is valid
    if (!url.startsWith('http')) {
      url = 'https://' + url
    }
    
    // Create a proper citation link
    parts.push(
      React.createElement('a', {
        key: `citation-${citationCounter}`,
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'inline-flex items-center ml-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors',
        title: `Source: ${url}`
      }, `[${citationCounter}]`)
    )
    
    citationCounter++
    lastIndex = matchStart + fullMatch.length
  }
  
  // Add remaining text after the last citation
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    parts.push(React.createElement('span', { key: `text-${lastIndex}` }, remainingText))
  }
  
  // If no malformed citations were found, fall back to regular citation formatting
  if (parts.length === 0) {
    return formatTextWithCitations(text)
  }
  
  return React.createElement(React.Fragment, {}, ...parts)
}

/**
 * Handles markdown links wrapped in parentheses like ([link_text](url))
 * Converts them to clean text with proper citation links
 */
export function formatMarkdownCitations(text: string): React.ReactElement {
  if (!text) return React.createElement('span', { key: 'empty' }, '')
  
  // Pattern to match markdown links in parentheses: ([link_text](url))
  const markdownCitationPattern = /\(\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\)/g
  
  const parts: React.ReactElement[] = []
  let lastIndex = 0
  let match
  let citationCounter = 1
  
  while ((match = markdownCitationPattern.exec(text)) !== null) {
    const fullMatch = match[0]
    const matchStart = match.index
    const linkText = match[1]
    let url = match[2]
    
    // Add text before the citation
    if (matchStart > lastIndex) {
      const beforeText = text.substring(lastIndex, matchStart)
      parts.push(React.createElement('span', { key: `text-${lastIndex}` }, beforeText))
    }
    
    // Clean up the URL if needed
    if (!url.startsWith('http')) {
      url = 'https://' + url
    }
    
    // For short text (like competitor descriptions), just create a small citation link
    // For longer text, we can include the link text as context
    const isShortText = text.length < 200
    
    if (isShortText) {
      // Create a minimal citation link for short descriptions
      parts.push(
        React.createElement('a', {
          key: `citation-${citationCounter}`,
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'inline-flex items-center ml-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors',
          title: `Source: ${linkText}`
        }, `[${citationCounter}]`)
      )
    } else {
      // For longer text, include the link text as context
      parts.push(
        React.createElement('a', {
          key: `citation-${citationCounter}`,
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
          className: 'inline-flex items-center ml-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors',
          title: `Source: ${linkText} - ${url}`
        }, `[${citationCounter}]`)
      )
    }
    
    citationCounter++
    lastIndex = matchStart + fullMatch.length
  }
  
  // Add remaining text after the last citation
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex)
    parts.push(React.createElement('span', { key: `text-${lastIndex}` }, remainingText))
  }
  
  // If no markdown citations were found, try other citation formats
  if (parts.length === 0) {
    return fixMalformedCitations(text)
  }
  
  return React.createElement(React.Fragment, {}, ...parts)
}

/**
 * Universal citation formatter that handles multiple citation patterns
 * This should be the main function used in components
 */
export function formatAllCitations(text: string): React.ReactElement {
  if (!text) return React.createElement('span', { key: 'empty' }, '')
  
  // First try markdown citations in parentheses: ([link_text](url))
  const markdownPattern = /\(\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\)/g
  const hasMarkdownCitations = markdownPattern.test(text)
  markdownPattern.lastIndex = 0 // Reset regex
  
  if (hasMarkdownCitations) {
    return formatMarkdownCitations(text)
  }
  
  // Then try malformed citations: ([[1]](https://[2]/forecasts/...))
  const malformedPattern = /\(\[\[(\d+)\]\]\((https?:\/\/[^\)]+)\)\)/g
  const hasMalformedCitations = malformedPattern.test(text)
  malformedPattern.lastIndex = 0 // Reset regex
  
  if (hasMalformedCitations) {
    return fixMalformedCitations(text)
  }
  
  // Fall back to regular citation formatting
  return formatTextWithCitations(text)
} 