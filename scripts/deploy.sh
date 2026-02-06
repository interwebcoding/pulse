#!/bin/bash

# pulse Deployment Script
# Run this on the Nuc server

set -e

echo "🚀 Deploying pulse..."

# Navigate to project directory
cd ~/hosted-stack/pulse

# Pull latest changes
echo "📦 Pulling latest code..."
git pull

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --include=dev

# Install frontend dependencies and build
echo "📦 Building frontend..."
cd ../frontend
npm install --include=dev
npm run build

# Create logs directory
mkdir -p ../logs

# Restart PM2
echo "🔄 Restarting PM2..."
cd ..
pm2 restart pulse-api || pm2 start ecosystem.config.js

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status pulse-api
echo ""
echo "🌐 pulse API running on port 3000"
echo "📊 Check logs: pm2 logs pulse-api"
