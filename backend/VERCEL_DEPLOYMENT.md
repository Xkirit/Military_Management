# Vercel Backend Deployment Guide

## Prerequisites
1. Vercel account (free tier available)
2. MongoDB Atlas database (or any MongoDB instance)
3. GitHub repository with your backend code

## Step 1: Prepare Your Repository
Your backend is now ready for Vercel deployment with the following files:
- `vercel.json` - Vercel configuration
- `src/server.js` - Modified to export the Express app
- `package.json` - Contains all dependencies

## Step 2: Environment Variables
Set these environment variables in your Vercel dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from backend directory
cd backend
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: military-management-backend
# - Directory: ./
# - Override settings? N
```

### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

## Step 4: Update Frontend Configuration
After deployment, update your frontend's API URL:

1. Get your Vercel backend URL (e.g., `https://military-management-backend.vercel.app`)
2. Update `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-actual-vercel-url.vercel.app/api';
   ```
3. Or set `VITE_API_URL` environment variable in your frontend Vercel project

## Step 5: Update CORS Configuration
Update the CORS configuration in `backend/src/server.js` with your actual frontend URL:
```javascript
'https://your-actual-frontend-url.vercel.app' // Replace with your actual Vercel app URL
```

## Benefits of Vercel vs Render
- **Faster cold starts**: Vercel's edge functions start faster
- **Global CDN**: Better performance worldwide
- **Automatic HTTPS**: Built-in SSL certificates
- **Git integration**: Automatic deployments on push
- **Preview deployments**: Each PR gets its own URL
- **Better free tier**: More generous limits

## Monitoring and Logs
- View logs in Vercel dashboard under "Functions" tab
- Monitor performance and errors
- Set up alerts for downtime

## Troubleshooting
1. **Cold starts**: First request might be slower (normal for serverless)
2. **Timeout issues**: Vercel has 10s timeout for hobby plan, 60s for pro
3. **Database connections**: Use connection pooling for MongoDB
4. **CORS errors**: Ensure frontend URL is in allowedOrigins array 