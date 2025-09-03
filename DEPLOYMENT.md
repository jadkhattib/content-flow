# 🚀 Perception.Flow - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Step 1: GitHub Repository Setup**

1. **Create GitHub Repository:**
   ```bash
   # Go to https://github.com/new
   # Repository name: perception-flow
   # Description: AI-powered brand perception analysis tool
   # Make it Public
   # Don't initialize with README (we already have one)
   ```

2. **Connect Local Repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/perception-flow.git
   git branch -M main
   git push -u origin main
   ```

### ✅ **Step 2: Environment Variables Setup**

#### **Required API Keys:**

1. **OpenAI API Key** (REQUIRED)
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Add to `.env.local`: `OPENAI_API_KEY=sk-proj-your-key-here`

2. **Perplexity API Key** (REQUIRED)
   - Go to https://www.perplexity.ai/settings/api
   - Generate new API key
   - Add to `.env.local`: `PERPLEXITY_API_KEY=pplx-your-key-here`

#### **Optional but Recommended:**

3. **Google Cloud BigQuery** (For data storage)
   - Create project at https://console.cloud.google.com/
   - Enable BigQuery API
   - Create service account and download JSON key
   - Add to `.env.local`:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
     GOOGLE_CLOUD_PROJECT_ID=your-project-id
     ```

4. **Brandwatch API** (For social listening)
   - Contact Brandwatch for API access
   - Add credentials to `.env.local`

### ✅ **Step 3: Fix Current Issues**

#### **Issue 1: Campaign Creation Error**
✅ **FIXED** - Updated `app/api/campaign-creation/route.ts` to handle non-string values properly.

#### **Issue 2: Perplexity Authentication**
- Verify your Perplexity API key is valid
- Check rate limits: https://docs.perplexity.ai/docs/rate-limits

#### **Issue 3: BigQuery Authentication**
```bash
# Option 1: Service Account (Recommended for production)
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account.json"

# Option 2: Application Default Credentials (Development)
gcloud auth application-default login
```

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add PERPLEXITY_API_KEY
   # Add other variables as needed
   ```

### **Option 2: Railway**

1. **Connect GitHub:**
   - Go to https://railway.app/
   - Connect your GitHub repository
   - Deploy from `main` branch

2. **Environment Variables:**
   - Add all required variables in Railway dashboard
   - Enable auto-deploys

### **Option 3: Supabase Edge Functions**

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Initialize and Deploy:**
   ```bash
   supabase init
   supabase functions deploy
   ```

## 🔧 Production Configuration

### **1. Update `next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  },
  images: {
    domains: ['your-domain.com']
  }
}
```

### **2. Update `package.json` scripts:**
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy:vercel": "vercel --prod",
    "deploy:railway": "railway up",
    "health-check": "curl -f http://localhost:3000/api/health || exit 1"
  }
}
```

### **3. Create Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
}
```

## 🐛 Troubleshooting Common Issues

### **1. "Repository not found" Error**
```bash
git remote -v  # Check current remotes
git remote remove origin
git remote add origin https://github.com/YOUR_ACTUAL_USERNAME/perception-flow.git
```

### **2. "401 Authorization Required" (Perplexity)**
- Verify API key format: `pplx-xxxxxxxx`
- Check billing status
- Ensure rate limits aren't exceeded

### **3. "trim is not a function" Error**
✅ **FIXED** - The campaign creation API now properly handles non-string values.

### **4. BigQuery "Project Id not found"**
```bash
# Set explicit project ID
export GOOGLE_CLOUD_PROJECT=your-project-id
# Or add to .env.local
echo "GOOGLE_CLOUD_PROJECT_ID=your-project-id" >> .env.local
```

### **5. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📊 Monitoring & Analytics

### **1. Set up Error Tracking:**
```bash
npm install @sentry/nextjs
```

### **2. Performance Monitoring:**
- Vercel Analytics (automatic)
- Google Analytics integration
- Custom metrics in BigQuery

### **3. API Rate Limit Monitoring:**
```typescript
// Add to your API routes
const rateLimiter = new Map()
// Implement rate limiting logic
```

## 🔒 Security Checklist

- [ ] All API keys in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced in production
- [ ] Security headers configured

## 🚀 Go Live Checklist

- [ ] GitHub repository created and code pushed
- [ ] Environment variables configured
- [ ] API keys tested and working
- [ ] Build successful (`npm run build`)
- [ ] Health check endpoint responding
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate active
- [ ] Error monitoring set up
- [ ] Backup strategy implemented

---

## 📞 Support

If you encounter issues:

1. Check the logs for specific error messages
2. Verify all environment variables are set
3. Ensure API keys have proper permissions
4. Test locally before deploying to production
5. Monitor the application after deployment

**Application Status:** ✅ Production Ready
**Last Updated:** December 2024 