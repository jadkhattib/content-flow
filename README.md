# 🎯 Perception.Flow

> **AI-Powered Brand Perception Analysis with Role-Based Access Control**  
> Transform any website into comprehensive brand intelligence with advanced AI analysis, social listening, competitive insights, and secure multi-user collaboration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jadkhattib/discover-flow)
[![Deploy to Cloud Run](https://cloud.google.com/run/docs/deploying)](https://cloud.google.com/run/docs/deploying)

## ✨ Key Features

### 🔐 **Role-Based Access Control (RBAC)**
- **Admin Dashboard**: Full access to all analyses, user management, and permission granting
- **Regular User Dashboard**: Access only to specifically granted analyses
- **Cloud Run Authentication**: Automatic user identification via Google Cloud headers
- **BigQuery-Backed Permissions**: Scalable user roles and analysis access management

### 📊 **Comprehensive Brand Analysis**
- **Executive Snapshot**: Company info, business model, and strategic overview
- **Brand X-Ray**: Deep dive into brand positioning and market perception  
- **Audience Analysis**: Detailed consumer psychology and demographics
- **Competitive Intelligence**: Market positioning and competitive landscape
- **Culture & Context**: Cultural trends and market opportunities
- **Strategic Opportunities**: Prioritized, actionable recommendations

### 🚀 **AI-Powered Campaign Creation**
- **Auto Mode**: Fully automated campaign generation with o4-mini reasoning
- **Guided Mode**: Step-by-step campaign building with AI assistance
- **Export Options**: Save campaigns to BigQuery with full metadata
- **Campaign Viewing**: Dedicated pages for campaign review and sharing

### 🤖 **Advanced AI Workflow**
- **Perplexity Integration**: Deep web research with automated prompts
- **Gemini Integration**: Alternative AI research workflow
- **OpenAI GPT-4**: Advanced reasoning and structured analysis
- **Citation Management**: Automatic source tracking and formatting

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI/UX**: Lucide React icons, Recharts, Framer Motion animations
- **AI**: OpenAI GPT-4, Perplexity API, Google Gemini
- **Data**: Google BigQuery for storage and analytics
- **Authentication**: Google Cloud Run identity headers
- **Security**: Production-safe logging, XSS protection, input validation
- **Deployment**: Google Cloud Run, Vercel compatible

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/jadkhattib/discover-flow.git
cd discover-flow
npm install
```

### 2. Environment Setup

```bash
cp env.example .env.local
```

**Required Environment Variables:**
```bash
# Essential APIs (REQUIRED)
OPENAI_API_KEY=sk-proj-your-openai-key-here
PERPLEXITY_API_KEY=pplx-your-perplexity-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# BigQuery Configuration (REQUIRED for RBAC)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
BIGQUERY_DATASET_ID=content_df
BIGQUERY_TABLE_ID=perception
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Optional APIs
BRANDWATCH_TOKEN=your-brandwatch-token
BRANDWATCH_USERNAME=your-username
BRANDWATCH_PASSWORD=your-password
```

### 3. BigQuery Setup (Required for RBAC)

1. **Create Google Cloud Project**
2. **Enable BigQuery API**
3. **Create Service Account** with BigQuery permissions
4. **Create Dataset and Tables**:
   ```sql
   -- Main analysis table
   CREATE TABLE `your-project.content_df.perception` (
     client_name STRING,
     analysis JSON,
     created_at TIMESTAMP,
     brand_name STRING,
     category STRING,
     website STRING
   );
   
   -- User roles table (auto-created)
   -- Analysis permissions table (auto-created)
   ```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 🌐 Production Deployment

### Deploy to Google Cloud Run (Recommended)

1. **Setup Google Cloud Project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud services enable run.googleapis.com
   gcloud services enable bigquery.googleapis.com
   ```

2. **Configure Authentication**
   - Enable Cloud Run with authentication required
   - Users will be automatically authenticated via Google accounts
   - See `GOOGLE_AUTH_SETUP.md` for detailed setup

3. **Deploy with Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

4. **Environment Variables**
   ```bash
   gcloud run services update YOUR_SERVICE \
     --set-env-vars="OPENAI_API_KEY=your-key" \
     --set-env-vars="PERPLEXITY_API_KEY=your-key" \
     --set-env-vars="GOOGLE_APPLICATION_CREDENTIALS_JSON='{...}'"
   ```

### Deploy to Vercel

1. **Connect Repository**
   - Import from GitHub to Vercel
   - Configure environment variables
   - Deploy automatically

2. **Required Environment Variables**
   ```bash
   OPENAI_API_KEY=your-openai-key
   PERPLEXITY_API_KEY=your-perplexity-key
   GOOGLE_APPLICATION_CREDENTIALS_JSON=your-service-account-json
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

## 🔧 User Management

### Initial Admin Setup

1. **Set Initial Admin** (one-time setup):
   ```bash
   curl -X POST https://your-domain.com/api/setup-admin
   ```

2. **Grant Analysis Access**:
   - Admin users can grant access to specific analyses
   - Regular users see only permitted analyses
   - Permissions are stored in BigQuery

### Automated Setup

For new deployments, use the quick-setup endpoint:
```bash
curl -X POST https://your-domain.com/api/quick-setup
```

This automatically:
- Creates necessary BigQuery tables
- Grants current user access to existing analyses
- Verifies permissions are working

## 📊 API Documentation

### Core Analysis
- `POST /api/analyze` - Generate brand analysis
- `GET /api/analyses` - List all analyses (admin only)
- `POST /api/analyses` - Get analysis by brand name

### User & Role Management
- `GET /api/user-role` - Get current user's role
- `POST /api/user-role` - Set user role (admin only)
- `GET /api/analysis-permissions` - Get user's accessible analyses
- `POST /api/analysis-permissions` - Grant analysis access (admin only)

### Campaign Creation
- `POST /api/campaign-creation` - Generate marketing campaigns
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/[id]` - Get specific campaign

### Sharing (Legacy)
- `POST /api/shares` - Create analysis share
- `GET /api/shares/[id]` - Access shared analysis
- `DELETE /api/shares/[id]` - Revoke share

### Utility
- `GET /api/health` - Health check
- `POST /api/migrate-permissions` - Migrate old permissions
- `POST /api/quick-setup` - Automated BigQuery setup

## 🏗 Project Structure

```
discover-flow/
├── app/
│   ├── components/              # React components
│   │   ├── sections/           # Analysis sections
│   │   │   ├── ExecutiveSnapshot.tsx
│   │   │   ├── BrandXRay.tsx
│   │   │   ├── Audience.tsx
│   │   │   ├── CategoryCompetition.tsx
│   │   │   ├── CultureContext.tsx
│   │   │   ├── StrategicOpportunities.tsx
│   │   │   ├── CampaignCreation.tsx
│   │   │   └── AIChat.tsx
│   │   ├── AnalysisDashboard.tsx    # Main analysis viewer
│   │   ├── ShareManagement.tsx      # Legacy sharing
│   │   ├── PerplexityWorkflowModal.tsx
│   │   └── GeminiWorkflowModal.tsx
│   ├── api/                     # API routes
│   │   ├── analyze/            # Main analysis endpoint
│   │   ├── campaign-creation/  # Campaign generation
│   │   ├── user-role/         # Role management
│   │   ├── analysis-permissions/ # Access control
│   │   ├── shares/            # Legacy sharing
│   │   └── quick-setup/       # Automated setup
│   ├── analysis/              # Analysis viewing pages
│   ├── campaign-creation/     # Campaign creation pages
│   ├── campaign-view/         # Campaign viewing pages
│   ├── history/               # Analysis history
│   ├── admin/                 # Admin tools
│   ├── hooks/                 # React hooks
│   └── page.tsx               # Main app with RBAC routing
├── lib/
│   ├── bigquery.ts            # BigQuery service
│   ├── logger.ts              # Production-safe logging
│   ├── citationUtils.ts       # Citation management
│   └── domain.ts              # Domain utilities
├── docs/                      # Documentation
│   ├── DEPLOYMENT.md
│   ├── BIGQUERY_SETUP.md
│   └── GOOGLE_AUTH_SETUP.md
└── scripts/                   # Deployment scripts
```

## 🔒 Security Features

### Authentication & Authorization
- **Cloud Run Identity**: Automatic user authentication via Google Cloud
- **Role-Based Access**: Admin and Regular user roles with different permissions
- **Analysis-Level Permissions**: Granular control over which analyses users can access
- **BigQuery-Backed Security**: All permissions stored securely in BigQuery

### Input Security
- **XSS Protection**: Safe React element rendering instead of `dangerouslySetInnerHTML`
- **SQL Injection Prevention**: Parameterized BigQuery queries throughout
- **Input Validation**: Sanitized user inputs and API responses
- **Error Handling**: Production-safe error messages that don't leak system information

### Production Hardening
- **Conditional Logging**: Development-only debug logs, production-only error logs
- **Sensitive Data Masking**: User emails and sensitive data masked in logs
- **Environment Separation**: Different logging levels for development and production
- **Security Headers**: Comprehensive security headers in production builds

## 📈 Performance Optimizations

- **Server-Side Rendering**: Fast initial page loads with Next.js
- **BigQuery Optimization**: Efficient queries with proper indexing
- **Bundle Splitting**: Optimized JavaScript bundles
- **Image Optimization**: Automatic image compression
- **Caching Strategies**: Intelligent API response caching
- **Production Logging**: Minimal logging overhead in production

## 🧪 Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run type-check      # TypeScript type checking
npm run lint            # ESLint checking
npm run lint:fix        # Auto-fix linting issues

# Analysis
npm run analyze         # Bundle analyzer
npm run clean           # Clean build artifacts
```

## 🔄 Recent Updates

### v1.0.0 - Security Hardening & RBAC
- ✅ **Complete RBAC System**: Admin and Regular user roles
- ✅ **Security Fixes**: XSS vulnerability patched, production-safe logging
- ✅ **Code Cleanup**: Removed 13 unused files, 1,729 lines of dead code
- ✅ **BigQuery Integration**: User roles and permissions system
- ✅ **Cloud Run Authentication**: Seamless Google Cloud identity integration
- ✅ **Production Hardening**: Logger utility, error handling improvements

### Core Features
- ✅ **Campaign Creation**: AI-powered marketing campaign generation
- ✅ **Analysis Sharing**: Legacy sharing system for external collaboration
- ✅ **Multi-AI Workflow**: Perplexity, Gemini, and OpenAI integration
- ✅ **Comprehensive Analytics**: 8 analysis sections with rich visualizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Setup Help**: See `DEPLOYMENT.md`, `BIGQUERY_SETUP.md`, `GOOGLE_AUTH_SETUP.md`

## 🎉 Acknowledgments

- OpenAI for GPT-4 API and advanced reasoning capabilities
- Perplexity for deep web research and citation tracking
- Google Cloud for BigQuery, Cloud Run, and authentication services
- Next.js team for the exceptional React framework
- The open-source community for all the amazing tools and libraries

---

**Built with ❤️ for agencies and marketing teams who need comprehensive brand intelligence**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
# content-flow
