#!/bin/bash

echo "🚀 Deploying backend to Vercel..."

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to production
echo "📦 Deploying to production..."
vercel --prod --yes

echo "✅ Deployment complete!"
echo "🌐 Your API is available at: https://military-management-nyce.vercel.app" 