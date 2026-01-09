# Workout Tracker

A modern workout tracking application with CrossFit WOD generator, progress charts, and Firebase authentication.

## Features

- 🏋️ **CrossFit WOD Generator**: Generate random workouts based on equipment (none/barbells/dumbbells) and difficulty level
- 📊 **Progress Charts**: Visualize your workout progress over time with interactive charts
- 📝 **Workout History**: View and search through your workout history with exercise details
- 🔐 **Firebase Authentication**: Secure login and data storage
- 🎨 **Modern UI**: Clean, dark theme with responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/u/0/project/workout-tracker-130ff/settings/general)
2. Get your Firebase configuration from Project Settings > General > Your apps
3. Replace the Firebase config in `main.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "workout-tracker-130ff.firebaseapp.com",
    projectId: "workout-tracker-130ff",
    storageBucket: "workout-tracker-130ff.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Enable Firebase Services

In Firebase Console:
- Enable **Authentication** > Sign-in method > Email/Password
- Enable **Firestore Database** > Create database (start in test mode, then add security rules)

### 4. Firestore Security Rules

Add these rules to Firestore:

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

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to GitHub Pages or Vercel.

## Deployment

### GitHub Pages

1. Build the project: `npm run build`
2. Push the `dist/` folder contents to your `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

## Project Structure

```
workout-tracker/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── main.js             # Main application logic
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
└── icon.png           # App icon
```

## Usage

1. **Sign Up/Login**: Click the "Login" button to create an account or sign in
2. **Generate WOD**: Go to "WOD Generator", select equipment and difficulty, then click "Generate WOD"
3. **Save Workouts**: After generating a WOD, click "Save Workout" to add it to your history
4. **View Progress**: Check the "Progress" page to see charts of your workout data
5. **Browse History**: Visit "History" to see all your past workouts with exercise details

## Technologies

- Vanilla JavaScript (ES6+)
- Firebase (Authentication & Firestore)
- Chart.js (Progress visualization)
- Vite (Build tool)
- Modern CSS (CSS Variables, Flexbox, Grid)

## License

MIT

