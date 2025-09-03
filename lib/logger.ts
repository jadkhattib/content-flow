const isDevelopment = process.env.NODE_ENV === 'development'
const isDebugEnabled = process.env.DEBUG === 'true' || isDevelopment

export const logger = {
  debug: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args)
    }
  },
  
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args)
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args)
  },
  
  // Safe logging for production - removes sensitive data
  safe: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[SAFE] ${message}`, data)
    } else {
      // In production, only log the message without data
      console.log(`[SAFE] ${message}`)
    }
  }
} 