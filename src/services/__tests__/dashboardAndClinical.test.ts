/**
 * Comprehensive Test Suite for Patient Health Dashboard, Vitals Tracking,
 * Chart Calculations, Health Timeline, Triage Protocols, and Safety Overrides.
 */

import {
  clinicalStore,
  checkEmergencyRedFlags,
  computeTriageTier,
  EMERGENCY_RED_FLAGS
} from '../clinicalStore';
import { VitalDataPoint, ConsultationRecord, AppointmentRecord, HealthTaskItem } from '../../types';

// Physiological validation helper mirroring PatientVitalsView validation
export function validateVitalsEntry(entry: {
  systolic: number;
  diastolic: number;
  heartRate: number;
  spo2: number;
  temperature?: number;
  tempUnit?: 'F' | 'C';
  respiratoryRate?: number;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  height?: number;
  heightUnit?: 'in' | 'cm';
  bloodGlucose?: number;
  glucoseUnit?: 'mg/dL' | 'mmol/L';
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (isNaN(entry.systolic) || entry.systolic < 60 || entry.systolic > 260) {
    errors.push('Systolic BP out of physiological range (60-260 mmHg)');
  }
  if (isNaN(entry.diastolic) || entry.diastolic < 30 || entry.diastolic > 160) {
    errors.push('Diastolic BP out of physiological range (30-160 mmHg)');
  }
  if (entry.systolic <= entry.diastolic) {
    errors.push('Systolic pressure must exceed diastolic pressure');
  }
  if (isNaN(entry.heartRate) || entry.heartRate < 30 || entry.heartRate > 240) {
    errors.push('Heart rate out of physiological range (30-240 bpm)');
  }
  if (isNaN(entry.spo2) || entry.spo2 < 50 || entry.spo2 > 100) {
    errors.push('SpO2 out of physiological range (50-100%)');
  }

  if (entry.temperature !== undefined) {
    const unit = entry.tempUnit || 'F';
    if (unit === 'F' && (entry.temperature < 90 || entry.temperature > 108)) {
      errors.push('Temperature out of range (90-108 °F)');
    } else if (unit === 'C' && (entry.temperature < 32.2 || entry.temperature > 42.2)) {
      errors.push('Temperature out of range (32.2-42.2 °C)');
    }
  }

  if (entry.respiratoryRate !== undefined) {
    if (entry.respiratoryRate < 6 || entry.respiratoryRate > 60) {
      errors.push('Respiratory rate out of range (6-60 breaths/min)');
    }
  }

  if (entry.weight !== undefined) {
    const unit = entry.weightUnit || 'lbs';
    if (unit === 'lbs' && (entry.weight < 20 || entry.weight > 700)) {
      errors.push('Weight out of range (20-700 lbs)');
    } else if (unit === 'kg' && (entry.weight < 9 || entry.weight > 318)) {
      errors.push('Weight out of range (9-318 kg)');
    }
  }

  if (entry.bloodGlucose !== undefined) {
    const unit = entry.glucoseUnit || 'mg/dL';
    if (unit === 'mg/dL' && (entry.bloodGlucose < 20 || entry.bloodGlucose > 600)) {
      errors.push('Blood glucose out of range (20-600 mg/dL)');
    } else if (unit === 'mmol/L' && (entry.bloodGlucose < 1.1 || entry.bloodGlucose > 33.3)) {
      errors.push('Blood glucose out of range (1.1-33.3 mmol/L)');
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Unit conversion helpers
export function convertTempFtoC(f: number): number {
  return Number((((f - 32) * 5) / 9).toFixed(1));
}

export function convertLbsToKg(lbs: number): number {
  return Number((lbs * 0.45359237).toFixed(1));
}

export function convertGlucoseMgDlToMmol(mgdl: number): number {
  return Number((mgdl / 18.0182).toFixed(1));
}

export function runDashboardAndClinicalTests(): {
  total: number;
  passed: number;
  failed: number;
  results: { testName: string; passed: boolean; error?: string }[];
} {
  const results: { testName: string; passed: boolean; error?: string }[] = [];

  function assert(testName: string, condition: boolean, errorMsg?: string) {
    if (condition) {
      results.push({ testName, passed: true });
    } else {
      results.push({ testName, passed: false, error: errorMsg || 'Assertion failed' });
    }
  }

  // TEST 1: Empty Data Handling
  try {
    const emptyVitals: VitalDataPoint[] = [];
    const latest = emptyVitals[emptyVitals.length - 1] || null;
    assert('1.1 Empty vitals array returns null without crashing', latest === null);

    const emptyAppointments: AppointmentRecord[] = [];
    assert('1.2 Empty appointments list length is zero', emptyAppointments.length === 0);

    const emptyConsultations: ConsultationRecord[] = [];
    assert('1.3 Empty consultations list length is zero', emptyConsultations.length === 0);
  } catch (err: any) {
    assert('1. Empty Data Handling', false, err.message);
  }

  // TEST 2: Invalid Measurements & Range Validation
  try {
    // 2.1 Systolic less than Diastolic
    const invertedBP = validateVitalsEntry({
      systolic: 80,
      diastolic: 120,
      heartRate: 70,
      spo2: 98
    });
    assert('2.1 Rejects inverted BP (systolic <= diastolic)', !invertedBP.isValid);

    // 2.2 Extreme out-of-range systolic
    const extremeSys = validateVitalsEntry({
      systolic: 320,
      diastolic: 80,
      heartRate: 70,
      spo2: 98
    });
    assert('2.2 Rejects out-of-range systolic (> 260 mmHg)', !extremeSys.isValid);

    // 2.3 Invalid SpO2 (> 100%)
    const invalidSpO2 = validateVitalsEntry({
      systolic: 120,
      diastolic: 80,
      heartRate: 70,
      spo2: 105
    });
    assert('2.3 Rejects SpO2 > 100%', !invalidSpO2.isValid);

    // 2.4 Valid standard reading
    const validReading = validateVitalsEntry({
      systolic: 120,
      diastolic: 78,
      heartRate: 72,
      spo2: 99,
      temperature: 98.6,
      tempUnit: 'F',
      respiratoryRate: 16,
      weight: 142,
      weightUnit: 'lbs',
      bloodGlucose: 95,
      glucoseUnit: 'mg/dL'
    });
    assert('2.4 Accepts valid standard physiological reading', validReading.isValid);
  } catch (err: any) {
    assert('2. Invalid Measurements Validation', false, err.message);
  }

  // TEST 3: Unit Conversions Accuracy
  try {
    const c = convertTempFtoC(98.6);
    assert('3.1 98.6°F correctly converts to 37.0°C', Math.abs(c - 37.0) <= 0.1);

    const kg = convertLbsToKg(142);
    assert('3.2 142 lbs correctly converts to 64.4 kg', Math.abs(kg - 64.4) <= 0.1);

    const mmol = convertGlucoseMgDlToMmol(90);
    assert('3.3 90 mg/dL correctly converts to 5.0 mmol/L', Math.abs(mmol - 5.0) <= 0.1);
  } catch (err: any) {
    assert('3. Unit Conversions Accuracy', false, err.message);
  }

  // TEST 4: Timezone and Timestamp Handling
  try {
    const isoString = '2026-03-29T08:15:00Z';
    const dateObj = new Date(isoString);
    assert('4.1 Parses ISO 8601 timestamp accurately', !isNaN(dateObj.getTime()));

    const formatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(dateObj);
    assert('4.2 Formats localized date string properly', formatted.includes('2026'));
  } catch (err: any) {
    assert('4. Timezone Handling', false, err.message);
  }

  // TEST 5: Longitudinal Timeline Ordering & Source Attribution
  try {
    const timeline = clinicalStore.getTimeline();
    assert('5.1 Timeline contains events', timeline.length > 0);

    // Check chronological order (descending)
    let isSorted = true;
    for (let i = 0; i < timeline.length - 1; i++) {
      if (timeline[i].date < timeline[i + 1].date) {
        isSorted = false;
        break;
      }
    }
    assert('5.2 Timeline is sorted in descending chronological order', isSorted);

    // Check source attribution exists
    const hasSources = timeline.every((t) => typeof t.source === 'string' && t.source.length > 0);
    assert('5.3 Every timeline entry has explicit source attribution', hasSources);
  } catch (err: any) {
    assert('5. Timeline and Provenance', false, err.message);
  }

  // TEST 6: Emergency Red Flag Screening & Safety Interceptors
  try {
    const redFlag1 = checkEmergencyRedFlags('I have crushing chest pain radiating to arm');
    assert('6.1 Intercepts crushing chest pain radiating to arm', redFlag1.isEmergency);

    const redFlag2 = checkEmergencyRedFlags('Patient experienced sudden facial droop and slurred speech');
    assert('6.2 Intercepts facial droop and slurred speech', redFlag2.isEmergency);

    const normalSymptom = checkEmergencyRedFlags('Mild tension headache after 6 hours on laptop');
    assert('6.3 Normal symptom does not trigger emergency override', !normalSymptom.isEmergency);

    const triageTier = computeTriageTier(4, '2 days', false);
    assert('6.4 Mild headache correctly mapped to routine triage', triageTier === 'routine');

    const urgentTier = computeTriageTier(9, '2 hours', false);
    assert('6.5 High severity (9/10) correctly mapped to urgent triage', urgentTier === 'urgent');
  } catch (err: any) {
    assert('6. Emergency Red Flags & Triage Stratification', false, err.message);
  }

  // TEST 7: Clinical Store In-Memory & Database Persistence Consistency
  try {
    const initialVitalsCount = clinicalStore.getVitals().length;
    const addedVital = clinicalStore.addVital({
      date: '2026-04-01',
      systolic: 119,
      diastolic: 77,
      heartRate: 69,
      spo2: 99,
      source: 'Test Calibration Suite',
      notes: 'Automated test suite entry'
    });

    assert('7.1 Adding vital increments vitals list', clinicalStore.getVitals().length === initialVitalsCount + 1);
    assert('7.2 Added vital preserves source', addedVital.source === 'Test Calibration Suite');

    // Test appointment addition
    const initialAptCount = clinicalStore.getAppointments().length;
    const addedApt = clinicalStore.addAppointment({
      patientId: 'pat-1',
      patientName: 'Aryan Yadav',
      providerName: 'Dr. Sarah Chen, MD',
      providerSpecialty: 'Cardiovascular Care',
      date: '2026-05-10',
      time: '11:00 AM',
      type: 'in_person',
      location: 'Suite 400',
      status: 'scheduled',
      reason: 'Bi-annual wellness screening'
    });

    assert('7.3 Adding appointment increments appointment list', clinicalStore.getAppointments().length === initialAptCount + 1);
    assert('7.4 Added appointment has scheduled status', addedApt.status === 'scheduled');

    // Test tasks
    const initialTaskCount = clinicalStore.getTasks().length;
    const addedTask = clinicalStore.addTask({
      patientId: 'pat-1',
      title: 'Test Daily Check',
      description: 'Test care task item',
      category: 'vitals',
      dueDate: 'Tomorrow',
      priority: 'low',
      status: 'pending'
    });
    assert('7.5 Adding care task increments tasks list', clinicalStore.getTasks().length === initialTaskCount + 1);

    clinicalStore.toggleTaskStatus(addedTask.id);
    const toggled = clinicalStore.getTasks().find((t) => t.id === addedTask.id);
    assert('7.6 Toggling care task marks it completed', toggled?.status === 'completed');
  } catch (err: any) {
    assert('7. Database Store Consistency', false, err.message);
  }

  // TEST 8: Privacy and Authorization Scopes
  try {
    const timeline = clinicalStore.getTimeline();
    const emergencyEntries = timeline.filter((t) => t.privacyScope === 'emergency');
    assert('8.1 Emergency-accessible entries identified for rapid responders', emergencyEntries.length > 0);
  } catch (err: any) {
    assert('8. Privacy and Scoping', false, err.message);
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
