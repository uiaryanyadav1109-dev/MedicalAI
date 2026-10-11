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

  const getClean = (val: any): string => {
    if (!val || typeof val !== 'string') return '';
    const clean = val.trim();
    if (!clean || clean.includes('YOUR_FIREBASE') || clean.includes('your-app-id') || clean.includes('G-XXXXXXXXXX')) {
      return '';
    }
    return clean;
  };

  return {
    apiKey: getClean(env.VITE_FIREBASE_API_KEY),
    authDomain: getClean(env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: getClean(env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: getClean(env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: getClean(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: getClean(env.VITE_FIREBASE_APP_ID),
    measurementId: getClean(env.VITE_FIREBASE_MEASUREMENT_ID)
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
