'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, User, Loader2, Trash2 } from 'lucide-react'
import BotIcon from '@/app/components/icons/BotIcon'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatProps {
  data: {
    brandName: string
    category: string
    structuredAnalysis?: any
    fullAnalysis?: string
    socialData?: any
  }
}

export default function AIChat({ data }: AIChatProps) {
  // Create a unique key for this brand's chat history
  const chatStorageKey = `aiChat_${data.brandName}_${data.category}`
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChat = localStorage.getItem(chatStorageKey)
    if (savedChat) {
      try {
        const parsedChat = JSON.parse(savedChat)
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedChat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(messagesWithDates)
        setIsInitialized(parsedChat.isInitialized || false)
      } catch (error) {
        console.error('Failed to load chat history:', error)
        // Fall back to default welcome message
        setMessages([{
          id: '1',
          type: 'assistant',
          content: `Hello! What would you like to learn about ${data.brandName}?`,
          timestamp: new Date()
        }])
      }
    } else {
      // Set default welcome message for new chats
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hello! What would you like to learn about ${data.brandName}?`,
        timestamp: new Date()
      }])
    }
  }, [chatStorageKey, data.brandName])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatData = {
        messages,
        isInitialized,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(chatStorageKey, JSON.stringify(chatData))
    }
  }, [messages, isInitialized, chatStorageKey])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const clearChat = () => {
    if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      const welcomeMessage = {
        id: '1',
        type: 'assistant' as const,
        content: `Hello! What would you like to learn about ${data.brandName}?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setIsInitialized(false)
      localStorage.removeItem(chatStorageKey)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare conversation history for API (last 10 messages excluding the current one)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue.trim(),
          brandData: data,
          isInitialized: isInitialized,
          conversationHistory: conversationHistory
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      
      if (!isInitialized) {
        setIsInitialized(true)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-200px)] flex flex-col"
    >
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BotIcon className="w-8 h-8" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-brand-dark">AI Chat</h1>
              <p className="text-gray-600">Chat with AI about {data.brandName} analysis</p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  {message.type === 'user' ? (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <BotIcon className="w-8 h-8" size={32} />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 max-w-full ${
                      message.type === 'user'
                        ? 'bg-brand-accent text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="flex-shrink-0">
                  <BotIcon className="w-8 h-8" size={32} />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask me anything about ${data.brandName}...`}
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0 w-12 h-12 bg-brand-accent text-white rounded-full flex items-center justify-center hover:bg-brand-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "What are the main challenges facing this brand?",
              "Who are the top competitors?",
              "What's the target audience like?",
              "What opportunities exist in the market?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 