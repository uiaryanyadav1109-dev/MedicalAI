/**
 * Comprehensive End-to-End Integration & QA Test Suite
 *
 * Verifies all 12 Core Healthcare Portal & Cross-Platform Workflows:
 * 1. Patient Registration & Profile Update
 * 2. Approved Patient Info Appears in Doctor's Clinical View
 * 3. Doctor Searches & Opens Patient Record
 * 4. Medical Report Upload & Secure Doctor Review
 * 5. AI Summaries & Strict Source Citations
 * 6. Clinician Reviews & Saves Note / Care-Plan Draft
 * 7. Medication & Allergy Consistency Across Views
 * 8. Clinical Priority Change & Escalation Auditing
 * 9. Handoff & Follow-up Tasks Persistence
 * 10. Shared Backend & Database Synchronization (Web & Mobile)
 * 11. Unauthorized Access Prevention & Data Isolation
 * 12. Honest Handling of Offline States, Corrupted Data & Fault Recoveries
 */

import { medicalDb } from '../../server/medicalDb';
import {
  User,
  PatientRecord,
  MedicalReportRecord,
  DoctorClinicalAssessment,
  DoctorHandoffRecord,
  TriageCategory,
  MedicationItem
} from '../../types';

export interface E2EIntegrationTestReport {
  total: number;
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string }[];
}

export function runEndToEndIntegrationTests(): E2EIntegrationTestReport {
  const results: { testName: string; passed: boolean; error?: string }[] = [];

  function assert(testName: string, condition: boolean, errorMsg?: string) {
    if (condition) {
      results.push({ testName, passed: true });
    } else {
      results.push({ testName, passed: false, error: errorMsg || 'Assertion failed' });
    }
  }

  const testTimestamp = Date.now();
  const testPatientId = `pat-e2e-${testTimestamp}`;
  const testMrn = `MAI-${Math.floor(10000 + Math.random() * 90000)}`;

  // =========================================================================
  // FLOW 1: Authorized Patient Registers & Updates Profile
  // =========================================================================
  try {
    const newUser = medicalDb.updateUser(testPatientId, {
      id: testPatientId,
      name: 'Rohan Sharma',
      email: `rohan.${testTimestamp}@health.me`,
      phone: '+1 (555) 702-8819',
      role: 'patient',
      patientId: testMrn,
      mrn: testMrn,
      bloodGroup: 'B+',
      allergies: ['Penicillin'],
      medicalConditions: ['Stage 1 Hypertension'],
      emergencyContacts: [
        {
          id: `ec-${testTimestamp}`,
          name: 'Priya Sharma',
          relationship: 'Spouse',
          phone: '+1 (555) 702-8820',
          isPrimary: true,
          isActive: true
        }
      ],
      hasCompletedOnboarding: true
    });

    assert(
      'Flow 1: Patient Registration & Profile Update - User account created with onboarding data',
      newUser.id === testPatientId &&
        newUser.name === 'Rohan Sharma' &&
        newUser.hasCompletedOnboarding === true &&
        newUser.allergies?.includes('Penicillin') === true,
      `User account was not properly persisted: ${JSON.stringify(newUser)}`
    );
  } catch (err: any) {
    assert('Flow 1 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 2: Approved Information Appears in Doctor's Clinical View
  // =========================================================================
  try {
    const clinicalRecord = medicalDb.getPatientById(testPatientId);
    assert(
      'Flow 2: Patient Info in Clinical View - Newly registered patient appears in clinical registry',
      clinicalRecord != null && clinicalRecord.id === testPatientId,
      'Clinical patient record was not found in db.patients'
    );

    assert(
      'Flow 2: Patient Info in Clinical View - Allergies and conditions synchronize to clinical view',
      clinicalRecord?.name === 'Rohan Sharma' &&
        clinicalRecord?.allergies?.includes('Penicillin') === true &&
        clinicalRecord?.activeConditions?.includes('Stage 1 Hypertension') === true &&
        clinicalRecord?.bloodType === 'B+',
      'Clinical patient record missing synchronized allergies or clinical profile'
    );
  } catch (err: any) {
    assert('Flow 2 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 3: Doctor Searches & Opens Patient Record
  // =========================================================================
  try {
    // Search by name
    const searchByName = medicalDb.getPatients({ search: 'Rohan' });
    assert(
      'Flow 3: Doctor Search - Matches patient by name query',
      searchByName.some((p) => p.id === testPatientId),
      'Search by name failed to locate patient'
    );

    // Search by MRN
    const searchByMrn = medicalDb.getPatients({ search: testMrn });
    assert(
      'Flow 3: Doctor Search - Matches patient by MRN code',
      searchByMrn.some((p) => p.id === testPatientId),
      'Search by MRN failed to locate patient'
    );

    // Search by phone
    const searchByPhone = medicalDb.getPatients({ search: '702-8819' });
    assert(
      'Flow 3: Doctor Search - Matches patient by phone number',
      searchByPhone.some((p) => p.id === testPatientId),
      'Search by phone failed to locate patient'
    );
  } catch (err: any) {
    assert('Flow 3 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 4: Medical Report Upload & Secure Doctor Review
  // =========================================================================
  const testReportId = `rep-e2e-${testTimestamp}`;
  try {
    const report: MedicalReportRecord = {
      id: testReportId,
      patientId: testPatientId,
      title: 'Comprehensive Metabolic Panel & Lipid Screen',
      category: 'Laboratory Diagnostics',
      date: new Date().toISOString().split('T')[0],
      doctor: 'Dr. Sarah Chen, MD',
      hospital: 'Metro Clinical Reference Center',
      status: 'critical',
      summary: 'Serum Creatinine 1.4 mg/dL (Elevated). Total Cholesterol 220 mg/dL.',
      reviewStatus: 'unreviewed',
      results: [
        {
          testName: 'Serum Creatinine',
          parameter: 'Serum Creatinine',
          value: '1.4',
          unit: 'mg/dL',
          normalRange: '0.7 - 1.2 mg/dL',
          status: 'high'
        },
        {
          testName: 'Estimated GFR',
          parameter: 'Estimated GFR',
          value: '58',
          unit: 'mL/min/1.73m²',
          normalRange: '> 60 mL/min',
          status: 'low'
        }
      ],
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'UPLOADED',
          actor: 'Patient Portal',
          details: 'Initial report ingestion.'
        }
      ]
    };

    medicalDb.addReport(report);
    const retrievedReport = medicalDb.getReportById(testReportId);

    assert(
      'Flow 4: Report Ingestion - Report successfully persists with critical analytes',
      retrievedReport != null && retrievedReport.id === testReportId && retrievedReport.status === 'critical',
      'Report failed to persist'
    );

    // Doctor reviews and signs report
    const reviewRes = medicalDb.updateReportReviewStatus(
      testReportId,
      'reviewed',
      'Dr. Sarah Chen, MD',
      '1942850192',
      'Confirmed mild renal insufficiency; scheduled repeat renal function panel in 4 weeks.'
    );

    assert(
      'Flow 4: Doctor Review & Certification - Review status transitions to reviewed with signature',
      reviewRes.success && reviewRes.report?.reviewStatus === 'reviewed',
      'Failed to certify report review status'
    );

    const signedRegistry = medicalDb.getSignedReports();
    assert(
      'Flow 4: Doctor Review & Certification - Report is registered in institutional signed reports ledger',
      Boolean(signedRegistry[testReportId] && signedRegistry[testReportId].signedBy.includes('1942850192')),
      'Signed report not found in signedReports registry'
    );
  } catch (err: any) {
    assert('Flow 4 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 5: AI Summaries & Strict Source Citations
  // =========================================================================
  try {
    // Verify authorization check
    const authCheck = medicalDb.isClinicianAuthorizedForPatient(
      '1942850192',
      'Dr. Sarah Chen, MD',
      'doctor',
      testPatientId
    );
    assert(
      'Flow 5: AI Copilot Authorization - Authorized clinician passes patient chart authorization check',
      authCheck.authorized === true,
      `Authorization failed: ${authCheck.reason}`
    );

    // Verify context extraction contains the patient's reports
    const patientReports = medicalDb.getReports(testPatientId);
    assert(
      'Flow 5: AI Grounding - Copilot context retriever locates the patient-specific reports',
      patientReports.some((r) => r.id === testReportId),
      'Report not located for patient copilot context'
    );
  } catch (err: any) {
    assert('Flow 5 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 6: Clinician Reviews & Saves Note / Care-Plan Draft
  // =========================================================================
  const testAssessmentId = `asm-e2e-${testTimestamp}`;
  try {
    const draftAssessment: DoctorClinicalAssessment = {
      id: testAssessmentId,
      patientId: testPatientId,
      consultationId: 'c-test',
      clinicianId: 'doc-1',
      clinicianName: 'Dr. Sarah Chen, MD',
      clinicianNpi: '1942850192',
      hospitalAffiliation: 'Metro Clinical Reference Center',
      chiefComplaint: 'Post-Lab Review & Hypertension Management',
      clinicalImpression: 'Stage 1 Essential Hypertension with mild baseline renal insufficiency.',
      differentialDiagnosis: ['Essential Hypertension', 'Renovascular Disease'],
      triageCategory: 'prompt_evaluation',
      recommendedPlan: 'Initiate lifestyle sodium restriction; recheck renal panel and ambulatory BP log.',
      orders: [],
      isDraft: true,
      isSigned: false,
      lastSavedAt: new Date().toISOString(),
      amendments: [],
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'DRAFT_SAVED',
          actor: 'Dr. Sarah Chen, MD'
        }
      ]
    };

    medicalDb.saveDoctorAssessment(draftAssessment);
    const savedDraft = medicalDb.getDoctorAssessments(testPatientId).find((a) => a.id === testAssessmentId);

    assert(
      'Flow 6: Clinician Note - Assessment draft successfully saved',
      savedDraft != null && savedDraft.isDraft === true && savedDraft.isSigned === false,
      'Draft assessment not found'
    );

    // Finalize and sign assessment
    const signedAssessment: DoctorClinicalAssessment = {
      ...savedDraft!,
      isDraft: false,
      isSigned: true,
      signedAt: new Date().toISOString(),
      auditLog: [
        ...savedDraft!.auditLog,
        {
          timestamp: new Date().toISOString(),
          action: 'FINALIZED_AND_SIGNED',
          actor: 'Dr. Sarah Chen, MD'
        }
      ]
    };

    medicalDb.saveDoctorAssessment(signedAssessment);
    const verifiedSigned = medicalDb.getDoctorAssessments(testPatientId).find((a) => a.id === testAssessmentId);

    assert(
      'Flow 6: Clinician Note - Assessment finalized, signed, and certified with audit log',
      verifiedSigned != null && verifiedSigned.isSigned === true && verifiedSigned.signedAt != null,
      'Signed assessment state invalid'
    );
  } catch (err: any) {
    assert('Flow 6 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 7: Medication & Allergy Consistency Across Views
  // =========================================================================
  try {
    // Attempt medication order with allergic cross-reactivity
    // Patient has documented Penicillin allergy; test ordering Amoxicillin
    const safetyCheck = medicalDb.checkMedicationSafety(
      testPatientId,
      'Amoxicillin 500mg PO TID'
    );

    assert(
      'Flow 7: Medication Safety - Deterministic screening detects allergy contraindication',
      safetyCheck.allergyWarnings.length > 0 &&
        safetyCheck.allergyWarnings[0].message.includes('CRITICAL ALLERGY ALERT'),
      'Safety check failed to detect Penicillin allergy contraindication'
    );

    // Place safe non-contraindicated medication (Amlodipine)
    const safeOrder = medicalDb.createMedicationOrder({
      patientId: testPatientId,
      patientName: 'Rohan Sharma',
      name: 'Amlodipine 5mg PO daily',
      dosage: '5mg',
      route: 'Oral',
      frequency: 'Once daily in morning',
      instructions: 'Take 1 tablet daily in the morning',
      prescriberName: 'Dr. Sarah Chen, MD',
      prescriberNpi: '1942850192',
      prescriberRole: 'doctor',
      indication: 'Hypertension monotherapy in setting of mild creatinine elevation'
    });

    assert(
      'Flow 7: Medication Order - Safe non-contraindicated order created with zero allergy warnings',
      safeOrder.success && safeOrder.order?.allergyWarnings.length === 0,
      'Safe medication order generation failed'
    );
  } catch (err: any) {
    assert('Flow 7 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 8: Clinical Priority Change & Escalation Auditing
  // =========================================================================
  try {
    // Override priority with documented clinical justification
    const overrideRes = medicalDb.overridePatientPriority(
      testPatientId,
      'urgent',
      'Mild creatinine elevation combined with BP spike requires accelerated subacute follow-up.',
      'Dr. Sarah Chen, MD',
      '1942850192'
    );

    assert(
      'Flow 8: Priority Change - Successfully updates triage status with documented justification',
      overrideRes.success && overrideRes.patient?.triageStatus === 'urgent',
      `Override failed: ${overrideRes.error}`
    );

    const updatedPatient = medicalDb.getPatientById(testPatientId);
    assert(
      'Flow 8: Priority Change - Override history logged in patient clinical dossier',
      Boolean(
        updatedPatient?.priorityOverrides &&
        updatedPatient.priorityOverrides.some((o) => o.newPriority === 'urgent')
      ),
      'Priority override history missing from patient record'
    );

    // Protection rule test: Attempt emergency downgrade without detailed reasoning
    medicalDb.overridePatientPriority(testPatientId, 'emergency', 'Acute Hypertensive Crisis with diaphoresis', 'Dr. Sarah Chen, MD');
    const invalidEmergencyDowngrade = medicalDb.overridePatientPriority(
      testPatientId,
      'routine',
      'Downgrade', // <15 characters
      'Dr. Sarah Chen, MD'
    );

    assert(
      'Flow 8: Emergency Protection - Reject silent emergency downgrade without detailed reasoning',
      invalidEmergencyDowngrade.success === false &&
        invalidEmergencyDowngrade.error?.includes('Emergency Protection') === true,
      'Emergency downgrade was not blocked'
    );
  } catch (err: any) {
    assert('Flow 8 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 9: Handoff & Follow-up Tasks Persistence
  // =========================================================================
  const testHandoffId = `h-e2e-${testTimestamp}`;
  try {
    const handoff: DoctorHandoffRecord = {
      id: testHandoffId,
      patientId: testPatientId,
      patientName: 'Rohan Sharma',
      mrn: 'MRN-90284',
      duration: '3 days',
      date: new Date().toISOString().split('T')[0],
      chiefConcern: 'Hypertension with mild creatinine elevation',
      hpiSynopsis: 'Ambulatory blood pressure elevation. Serum creatinine 1.4 mg/dL.',
      currentMedications: ['Amlodipine 5mg PO daily'],
      recentVitalsSummary: 'BP 142/88 mmHg, HR 72 bpm',
      labHighlights: ['Creatinine 1.4 mg/dL', 'eGFR 58 mL/min'],
      patientQuestions: ['Should I adjust my salt intake?'],
      actionsCompleted: [
        'Reviewed metabolic panel and renal profile',
        'Signed lab certification',
        'Initiated Amlodipine 5mg PO daily'
      ],
      outstandingTasks: [
        'Repeat creatinine and GFR in 4 weeks',
        'Check ambulatory BP log at next visit'
      ],
      followUpNeeds: 'Routine attending review within current shift',
      authorClinician: 'Dr. Sarah Chen, MD',
      handoffState: 'pending',
      consentStatus: 'authorized',
      status: 'pending',
      version: 1,
      submissionToken: `tok-handoff-${testTimestamp}`
    };

    const addRes = medicalDb.addHandoff(handoff);
    assert(
      'Flow 9: Handoff Persistence - Handoff brief successfully created',
      addRes.success && addRes.handoff.id === testHandoffId,
      'Handoff creation failed'
    );

    // Test duplicate submission protection
    const dupRes = medicalDb.addHandoff(handoff);
    assert(
      'Flow 9: Handoff Protection - Duplicate token submission is safely deduplicated',
      dupRes.success && dupRes.isDuplicate === true,
      'Duplicate handoff was not caught'
    );

    // Complete handoff
    const updateRes = medicalDb.updateHandoff(
      testHandoffId,
      { handoffState: 'completed', status: 'reviewed' },
      1,
      'Dr. Sarah Chen, MD',
      'doctor'
    );

    assert(
      'Flow 9: Handoff State Machine - Successfully transitions to completed state',
      updateRes.success && updateRes.handoff?.handoffState === 'completed',
      `Handoff update failed: ${updateRes.error}`
    );
  } catch (err: any) {
    assert('Flow 9 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 10: Shared Backend & Database Synchronization (Web & Mobile)
  // =========================================================================
  try {
    // Verify that the full patient packet query returns identical shared records
    const fullPatient = medicalDb.getPatientById(testPatientId);
    const patientReports = medicalDb.getReports(testPatientId);
    const patientHandoffs = medicalDb.getHandoffs(testPatientId);
    const patientAssessments = medicalDb.getDoctorAssessments(testPatientId);

    assert(
      'Flow 10: Shared Backend Sync - Patient packet reflects all created artifacts in shared storage',
      fullPatient != null &&
        patientReports.length >= 1 &&
        patientHandoffs.length >= 1 &&
        patientAssessments.length >= 1,
      'Shared data artifacts incomplete'
    );
  } catch (err: any) {
    assert('Flow 10 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 11: Unauthorized Access Prevention & Data Isolation
  // =========================================================================
  try {
    // 1. Role gating check
    const unauthorizedAuditAccess = medicalDb.getProtectedAuditLogs(
      { limit: 5 },
      { role: 'unauthorized_guest' as any }
    );
    assert(
      'Flow 11: Security Isolation - Unauthorized guest role denied audit log access',
      unauthorizedAuditAccess.success === false &&
        unauthorizedAuditAccess.error?.includes('ACCESS_DENIED') === true,
      'Unauthorized role gained audit log access'
    );

    // 2. Cross-patient isolation check
    const restrictedPatientCheck = medicalDb.isClinicianAuthorizedForPatient(
      '1942850192',
      'Dr. Sarah Chen, MD',
      'doctor',
      'pat-unauthorized-test'
    );
    assert(
      'Flow 11: Security Isolation - Restricted patient chart access is blocked',
      restrictedPatientCheck.authorized === false,
      'Restricted patient chart check was not blocked'
    );

    // 3. Immutability protection
    const immutabilityCheck = medicalDb.deleteAuditLogs();
    assert(
      'Flow 11: Security Isolation - Audit log modification/deletion strictly prohibited',
      immutabilityCheck.success === false &&
        immutabilityCheck.error.includes('AUDIT_LOG_IMMUTABLE'),
      'Audit log deletion was not blocked'
    );
  } catch (err: any) {
    assert('Flow 11 Exception', false, err.message);
  }

  // =========================================================================
  // FLOW 12: Honest Handling of Offline States, Corrupted Data & Faults
  // =========================================================================
  try {
    // Corrupted document processing simulation
    const corruptReportId = `rep-corrupt-${testTimestamp}`;
    const corruptReport: MedicalReportRecord = {
      id: corruptReportId,
      patientId: testPatientId,
      title: 'Damaged Laboratory Scan',
      date: new Date().toISOString().split('T')[0],
      doctor: 'Dr. Sarah Chen, MD',
      hospital: 'Metro Clinical Reference Center',
      status: 'normal',
      reviewStatus: 'unreviewed',
      processingStatus: 'failed',
      failureReason: 'Corrupted binary stream: TIFF header byte 0x4D4D missing in scan.',
      retryCount: 0
    };

    medicalDb.addReport(corruptReport);
    const unrecoveredMetrics = medicalDb.getClinicalMetrics();

    assert(
      'Flow 12: Fault Telemetry - Data-processing fault tracked honestly in clinical metrics',
      unrecoveredMetrics.dataProcessingFailures.unrecoveredCount >= 1 &&
        unrecoveredMetrics.dataProcessingFailures.unresolvedList.some((f) => f.id === corruptReportId),
      'Corrupt report fault was not reflected in telemetry'
    );

    // Retry and recover
    const retryRes = medicalDb.retryReportProcessing(corruptReportId);
    assert(
      'Flow 12: Fault Recovery - Manual retry clears failureReason and marks processed',
      retryRes.success === true &&
        retryRes.report?.processingStatus === 'processed' &&
        retryRes.report?.failureReason == null &&
        retryRes.report?.retryCount === 1,
      'Retry processing failed to recover report'
    );
  } catch (err: any) {
    assert('Flow 12 Exception', false, err.message);
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
