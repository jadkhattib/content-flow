/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: [
      'localhost', 
      'lh3.googleusercontent.com', // Google profile pictures
      'lh4.googleusercontent.com', // Google profile pictures
      'lh5.googleusercontent.com', // Google profile pictures
      'lh6.googleusercontent.com', // Google profile pictures
      'ui-avatars.com'             // Generated avatar service
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Webpack configuration for production optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // Output configuration for deployment
  // output: 'standalone',
  
  // Compression
  compress: true,
  
  // Experimental features
  experimental: {
    // Enable app directory
    serverComponentsExternalPackages: ['@google-cloud/bigquery'],
  },
}

module.exports = nextConfig 