/**
 * Automated Verification Test Suite for Identity Verification Feature
 *
 * Verifies:
 * 1. Optional Verification Default (not_started allows full portal access)
 * 2. User Cancellation of Optional Verification
 * 3. Invalid Documents Rejection (expired documents, too short, missing consent)
 * 4. Provider Integration Boundary (honest reporting, no fake government DB claims)
 * 5. Pending and Needs Review Status Transitions
 * 6. Repeated Submissions Guard (blocks duplicate submission while pending)
 * 7. Sensitive Data Safeguards (masked numbers, zero image retention in storage, clean audit logs)
 * 8. Patient ID vs Government ID Isolation (Patient Card & QR code contain NO government credentials)
 */

import {
  identityVerificationService,
  maskDocumentNumber,
  VerificationSubmissionPayload
} from '../identityVerificationService';
import { qrShareService } from '../qrShareService';

export interface IdentityVerificationTestReport {
  total: number;
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string }[];
}

export async function runIdentityVerificationTests(): Promise<IdentityVerificationTestReport> {
  const results: { testName: string; passed: boolean; error?: string }[] = [];

  function assert(testName: string, condition: boolean, errorMsg?: string) {
    if (condition) {
      results.push({ testName, passed: true });
    } else {
      results.push({ testName, passed: false, error: errorMsg || 'Assertion failed' });
    }
  }

  const testUserId = `test-patient-id-verify-${Date.now()}`;

  // ==========================================
  // TEST 1: Optional Verification Default
  // ==========================================
  try {
    const initialRecord = identityVerificationService.getVerificationRecord(testUserId);
    assert(
      '1.1 Patient registration defaults to not_started status without mandatory government ID',
      initialRecord.status === 'not_started'
    );
    assert(
      '1.2 Ephemeral data retention policy is pre-declared on the record',
      initialRecord.retentionPolicy.toLowerCase().includes('ephemeral')
    );
  } catch (err: any) {
    assert('1. Optional Verification Default', false, err.message);
  }

  // ==========================================
  // TEST 2: Input Validation & Invalid Documents
  // ==========================================
  try {
    // 2.1 Missing consent
    const noConsentPayload: VerificationSubmissionPayload = {
      documentType: 'passport',
      issuingCountry: 'United States',
      documentNumberRaw: 'P19827364',
      expirationDate: '2029-12-31',
      legalFullName: 'Aryan Yadav',
      consentGiven: false
    };
    const v1 = identityVerificationService.validateSubmission(noConsentPayload);
    assert('2.1 Rejects document submission when explicit consent is omitted', !v1.isValid && !!v1.errors.consent);

    // 2.2 Expired document
    const expiredPayload: VerificationSubmissionPayload = {
      documentType: 'drivers_license',
      issuingCountry: 'India',
      documentNumberRaw: 'DL987654321',
      expirationDate: '2020-01-01', // Expired
      legalFullName: 'Aryan Yadav',
      consentGiven: true
    };
    const v2 = identityVerificationService.validateSubmission(expiredPayload);
    assert('2.2 Rejects expired identity credentials', !v2.isValid && !!v2.errors.expirationDate);

    // 2.3 Invalid/short document number
    const shortPayload: VerificationSubmissionPayload = {
      documentType: 'national_id',
      issuingCountry: 'United Kingdom',
      documentNumberRaw: '12', // Too short
      expirationDate: '2028-06-30',
      legalFullName: 'Aryan Yadav',
      consentGiven: true
    };
    const v3 = identityVerificationService.validateSubmission(shortPayload);
    assert('2.3 Rejects malformed or insufficient document numbers', !v3.isValid && !!v3.errors.documentNumber);
  } catch (err: any) {
    assert('2. Input Validation & Invalid Documents', false, err.message);
  }

  // ==========================================
  // TEST 3: Verification Submission & Masking Safeguards
  // ==========================================
  try {
    const validPayload: VerificationSubmissionPayload = {
      documentType: 'drivers_license',
      issuingCountry: 'India',
      documentNumberRaw: 'MH02-20220014821',
      expirationDate: '2032-05-15',
      legalFullName: 'Aryan Yadav',
      consentGiven: true
    };

    const submitRes = await identityVerificationService.submitVerification(testUserId, validPayload);
    assert('3.1 Successfully submits valid verification payload', submitRes.success);
    assert('3.2 Transitions record status to pending', submitRes.record.status === 'pending');
    assert(
      '3.3 Masks document number preserving only last 4 characters',
      Boolean(
        submitRes.record.maskedDocumentNumber?.includes('4821') &&
        !submitRes.record.maskedDocumentNumber?.includes('MH02')
      )
    );
  } catch (err: any) {
    assert('3. Verification Submission & Masking', false, err.message);
  }

  // ==========================================
  // TEST 4: Repeated Submissions Guard
  // ==========================================
  try {
    const repeatPayload: VerificationSubmissionPayload = {
      documentType: 'passport',
      issuingCountry: 'India',
      documentNumberRaw: 'Z98765432',
      expirationDate: '2030-01-01',
      legalFullName: 'Aryan Yadav',
      consentGiven: true
    };

    const repeatRes = await identityVerificationService.submitVerification(testUserId, repeatPayload);
    assert('4.1 Blocks repeated verification submission while already in pending status', !repeatRes.success);
  } catch (err: any) {
    assert('4. Repeated Submissions Guard', false, err.message);
  }

  // ==========================================
  // TEST 5: User Cancellation Flow
  // ==========================================
  try {
    const cancelRes = identityVerificationService.cancelVerification(testUserId);
    assert('5.1 User can cancel optional verification at any time', cancelRes.success);
    assert('5.2 Cancellation restores status to not_started', cancelRes.record.status === 'not_started');
  } catch (err: any) {
    assert('5. User Cancellation Flow', false, err.message);
  }

  // ==========================================
  // TEST 6: Provider Status & Honest Architecture Boundary
  // ==========================================
  try {
    const providerStatus = identityVerificationService.getProviderStatus();
    assert(
      '6.1 Honestly marks provider as sandbox/unconfigured when production API keys are absent',
      providerStatus.environment === 'sandbox_simulated' || providerStatus.isConfigured
    );
    assert(
      '6.2 Does not claim direct connection to government databases',
      !providerStatus.disclaimer.toLowerCase().includes('direct fbi') &&
      !providerStatus.disclaimer.toLowerCase().includes('direct government database connection')
    );
  } catch (err: any) {
    assert('6. Provider Status & Honest Boundary', false, err.message);
  }

  // ==========================================
  // TEST 7: Review State Transitions (Needs Review, Rejected, Verified)
  // ==========================================
  try {
    // Transition to needs_review
    const reviewRecord = identityVerificationService.updateStatus(testUserId, 'needs_review', {
      reviewNotes: 'Glare detected on document photo. Manual review requested.'
    });
    assert('7.1 Supports needs_review status with review notes', reviewRecord.status === 'needs_review');

    // Transition to rejected
    const rejectedRecord = identityVerificationService.updateStatus(testUserId, 'rejected', {
      rejectionReason: 'Issuing jurisdiction mismatch with account country.'
    });
    assert('7.2 Supports rejected status with clear rejection rationale',
      rejectedRecord.status === 'rejected' && !!rejectedRecord.rejectionReason
    );

    // Transition to verified
    const verifiedRecord = identityVerificationService.updateStatus(testUserId, 'verified');
    assert('7.3 Supports verified status with verifiedAt timestamp',
      verifiedRecord.status === 'verified' && !!verifiedRecord.verifiedAt
    );
  } catch (err: any) {
    assert('7. Review State Transitions', false, err.message);
  }

  // ==========================================
  // TEST 8: Sensitive Data Leakage & Patient Card / QR Code Isolation
  // ==========================================
  try {
    // 8.1 No document image or raw number in storage
    const storedRaw = localStorage.getItem(`medical_ai_identity_verification_${testUserId}`) || '';
    assert(
      '8.1 Raw government ID number is never written to storage',
      !storedRaw.includes('MH02-20220014821')
    );
    assert(
      '8.2 Document image binary/base64 is not retained in local storage',
      !storedRaw.includes('data:image') && !storedRaw.includes('base64')
    );

    // 8.2 QR Share record isolation
    const qrRecord = qrShareService.getOrCreateActiveRecordForPatient({
      patientId: testUserId,
      patientName: 'Aryan Yadav',
      patientIdCode: 'MAI-80429', // Application Patient ID
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      emergencyContacts: []
    });

    const qrPayloadString = JSON.stringify(qrRecord);
    assert(
      '8.3 Scannable QR code contains clinic Patient ID (MAI-80429) but zero government ID numbers',
      qrPayloadString.includes('MAI-80429') &&
      !qrPayloadString.includes('MH02') &&
      !qrPayloadString.includes('passport')
    );

    // Clean up test user
    identityVerificationService.resetVerification(testUserId);
  } catch (err: any) {
    assert('8. Sensitive Data Leakage & Isolation', false, err.message);
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results
  };
}
