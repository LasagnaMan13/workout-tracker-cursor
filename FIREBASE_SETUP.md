# Firebase Setup Guide

## Step 1: Get Your Firebase Config

1. Go to: https://console.firebase.google.com/u/0/project/workout-tracker-130ff/settings/general
2. Scroll down to "Your apps" section
3. If you don't have a web app yet:
   - Click the `</>` (web) icon
   - Give it a nickname (e.g., "Workout Tracker Web")
   - Click "Register app"
4. Copy the config values you see (they look like this):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "workout-tracker-130ff.firebaseapp.com",
     projectId: "workout-tracker-130ff",
     storageBucket: "workout-tracker-130ff.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## Step 2: Enable Authentication

1. Go to: https://console.firebase.google.com/u/0/project/workout-tracker-130ff/authentication
2. Click "Get started" if you see it
3. Go to the "Sign-in method" tab
4. Click on "Email/Password"
5. Toggle "Enable" to ON
6. Click "Save"

## Step 3: Enable Firestore Database

1. Go to: https://console.firebase.google.com/u/0/project/workout-tracker-130ff/firestore
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules next)
4. Choose a location (pick the one closest to you)
5. Click "Enable"

## Step 4: Add Security Rules

1. Still in Firestore, go to the "Rules" tab
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /workouts/{workoutId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```
3. Click "Publish"

## Step 5: Update main.js

Once you have your Firebase config values, update `main.js` around line 10 with your actual values.


