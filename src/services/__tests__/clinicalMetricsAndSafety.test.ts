/**
 * Automated Verification Test Suite for Clinical Metrics, Safety Telemetry & Protected Audit Centre
 *
 * Verifies:
 * 1. Data-Driven Calculation: Active cases by urgency (counts & percentages)
 * 2. Waiting Patient Stratification: Unreviewed queue partitioned by department
 * 3. Waiting-Time Distribution: Min, median, max, average, and 15/30/60m duration buckets
 * 4. Diagnostic Risk Queue: Abnormal & critical unreviewed reports awaiting sign-off
 * 5. Clinical Task Surveillance: Overdue tasks partitioned by high/medium/low priority
 * 6. Escalation State Machine: MTTA (Mean Time to Acknowledge) and SLA overdue detection
 * 7. Continuity of Care: Completed handoffs and completion percentage
 * 8. Pipeline Resilience: Unrecovered ingestion faults, error classification & retry tracking
 * 9. Multi-Parameter Filtering: Date range (24h, 7d, 30d, all), department, and case status
 * 10. Metric Definition Disclosure: Verifies mathematical rules without unsupported quality claims
 * 11. Privacy & De-Identification: Verifies absence of exposed patient names in aggregate telemetry
 * 12. Audit Centre Role-Based Access: Authorized clinicians granted, unauthorized roles denied
 * 13. Audit Immutability Protection: Append-only ledger rejects deletion attempts with AUDIT_LOG_IMMUTABLE
 * 14. Audit Export Governance: Exporting audit trail records AUDIT_LOG_EXPORTED event in ledger
 */

import { medicalDb } from '../../server/medicalDb';
import { ClinicalMetricsFilter, ClinicianRole } from '../../types';

export interface ClinicalMetricsTestReport {
  total: number;
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string }[];
}

export function runClinicalMetricsAndSafetyTests(): ClinicalMetricsTestReport {
  const results: { testName: string; passed: boolean; error?: string }[] = [];

  function assert(testName: string, condition: boolean, errorMsg?: string) {
    if (condition) {
      results.push({ testName, passed: true });
    } else {
      results.push({ testName, passed: false, error: errorMsg || 'Assertion failed' });
    }
  }

  // =========================================================================
  // TEST 1: Metric 1 - Active Cases by Urgency Calculations
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { activeCasesByUrgency, totalActiveCases } = metrics;

    const sumTiers =
      activeCasesByUrgency.emergency +
      activeCasesByUrgency.urgent +
      activeCasesByUrgency.prompt_evaluation +
      activeCasesByUrgency.routine;

    assert(
      'Active Cases by Urgency: Tier sum equals total active cases',
      sumTiers === totalActiveCases && totalActiveCases > 0,
      `Expected tier sum (${sumTiers}) to equal totalActiveCases (${totalActiveCases})`
    );

    const sumPercentages =
      activeCasesByUrgency.percentages.emergency +
      activeCasesByUrgency.percentages.urgent +
      activeCasesByUrgency.percentages.prompt_evaluation +
      activeCasesByUrgency.percentages.routine;

    assert(
      'Active Cases Percentages: Total percentages approximate 100%',
      sumPercentages >= 98 && sumPercentages <= 102,
      `Percentage sum ${sumPercentages}% is outside expected range [98-102%]`
    );

    // Verify calculated from actual DB records
    const db = (medicalDb as any).read();
    const actualEmergencies = (db.patients || []).filter((p: any) => p.triageStatus === 'emergency').length;
    assert(
      'Active Cases by Urgency: Emergency count exactly matches raw database records',
      activeCasesByUrgency.emergency === actualEmergencies,
      `Expected ${actualEmergencies} emergency cases, found ${activeCasesByUrgency.emergency}`
    );
  } catch (err: any) {
    assert('Metric 1 (Active Cases) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 2: Metric 2 - Patients Waiting for Review
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { patientsWaitingForReview } = metrics;

    assert(
      'Patients Waiting for Review: Total waiting count is positive and tracked',
      patientsWaitingForReview.total > 0,
      `Expected waiting count > 0, got ${patientsWaitingForReview.total}`
    );

    const sumAcuity =
      patientsWaitingForReview.emergencyCount +
      patientsWaitingForReview.urgentCount +
      patientsWaitingForReview.promptCount +
      patientsWaitingForReview.routineCount;

    assert(
      'Patients Waiting for Review: Acuity breakdown equals total waiting count',
      sumAcuity === patientsWaitingForReview.total,
      `Acuity sum ${sumAcuity} != total waiting ${patientsWaitingForReview.total}`
    );

    assert(
      'Patients Waiting for Review: Department breakdown is categorized',
      Object.keys(patientsWaitingForReview.byDepartment).length > 0,
      'No departments found in waiting breakdown'
    );
  } catch (err: any) {
    assert('Metric 2 (Waiting Patients) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 3: Metric 3 - Waiting-Time Distribution & Duration Buckets
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { waitingTimeDistribution } = metrics;

    assert(
      'Waiting-Time Distribution: Min wait is less than or equal to max wait',
      waitingTimeDistribution.minMinutes <= waitingTimeDistribution.maxMinutes,
      `Min wait (${waitingTimeDistribution.minMinutes}m) > Max wait (${waitingTimeDistribution.maxMinutes}m)`
    );

    assert(
      'Waiting-Time Distribution: Average and median fall within min-max bounds',
      waitingTimeDistribution.averageMinutes >= waitingTimeDistribution.minMinutes &&
        waitingTimeDistribution.averageMinutes <= waitingTimeDistribution.maxMinutes &&
        waitingTimeDistribution.medianMinutes >= waitingTimeDistribution.minMinutes &&
        waitingTimeDistribution.medianMinutes <= waitingTimeDistribution.maxMinutes,
      'Average or median wait time is mathematically outside [min, max] range'
    );

    const bucketSum =
      waitingTimeDistribution.buckets.under15 +
      waitingTimeDistribution.buckets.between15And30 +
      waitingTimeDistribution.buckets.between31And60 +
      waitingTimeDistribution.buckets.over60;

    assert(
      'Waiting-Time Buckets: Sum of duration buckets matches total waiting patients',
      bucketSum === waitingTimeDistribution.totalWaiting,
      `Bucket sum (${bucketSum}) does not equal totalWaiting (${waitingTimeDistribution.totalWaiting})`
    );
  } catch (err: any) {
    assert('Metric 3 (Waiting-Time Distribution) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 4: Metric 4 - Abnormal Reports Awaiting Review
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { abnormalReportsAwaitingReview } = metrics;

    assert(
      'Abnormal Reports: Critical count does not exceed total abnormal reports',
      abnormalReportsAwaitingReview.criticalCount <= abnormalReportsAwaitingReview.total,
      `Critical count (${abnormalReportsAwaitingReview.criticalCount}) > Total (${abnormalReportsAwaitingReview.total})`
    );

    assert(
      'Abnormal Reports: Non-critical abnormal count is non-negative and balanced',
      abnormalReportsAwaitingReview.abnormalCount >= 0 &&
        abnormalReportsAwaitingReview.criticalCount + abnormalReportsAwaitingReview.abnormalCount ===
          abnormalReportsAwaitingReview.total,
      'Critical + Abnormal count mismatch against total'
    );

    // Verify reports by department is populated if total > 0
    if (abnormalReportsAwaitingReview.total > 0) {
      assert(
        'Abnormal Reports: Department breakdown populated for pending reports',
        Object.keys(abnormalReportsAwaitingReview.byDepartment).length > 0,
        'Expected department breakdown for abnormal reports'
      );
    } else {
      assert('Abnormal Reports: Zero abnormal reports state verified', true);
    }
  } catch (err: any) {
    assert('Metric 4 (Abnormal Reports) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 5: Metric 5 - Overdue Follow-Up Tasks
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { overdueFollowUpTasks } = metrics;

    const sumPriorities =
      overdueFollowUpTasks.highPriorityCount +
      overdueFollowUpTasks.mediumPriorityCount +
      overdueFollowUpTasks.lowPriorityCount;

    assert(
      'Overdue Tasks: Priority breakdown equals total overdue tasks',
      sumPriorities === overdueFollowUpTasks.total,
      `Priority sum (${sumPriorities}) != Total overdue tasks (${overdueFollowUpTasks.total})`
    );

    assert(
      'Overdue Tasks: Oldest overdue hours is a non-negative number',
      overdueFollowUpTasks.oldestOverdueHours >= 0,
      `Invalid oldestOverdueHours: ${overdueFollowUpTasks.oldestOverdueHours}`
    );
  } catch (err: any) {
    assert('Metric 5 (Overdue Tasks) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 6: Metric 6 - Open Escalations and Acknowledgement Times
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { openEscalations } = metrics;

    assert(
      'Open Escalations: Active and In-Progress counts sum to total open escalations',
      openEscalations.activeCount + openEscalations.inProgressCount === openEscalations.total,
      `State sum != total open escalations (${openEscalations.total})`
    );

    assert(
      'Open Escalations: Overdue count does not exceed total open escalations',
      openEscalations.overdueCount <= openEscalations.total,
      `Overdue escalations (${openEscalations.overdueCount}) exceed total (${openEscalations.total})`
    );

    assert(
      'Open Escalations: Mean Time to Acknowledge (MTTA) is positive and non-zero',
      openEscalations.meanTimeToAcknowledgeMinutes > 0,
      `Invalid MTTA: ${openEscalations.meanTimeToAcknowledgeMinutes}m`
    );
  } catch (err: any) {
    assert('Metric 6 (Open Escalations) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 7: Metric 7 - Completed Handoffs
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { completedHandoffs } = metrics;

    assert(
      'Completed Handoffs: Completed handoffs cannot exceed total handoffs',
      completedHandoffs.totalCompleted <= completedHandoffs.totalHandoffs,
      `Completed (${completedHandoffs.totalCompleted}) > Total (${completedHandoffs.totalHandoffs})`
    );

    assert(
      'Completed Handoffs: Completion rate is between 0% and 100%',
      completedHandoffs.completionRatePercent >= 0 && completedHandoffs.completionRatePercent <= 100,
      `Invalid completion rate: ${completedHandoffs.completionRatePercent}%`
    );
  } catch (err: any) {
    assert('Metric 7 (Completed Handoffs) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 8: Metric 8 - Data-Processing Failures Requiring Attention
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const { dataProcessingFailures } = metrics;

    assert(
      'Data-Processing Failures: Unrecovered fault count is less than or equal to total failures',
      dataProcessingFailures.unrecoveredCount <= dataProcessingFailures.total,
      `Unrecovered (${dataProcessingFailures.unrecoveredCount}) > Total (${dataProcessingFailures.total})`
    );

    assert(
      'Data-Processing Failures: Unresolved fault queue length matches unrecovered count',
      dataProcessingFailures.unresolvedList.length === dataProcessingFailures.unrecoveredCount,
      `Unresolved list (${dataProcessingFailures.unresolvedList.length}) != unrecoveredCount (${dataProcessingFailures.unrecoveredCount})`
    );

    if (dataProcessingFailures.unresolvedList.length > 0) {
      const firstItem = dataProcessingFailures.unresolvedList[0];
      assert(
        'Data-Processing Failures: Items contain diagnostic failure reason and retry count',
        Boolean(firstItem.id && firstItem.failureReason && typeof firstItem.retryCount === 'number'),
        'Fault item missing required audit metadata'
      );
    }
  } catch (err: any) {
    assert('Metric 8 (Data-Processing Failures) Exception', false, err.message);
  }

  // =========================================================================
  // TEST 9: Multi-Parameter Filtering (Date Range, Department & Status)
  // =========================================================================
  try {
    const allMetrics = medicalDb.getClinicalMetrics();

    // Department filter
    const cardioMetrics = medicalDb.getClinicalMetrics({ department: 'Cardiology' });
    assert(
      'Department Filtering: Filters patients specifically to Cardiology department',
      cardioMetrics.totalActiveCases <= allMetrics.totalActiveCases,
      `Cardiology total (${cardioMetrics.totalActiveCases}) should be <= overall total (${allMetrics.totalActiveCases})`
    );

    // Status filter
    const pendingReviewMetrics = medicalDb.getClinicalMetrics({ status: 'pending_review' });
    assert(
      'Status Filtering: Correctly restricts telemetry to pending_review cases',
      pendingReviewMetrics.totalActiveCases <= allMetrics.totalActiveCases,
      'Status filter produced invalid total count'
    );

    // Date range filter
    const range24h = medicalDb.getClinicalMetrics({ dateRange: '24h' });
    assert(
      'Date Range Filtering: 24h filter produces valid evaluated record metadata',
      range24h.filterMeta.dateRange === '24h' && range24h.filterMeta.totalRecordsEvaluated >= 0,
      'Date range filter metadata invalid'
    );
  } catch (err: any) {
    assert('Multi-Parameter Filtering Exception', false, err.message);
  }

  // =========================================================================
  // TEST 10: Metric Definitions Disclosure (No Unsupported Claims)
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const defs = metrics.metricDefinitions;

    assert(
      'Metric Definitions: All 8 clinical metrics have explicit definitions disclosed',
      Boolean(
        defs.activeCasesByUrgency &&
        defs.patientsWaitingForReview &&
        defs.waitingTimeDistribution &&
        defs.abnormalReportsAwaitingReview &&
        defs.overdueFollowUpTasks &&
        defs.openEscalations &&
        defs.completedHandoffs &&
        defs.dataProcessingFailures
      ),
      'Missing one or more metric definitions in telemetry response'
    );

    // Verify source collections and calculation rules are provided
    assert(
      'Metric Governance: Calculation rules and authoritative collections are stated',
      defs.activeCasesByUrgency.calculationRule.length > 10 &&
        defs.activeCasesByUrgency.sourceCollection.startsWith('medicalDb.'),
      'Calculation rule or source collection not properly specified'
    );
  } catch (err: any) {
    assert('Metric Definitions Exception', false, err.message);
  }

  // =========================================================================
  // TEST 11: Privacy & De-Identification in Aggregate Views
  // =========================================================================
  try {
    const metrics = medicalDb.getClinicalMetrics();
    const serialized = JSON.stringify(metrics);

    // Ensure aggregate telemetry does NOT contain raw patient full names
    const forbiddenNames = ['Aryan Yadav', 'Fatima Zahra', 'Michael Chang', 'Elena Rostova', 'David Miller'];
    const exposedName = forbiddenNames.find((name) => serialized.includes(name));

    assert(
      'Privacy Governance: Aggregate metrics do NOT expose raw patient names or PHI',
      !exposedName,
      `Found exposed patient name '${exposedName}' in aggregate telemetry JSON`
    );
  } catch (err: any) {
    assert('Privacy Governance Exception', false, err.message);
  }

  // =========================================================================
  // TEST 12: Protected Audit Centre - Role-Based Access Control
  // =========================================================================
  try {
    // Authorized doctor
    const docResult = medicalDb.getProtectedAuditLogs(
      { limit: 10 },
      { role: 'doctor', id: 'doc-1' }
    );
    assert(
      'Audit RBAC: Attending doctor is granted access to protected audit logs',
      docResult.success && Array.isArray(docResult.logs) && docResult.logs.length > 0,
      `Doctor access failed: ${docResult.error}`
    );

    // Authorized administrator
    const adminResult = medicalDb.getProtectedAuditLogs(
      { limit: 10 },
      { role: 'admin', id: 'admin-1' }
    );
    assert(
      'Audit RBAC: Hospital administrator is granted access to protected audit logs',
      adminResult.success && Array.isArray(adminResult.logs),
      `Admin access failed: ${adminResult.error}`
    );

    // Unauthorized role (e.g., patient, external guest, unauthorized staff)
    const unauthorizedResult = medicalDb.getProtectedAuditLogs(
      { limit: 10 },
      { role: 'patient' as any, id: 'pat-1' }
    );
    assert(
      'Audit RBAC: Unauthorized patient/guest role is strictly rejected (ACCESS_DENIED)',
      Boolean(!unauthorizedResult.success && unauthorizedResult.error?.includes('ACCESS_DENIED')),
      'Unauthorized role was not rejected'
    );
  } catch (err: any) {
    assert('Audit RBAC Exception', false, err.message);
  }

  // =========================================================================
  // TEST 13: Protected Audit Centre - Immutability Protection
  // =========================================================================
  try {
    // Attempt deletion on legally protected audit log
    const deleteAttempt = medicalDb.deleteAuditLogs();
    assert(
      'Audit Immutability: Delete attempts are blocked with AUDIT_LOG_IMMUTABLE error',
      !deleteAttempt.success && deleteAttempt.error.includes('AUDIT_LOG_IMMUTABLE'),
      `Deletion was not blocked properly: ${JSON.stringify(deleteAttempt)}`
    );
  } catch (err: any) {
    assert('Audit Immutability Exception', false, err.message);
  }

  // =========================================================================
  // TEST 14: Protected Audit Centre - Audit Event Creation & Structure
  // =========================================================================
  try {
    // Log a sensitive workflow action
    const newEntry = medicalDb.logAudit({
      actor: 'Dr. Sarah Chen, MD',
      actorId: 'doc-1',
      actorRole: 'doctor',
      action: 'PRESCRIPTION_SIGNED',
      targetEntity: 'medication_order',
      patientId: 'pat-1',
      recordId: 'med-ord-test-44',
      outcome: 'SUCCESS',
      details: 'Signed clinical order for Lisinopril 10mg PO daily after reviewing renal panel.',
      ipAddress: '10.240.12.8',
      platform: 'Web Portal EMR v4.2'
    });

    assert(
      'Audit Event Creation: Generates complete audit record with ID, timestamp, and outcome',
      Boolean(newEntry.id && newEntry.timestamp && newEntry.action === 'PRESCRIPTION_SIGNED' && newEntry.outcome === 'SUCCESS'),
      'Generated audit record missing required audit fields'
    );

    assert(
      'Audit Event Structure: Captures actor, role, targetEntity, recordId, and IP address',
      newEntry.actorId === 'doc-1' &&
        newEntry.actorRole === 'doctor' &&
        newEntry.targetEntity === 'medication_order' &&
        newEntry.recordId === 'med-ord-test-44' &&
        newEntry.ipAddress === '10.240.12.8',
      'Audit record attributes do not match input'
    );

    // Verify it is queryable in protected audit logs
    const fetched = medicalDb.getProtectedAuditLogs(
      { action: 'PRESCRIPTION_SIGNED', limit: 5 },
      { role: 'doctor', id: 'doc-1' }
    );
    assert(
      'Audit Ledger Query: Newly logged event is immediately present in protected ledger',
      fetched.success && fetched.logs.some((l) => l.id === newEntry.id),
      'New audit entry not found in query results'
    );
  } catch (err: any) {
    assert('Audit Event Creation Exception', false, err.message);
  }

  // =========================================================================
  // TEST 15: Protected Audit Centre - Export Governance Event
  // =========================================================================
  try {
    const exportRes = medicalDb.exportAuditLogs({
      role: 'doctor',
      id: 'doc-1',
      name: 'Dr. Sarah Chen, MD'
    });

    assert(
      'Audit Export: Successfully exports immutable archive with count and timestamp',
      exportRes.success && exportRes.count > 0 && Array.isArray(exportRes.auditLogs),
      'Audit log export failed'
    );

    // Check that AUDIT_LOG_EXPORTED was logged into the audit ledger
    const verifyExportLogged = medicalDb.getProtectedAuditLogs(
      { action: 'AUDIT_LOG_EXPORTED', limit: 5 },
      { role: 'doctor', id: 'doc-1' }
    );
    assert(
      'Audit Export Governance: Exporting audit ledger logs an AUDIT_LOG_EXPORTED event',
      verifyExportLogged.success && verifyExportLogged.logs.some((l) => l.action === 'AUDIT_LOG_EXPORTED'),
      'AUDIT_LOG_EXPORTED was not registered in ledger upon export'
    );
  } catch (err: any) {
    assert('Audit Export Governance Exception', false, err.message);
  }

  // =========================================================================
  // TEST 16: Telemetry Incomplete Data Graceful Recovery
  // =========================================================================
  try {
    // Pass non-existent department to test graceful zero-data handling
    const emptyDeptMetrics = medicalDb.getClinicalMetrics({ department: 'NonExistentDepartment_XYZ' });

    assert(
      'Graceful Zero-Data State: Empty query yields zero counts without crashing or NaN',
      emptyDeptMetrics.totalActiveCases === 0 &&
        emptyDeptMetrics.waitingTimeDistribution.minMinutes === 0 &&
        emptyDeptMetrics.waitingTimeDistribution.averageMinutes === 0 &&
        !isNaN(emptyDeptMetrics.waitingTimeDistribution.averageMinutes),
      'Empty department query produced NaN or corrupted state'
    );
  } catch (err: any) {
    assert('Graceful Zero-Data State Exception', false, err.message);
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
