'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, ExternalLink, Brain, Upload, Loader, ChevronDown, ChevronUp } from 'lucide-react'

interface PerplexityWorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  prompt: string
  instructions: {
    step1: string
    step2: string
    step3: string
    step4: string
    step5: string
    step6: string
  }
  perplexityUrl: string
  brandName: string
  category: string
  website: string
  timeframe: string
  length: string
  pitchContext: string
  blendSubject?: string
  markets: string[]
  onProcessResults?: (results: string) => void
}

export default function PerplexityWorkflowModal({ 
  isOpen, 
  onClose, 
  prompt, 
  instructions, 
  perplexityUrl, 
  brandName,
  category,
  website,
  timeframe,
  length,
  pitchContext,
  blendSubject,
  markets,
  onProcessResults
}: PerplexityWorkflowModalProps) {
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedInstructions, setCopiedInstructions] = useState(false)
  const [perplexityResults, setPerplexityResults] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResultsSection, setShowResultsSection] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)

  const copyToClipboard = async (text: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const openPerplexity = () => {
    window.open(perplexityUrl, '_blank')
    setShowResultsSection(true)
  }

  const handleProcessResults = async () => {
    if (!perplexityResults.trim()) return

    setIsProcessing(true)
    
    try {
      // Call the API to process the Perplexity results and complete the analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website: website.trim(),
          brandName: brandName.trim() || website.replace(/https?:\/\//, '').replace(/www\./, '').split('.')[0],
          category: category.trim(),
          timeframe: timeframe,
          length: parseInt(length),
          pitchContext: pitchContext.trim(),
          blendSubject: blendSubject?.trim(),
          markets: markets.filter(m => m.trim() !== ''),
          researchProvider: 'gemini',
          geminiResults: perplexityResults.trim()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProcessingComplete(true)
        
        // Show success message with BigQuery status
        const bigQueryStatus = data.bigqueryId ? 'and saved to BigQuery' : '(BigQuery not configured)'
        alert(`✅ Analysis completed ${bigQueryStatus}!\n\nRedirecting to dashboard...`)
        
        // Call the parent callback if provided
        if (onProcessResults) {
          onProcessResults(perplexityResults.trim())
        }
        
        // Close modal after a brief delay to show success
        setTimeout(() => {
          onClose()
          // Reload the page to show the new results
          window.location.reload()
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process results')
      }
    } catch (error) {
      console.error('Error processing Perplexity results:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to process results. Please try again.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Brain className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Perplexity Deep Research</h2>
                    <p className="text-blue-100">Manual Workflow for {brandName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Instructions */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Quick Start Instructions</h3>
                  <button
                    onClick={() => copyToClipboard(Object.values(instructions).join('\n'), setCopiedInstructions)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copiedInstructions ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copiedInstructions ? 'Copied!' : 'Copy Steps'}</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(instructions).map(([step, instruction], index) => (
                    <div key={step} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 flex-1">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={openPerplexity}
                    className="flex items-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Open Perplexity</span>
                  </button>
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">Research Prompt</h3>
                  <button
                    onClick={() => copyToClipboard(prompt, setCopiedPrompt)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                  >
                    {copiedPrompt ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>
                
                <div className="bg-gray-100 p-4 rounded-lg">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                    {prompt}
                  </pre>
                </div>
              </div>

              {/* Results Input Section */}
              <AnimatePresence>
                {showResultsSection && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <div className="border-t pt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Paste Perplexity Results</h3>
                        <button
                          onClick={() => setShowResultsSection(false)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span className="text-sm">Hide</span>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">
                          After completing the research in Perplexity, copy the <strong>entire response</strong> (including any markdown formatting) and paste it below. The system will automatically extract the JSON data.
                        </p>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-blue-800 text-sm">
                            <strong>💡 Copy Tip:</strong> Select all text from Perplexity's response (Ctrl/Cmd+A), then copy (Ctrl/Cmd+C). 
                            Don't worry about markdown formatting - we'll handle that automatically.
                          </p>
                        </div>
                        
                        <textarea
                          value={perplexityResults}
                          onChange={(e) => setPerplexityResults(e.target.value)}
                          placeholder="Paste the complete JSON response from Perplexity here..."
                          className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {perplexityResults.trim() ? `${perplexityResults.trim().length} characters` : 'No content yet'}
                          </div>
                          
                          <button
                            onClick={handleProcessResults}
                            disabled={!perplexityResults.trim() || isProcessing}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                              !perplexityResults.trim() || isProcessing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : processingComplete
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isProcessing ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                              </>
                            ) : processingComplete ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Complete!</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Process Results</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Show Results Button when section is hidden */}
              {!showResultsSection && (
                <div className="mb-8 text-center">
                  <button
                    onClick={() => setShowResultsSection(true)}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Ready to paste results?</span>
                  </button>
                </div>
              )}

              {/* Footer Note */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> Copy the complete response from Perplexity (including any headers or markdown). 
                  Our system automatically extracts JSON from markdown code blocks, so you don't need to manually clean the response.
                  Once processed, the dashboard will update with your comprehensive brand analysis.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 