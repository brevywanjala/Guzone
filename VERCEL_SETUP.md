# Vercel Deployment Setup Guide

## Required Environment Variables

You need to add these environment variables in your Vercel project settings:

### Firebase Configuration (Required for Google OAuth)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend API URL (Optional - if your backend is deployed)

```
VITE_API_URL=https://your-backend-api-url.com/api
```

## How to Get Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (guzone-3b9c6)
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** → **Web** (</> icon)
6. Copy the config values from the `firebaseConfig` object

## Vercel Project Settings

1. **Root Directory**: Set to `client` (this tells Vercel to deploy from the client directory)
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build` (automatically detected when root is `client`)
4. **Output Directory**: `dist` (automatically detected for Vite)
5. **Install Command**: `npm install` (default)

**Note**: Since you're deploying from the `client` directory directly, the `vercel.json` file is located in the `client` folder, and all paths are relative to that directory.

## After Adding Environment Variables

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. This will trigger a new build with the environment variables

## Troubleshooting

### Build Fails with "Firebase config not found"
- Make sure all 6 Firebase environment variables are set in Vercel
- Check that variable names start with `VITE_` (required for Vite)

### Build Succeeds but App Shows Errors
- Check browser console for specific errors
- Verify Firebase project has Google Authentication enabled
- Ensure authorized domains include your Vercel domain

### API Calls Fail
- Set `VITE_API_URL` to your backend API URL
- Ensure CORS is configured on your backend to allow your Vercel domain

