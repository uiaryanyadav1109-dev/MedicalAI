import 'dotenv/config';

/**
 * Complete Service & Clinical Unit Test Runner
 * Executes all 12 modular test suites with in-memory storage polyfills
 */

// In-Memory Storage Polyfill for Node.js CLI runtime
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() {
    return storageMap.size;
  },
  key: (i: number) => Array.from(storageMap.keys())[i] || null
};

import { runEndToEndIntegrationTests } from './src/services/__tests__/endToEndIntegrationAudit.test';
import { runClinicalMetricsAndSafetyTests } from './src/services/__tests__/clinicalMetricsAndSafety.test';
import { runDoctorPortalTests } from './src/services/__tests__/doctorPortalWorkflows.test';
import { runDoctorHandoffTests } from './src/services/__tests__/doctorHandoff.test';
import { runClinicianAccountManagementTests } from './src/services/__tests__/clinicianAccountManagement.test';
import { runMedicationManagementTests } from './src/services/__tests__/medicationManagement.test';
import { runSecurityAndSettingsTests } from './src/services/__tests__/securityAndSettings.test';
import { runMultilingualSpeechTests } from './src/services/__tests__/multilingualSpeech.test';
import { runDashboardAndClinicalTests } from './src/services/__tests__/dashboardAndClinical.test';
import { runIdentityVerificationTests } from './src/services/__tests__/identityVerification.test';
import { runGoogleAuthTests } from './src/services/__tests__/googleAuth.test';
import { runSecureQrAccessWorkflowTests } from './src/services/__tests__/secureQrAccessWorkflow.test';

async function main() {
  console.log('================================================================');
  console.log('🩺 MEDICAL AI: RUNNING ALL 12 SERVICE & CLINICAL TEST SUITES');
  console.log('================================================================\n');

  let grandTotal = 0;
  let grandPassed = 0;
  let grandFailed = 0;

  function reportSuite(name: string, report: { total: number; passed: number; failed: number; results?: any[] }) {
    grandTotal += report.total;
    grandPassed += report.passed;
    grandFailed += report.failed;
    const icon = report.failed === 0 ? '✅' : '❌';
    console.log(`${icon} [${name}]: ${report.passed}/${report.total} Passed (${report.failed} Failed)`);
    if (report.failed > 0 && Array.isArray(report.results)) {
      for (const r of report.results) {
        if (!r.passed) {
          console.error(`   ❌ FAIL: ${r.testName || r.name} - ${r.error || r.message}`);
        }
      }
    }
  }

  // 1. End to End Integration
  try {
    const e2e = runEndToEndIntegrationTests();
    reportSuite('End-to-End Integration & Workflows', e2e);
  } catch (err: any) {
    console.error('❌ E2E Integration Suite crashed:', err.message);
  }

  // 2. Clinical Metrics & Safety
  try {
    const metrics = runClinicalMetricsAndSafetyTests();
    reportSuite('Clinical Metrics & Safety Telemetry', metrics);
  } catch (err: any) {
    console.error('❌ Clinical Metrics Suite crashed:', err.message);
  }

  // 3. Doctor Portal Workflows
  try {
    const docPortal = runDoctorPortalTests();
    reportSuite('Doctor Portal Workflows', docPortal);
  } catch (err: any) {
    console.error('❌ Doctor Portal Suite crashed:', err.message);
  }

  // 4. Doctor Handoffs
  try {
    const handoffs = runDoctorHandoffTests();
    reportSuite('Doctor Handoffs & Escalations', handoffs);
  } catch (err: any) {
    console.error('❌ Doctor Handoffs Suite crashed:', err.message);
  }

  // 5. Clinician Account Management
  try {
    const clinicianAcc = runClinicianAccountManagementTests();
    reportSuite('Clinician Account & RBAC Governance', clinicianAcc);
  } catch (err: any) {
    console.error('❌ Clinician Account Suite crashed:', err.message);
  }

  // 6. Medication Management
  try {
    const meds = runMedicationManagementTests();
    reportSuite('Medication Management & Drug Safety', meds);
  } catch (err: any) {
    console.error('❌ Medication Management Suite crashed:', err.message);
  }

  // 7. Security and Settings
  try {
    const sec = runSecurityAndSettingsTests();
    reportSuite('Security & Patient Settings', sec);
  } catch (err: any) {
    console.error('❌ Security Suite crashed:', err.message);
  }

  // 8. Multilingual Speech
  try {
    const speech = runMultilingualSpeechTests();
    reportSuite('Multilingual Speech Recognition & Synthesis', speech);
  } catch (err: any) {
    console.error('❌ Speech Suite crashed:', err.message);
  }

  // 9. Dashboard & Clinical Store
  try {
    const dash = runDashboardAndClinicalTests();
    reportSuite('Dashboard & Clinical Store State', dash);
  } catch (err: any) {
    console.error('❌ Dashboard Suite crashed:', err.message);
  }

  // 10. Identity Verification
  try {
    const idv = await runIdentityVerificationTests();
    reportSuite('Identity Verification & Masked Storage', idv);
  } catch (err: any) {
    console.error('❌ Identity Verification Suite crashed:', err.message);
  }

  // 11. Google Authentication
  try {
    const googleRes = await runGoogleAuthTests();
    const passed = googleRes.filter((r) => r.passed).length;
    const failed = googleRes.filter((r) => !r.passed).length;
    reportSuite('Google Auth & Clinical Role Safeguards', {
      total: googleRes.length,
      passed,
      failed,
      results: googleRes
    });
  } catch (err: any) {
    console.error('❌ Google Auth Suite crashed:', err.message);
  }

  // 12. Secure QR Access, Mandatory Reason & Patient Consent
  try {
    const qrAccessRes = await runSecureQrAccessWorkflowTests();
    reportSuite('Secure Patient QR Access, Reason & Patient Consent', qrAccessRes);
  } catch (err: any) {
    console.error('❌ Secure QR Access Suite crashed:', err.message);
  }

  console.log('\n================================================================');
  console.log(`GRAND TOTAL: ${grandPassed}/${grandTotal} Tests Passed (${grandFailed} Failed)`);
  console.log('================================================================\n');

  if (grandFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected fatal test runner error:', err);
  process.exit(1);
});
