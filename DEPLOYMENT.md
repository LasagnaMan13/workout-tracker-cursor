# Deployment Guide

## Quick Deploy to Vercel

Your workout tracker is now ready to deploy as a PWA! Here's how:

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts - it will ask:
   - Link to existing project? (Say yes if you already have the Vercel project)
   - Project name: `workout-tracker`
   - Directory: `./` (current directory)
   - Override settings? No (defaults are fine)

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub + Vercel Dashboard

1. **Initialize Git** (if not done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Workout Tracker with PWA support"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `workout-tracker`)
   - Don't initialize with README (you already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to Vercel**:
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"

## PWA Installation

Once deployed, users can install the app on their phones:

### iOS (Safari):
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome):
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home screen" or "Install app"
4. Tap "Install"

## What's Included

✅ **PWA Manifest** - App can be installed on home screen
✅ **Service Worker** - Offline support (caches app files)
✅ **Mobile Optimized** - Responsive design for all screen sizes
✅ **Vercel Config** - Ready for deployment
✅ **Mobile Viewport** - Proper scaling on mobile devices

## Build Command

The build command for Vercel is automatically detected:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## Environment Variables

If you need to add environment variables in Vercel:
1. Go to Project Settings → Environment Variables
2. Add any Firebase config if needed (though it's already in main.js)

## Updating the App

After making changes:
```bash
git add .
git commit -m "Update description"
git push
```

Vercel will automatically redeploy on every push to main branch!

