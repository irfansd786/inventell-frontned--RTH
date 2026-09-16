// Firebase Single Initialization Module
// Configured via environment variables in frontend/.env
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Singleton Firebase App
let app = null;
let auth = null;

const hasApiKey = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.trim().length > 10;

if (hasApiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
  } catch (err) {
    // Don't crash the app in production if Firebase initialization fails.
    // Log the error for debugging and continue without auth features.
    // eslint-disable-next-line no-console
    console.error('Firebase initialization failed:', err);
    app = null;
    auth = null;
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firebase API key not found. Skipping Firebase initialization.');
}

export { app, auth };
export default app;
