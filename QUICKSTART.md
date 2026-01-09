# Quick Start Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Firebase

1. Go to your Firebase Console: https://console.firebase.google.com/u/0/project/workout-tracker-130ff/settings/general

2. Scroll down to "Your apps" section and copy your Firebase config

3. Open `main.js` and replace the Firebase config (around line 13):
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY_HERE",
       authDomain: "workout-tracker-130ff.firebaseapp.com",
       projectId: "workout-tracker-130ff",
       storageBucket: "workout-tracker-130ff.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
       appId: "YOUR_APP_ID_HERE"
   };
   ```

## Step 3: Enable Firebase Services

### Enable Authentication:
1. Go to Firebase Console > Authentication
2. Click "Get Started" if not already enabled
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider

### Enable Firestore:
1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Start in "Test mode" (we'll add security rules next)
4. Choose a location closest to you

### Add Security Rules:
1. Go to Firestore Database > Rules tab
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

## Step 4: Run the App
```bash
npm run dev
```

The app will open at http://localhost:3000

## Step 5: Test It Out!

1. **Create an account**: Click "Login" > "Sign up" to create a new account
2. **Generate a WOD**: Go to "WOD Generator", select equipment and difficulty, click "Generate WOD"
3. **Save a workout**: Click "Save Workout" to add it to your history
4. **View progress**: Check the "Progress" page to see your charts
5. **Browse history**: Visit "History" to see all your workouts

## Troubleshooting

- **Firebase errors**: Make sure you've copied your config correctly and enabled Authentication and Firestore
- **Charts not showing**: Make sure you have some saved workouts first
- **Can't save workouts**: Make sure you're logged in and Firestore security rules are set correctly

## Deploy to Production

### Vercel:
```bash
npm run build
vercel
```

### GitHub Pages:
```bash
npm run build
# Copy contents of dist/ folder to gh-pages branch
```

