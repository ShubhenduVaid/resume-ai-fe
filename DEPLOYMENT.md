# Production Deployment Guide

This guide explains how to deploy the Resume Builder application to production.

## Prerequisites

1. **OAuth Applications Setup**
   - Google OAuth: [Google Cloud Console](https://console.cloud.google.com/)
   - Apple OAuth: [Apple Developer Portal](https://developer.apple.com/)
   - LinkedIn OAuth: [LinkedIn Developer Portal](https://developer.linkedin.com/)

2. **Backend Services**
   - AI API service for resume processing
   - Payment processor (Stripe recommended)
   - User authentication service
   - Database for user data and resume storage

## Environment Configuration

1. Copy `.env.example` to `.env.production`
2. Fill in all required environment variables:

```bash
# Authentication
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_APPLE_CLIENT_ID=your_apple_client_id
REACT_APP_LINKEDIN_CLIENT_ID=your_linkedin_client_id

# API Endpoints
REACT_APP_API_URL=https://api.yourapp.com
REACT_APP_AI_API_URL=https://ai.yourapp.com

# Payment
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

NODE_ENV=production
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `https://yourapp.com/auth/callback`

### Apple OAuth

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID
3. Enable Sign In with Apple
4. Configure redirect URLs: `https://yourapp.com/auth/callback`

### LinkedIn OAuth

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Create a new application
3. Add redirect URLs: `https://yourapp.com/auth/callback`
4. Request access to required scopes

## Backend API Requirements

Your backend should implement these endpoints:

### Authentication

- `POST /auth/oauth/callback` - Handle OAuth callbacks
- `POST /auth/refresh` - Refresh access tokens
- `DELETE /auth/logout` - Handle logout

### AI Processing

- `POST /ai/chat` - Process chat messages and update resume
- `POST /ai/improve` - AI-powered resume improvement

### Payments

- `POST /payments/create-checkout-session` - Create Stripe checkout
- `POST /payments/webhook` - Handle payment webhooks
- `GET /payments/verify` - Verify payment status

### User Management

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/credits` - Get credit balance

## Build and Deploy

1. **Build the application:**

```bash
npm run build
```

2. **Deploy to your hosting platform:**

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Upload build/ folder to Netlify
```

### AWS S3 + CloudFront

```bash
aws s3 sync build/ s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Production Checklist

- [ ] All OAuth applications configured with production URLs
- [ ] Environment variables set in production
- [ ] Backend API deployed and accessible
- [ ] Database configured and secured
- [ ] Payment processor configured (Stripe webhooks)
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Error monitoring setup (Sentry recommended)
- [ ] Analytics configured (Google Analytics)
- [ ] Rate limiting implemented on API
- [ ] CORS configured properly
- [ ] Security headers configured

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive keys to version control
   - Use platform-specific environment variable management

2. **API Security**
   - Implement proper authentication on all API endpoints
   - Use HTTPS everywhere
   - Validate and sanitize all inputs
   - Implement rate limiting

3. **OAuth Security**
   - Use secure redirect URIs (HTTPS only)
   - Validate state parameters
   - Implement CSRF protection

## Monitoring and Maintenance

1. **Error Tracking**
   - Set up Sentry or similar error tracking
   - Monitor API response times
   - Track user engagement metrics

2. **Performance**
   - Monitor bundle size
   - Implement caching strategies
   - Use CDN for static assets

3. **Updates**
   - Regular dependency updates
   - Security patch management
   - Feature deployment pipeline

## Support

For production deployment support, please refer to:

- [React deployment guide](https://create-react-app.dev/docs/deployment/)
- [OAuth provider documentation](https://oauth.net/2/)
- [Stripe integration guide](https://stripe.com/docs)
