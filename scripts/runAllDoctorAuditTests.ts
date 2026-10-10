import { runDoctorPortalTests } from '../src/services/__tests__/doctorPortalWorkflows.test';
import { runClinicianAccountManagementTests } from '../src/services/__tests__/clinicianAccountManagement.test';
import { runDoctorHandoffTests } from '../src/services/__tests__/doctorHandoff.test';
import { runEndToEndIntegrationTests } from '../src/services/__tests__/endToEndIntegrationAudit.test';

console.log('================================================================');
console.log('🩺 RUNNING COMPREHENSIVE DOCTORS PORTAL & INTEGRATION TEST SUITES');
console.log('================================================================\n');

let grandTotal = 0;
let grandPassed = 0;
let grandFailed = 0;

// 1. Doctor Portal Workflows (Clinical Queue, Triage Escalations, Copilot, Labs, Appointments)
console.log('--- 1. Testing Doctor Portal Workflows & Safety Rules ---');
const portalReport = runDoctorPortalTests();
grandTotal += portalReport.total;
grandPassed += portalReport.passed;
grandFailed += portalReport.failed;
console.log(`Results: ${portalReport.passed}/${portalReport.total} passed (${portalReport.failed} failed)`);
if (portalReport.failed > 0) {
  portalReport.results.filter((r) => !r.passed).forEach((r) => {
    console.error(`  ❌ FAIL: ${r.testName} -> ${r.error}`);
  });
}

// 2. Clinician Account & Security Controls
console.log('\n--- 2. Testing Clinician Account & Credential Management ---');
const accountReport = runClinicianAccountManagementTests();
grandTotal += accountReport.total;
grandPassed += accountReport.passed;
grandFailed += accountReport.failed;
console.log(`Results: ${accountReport.passed}/${accountReport.total} passed (${accountReport.failed} failed)`);
if (accountReport.failed > 0) {
  accountReport.results.filter((r) => !r.passed).forEach((r) => {
    console.error(`  ❌ FAIL: ${r.testName} -> ${r.error}`);
  });
}

// 3. Doctor Handoff & Summaries
console.log('\n--- 3. Testing Doctor Handoff & Continuity of Care ---');
const handoffReport = runDoctorHandoffTests();
grandTotal += handoffReport.total;
grandPassed += handoffReport.passed;
grandFailed += handoffReport.failed;
console.log(`Results: ${handoffReport.passed}/${handoffReport.total} passed (${handoffReport.failed} failed)`);
if (handoffReport.failed > 0) {
  handoffReport.results.filter((r) => !r.passed).forEach((r) => {
    console.error(`  ❌ FAIL: ${r.testName} -> ${r.error}`);
  });
}

// 4. End-to-End System & Database Integration
console.log('\n--- 4. Testing End-to-End System & Shared Database Integration ---');
const e2eReport = runEndToEndIntegrationTests();
grandTotal += e2eReport.total;
grandPassed += e2eReport.passed;
grandFailed += e2eReport.failed;
console.log(`Results: ${e2eReport.passed}/${e2eReport.total} passed (${e2eReport.failed} failed)`);
if (e2eReport.failed > 0) {
  e2eReport.results.filter((r) => !r.passed).forEach((r) => {
    console.error(`  ❌ FAIL: ${r.testName} -> ${r.error}`);
  });
}

console.log('\n================================================================');
console.log(`📊 FINAL AUDIT SCORE: ${grandPassed}/${grandTotal} PASSED (${grandFailed} FAILED)`);
console.log('================================================================\n');

if (grandFailed > 0) {
  process.exit(1);
} else {
  console.log('✨ ALL DOCTOR PORTAL TEST SUITES PASSED FLAWLESSLY WITH 100% SUCCESS RATE.');
  process.exit(0);
}
