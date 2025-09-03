# Google Authentication Setup for Profile Pictures 👤

The AI Chat feature now supports Google profile pictures! This guide explains how to set up authentication for your deployment method.

## ✨ Features Added

- **Real Google Profile Pictures**: Users see their actual Google account photos in chat
- **Multiple Auth Methods**: Supports Cloud Run IAM, OAuth 2.0, and development mode
- **Automatic Fallbacks**: Gracefully handles missing profile pictures with generated avatars
- **User Information Display**: Shows logged-in user's name/email in chat header

## 🚀 Setup Methods

### Method 1: Cloud Run with IAM Authentication (Recommended for Production)

If you're already using Cloud Run with Google IAM authentication, the profile pictures will work automatically! The system reads user information from Google Cloud IAM headers.

**How it works:**
- Google Cloud Run automatically adds headers: `x-goog-authenticated-user-email` and `x-goog-authenticated-user-id`
- The `/api/user` endpoint extracts user information from these headers
- Profile pictures are generated based on the user's email/name

**Configuration:**
```bash
# No additional environment variables needed
# IAM headers are automatically provided by Cloud Run
```

**Cloud Run Authentication Setup:**
1. Ensure your Cloud Run service has IAM authentication enabled
2. Users must be authenticated with Google to access the application
3. The system will automatically detect and use their Google account information

### Method 2: Google OAuth 2.0 (For Other Deployments)

For Vercel, Railway, or other platforms, set up Google OAuth to get profile pictures.

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Click **"Create Credentials" > "OAuth 2.0 Client IDs"**
4. Configure the OAuth consent screen if prompted
5. Set **Application type** to "Web application"
6. Add your domain to **Authorized redirect URIs**:
   ```
   https://your-domain.com/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback  # For development
   ```

#### Step 2: Environment Variables

Add these to your `.env.local` or deployment environment:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

#### Step 3: OAuth Flow Implementation

The system provides several OAuth endpoints:

```bash
# Get Google authentication URL
GET /api/auth/google?action=login

# Handle OAuth callback (automatic)
POST /api/auth/google

# Logout
GET /api/auth/google?action=logout

# Get current user info
GET /api/user
```

### Method 3: Development Mode

For local development, the system automatically provides a mock user with a generated avatar.

```bash
NODE_ENV=development
# No additional setup required
```

## 🎯 How It Works

### User Avatar Priority

The system tries multiple methods to get the user's profile picture:

1. **Google Profile Picture** (OAuth): Real photo from Google account
2. **Generated Avatar** (IAM): Custom avatar based on user's name/email
3. **Fallback Icon** (Default): Generic user icon if all else fails

### AI Chat Integration

The updated AI Chat component:

- **Fetches user info** when the component loads
- **Displays profile pictures** instead of generic user icons
- **Shows user information** in the chat header
- **Handles loading states** with skeleton placeholders
- **Graceful error handling** with fallback avatars

### API Endpoints

#### `/api/user` - Get Current User
```typescript
// Response format
{
  success: true,
  user: {
    name: "John Doe",
    email: "john@company.com",
    picture: "https://lh3.googleusercontent.com/...",
    sub: "user-id"
  },
  authenticated: true,
  method: "cloud-iam" | "oauth-cookie" | "oauth-bearer" | "development"
}
```

#### `/api/auth/google` - OAuth Authentication
```typescript
// Get auth URL
GET /api/auth/google?action=login

// Exchange code for token
POST /api/auth/google
{
  "code": "authorization-code-from-google"
}
```

## 🔧 Configuration Examples

### Vercel Deployment

```bash
# Vercel environment variables
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### Railway Deployment

Add in Railway dashboard:
```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your-secret
```

### Docker/Cloud Run

```yaml
# cloudbuild.yaml
- name: 'gcr.io/cloud-builders/gcloud'
  args:
  - 'run'
  - 'deploy'
  - 'perception-flow'
  - '--set-env-vars'
  - 'GOOGLE_CLIENT_ID=your-client-id,GOOGLE_CLIENT_SECRET=your-client-secret'
```

## 🐛 Troubleshooting

### Common Issues

**No profile picture showing:**
- Check if `lh3.googleusercontent.com` is allowed in `next.config.js`
- Verify OAuth credentials are correct
- Check browser console for CORS errors

**"Authentication failed" error:**
- Verify redirect URI matches exactly in Google Console
- Check that OAuth consent screen is configured
- Ensure client secret is correct

**Profile picture not loading:**
- The system will automatically fall back to generated avatars
- Check network tab for image loading errors
- Verify image domains are configured in Next.js

### Debug Mode

Enable debug logging by checking the browser console and API responses:

```javascript
// Check user authentication status
fetch('/api/user').then(r => r.json()).then(console.log)

// Get OAuth URL for manual testing
fetch('/api/auth/google?action=login').then(r => r.json()).then(console.log)
```

## 🔒 Security Considerations

- **HTTPS Required**: OAuth only works over HTTPS in production
- **Secure Cookies**: Tokens are stored in httpOnly cookies when possible
- **Token Validation**: All Google tokens are verified before use
- **Fallback Safety**: System works even if authentication fails

## 📱 User Experience

- **Instant Recognition**: Users see their familiar profile picture
- **Professional Look**: Real photos create a more personal chat experience
- **Smooth Loading**: Skeleton states prevent layout shifts
- **Error Resilience**: Graceful fallbacks ensure chat always works

## 🚀 Next Steps

1. **Deploy your chosen authentication method**
2. **Test the user experience** by accessing the AI Chat
3. **Verify profile pictures** are loading correctly
4. **Monitor authentication logs** for any issues

The profile picture feature enhances the user experience while maintaining backward compatibility with all deployment methods! 