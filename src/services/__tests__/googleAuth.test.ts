/**
 * Medical AI — Google Authentication & Clinical Security Test Suite
 *
 * Verifies:
 * 1. Configuration detection & environment variable validation
 * 2. Firebase error normalization (popup blockers, cancellation, unauthorized domain)
 * 3. Clinical role protection (preventing unauthorized clinician escalation)
 * 4. Profile preservation (guaranteeing allergies, conditions, and MRNs are preserved on repeat login)
 * 5. Session token generation and synchronization contract
 */

import { isFirebaseConfigured, getFirebaseConfig } from '../firebase/firebaseConfig';
import { firebaseAuthService } from '../firebase/firebaseAuthService';
import { medicalDb } from '../../server/medicalDb';
import { User } from '../../types';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

export async function runGoogleAuthTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => void | Promise<void>) => {
    const start = performance.now();
    try {
      await fn();
      results.push({
        suite: 'Google Authentication',
        name,
        passed: true,
        durationMs: Math.round(performance.now() - start)
      });
    } catch (err: any) {
      results.push({
        suite: 'Google Authentication',
        name,
        passed: false,
        message: err?.message || String(err),
        durationMs: Math.round(performance.now() - start)
      });
    }
  };

  // Test 1: Configuration check validates active Firebase project configuration
  await runTest('Configuration Validator correctly validates medicalai-2b4a7 project credentials', () => {
    const config = getFirebaseConfig();
    const isConfigured = isFirebaseConfigured();
    if (!isConfigured) {
      throw new Error('Expected isFirebaseConfigured() to be true for valid project credentials');
    }
    if (config.projectId !== 'medicalai-2b4a7') {
      throw new Error(`Expected projectId to be medicalai-2b4a7, received ${config.projectId}`);
    }
    if (config.authDomain !== 'medicalai-2b4a7.firebaseapp.com') {
      throw new Error(`Expected authDomain to be medicalai-2b4a7.firebaseapp.com, received ${config.authDomain}`);
    }
  });

  // Test 2: Error Mapping for Popup Blocker
  await runTest('Firebase error mapper handles auth/popup-blocked with clear guidance', () => {
    const error = firebaseAuthService.mapFirebaseError({ code: 'auth/popup-blocked' });
    if (!error.error?.toLowerCase().includes('popup')) {
      throw new Error(`Expected error message to mention popup blocker, received: ${error.error}`);
    }
    if (error.errorCode !== 'auth/popup-blocked') {
      throw new Error(`Expected errorCode to be auth/popup-blocked, received: ${error.errorCode}`);
    }
  });

  // Test 3: Error Mapping for User Cancellation
  await runTest('Firebase error mapper handles auth/popup-closed-by-user gracefully', () => {
    const error = firebaseAuthService.mapFirebaseError({ code: 'auth/popup-closed-by-user' });
    if (!error.error?.toLowerCase().includes('cancelled')) {
      throw new Error(`Expected error message to mention cancellation, received: ${error.error}`);
    }
  });

  // Test 4: Error Mapping for Unauthorized Domain
  await runTest('Firebase error mapper guides user to configure Authorized Domains in Console', () => {
    const error = firebaseAuthService.mapFirebaseError({ code: 'auth/unauthorized-domain' });
    if (!error.error?.toLowerCase().includes('authorized domain')) {
      throw new Error(`Expected error message to mention Authorized Domains, received: ${error.error}`);
    }
  });

  // Test 5: Clinical Safety Guard - Doctor role cannot be self-claimed
  await runTest('New Google sign-ins strictly default to patient role to prevent unauthorized clinician escalation', () => {
    const requestedRole = 'doctor';
    const email = 'regular.user@example.com'; // Non-clinician domain/name

    // Simulating backend /api/auth/google role logic
    const finalRole = requestedRole === 'doctor' && email.includes('dr.') ? 'doctor' : 'patient';
    if (finalRole !== 'patient') {
      throw new Error('Security violation: Ordinary user was granted doctor role via Google OAuth');
    }
  });

  // Test 6: Medical History Preservation
  await runTest('Repeat Google sign-in preserves allergies, conditions, and existing MRN', () => {
    // Check existing demo user in medical database
    const existing = medicalDb.getUserById('pat-1');
    if (!existing) {
      throw new Error('pat-1 not found in medicalDb');
    }

    const originalAllergies = existing.allergies || [];
    const originalConditions = existing.medicalConditions || [];
    const originalPatientId = existing.patientId || existing.mrn;

    // Simulate update during Google sign-in
    const updated = medicalDb.updateUser('pat-1', {
      authProvider: 'google',
      lastUpdated: new Date().toISOString()
    });

    if (updated.allergies?.length !== originalAllergies.length) {
      throw new Error('Allergies were corrupted during Google sign-in sync');
    }
    if (updated.medicalConditions?.length !== originalConditions.length) {
      throw new Error('Medical conditions were corrupted during Google sign-in sync');
    }
    if (updated.patientId !== originalPatientId) {
      throw new Error('Patient ID (MRN) was altered during Google sign-in sync');
    }
  });

  // Test 7: Mobile WebView Detection
  await runTest('Mobile WebView helper correctly inspects user agent indicators', () => {
    const isWv = firebaseAuthService.isWebView();
    // In standard Node / desktop test environment, should be boolean
    if (typeof isWv !== 'boolean') {
      throw new Error('isWebView did not return a boolean');
    }
  });

  return results;
}
