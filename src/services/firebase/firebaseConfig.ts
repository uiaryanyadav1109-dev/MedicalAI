/**
 * Medical AI — Firebase Client Initialization & Configuration
 *
 * Configures the official Firebase JavaScript SDK for Google OAuth authentication.
 * Uses environment variables prefixed with VITE_ to keep client credentials safe.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

/**
 * Retrieves client-safe Firebase configuration from Vite environment variables.
 */
export function getFirebaseConfig(): FirebaseClientConfig {
  const env =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env
      : typeof process !== 'undefined' && (process as any).env
      ? (process as any).env
      : ({} as Record<string, string>);

  const getValid = (val: any, fallback: string) => {
    if (!val || typeof val !== 'string') return fallback;
    const clean = val.trim();
    if (!clean || clean.includes('YOUR_FIREBASE') || clean.includes('your-app-id')) {
      return fallback;
    }
    return clean;
  };

  return {
    apiKey: getValid(env.VITE_FIREBASE_API_KEY, 'AIzaSyBptim7GduYiPxLH_qmD3bi5p2qgrHWa7w'),
    authDomain: getValid(env.VITE_FIREBASE_AUTH_DOMAIN, 'medicalai-2b4a7.firebaseapp.com'),
    projectId: getValid(env.VITE_FIREBASE_PROJECT_ID, 'medicalai-2b4a7'),
    storageBucket: getValid(env.VITE_FIREBASE_STORAGE_BUCKET, 'medicalai-2b4a7.firebasestorage.app'),
    messagingSenderId: getValid(env.VITE_FIREBASE_MESSAGING_SENDER_ID, '331178919212'),
    appId: getValid(env.VITE_FIREBASE_APP_ID, '1:331178919212:web:68a8541091a1dd71b95889'),
    measurementId: getValid(env.VITE_FIREBASE_MEASUREMENT_ID, 'G-H7TG75GTXZ')
  };
}

/**
 * Validates whether required Firebase configuration parameters are present.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.apiKey.startsWith('AIza') &&
    config.authDomain &&
    config.authDomain.includes('firebaseapp.com') &&
    config.projectId &&
    config.projectId.length > 2
  );
}

let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let googleAuthProviderInstance: GoogleAuthProvider | null = null;

/**
 * Initializes and retrieves the Firebase App singleton instance.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  if (getApps().length > 0) {
    firebaseAppInstance = getApp();
    return firebaseAppInstance;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const config = getFirebaseConfig();
    firebaseAppInstance = initializeApp(config);
    return firebaseAppInstance;
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase App:', error);
    return null;
  }
}

/**
 * Retrieves the Firebase Auth singleton instance.
 */
export function getFirebaseAuth(): Auth | null {
  if (firebaseAuthInstance) {
    return firebaseAuthInstance;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    firebaseAuthInstance = getAuth(app);
    return firebaseAuthInstance;
  } catch (error) {
    console.error('[Firebase] Error initializing Firebase Auth:', error);
    return null;
  }
}

/**
 * Configures and retrieves the Google Auth Provider instance.
 */
export function getGoogleAuthProvider(): GoogleAuthProvider {
  if (!googleAuthProviderInstance) {
    googleAuthProviderInstance = new GoogleAuthProvider();
    // Request standard profile and email scopes
    googleAuthProviderInstance.addScope('profile');
    googleAuthProviderInstance.addScope('email');
    // Prompt user to select account when needed
    googleAuthProviderInstance.setCustomParameters({
      prompt: 'select_account'
    });
  }
  return googleAuthProviderInstance;
}
