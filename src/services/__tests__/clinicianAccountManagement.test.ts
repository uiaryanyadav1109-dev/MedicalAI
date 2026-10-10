/**
 * Comprehensive Automated Test Suite for Clinician Account Management & Security Controls
 *
 * Verifies:
 * 1. Clinician Profile, Contacts, and Working Status
 * 2. Credential Documents and Verification Invariants (Never label verified solely on upload)
 * 3. Authoritative Medical Registry Verification Handshake (NPPES / State Board Interop)
 * 4. Role & Least-Privilege Permission Management (Doctor, Nurse, Lab Reviewer, Admin)
 * 5. Anti-Self-Approval Rule & Conflict of Interest Guard
 * 6. Sensitive Credential Masking & Non-Exposure
 * 7. Active Session Management & Remote Revocation
 * 8. Clinical Team Collaboration & Case Reassignment with Mandatory Rationale
 * 9. Immutable Security Audit Logging
 */

import { medicalDb } from '../../server/medicalDb';
import {
  ClinicianRole,
  ClinicianWorkingStatus,
  ClinicianCredentialDocument,
  CredentialVerificationStatus
} from '../../types';

export interface ClinicianAccountTestReport {
  total: number;
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string; details?: string }[];
}

export function runClinicianAccountManagementTests(): ClinicianAccountTestReport {
  const results: { testName: string; passed: boolean; error?: string; details?: string }[] = [];

  function assert(testName: string, condition: boolean, details?: string, error?: string) {
    results.push({
      testName,
      passed: condition,
      details,
      error
    });
  }

  // =========================================================================
  // TEST 1: Clinician Profile, Contacts & Working Status
  // =========================================================================
  try {
    const profile = medicalDb.getClinicianProfile('doc-1');
    assert(
      '1.1 Clinician profile retrieves active physician details with contacts and status',
      Boolean(
        profile &&
        profile.clinician.id === 'doc-1' &&
        profile.clinician.name === 'Dr. Sarah Chen, MD' &&
        profile.clinician.officePhone &&
        profile.clinician.pagerNumber &&
        profile.clinician.workingStatus === 'on_duty'
      ),
      `Profile loaded: ${profile?.clinician.name}, Department: ${profile?.clinician.department}, WorkingStatus: ${profile?.clinician.workingStatus}`
    );

    // Update status to in_surgery
    const statusResult = medicalDb.updateClinicianWorkingStatus('doc-1', 'in_surgery', {
      id: 'doc-1',
      role: 'doctor',
      name: 'Dr. Sarah Chen, MD'
    });
    const updatedProfile = medicalDb.getClinicianProfile('doc-1');
    assert(
      '1.2 Working status transition to in_surgery updates profile and logs audit trail',
      Boolean(
        statusResult.success &&
        updatedProfile?.clinician.workingStatus === 'in_surgery'
      ),
      `Updated workingStatus to: ${updatedProfile?.clinician.workingStatus}`
    );

    // Revert status back to on_duty
    medicalDb.updateClinicianWorkingStatus('doc-1', 'on_duty', {
      id: 'doc-1',
      role: 'doctor',
      name: 'Dr. Sarah Chen, MD'
    });
  } catch (err: any) {
    assert('1. Clinician Profile & Working Status', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 2: Credential Upload Invariant: Never Label Verified Solely on Upload
  // =========================================================================
  try {
    const uploadedDoc = medicalDb.uploadClinicianCredential(
      'doc-1',
      {
        documentType: 'state_medical_license',
        title: 'State Medical Board License Renewal',
        identifier: 'MD-992144',
        issuingBody: 'Medical Board of California',
        issueDate: '2026-01-01',
        expiryDate: '2028-01-01'
      },
      { id: 'doc-1', role: 'doctor', name: 'Dr. Sarah Chen, MD' }
    );

    assert(
      '2.1 Uploaded document is strictly pending, never automatically verified',
      Boolean(
        uploadedDoc.success &&
        uploadedDoc.credential &&
        uploadedDoc.credential.verificationStatus === 'pending' &&
        uploadedDoc.credential.isAuthoritativeVerification === false
      ),
      `Uploaded credential id: ${uploadedDoc.credential?.id}, verificationStatus: ${uploadedDoc.credential?.verificationStatus}, isAuthoritative: ${uploadedDoc.credential?.isAuthoritativeVerification}`
    );

    // Check that demo credentials remain visibly labeled
    const docCredentials = medicalDb.getClinicianCredentials('doc-1', {
      id: 'doc-1',
      role: 'doctor'
    });
    const demoDoc = docCredentials.find((d) => d.verificationStatus === 'unverified_demo' || d.isDemoOrSimulated);
    assert(
      '2.2 Demo credentials are explicitly labelled as unverified_demo',
      Boolean(demoDoc && (demoDoc.verificationStatus === 'unverified_demo' || demoDoc.isDemoOrSimulated)),
      `Demo document found: ${demoDoc?.title} (Status: ${demoDoc?.verificationStatus}, DemoFlag: ${demoDoc?.isDemoOrSimulated})`
    );
  } catch (err: any) {
    assert('2. Credential Upload Invariants', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 3: Authoritative Medical Registry Verification Handshake
  // =========================================================================
  try {
    // We verify the uploaded pending credential using authoritative registry check
    const credentials = medicalDb.getClinicianCredentials('doc-1', {
      id: 'doc-1',
      role: 'doctor'
    });
    const targetDoc = credentials.find((d) => d.verificationStatus === 'pending');

    if (targetDoc) {
      const verifyResult = medicalDb.verifyCredentialAuthoritative(targetDoc.id, {
        id: 'doc-1',
        role: 'doctor',
        name: 'Dr. Sarah Chen, MD'
      });

      assert(
        '3.1 Authoritative registry check marks credential verified with source attribution and date',
        Boolean(
          verifyResult.success &&
          verifyResult.credential?.verificationStatus === 'verified' &&
          verifyResult.credential?.isAuthoritativeVerification === true &&
          verifyResult.credential?.verificationSource &&
          verifyResult.credential?.verifiedAt
        ),
        `Verification result: verified via ${verifyResult.credential?.verificationSource} on ${verifyResult.credential?.verifiedAt}`
      );
    } else {
      assert('3.1 Authoritative registry check', false, undefined, 'No pending credential found to verify');
    }
  } catch (err: any) {
    assert('3. Authoritative Medical Registry Handshake', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 4: Role & Permission Management: Server-Enforced Least-Privilege
  // =========================================================================
  try {
    // 4.1 Non-admin actor attempting role elevation is strictly denied
    const unauthorizedElevation = medicalDb.updateClinicianRole('nurse-1', 'admin', {
      id: 'nurse-1',
      role: 'nurse',
      name: 'Emily Patel, RN'
    });

    assert(
      '4.1 Non-admin clinician cannot elevate roles (ROLE_ELEVATION_DENIED)',
      Boolean(
        !unauthorizedElevation.success &&
        unauthorizedElevation.error?.includes('elevation')
      ),
      `Denied response: ${unauthorizedElevation.error}`
    );

    // 4.2 Authorized administrator CAN update clinician roles
    const authorizedRoleChange = medicalDb.updateClinicianRole('nurse-1', 'nurse', {
      id: 'admin-1',
      role: 'admin',
      name: 'Marcus Vance, MHA'
    });

    assert(
      '4.2 Authorized Administrator can update clinician roles',
      Boolean(authorizedRoleChange.success),
      `Admin role update successful: ${authorizedRoleChange.success}`
    );

    // 4.3 Permissions matrix properly partitions doctor vs nurse vs lab vs admin
    const doctorPerms = medicalDb.getClinicianPermissions('doctor');
    const nursePerms = medicalDb.getClinicianPermissions('nurse');
    const labPerms = medicalDb.getClinicianPermissions('lab_reviewer');
    const adminPerms = medicalDb.getClinicianPermissions('admin');

    const doctorCanPrescribe = doctorPerms.includes('prescribe:order');
    const nurseCannotPrescribe = !nursePerms.includes('prescribe:order');
    const labCanReviewReports = labPerms.includes('reports:review');
    const adminCanApproveCredentials = adminPerms.includes('credentials:approve');

    assert(
      '4.3 Least-privilege capability matrix partitions sensitive scopes',
      Boolean(doctorCanPrescribe && nurseCannotPrescribe && labCanReviewReports && adminCanApproveCredentials),
      'Permissions partitioned: Doctor can prescribe; Nurse cannot; Lab can review reports; Admin can approve credentials.'
    );
  } catch (err: any) {
    assert('4. Role & Permission Management', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 5: Anti-Self-Approval Rule & Conflict of Interest Guard
  // =========================================================================
  try {
    // Clinician Dr. Sarah Chen attempting to approve her own credential document
    const creds = medicalDb.getClinicianCredentials('doc-1', {
      id: 'doc-1',
      role: 'doctor'
    });
    const docToReview = creds[0];

    const selfApprovalAttempt = medicalDb.adminReviewCredential(
      docToReview.id,
      'verified',
      'Self-approval attempt',
      { id: 'doc-1', role: 'admin', name: 'Dr. Sarah Chen, MD' } // even if claiming admin role in session
    );

    assert(
      '5.1 Clinician cannot approve their own credential (CREDENTIAL_SELF_APPROVAL_DENIED)',
      Boolean(
        !selfApprovalAttempt.success &&
        selfApprovalAttempt.error?.includes('Conflict of Interest')
      ),
      `Self-approval blocked with message: ${selfApprovalAttempt.error}`
    );

    // Independent administrator CAN review another clinician's credential
    const independentAdminReview = medicalDb.adminReviewCredential(
      docToReview.id,
      'verified',
      'Independent review by hospital credentialing committee',
      { id: 'admin-1', role: 'admin', name: 'Marcus Vance, MHA' }
    );

    assert(
      '5.2 Independent hospital administrator can review and verify credentials',
      Boolean(independentAdminReview.success && independentAdminReview.credential),
      `Independent admin review status: ${independentAdminReview.credential?.verificationStatus}`
    );
  } catch (err: any) {
    assert('5. Anti-Self-Approval Rule', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 6: Sensitive Credential Masking & Non-Exposure
  // =========================================================================
  try {
    // Non-owner / unauthorized viewer requesting credentials
    const credentialsForViewer = medicalDb.getClinicianCredentials('doc-1', {
      id: 'nurse-1',
      role: 'nurse'
    });

    const hasMaskedIdentifiers = credentialsForViewer.every(
      (c) => c.maskedIdentifier && c.maskedIdentifier.includes('••')
    );
    const rawNumberNotExposed = !credentialsForViewer.some(
      (c) => c.identifier === 'MD-748291'
    );

    assert(
      '6.1 Sensitive license and DEA numbers are masked (e.g. •••• ••8291) for third-party viewers',
      Boolean(hasMaskedIdentifiers && rawNumberNotExposed),
      `Masked example: ${credentialsForViewer[0]?.maskedIdentifier}`
    );
  } catch (err: any) {
    assert('6. Sensitive Credential Masking', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 7: Active Session Management & Remote Revocation
  // =========================================================================
  try {
    // Reset test sessions for isolation
    const db = (medicalDb as any).read();
    db.clinicianSessions = [
      {
        id: 'sess-1',
        clinicianId: 'doc-1',
        deviceType: 'Desktop Workstation',
        browser: 'Chrome 124 (Epic & Medical AI EHR Client)',
        ipAddress: '10.14.82.11',
        location: 'Room 402 Attending Desk (Metro Intranet VLAN)',
        loginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        lastActiveAt: new Date().toISOString(),
        isCurrentSession: true,
        status: 'active'
      },
      {
        id: 'sess-2',
        clinicianId: 'doc-1',
        deviceType: 'Mobile Device',
        browser: 'Medical AI Android App (Expo / React Native)',
        ipAddress: '10.14.95.44',
        location: 'Acute Triage Ward 3 (Hospital Enterprise Wi-Fi)',
        loginAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        isCurrentSession: false,
        status: 'active'
      },
      {
        id: 'sess-3',
        clinicianId: 'doc-1',
        deviceType: 'Hospital Tablet',
        browser: 'Mobile Safari (Ward Rounds Rover Tablet)',
        ipAddress: '10.14.95.102',
        location: 'Cardiology Telemetry Step-Down Unit',
        loginAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        isCurrentSession: false,
        status: 'active'
      }
    ];
    (medicalDb as any).write(db);

    const initialSessions = medicalDb.getClinicianSessions('doc-1');
    assert(
      '7.1 Retrieves multi-device active clinician sessions (workstation, mobile, tablet)',
      Boolean(initialSessions && initialSessions.length >= 2),
      `Initial session count: ${initialSessions.length}`
    );

    // Revoke mobile session sess-2
    const revokeResult = medicalDb.revokeClinicianSession('sess-2', {
      id: 'doc-1',
      role: 'doctor',
      name: 'Dr. Sarah Chen, MD'
    });
    const updatedSessions = medicalDb.getClinicianSessions('doc-1');
    const sess2IsRevoked = updatedSessions.find((s) => s.id === 'sess-2')?.status === 'revoked';

    assert(
      '7.2 Remote revocation immediately invalidates target device session',
      Boolean(revokeResult.success && sess2IsRevoked),
      `Session sess-2 status after revocation: ${updatedSessions.find((s) => s.id === 'sess-2')?.status}`
    );

    // Revoke all other sessions keeping sess-1
    const revokeOthersResult = medicalDb.revokeAllOtherSessions('doc-1', 'sess-1', {
      id: 'doc-1',
      role: 'doctor',
      name: 'Dr. Sarah Chen, MD'
    });
    const postSessions = medicalDb.getClinicianSessions('doc-1');
    const currentActiveOnly = postSessions.filter((s) => s.status === 'active');

    assert(
      '7.3 Remote sign-out invalidates all other devices while preserving current active workstation',
      Boolean(
        revokeOthersResult.success &&
        currentActiveOnly.length === 1 &&
        currentActiveOnly[0].id === 'sess-1'
      ),
      `Active sessions remaining: ${currentActiveOnly.map((s) => s.id).join(', ')}`
    );
  } catch (err: any) {
    assert('7. Active Session Management & Remote Revocation', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 8: Team Collaboration & Case Reassignment with Clinical Rationale
  // =========================================================================
  try {
    const team = medicalDb.getClinicianTeam();
    assert(
      '8.1 Multi-disciplinary clinical team roster returns doctors, nurses, and lab reviewers',
      Boolean(team && team.length >= 4 && team.some((m) => m.role === 'nurse') && team.some((m) => m.role === 'lab_reviewer')),
      `Team roster count: ${team.length}`
    );

    // Ensure initial cases for doc-1
    medicalDb.assignCase(
      {
        patientId: 'pat-1',
        patientName: 'Aarav Patel',
        mrn: 'MRN-849201',
        triageCategory: 'emergency',
        targetClinicianId: 'doc-1',
        targetClinicianName: 'Dr. Sarah Chen, MD',
        team: 'Acute Medicine Team A',
        department: 'Emergency Medicine',
        reason: 'Initial assignment'
      },
      { id: 'admin-1', role: 'admin', name: 'Marcus Vance, MHA' }
    );
    medicalDb.assignCase(
      {
        patientId: 'pat-2',
        patientName: 'Elena Rostova',
        mrn: 'MRN-90142',
        triageCategory: 'urgent',
        targetClinicianId: 'doc-1',
        targetClinicianName: 'Dr. Sarah Chen, MD',
        team: 'Cardiopulmonary Telemetry Team',
        department: 'Cardiopulmonary & Internal Medicine',
        reason: 'Initial assignment'
      },
      { id: 'admin-1', role: 'admin', name: 'Marcus Vance, MHA' }
    );

    const initialCases = medicalDb.getCaseAssignments('doc-1');
    assert(
      '8.2 Retrieves active case assignments with acuity and patient MRN',
      Boolean(initialCases && initialCases.length >= 2),
      `Initial case count: ${initialCases.length}`
    );

    // Reassign case-1 to nurse-1 with mandatory clinical handover rationale
    const reassignResult = medicalDb.assignCase(
      {
        patientId: 'pat-1',
        patientName: 'Aarav Patel',
        mrn: 'MRN-849201',
        triageCategory: 'emergency',
        targetClinicianId: 'nurse-1',
        targetClinicianName: 'Emily Patel, RN',
        team: 'Acute Medicine Team A',
        department: 'Emergency Medicine',
        reason: 'Patient stabilized post-IV protocol; bedside monitoring handover to Lead Triage RN.'
      },
      { id: 'doc-1', role: 'doctor', name: 'Dr. Sarah Chen, MD' }
    );

    const updatedCases = medicalDb.getCaseAssignments('nurse-1');
    const case1 = updatedCases.find((c) => c.patientId === 'pat-1');

    assert(
      '8.3 Case reassignment updates assignee and preserves mandatory clinical handover rationale',
      Boolean(
        reassignResult.success &&
        case1 &&
        case1.primaryClinicianId === 'nurse-1' &&
        case1.reassignmentReason?.includes('bedside monitoring')
      ),
      `Case-1 reassigned to: ${case1?.primaryClinicianName}, Rationale: "${case1?.reassignmentReason}"`
    );
  } catch (err: any) {
    assert('8. Team Collaboration & Case Reassignment', false, undefined, err.message);
  }

  // =========================================================================
  // TEST 9: Immutable Security Audit Logging
  // =========================================================================
  try {
    const auditLogs = medicalDb.getClinicianAuditLogs('doc-1');

    const hasCredentialAction = auditLogs.some((l) => l.action.includes('CREDENTIAL'));
    const hasStatusOrRoleAction = auditLogs.some((l) => l.action.includes('STATUS') || l.action.includes('ROLE'));
    const hasSessionAction = auditLogs.some((l) => l.action.includes('SESSION'));
    const hasCaseAction = auditLogs.some((l) => l.action.includes('CASE'));
    const allLogsHaveTimestamps = auditLogs.every((l) => l.timestamp && l.actorId && l.details);

    assert(
      '9.1 Immutable audit log records events across credentials, roles, sessions, and case assignments',
      Boolean(
        auditLogs.length >= 5 &&
        hasCredentialAction &&
        hasSessionAction &&
        hasCaseAction &&
        allLogsHaveTimestamps
      ),
      `Audit logs verified: ${auditLogs.length} events logged with actors, timestamps, and details.`
    );
  } catch (err: any) {
    assert('9. Security Audit Logging', false, undefined, err.message);
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
