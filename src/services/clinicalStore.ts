import {
  ConsultationRecord,
  VitalDataPoint,
  MedicationItem,
  MedicationSourceType,
  MedicationRoute,
  MedicationStatus,
  DoseLogStatus,
  MedicationDoseLog,
  MedicationChangeLogEntry,
  MedicationReminderConfig,
  DrugInteractionCheckResult,
  MedicalReportRecord,
  DoctorHandoffRecord,
  PatientRecord,
  TimelineEntry,
  TriageCategory,
  AppointmentRecord,
  HealthTaskItem,
  ClinicalTask,
  DoctorClinicalAssessment,
  TriageEscalationRecord,
  ClinicalCopilotResponse,
  ClinicalCopilotApprovalPayload,
  ClinicalCopilotApprovalRecord,
  ClinicalCopilotMode,
  ClinicalDraftType,
  ReportComment,
  ReportAuditEntry,
  AnalyteComparisonItem,
  MedicationOrder,
  MedicationOrderStatus,
  MedicationOrderAuditEntry,
  MedicationAllergyWarning,
  MedicationDrugInteractionWarning,
  ClinicalReferralRecord,
  ClinicalNotificationRecord,
  HandoffState,
  User,
  ClinicianRole,
  ClinicianWorkingStatus,
  CredentialDocumentType,
  CredentialVerificationStatus,
  ClinicianCredentialDocument,
  ClinicianPermission,
  ClinicianSession,
  ClinicianTeamMember,
  ClinicianCaseAssignment,
  ClinicianAccountAuditLog,
  ClinicalMetricsData,
  ClinicalMetricsFilter,
  ClinicalAuditLogEntry,
  ClinicalAuditAction,
  ClinicalAuditOutcome
} from '../types';


// Deterministic Emergency Red Flag Detection
export const EMERGENCY_RED_FLAGS = [
  'crushing chest pain',
  'chest pain radiating to arm',
  'chest pressure with cold sweat',
  'facial droop',
  'slurred speech',
  'arm weakness',
  'loss of consciousness',
  'severe breathing distress',
  'inability to breathe',
  'cyanosis',
  'coughing up large amounts of blood',
  'anaphylaxis',
  'throat swelling shut',
  'sudden thunderclap headache',
  'acute vision loss'
];

export function checkEmergencyRedFlags(text: string, selectedSymptoms: string[] = []): {
  isEmergency: boolean;
  matchedTrigger?: string;
  urgentGuidance: string;
} {
  const normalized = (text + ' ' + selectedSymptoms.join(' ')).toLowerCase();
  for (const flag of EMERGENCY_RED_FLAGS) {
    if (normalized.includes(flag)) {
      return {
        isEmergency: true,
        matchedTrigger: flag,
        urgentGuidance:
          'Potential acute clinical red flag detected. Do not wait for software evaluation. Contact your local emergency medical services immediately or proceed to the nearest emergency department.'
      };
    }
  }

  return {
    isEmergency: false,
    urgentGuidance: ''
  };
}

export function computeTriageTier(
  severity: number,
  durationText: string,
  isEmergency: boolean
): TriageCategory {
  if (isEmergency) return 'emergency';
  if (severity >= 8) return 'urgent';
  if (severity >= 5 || durationText.includes('week') || durationText.includes('7 days')) {
    return 'prompt_evaluation';
  }
  if (severity >= 3) return 'routine';
  return 'monitor_self_care';
}

// Initial Mock Records with real structure
const INITIAL_CONSULTATIONS: ConsultationRecord[] = [
  {
    id: 'c-101',
    date: '2026-03-24',
    patientId: 'pat-1',
    patientName: 'Aryan Yadav',
    chiefComplaint: 'Bilateral Frontal Tension Headache',
    duration: '2 days (gradual onset)',
    severity: 4,
    location: 'Bilateral forehead & temples',
    associatedSymptoms: ['Screen fatigue', 'Neck tightness'],
    pertinentNegatives: ['No photophobia', 'No nausea', 'No focal neurological deficit', 'Afebrile'],
    triageCategory: 'routine',
    emergencyFlag: false,
    preliminaryGuidance:
      'Mild-to-moderate presentation consistent with musculoskeletal or tension-type discomfort. Rest, hydration, and ergonomic posture review recommended. Consult clinician if pain worsens or persists past 7 days.',
    status: 'reviewed',
    clinicianNotes:
      'Reviewed pre-consult intake. Likely tension headache secondary to cervical posture strain. Recommend ergonomic screen distance and hydration.',
    reviewedBy: 'Dr. Sarah Chen, MD',
    reviewedAt: '2026-03-25 09:15 AM'
  },
  {
    id: 'c-102',
    date: '2026-03-12',
    patientId: 'pat-1',
    patientName: 'Aryan Yadav',
    chiefComplaint: 'Intermittent Productive Cough',
    duration: '5 days',
    severity: 3,
    location: 'Upper respiratory tract',
    associatedSymptoms: ['Clear sputum', 'Post-nasal drip'],
    pertinentNegatives: ['No high fever', 'No hemoptysis', 'No wheezing'],
    triageCategory: 'prompt_evaluation',
    emergencyFlag: false,
    preliminaryGuidance:
      'Lingering post-viral bronchial irritation. Monitor temperature. Arrange prompt primary care evaluation if purulent sputum or dyspnea develops.',
    status: 'reviewed',
    clinicianNotes: 'Chest exam normal. Prescribed supportive saline rinse and observation.',
    reviewedBy: 'Dr. Sarah Chen, MD',
    reviewedAt: '2026-03-13 11:30 AM'
  }
];

const INITIAL_VITALS: VitalDataPoint[] = [
  {
    id: 'v-1',
    date: '2026-03-01',
    timestamp: '2026-03-01T08:30:00Z',
    systolic: 122,
    diastolic: 80,
    heartRate: 72,
    spo2: 98,
    temperature: 98.4,
    temperatureUnit: 'F',
    respiratoryRate: 15,
    weight: 142,
    weightUnit: 'lbs',
    height: 69,
    heightUnit: 'in',
    bloodGlucose: 96,
    bloodGlucoseUnit: 'mg/dL',
    source: 'Clinic Triage (Metro Hospital)',
    notes: 'Baseline check at routine annual screening.'
  },
  {
    id: 'v-2',
    date: '2026-03-08',
    timestamp: '2026-03-08T09:15:00Z',
    systolic: 120,
    diastolic: 78,
    heartRate: 70,
    spo2: 99,
    temperature: 98.6,
    temperatureUnit: 'F',
    respiratoryRate: 16,
    weight: 142,
    weightUnit: 'lbs',
    height: 69,
    heightUnit: 'in',
    bloodGlucose: 94,
    bloodGlucoseUnit: 'mg/dL',
    source: 'Connected Device (Bluetooth BP)',
    notes: 'Morning reading before breakfast.'
  },
  {
    id: 'v-3',
    date: '2026-03-15',
    timestamp: '2026-03-15T08:45:00Z',
    systolic: 118,
    diastolic: 76,
    heartRate: 68,
    spo2: 99,
    temperature: 98.2,
    temperatureUnit: 'F',
    respiratoryRate: 14,
    weight: 141.5,
    weightUnit: 'lbs',
    height: 69,
    heightUnit: 'in',
    bloodGlucose: 98,
    bloodGlucoseUnit: 'mg/dL',
    source: 'Patient Logged (Self-Reported)',
    notes: 'Resting seated reading, no caffeine beforehand.'
  },
  {
    id: 'v-4',
    date: '2026-03-22',
    timestamp: '2026-03-22T09:00:00Z',
    systolic: 121,
    diastolic: 79,
    heartRate: 71,
    spo2: 98,
    temperature: 98.5,
    temperatureUnit: 'F',
    respiratoryRate: 16,
    weight: 142,
    weightUnit: 'lbs',
    height: 69,
    heightUnit: 'in',
    bloodGlucose: 104,
    bloodGlucoseUnit: 'mg/dL',
    source: 'Connected Device (Bluetooth BP)',
    notes: 'Fasting morning measurement.'
  },
  {
    id: 'v-5',
    date: '2026-03-29',
    timestamp: '2026-03-29T08:15:00Z',
    systolic: 117,
    diastolic: 75,
    heartRate: 66,
    spo2: 100,
    temperature: 98.3,
    temperatureUnit: 'F',
    respiratoryRate: 15,
    weight: 141,
    weightUnit: 'lbs',
    height: 69,
    heightUnit: 'in',
    bloodGlucose: 92,
    bloodGlucoseUnit: 'mg/dL',
    source: 'Patient Logged (Self-Reported)',
    notes: 'Resting seated telemetry, optimal normotensive control.'
  }
];

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt-1',
    patientId: 'pat-1',
    patientName: 'Aryan Yadav',
    providerName: 'Dr. Sarah Chen, MD',
    providerSpecialty: 'Internal Medicine & Cardiovascular Health',
    date: '2026-04-14',
    time: '10:30 AM',
    type: 'in_person',
    location: 'Metro Clinical Reference Hospital, Suite 410',
    status: 'scheduled',
    reason: 'Hypertension Quarterly Follow-up & Fasting Blood Panel Review',
    source: 'Clinic Scheduling Portal',
    notes: 'Bring current ambulatory blood pressure log and medication list.'
  },
  {
    id: 'apt-2',
    patientId: 'pat-1',
    patientName: 'Aryan Yadav',
    providerName: 'Dr. Marcus Vance, MD',
    providerSpecialty: 'Preventive Telehealth & Ergonomics',
    date: '2026-04-28',
    time: '02:00 PM',
    type: 'telehealth',
    location: 'Secure Clinical Video Room',
    status: 'scheduled',
    reason: 'Cervical Posture & Tension Headache Follow-up',
    source: 'Patient Self-Scheduled',
    notes: 'Evaluate workplace screen setup and neck mobility progress.'
  }
];

const INITIAL_TASKS: HealthTaskItem[] = [
  {
    id: 'task-1',
    patientId: 'pat-1',
    title: 'Record Morning Resting Blood Pressure',
    description: 'Log seated resting blood pressure measurement before morning Lisinopril dose.',
    category: 'vitals',
    dueDate: 'Today',
    priority: 'high',
    status: 'pending',
    actionRoute: '/dashboard/vitals'
  },
  {
    id: 'task-2',
    patientId: 'pat-1',
    title: 'Review Recent CBC Diagnostic Findings',
    description: 'Examine complete blood count indices and doctor summary in your health records.',
    category: 'lab',
    dueDate: 'Tomorrow',
    priority: 'medium',
    status: 'pending',
    actionRoute: '/dashboard/health-records'
  },
  {
    id: 'task-3',
    patientId: 'pat-1',
    title: 'Complete Ergonomics & Tension Follow-up Intake',
    description: 'Report whether tension headaches have lessened with hydration and posture breaks.',
    category: 'assessment',
    dueDate: 'This Week',
    priority: 'low',
    status: 'pending',
    actionRoute: '/dashboard/consultation'
  }
];

const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    patientId: 'pat-1',
    name: 'Lisinopril',
    strength: '10 mg',
    dosage: '1 tablet (10 mg)',
    route: 'Oral',
    frequency: 'Once daily',
    timing: 'Morning (08:00 AM)',
    startDate: '2025-11-10',
    prescribingClinician: 'Dr. Sarah Chen, MD',
    prescriptionInstructions: 'Take 1 tablet (10 mg) by mouth once daily every morning with water.',
    indication: 'Essential Hypertension (Controlled Maintenance)',
    prescribingContext: 'Metro Health Primary Care',
    foodNotes: 'Take consistently with or without food. Avoid potassium salt substitutes.',
    notes: 'Baseline BP well-managed at 118/76 mmHg. Monitored with annual serum electrolytes.',
    sourceType: 'clinician_verified',
    sourceDocumentRef: 'Electronic Prescription Rx-80429-01',
    requiresConfirmation: false,
    status: 'active',
    reminders: {
      enabled: true,
      paused: false,
      times: ['08:00'],
      timezone: 'Asia/Kolkata',
      repeatSchedule: 'daily',
      maskNotificationPreview: false
    },
    doseLogs: [
      {
        id: 'dl-101',
        timestamp: '2026-03-28T08:04:00Z',
        scheduledTime: '08:00',
        status: 'taken',
        notes: 'Taken with breakfast'
      },
      {
        id: 'dl-102',
        timestamp: '2026-03-29T08:02:00Z',
        scheduledTime: '08:00',
        status: 'taken',
        notes: 'Taken on schedule'
      }
    ],
    changeLog: [
      {
        id: 'cl-1',
        timestamp: '2025-11-10T10:00:00Z',
        changedBy: 'Dr. Sarah Chen, MD',
        action: 'CREATED',
        rationale: 'Initiated 10mg maintenance therapy for Stage 1 essential hypertension'
      }
    ]
  },
  {
    id: 'med-2',
    patientId: 'pat-1',
    name: 'Vitamin D3 (Cholecalciferol)',
    strength: '2,000 IU',
    dosage: '1 capsule (2,000 IU)',
    route: 'Oral',
    frequency: 'Once daily',
    timing: 'Lunchtime (12:30 PM)',
    startDate: '2026-01-05',
    prescribingClinician: 'Dr. Sarah Chen, MD',
    prescriptionInstructions: 'Take 1 capsule by mouth once daily with main meal.',
    indication: 'Bone & Immune Health Support',
    prescribingContext: 'Routine Maintenance',
    foodNotes: 'Fat-soluble; optimal absorption when taken with a meal containing dietary fats.',
    notes: 'Recommended during winter season for optimal serum 25(OH)D levels.',
    sourceType: 'clinician_verified',
    sourceDocumentRef: 'Clinic Visit Orders (Jan 2026)',
    requiresConfirmation: false,
    status: 'active',
    reminders: {
      enabled: true,
      paused: false,
      times: ['12:30'],
      timezone: 'Asia/Kolkata',
      repeatSchedule: 'daily',
      maskNotificationPreview: false
    },
    doseLogs: [
      {
        id: 'dl-201',
        timestamp: '2026-03-28T12:35:00Z',
        scheduledTime: '12:30',
        status: 'taken'
      },
      {
        id: 'dl-202',
        timestamp: '2026-03-29T12:30:00Z',
        scheduledTime: '12:30',
        status: 'taken'
      }
    ],
    changeLog: [
      {
        id: 'cl-2',
        timestamp: '2026-01-05T11:00:00Z',
        changedBy: 'Dr. Sarah Chen, MD',
        action: 'CREATED',
        rationale: 'Mild seasonal insufficiency management'
      }
    ]
  },
  {
    id: 'med-3',
    patientId: 'pat-1',
    name: 'Acetaminophen (PRN)',
    strength: '500 mg',
    dosage: '1-2 tablets (500-1,000 mg)',
    route: 'Oral',
    frequency: 'As needed for tension pain',
    timing: 'Every 6-8 hours PRN (Max 3,000 mg/day)',
    startDate: '2026-03-24',
    prescribingClinician: 'Self-Reported / Over-The-Counter',
    prescriptionInstructions: 'Take 1 to 2 tablets every 6 hours as needed for tension headache. Do not exceed 3,000 mg in 24 hours.',
    indication: 'Mild tension headache / cervical discomfort',
    prescribingContext: 'Self-Report Intake',
    foodNotes: 'Take with full glass of water. Avoid combining with alcohol or other acetaminophen products.',
    notes: 'Used occasionally following extended screen work.',
    sourceType: 'patient_entered',
    sourceDocumentRef: 'Patient Intake Portal',
    requiresConfirmation: false,
    status: 'active',
    reminders: {
      enabled: false,
      paused: false,
      times: [],
      timezone: 'Asia/Kolkata',
      repeatSchedule: 'prn',
      maskNotificationPreview: false
    },
    doseLogs: [
      {
        id: 'dl-301',
        timestamp: '2026-03-24T18:15:00Z',
        scheduledTime: '18:00',
        status: 'taken',
        notes: '1 tablet taken for tension headache after work'
      }
    ],
    changeLog: [
      {
        id: 'cl-3',
        timestamp: '2026-03-24T09:00:00Z',
        changedBy: 'Patient (Aryan Yadav)',
        action: 'CREATED',
        rationale: 'Self-logged PRN analgesic for tension headache relief'
      }
    ]
  },
  {
    id: 'med-4',
    patientId: 'pat-1',
    name: 'Amoxicillin (Completed Course)',
    strength: '500 mg',
    dosage: '1 capsule (500 mg)',
    route: 'Oral',
    frequency: 'Three times daily (Every 8 hours)',
    timing: '08:00 AM, 02:00 PM, 10:00 PM',
    startDate: '2025-10-12',
    endDate: '2025-10-22',
    prescribingClinician: 'Dr. Robert Vance, MD',
    prescriptionInstructions: 'Take 1 capsule by mouth every 8 hours for 10 days until finished.',
    indication: 'Acute Streptococcal Pharyngitis',
    prescribingContext: 'Urgent Care Encounter',
    foodNotes: 'Take with or without food. Complete entire course.',
    notes: 'Completed full 10-day antibiotic regimen without adverse gastrointestinal effects.',
    sourceType: 'clinician_verified',
    sourceDocumentRef: 'Urgent Care Discharge Summary (Oct 2025)',
    requiresConfirmation: false,
    status: 'completed',
    reminders: {
      enabled: false,
      paused: false,
      times: ['08:00', '14:00', '22:00'],
      timezone: 'Asia/Kolkata',
      repeatSchedule: 'daily',
      maskNotificationPreview: false
    },
    doseLogs: [],
    changeLog: [
      {
        id: 'cl-4a',
        timestamp: '2025-10-12T09:00:00Z',
        changedBy: 'Dr. Robert Vance, MD',
        action: 'CREATED',
        rationale: 'Prescribed for acute bacterial pharyngitis'
      },
      {
        id: 'cl-4b',
        timestamp: '2025-10-22T20:00:00Z',
        changedBy: 'Dr. Robert Vance, MD',
        action: 'DISCONTINUED',
        rationale: 'Standard 10-day antimicrobial course successfully completed'
      }
    ]
  },
  {
    id: 'med-5',
    patientId: 'pat-1',
    name: 'Metoprolol Tartrate (Pending Confirmation)',
    strength: '25 mg (Uncertain)',
    dosage: '1 tablet (Uncertain SIG)',
    route: 'Oral',
    frequency: 'Twice daily (Pending verification)',
    timing: 'Morning and Evening',
    startDate: '2026-03-26',
    prescribingClinician: 'External Clinic Record',
    prescriptionInstructions: 'SIG text partially illegible on scanned document: Appears "Take 1 tab BID with food".',
    indication: 'Possible Antihypertensive Adjunct',
    prescribingContext: 'Optical Document Extraction',
    foodNotes: 'Always take with meals.',
    notes: 'Prescription scan contains ambiguous instructions. Requires clinician verification before taking.',
    sourceType: 'extracted_from_prescription',
    sourceDocumentRef: 'Uploaded External Record #DOC-7721',
    requiresConfirmation: true,
    confirmationNotes: 'Prescription instructions are ambiguous on the scanned document. The system did not guess dosage or schedule. Please verify exact dosage and timing with Dr. Sarah Chen.',
    status: 'paused',
    reminders: {
      enabled: false,
      paused: true,
      times: [],
      timezone: 'Asia/Kolkata',
      repeatSchedule: 'daily',
      maskNotificationPreview: true
    },
    doseLogs: [],
    changeLog: [
      {
        id: 'cl-5',
        timestamp: '2026-03-26T14:30:00Z',
        changedBy: 'Optical Record Ingestion Protocol',
        action: 'CREATED',
        rationale: 'Extracted with ambiguous SIG flag; paused pending physician review'
      }
    ]
  }
];

const INITIAL_REPORTS: MedicalReportRecord[] = [
  {
    id: 'rep-1',
    title: 'Complete Blood Count (CBC) with Differential',
    date: '2026-03-20',
    laboratory: 'Metro Reference Diagnostics',
    specimenType: 'Whole Blood (EDTA)',
    status: 'normal',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    clinicalImpression:
      'Normocytic, normochromic red cell morphology. Leukocyte count and platelet indices are well preserved within biological reference limits. No microcytosis or left shift.',
    questionsForDoctor: [
      'Are my hemoglobin and iron reserves optimal for my current endurance training?',
      'When should we schedule our routine annual re-screening panel?'
    ],
    results: [
      {
        testName: 'Hemoglobin (Hgb)',
        code: '718-7',
        value: '13.8',
        unit: 'g/dL',
        referenceRange: '12.0 – 16.0',
        status: 'normal',
        explanation: 'Primary oxygen carrier in blood. Optimal concentration across tissues.'
      },
      {
        testName: 'White Blood Cell Count (WBC)',
        code: '6690-2',
        value: '7.4',
        unit: '×10⁹/L',
        referenceRange: '4.5 – 11.0',
        status: 'normal',
        explanation: 'Balanced immune count. No leukocytosis indicative of active bacterial infection.'
      },
      {
        testName: 'Platelets (PLT)',
        code: '777-3',
        value: '245',
        unit: '×10⁹/L',
        referenceRange: '150 – 450',
        status: 'normal',
        explanation: 'Essential for coagulation and hemostatic repair.'
      },
      {
        testName: 'Fasting Serum Glucose',
        code: '2345-7',
        value: '104',
        unit: 'mg/dL',
        referenceRange: '70 – 99',
        status: 'attention',
        explanation: 'Borderline fasting reading. Recommend monitoring with HbA1c test.'
      }
    ]
  }
];

const INITIAL_HANDOFFS: DoctorHandoffRecord[] = [
  {
    id: 'h-1',
    shareToken: 'sec-hnd-9a8b7c6d5e4f',
    date: '2026-03-24',
    patientId: 'pat-1',
    patientName: 'Aryan Yadav',
    mrn: 'MAI-80429',
    dateOfBirth: '1998-09-14',
    bloodGroup: 'O+',
    allergies: ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)'],
    chiefConcern: 'Bilateral Frontal Tension Headache & Cervical Strain',
    duration: '2 days (gradual onset)',
    hpiSynopsis:
      '27-year-old male presents with 2-day gradual onset of bilateral band-like frontal headache (severity 4/10). Symptoms aggravate following prolonged computer screen use. Denies fever, vomiting, photophobia, limb weakness, or acute visual disturbance. Ambulatory vitals stable (BP 118/76 mmHg). Currently taking Lisinopril 10mg daily for controlled hypertension.',
    currentMedications: ['Lisinopril 10mg daily', 'Vitamin D3 2000 IU daily', 'Acetaminophen 500mg PRN'],
    medicalConditions: ['Essential Hypertension (Stage 1, Controlled)', 'Mild Tension Headaches'],
    recentVitalsSummary: 'BP: 118/76 mmHg · HR: 68 bpm · SpO2: 99% · Temp: 98.3°F',
    labHighlights: ['CBC Normal (Hgb 13.8 g/dL, WBC 7.4)', 'Fasting Glucose 104 mg/dL (Borderline)'],
    patientQuestions: [
      'Could this headache be aggravated by cervical posture or eye strain?',
      'Does my borderline fasting glucose of 104 mg/dL warrant follow-up HbA1c testing?'
    ],
    sourceAttributions: [
      {
        id: 'sa-1',
        item: 'Chief Complaint: Bilateral Frontal Tension Headache',
        sourceType: 'patient_entered',
        originalRecordRef: 'AI Clinical Assessment (c-101)',
        recordDate: '2026-03-24'
      },
      {
        id: 'sa-2',
        item: 'Active Regimen: Lisinopril 10mg Daily',
        sourceType: 'clinician_verified',
        originalRecordRef: 'Prescription Records (med-1)',
        recordDate: '2025-11-10'
      },
      {
        id: 'sa-3',
        item: 'Diagnostic: CBC Panel Normal & Fasting Glucose 104 mg/dL',
        sourceType: 'extracted_record',
        originalRecordRef: 'Metro Diagnostic Lab (rep-1)',
        recordDate: '2026-03-20'
      },
      {
        id: 'sa-4',
        item: 'Telemetry: BP 118/76 mmHg, Pulse 68 bpm, SpO2 99%',
        sourceType: 'clinician_verified',
        originalRecordRef: 'Ambulatory Telemetry (v-5)',
        recordDate: '2026-03-29'
      },
      {
        id: 'sa-5',
        item: 'Clinical HPI Synopsis & Suggested Discussion Questions',
        sourceType: 'ai_synthesized',
        originalRecordRef: 'AI Synthesis Protocol',
        recordDate: '2026-03-24',
        isUncertain: false
      }
    ],
    includedRecordIds: ['rep-1', 'v-5', 'med-1', 'med-2'],
    excludedSensitiveCategories: [],
    dataQualityWarnings: [
      'Fasting glucose of 104 mg/dL on Mar 20 is borderline — formal HbA1c follow-up recommended.',
      'Weight was last logged 11 days ago; current weight not re-measured today.'
    ],
    recipientName: 'Dr. Sarah Chen, MD',
    recipientSpecialty: 'Internal Medicine & Cardiovascular Health',
    recipientFacility: 'Metro Clinical Reference Hospital',
    recipientEmail: 's.chen@metrohealth.org',
    expiresAt: '2026-04-24T00:00:00Z',
    isRevoked: false,
    consentStatus: 'authorized',
    status: 'reviewed',
    doctorReviewNotes:
      'Reviewed pre-encounter brief. Likely tension headache secondary to cervical posture strain. Recommend ergonomic screen breaks and scheduled HbA1c screening.',
    auditLog: [
      {
        timestamp: '2026-03-24T09:00:00Z',
        action: 'CREATED',
        actor: 'Aryan Yadav (Patient)',
        details: 'Initial clinical brief generated from verified records'
      },
      {
        timestamp: '2026-03-24T09:05:00Z',
        action: 'TRANSMITTED',
        actor: 'Aryan Yadav (Patient)',
        details: 'Transmitted securely to Dr. Sarah Chen, MD'
      },
      {
        timestamp: '2026-03-25T09:15:00Z',
        action: 'VIEWED',
        actor: 'Dr. Sarah Chen, MD',
        details: 'Clinician accessed record via secure clinical portal'
      }
    ]
  }
];

const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat-1',
    name: 'Alex Morgan',
    mrn: 'MED-80429',
    age: 38,
    gender: 'Female',
    bloodType: 'O+',
    phone: '+1 (555) 382-9104',
    email: 'alex.morgan@health.me',
    lastVisit: '2026-03-24',
    triageStatus: 'routine',
    activeConditions: ['Mild Tension Headaches', 'Essential Hypertension (Controlled)'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    assignedDoctor: 'Dr. Sarah Chen, MD',
    recentConsultationId: 'c-101',
    recentHandoffId: 'h-1'
  },
  {
    id: 'pat-2',
    name: 'David K. Miller',
    mrn: 'MED-71932',
    age: 54,
    gender: 'Male',
    bloodType: 'A+',
    phone: '+1 (555) 491-0021',
    email: 'd.miller@workmail.com',
    lastVisit: '2026-03-26',
    triageStatus: 'urgent',
    activeConditions: ['Type 2 Diabetes Mellitus', 'Refractory Nocturnal Pyrexia'],
    allergies: ['None Known'],
    assignedDoctor: 'Dr. Sarah Chen, MD',
    recentConsultationId: 'c-103'
  },
  {
    id: 'pat-3',
    name: 'Elena Rostova',
    mrn: 'MED-90214',
    age: 29,
    gender: 'Female',
    bloodType: 'B-',
    phone: '+1 (555) 602-8819',
    email: 'elena.rostova@design.co',
    lastVisit: '2026-03-27',
    triageStatus: 'prompt_evaluation',
    activeConditions: ['Persistent Productive Cough', 'Seasonal Allergic Rhinitis'],
    allergies: ['Amoxicillin', 'Aspirin'],
    assignedDoctor: 'Dr. Sarah Chen, MD'
  },
  {
    id: 'pat-4',
    name: 'Marcus Vance',
    mrn: 'MED-65481',
    age: 67,
    gender: 'Male',
    bloodType: 'O-',
    phone: '+1 (555) 819-3342',
    email: 'm.vance@retired.org',
    lastVisit: '2026-03-28',
    triageStatus: 'routine',
    department: 'Cardiology',
    activeConditions: ['Atrial Fibrillation (Stable)', 'Hyperlipidemia'],
    allergies: ['Latex'],
    assignedDoctor: 'Dr. Sarah Chen, MD'
  },
  {
    id: 'pat-5',
    name: 'Priya Sharma',
    mrn: 'MAI-54318',
    age: 42,
    gender: 'Female',
    bloodType: 'AB+',
    phone: '+1 (555) 723-9041',
    email: 'priya.sharma@health.me',
    lastVisit: '2026-03-29',
    triageStatus: 'emergency',
    department: 'Cardiology',
    activeConditions: ['Acute Crushing Retrosternal Chest Pressure', 'Diaphoresis'],
    allergies: ['Penicillin', 'Sulfa'],
    assignedDoctor: 'Dr. Sarah Chen, MD',
    isEscalated: true,
    caseStatus: 'escalated',
    reportedSymptoms: ['Severe retrosternal chest pain radiating to left jaw', 'Diaphoresis', 'Dyspnea'],
    vitalsSummary: 'BP 88/54 mmHg, HR 128 bpm, SpO2 91% on room air',
    priorityAssignedAt: '2026-03-29T08:15:00Z',
    priorityExplanation: 'Suspected Acute Coronary Syndrome (STEMI risk) with hemodynamic compromise.',
    prioritySource: 'configured_rule'
  }
];

const INITIAL_ESCALATIONS: TriageEscalationRecord[] = [
  {
    id: 'esc-1',
    patientId: 'pat-5',
    patientName: 'Priya Sharma',
    mrn: 'MAI-54318',
    severity: 9,
    triageTier: 'emergency',
    acuityLevel: 'critical',
    triggeredFlags: ['crushing chest pain', 'hypotensive shock'],
    reason: 'Severe retrosternal chest pain with diaphoresis and hypotensive shock (BP 88/54). STEMI alert.',
    triggerReason: 'Severe retrosternal chest pain with diaphoresis and hypotensive shock (BP 88/54). STEMI alert.',
    status: 'active',
    escalatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    escalationTimestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    assignedTeam: 'Cardiology',
    assignedDepartment: 'Cardiology',
    assignedClinician: 'Dr. Sarah Chen, MD',
    policyResponseTimeMinutes: 5,
    overdueMinutesThreshold: 5,
    responseTimeMinutes: 12,
    isOverdue: true,
    vitalSignsSnapshot: {
      bloodPressure: '88/54 mmHg',
      heartRate: '128 bpm',
      oxygenSaturation: '91%',
      respiratoryRate: '26 /min',
      temperature: '37.1 °C'
    },
    auditLog: [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        actor: 'Clinical Triage AI Rule Engine',
        action: 'ESCALATION_TRIGGERED',
        details: 'Code STEMI Criteria Met: Severe chest pain + hypotension.'
      }
    ]
  }
];

// Reactive In-Memory Singleton with LocalSession Persistence
class ClinicalStore {
  private consultations: ConsultationRecord[] = INITIAL_CONSULTATIONS;
  private vitals: VitalDataPoint[] = INITIAL_VITALS;
  private medications: MedicationItem[] = INITIAL_MEDICATIONS;
  private reports: MedicalReportRecord[] = INITIAL_REPORTS;
  private handoffs: DoctorHandoffRecord[] = INITIAL_HANDOFFS;
  private patients: PatientRecord[] = INITIAL_PATIENTS;
  private appointments: AppointmentRecord[] = INITIAL_APPOINTMENTS;
  private tasks: HealthTaskItem[] = INITIAL_TASKS;
  private clinicalTasks: ClinicalTask[] = [];
  private doctorAssessments: DoctorClinicalAssessment[] = [];
  private triageEscalations: TriageEscalationRecord[] = INITIAL_ESCALATIONS;
  private signedReports: Record<string, { signedBy: string; signedAt: string; notes?: string }> = {};
  private medicationOrders: MedicationOrder[] = [];
  private referrals: ClinicalReferralRecord[] = [];
  private clinicalNotifications: ClinicalNotificationRecord[] = [];
  private listeners: Set<() => void> = new Set();


  public getDoctorAuthHeaders(override?: { role?: ClinicianRole; id?: string; name?: string }): Record<string, string> {
    const currentRole = override?.role || (typeof window !== 'undefined' ? (localStorage.getItem('active_clinician_role') as ClinicianRole) : null) || 'doctor';
    const currentId = override?.id || (typeof window !== 'undefined' ? localStorage.getItem('active_clinician_id') : null) || 'doc-1';
    const currentName = override?.name || (typeof window !== 'undefined' ? localStorage.getItem('active_clinician_name') : null) || 'Dr. Sarah Chen, MD';

    return {
      'x-user-role': currentRole,
      'x-role': currentRole,
      'x-clinician-id': currentId,
      'x-doctor-id': currentId,
      'x-doctor-name': currentName,
      'x-doctor-npi': currentRole === 'doctor' ? '1942850192' : (currentRole === 'admin' ? '1639201490' : '1538209411')
    };
  }

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.syncWithServer('pat-1').catch(() => {});
    }
  }

  public async syncWithServer(patientId: string = 'pat-1'): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      const res = await fetch(`/api/clinical/patient/${patientId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.vitals) && json.data.vitals.length > 0) {
            this.vitals = json.data.vitals.sort((a: VitalDataPoint, b: VitalDataPoint) => {
              const timeA = a.timestamp ? new Date(a.timestamp).getTime() : (a.date ? new Date(a.date).getTime() : 0);
              const timeB = b.timestamp ? new Date(b.timestamp).getTime() : (b.date ? new Date(b.date).getTime() : 0);
              return timeA - timeB;
            });
          }
          if (Array.isArray(json.data.medications) && json.data.medications.length > 0) {
            this.medications = json.data.medications;
          }
          if (Array.isArray(json.data.consultations) && json.data.consultations.length > 0) {
            this.consultations = json.data.consultations;
          }
          if (Array.isArray(json.data.reports) && json.data.reports.length > 0) {
            this.reports = json.data.reports;
          }
          if (Array.isArray(json.data.handoffs) && json.data.handoffs.length > 0) {
            this.handoffs = json.data.handoffs;
          }
          if (Array.isArray(json.data.appointments) && json.data.appointments.length > 0) {
            this.appointments = json.data.appointments;
          }
          this.saveToStorage();
          this.listeners.forEach((l) => l());
        }
      }
    } catch {
      // offline fallback
    }
  }

  private loadFromStorage() {
    try {
      const v = sessionStorage.getItem('med_vitals');
      if (v) this.vitals = JSON.parse(v);
      const c = sessionStorage.getItem('med_consultations');
      if (c) this.consultations = JSON.parse(c);
      const m = sessionStorage.getItem('med_medications');
      if (m) this.medications = JSON.parse(m);
      const r = sessionStorage.getItem('med_reports');
      if (r) this.reports = JSON.parse(r);
      const h = sessionStorage.getItem('med_handoffs');
      if (h) this.handoffs = JSON.parse(h);
      const p = sessionStorage.getItem('med_patients');
      if (p) this.patients = JSON.parse(p);
      const apt = sessionStorage.getItem('med_appointments');
      if (apt) this.appointments = JSON.parse(apt);
      const t = sessionStorage.getItem('med_tasks');
      if (t) this.tasks = JSON.parse(t);
      const mo = sessionStorage.getItem('med_medication_orders');
      if (mo) this.medicationOrders = JSON.parse(mo);
      const ref = sessionStorage.getItem('med_referrals');
      if (ref) this.referrals = JSON.parse(ref);
      const notifs = sessionStorage.getItem('med_clinical_notifications');
      if (notifs) this.clinicalNotifications = JSON.parse(notifs);
    } catch {
      // safe fallback
    }
  }

  private saveToStorage() {
    try {
      sessionStorage.setItem('med_vitals', JSON.stringify(this.vitals));
      sessionStorage.setItem('med_consultations', JSON.stringify(this.consultations));
      sessionStorage.setItem('med_medications', JSON.stringify(this.medications));
      sessionStorage.setItem('med_reports', JSON.stringify(this.reports));
      sessionStorage.setItem('med_handoffs', JSON.stringify(this.handoffs));
      sessionStorage.setItem('med_patients', JSON.stringify(this.patients));
      sessionStorage.setItem('med_appointments', JSON.stringify(this.appointments));
      sessionStorage.setItem('med_tasks', JSON.stringify(this.tasks));
      sessionStorage.setItem('med_medication_orders', JSON.stringify(this.medicationOrders));
      sessionStorage.setItem('med_referrals', JSON.stringify(this.referrals));
      sessionStorage.setItem('med_clinical_notifications', JSON.stringify(this.clinicalNotifications));
    } catch {
      // safe fallback
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // Consultations
  public getConsultations(patientId?: string): ConsultationRecord[] {
    if (patientId && patientId !== 'all') {
      return this.consultations.filter((c) => !c.patientId || c.patientId === patientId);
    }
    return [...this.consultations];
  }

  public addConsultation(record: Omit<ConsultationRecord, 'id' | 'date'>): ConsultationRecord {
    const newRecord: ConsultationRecord = {
      ...record,
      id: `c-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.consultations.unshift(newRecord);

    // Update patient triage status
    const pat = this.patients.find((p) => p.id === newRecord.patientId);
    if (pat) {
      pat.triageStatus = newRecord.triageCategory;
      pat.lastVisit = newRecord.date;
      pat.recentConsultationId = newRecord.id;
    }

    this.notify();
    return newRecord;
  }

  // Vitals
  public getVitals(patientId?: string): VitalDataPoint[] {
    if (patientId && patientId !== 'all') {
      return this.vitals.filter((v) => !v.patientId || v.patientId === patientId);
    }
    return [...this.vitals];
  }

  public addVital(vital: Omit<VitalDataPoint, 'id'>): VitalDataPoint {
    const newVital: VitalDataPoint = {
      ...vital,
      id: `v-${Date.now()}`,
      timestamp: vital.timestamp || new Date().toISOString()
    };
    this.vitals.push(newVital);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clinical/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVital)
      }).catch((e) => console.warn('[SYNC] Vital sync notice:', e));
    }

    return newVital;
  }

  // Medications Management
  public getMedications(patientId?: string): MedicationItem[] {
    if (patientId) {
      return this.medications.filter((m) => !m.patientId || m.patientId === patientId);
    }
    return [...this.medications];
  }

  public getMedicationById(id: string): MedicationItem | undefined {
    return this.medications.find((m) => m.id === id);
  }

  public addMedication(med: Partial<MedicationItem> & { name: string; dosage: string }): MedicationItem {
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const systemTz = Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'Asia/Kolkata';

    const newMed: MedicationItem = {
      id: med.id || `med-${Date.now()}`,
      patientId: med.patientId || 'pat-1',
      name: med.name.trim(),
      strength: med.strength || med.dosage,
      dosage: med.dosage.trim(),
      route: med.route || 'Oral',
      frequency: med.frequency || 'Once daily',
      timing: med.timing || 'Morning',
      startDate: med.startDate || todayStr,
      endDate: med.endDate,
      prescribingClinician: med.prescribingClinician || 'Patient-Entered / Self-Managed',
      prescriptionInstructions: med.prescriptionInstructions || 'Take as directed on packaging.',
      indication: med.indication || 'General Health & Maintenance',
      prescribingContext: med.prescribingContext || 'Self-Report Intake',
      foodNotes: med.foodNotes || 'Take with water.',
      notes: med.notes,
      sourceType: med.sourceType || 'patient_entered',
      sourceDocumentRef: med.sourceDocumentRef || 'Patient Intake Portal',
      requiresConfirmation: med.requiresConfirmation ?? false,
      confirmationNotes: med.confirmationNotes,
      status: med.status || 'active',
      reminders: med.reminders || {
        enabled: true,
        paused: false,
        times: ['08:00'],
        timezone: systemTz,
        repeatSchedule: 'daily',
        maskNotificationPreview: false
      },
      doseLogs: med.doseLogs || [],
      changeLog: med.changeLog || [
        {
          id: `cl-${Date.now()}`,
          timestamp: nowIso,
          changedBy: 'Patient (Authorized Owner)',
          action: 'CREATED',
          rationale: 'Initial regimen added to clinical profile'
        }
      ]
    };

    this.medications.unshift(newMed);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clinical/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed)
      }).catch((e) => console.warn('[SYNC] Med sync notice:', e));
    }

    return newMed;
  }

  public updateMedication(
    id: string,
    updates: Partial<MedicationItem>,
    changedBy: string = 'Patient (Authorized Owner)',
    rationale?: string
  ): MedicationItem | null {
    const idx = this.medications.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const existing = this.medications[idx];
      const nowIso = new Date().toISOString();

      const newChangeLogEntry: MedicationChangeLogEntry = {
        id: `cl-${Date.now()}`,
        timestamp: nowIso,
        changedBy,
        action: 'UPDATED',
        rationale: rationale || 'Patient updated regimen parameters'
      };

      this.medications[idx] = {
        ...existing,
        ...updates,
        changeLog: [...(existing.changeLog || []), newChangeLogEntry]
      };

      this.notify();
      return this.medications[idx];
    }
    return null;
  }

  public confirmMedication(id: string, confirmedBy: string = 'Patient & Clinician Verified'): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.requiresConfirmation = false;
      med.confirmationNotes = 'Verified with prescribing physician';
      med.status = 'active';
      med.changeLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: confirmedBy,
        action: 'CONFIRMED',
        rationale: 'Patient confirmed verified instructions with qualified practitioner'
      });
      this.notify();
      return true;
    }
    return false;
  }

  public logDose(
    id: string,
    status: DoseLogStatus,
    scheduledTime: string = '08:00',
    notes?: string,
    snoozedMinutes?: number
  ): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      const now = new Date();
      let snoozedUntil: string | undefined;
      if (status === 'snoozed' && snoozedMinutes) {
        snoozedUntil = new Date(now.getTime() + snoozedMinutes * 60000).toISOString();
      }

      const logEntry: MedicationDoseLog = {
        id: `dl-${Date.now()}`,
        timestamp: now.toISOString(),
        scheduledTime,
        status,
        snoozedUntil,
        notes
      };

      med.doseLogs.unshift(logEntry);
      // NOTE: Missing a dose or logging missed doses DOES NOT automatically discontinue treatment!
      this.notify();

      if (typeof window !== 'undefined') {
        fetch(`/api/clinical/medications/${id}/dose`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, scheduledTime, notes })
        }).catch((e) => console.warn('[SYNC] Dose sync notice:', e));
      }

      return true;
    }
    return false;
  }

  public updateReminderConfig(id: string, config: Partial<MedicationReminderConfig>): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.reminders = {
        ...med.reminders,
        ...config
      };
      med.changeLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: 'Patient (Authorized Owner)',
        action: 'REMINDERS_UPDATED',
        rationale: 'Updated reminder time, repeat schedule, or privacy masking'
      });
      this.notify();
      return true;
    }
    return false;
  }

  public pauseReminders(id: string, pausedUntil?: string): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.reminders.paused = true;
      med.reminders.pausedUntil = pausedUntil;
      med.changeLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: 'Patient (Authorized Owner)',
        action: 'PAUSED',
        rationale: pausedUntil ? `Reminders temporarily paused until ${pausedUntil}` : 'Reminders paused'
      });
      this.notify();
      return true;
    }
    return false;
  }

  public resumeReminders(id: string): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.reminders.paused = false;
      med.reminders.pausedUntil = undefined;
      med.changeLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: 'Patient (Authorized Owner)',
        action: 'RESUMED',
        rationale: 'Reminders resumed'
      });
      this.notify();
      return true;
    }
    return false;
  }

  public discontinueMedication(id: string, reason: string, discontinuedBy: string = 'Patient / Clinician'): boolean {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.status = 'discontinued';
      med.discontinuedDate = new Date().toISOString().split('T')[0];
      med.discontinuationReason = reason;
      med.reminders.enabled = false;
      med.changeLog.push({
        id: `cl-${Date.now()}`,
        timestamp: new Date().toISOString(),
        changedBy: discontinuedBy,
        action: 'DISCONTINUED',
        rationale: `Therapy discontinued: ${reason}`
      });
      this.notify();

      if (typeof window !== 'undefined') {
        fetch(`/api/clinical/medications/${id}/discontinue`, {
          method: 'POST',
          headers: {
            ...this.getDoctorAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }).catch((e) => console.warn('[SYNC] Discontinue sync notice:', e));
      }

      return true;
    }
    return false;
  }

  // ==========================================
  // MEDICATION ORDERS & CLINICAL PRESCRIBING
  // ==========================================

  public getMedicationOrders(patientId?: string): MedicationOrder[] {
    if (patientId && patientId !== 'all') {
      return this.medicationOrders.filter((o) => !o.patientId || o.patientId === patientId);
    }
    return [...this.medicationOrders];
  }

  public async fetchMedications(patientId: string = 'pat-1', status?: string): Promise<MedicationItem[]> {
    try {
      const url = status && status !== 'all'
        ? `/api/clinical/medications?patientId=${patientId}&status=${status}`
        : `/api/clinical/medications?patientId=${patientId}`;
      const res = await fetch(url, { headers: this.getDoctorAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.medications)) {
          // Merge into local cache
          for (const m of json.medications) {
            const idx = this.medications.findIndex((existing) => existing.id === m.id);
            if (idx >= 0) {
              this.medications[idx] = m;
            } else {
              this.medications.push(m);
            }
          }
          this.saveToStorage();
          this.notify();
          return json.medications;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch medications from server:', err);
    }
    return this.getMedications(patientId);
  }

  public async fetchMedicationOrders(patientId: string = 'all'): Promise<MedicationOrder[]> {
    try {
      const url = patientId !== 'all'
        ? `/api/clinical/medications/orders?patientId=${patientId}`
        : `/api/clinical/medications/orders`;
      const res = await fetch(url, { headers: this.getDoctorAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          this.medicationOrders = json.orders;
          this.saveToStorage();
          this.notify();
          return json.orders;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch medication orders from server:', err);
    }
    return this.getMedicationOrders(patientId);
  }

  public async createMedicationOrder(
    payload: Partial<MedicationOrder> & { name: string; dosage: string; frequency: string; instructions: string }
  ): Promise<{ success: boolean; order?: MedicationOrder; error?: string }> {
    try {
      const res = await fetch('/api/clinical/medications/orders', {
        method: 'POST',
        headers: {
          ...this.getDoctorAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success && json.order) {
        this.medicationOrders.unshift(json.order);
        this.saveToStorage();
        this.notify();
        return { success: true, order: json.order };
      }
      return { success: false, error: json.error || 'Failed to create medication order draft.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error creating medication order.' };
    }
  }

  public async amendMedicationOrder(
    orderId: string,
    updates: Partial<MedicationOrder>,
    reason: string = 'Clinician amendment of draft parameters'
  ): Promise<{ success: boolean; order?: MedicationOrder; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/medications/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          ...this.getDoctorAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...updates, reason })
      });
      const json = await res.json();
      if (res.ok && json.success && json.order) {
        const idx = this.medicationOrders.findIndex((o) => o.id === orderId);
        if (idx >= 0) this.medicationOrders[idx] = json.order;
        this.saveToStorage();
        this.notify();
        return { success: true, order: json.order };
      }
      return { success: false, error: json.error || 'Failed to amend medication order.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error amending medication order.' };
    }
  }

  public async authorizeMedicationOrder(
    orderId: string,
    notes?: string
  ): Promise<{ success: boolean; order?: MedicationOrder; medication?: MedicationItem; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/medications/orders/${orderId}/authorize`, {
        method: 'POST',
        headers: {
          ...this.getDoctorAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      const json = await res.json();
      if (res.ok && json.success && json.order) {
        const idx = this.medicationOrders.findIndex((o) => o.id === orderId);
        if (idx >= 0) this.medicationOrders[idx] = json.order;

        if (json.medication) {
          const medIdx = this.medications.findIndex((m) => m.id === json.medication.id);
          if (medIdx >= 0) {
            this.medications[medIdx] = json.medication;
          } else {
            this.medications.unshift(json.medication);
          }
        }

        this.saveToStorage();
        this.notify();
        return { success: true, order: json.order, medication: json.medication };
      }
      return { success: false, error: json.error || 'Failed to authorize medication order.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error authorizing medication order.' };
    }
  }

  public async cancelMedicationOrder(
    orderId: string,
    reason: string
  ): Promise<{ success: boolean; order?: MedicationOrder; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/medications/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          ...this.getDoctorAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const json = await res.json();
      if (res.ok && json.success && json.order) {
        const idx = this.medicationOrders.findIndex((o) => o.id === orderId);
        if (idx >= 0) this.medicationOrders[idx] = json.order;
        this.saveToStorage();
        this.notify();
        return { success: true, order: json.order };
      }
      return { success: false, error: json.error || 'Failed to cancel medication order draft.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error cancelling medication order.' };
    }
  }

  public async screenMedicationSafety(
    patientId: string,
    medicationName: string,
    route: string = 'Oral'
  ): Promise<{ success: boolean; safety?: any; error?: string }> {
    try {
      const res = await fetch('/api/clinical/medications/safety-screen', {
        method: 'POST',
        headers: {
          ...this.getDoctorAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patientId, medicationName, route })
      });
      const json = await res.json();
      if (res.ok && json.success && json.safety) {
        return { success: true, safety: json.safety };
      }
      return { success: false, error: json.error || 'Safety screen failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error running safety screen' };
    }
  }

  public removeMedication(id: string): boolean {
    const prevLength = this.medications.length;
    this.medications = this.medications.filter((m) => m.id !== id);
    if (this.medications.length !== prevLength) {
      this.notify();
      return true;
    }
    return false;
  }

  public toggleMedicationStatus(id: string) {
    const med = this.medications.find((m) => m.id === id);
    if (med) {
      med.status = med.status === 'active' ? 'paused' : 'active';
      this.notify();
    }
  }

  // Drug-Drug Interaction Screen (Informational Reference)
  public checkDrugInteractions(medicationsList?: MedicationItem[]): DrugInteractionCheckResult {
    const active = (medicationsList || this.medications).filter((m) => m.status === 'active');
    const names = active.map((m) => m.name.toLowerCase());
    const interactions: DrugInteractionCheckResult['interactions'] = [];

    // Curated clinical monograph interaction rules
    // Rule 1: ACE Inhibitors (Lisinopril) + Potassium-Sparing or Salt Substitutes
    const hasAceInhibitor = names.some((n) => n.includes('lisinopril') || n.includes('enalapril') || n.includes('ramipril'));
    const mentionsPotassiumInRegimens = active.some((m) =>
      m.name.toLowerCase().includes('potassium') ||
      m.foodNotes?.toLowerCase().includes('potassium') ||
      m.notes?.toLowerCase().includes('potassium')
    );
    if (hasAceInhibitor && mentionsPotassiumInRegimens) {
      interactions.push({
        id: 'int-1',
        drugA: 'Lisinopril',
        drugB: 'Potassium Salt Substitutes / Potassium Supplement',
        severity: 'moderate',
        description: 'Concomitant use of ACE inhibitors with potassium supplements or potassium-based salt substitutes increases the risk of severe hyperkalemia.',
        clinicalManagement: 'Avoid potassium salt substitutes without physician approval. Routine serum potassium monitoring is advised.'
      });
    }

    // Rule 2: ACE Inhibitor (Lisinopril) + NSAIDs (Ibuprofen, Naproxen, Ketorolac)
    const hasNsaid = names.some((n) => n.includes('ibuprofen') || n.includes('naproxen') || n.includes('diclofenac') || n.includes('celecoxib'));
    if (hasAceInhibitor && hasNsaid) {
      interactions.push({
        id: 'int-2',
        drugA: 'Lisinopril (ACE Inhibitor)',
        drugB: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
        severity: 'moderate',
        description: 'NSAIDs may blunt the antihypertensive effectiveness of ACE inhibitors and cause reversible acute deterioration of renal function, particularly in volume-depleted or elderly patients.',
        clinicalManagement: 'Use lowest effective NSAID dose for short duration. Acetaminophen is generally preferred for simple analgesic needs.'
      });
    }

    // Rule 3: ACE Inhibitor + ARB / Aliskiren (Dual RAAS Blockade)
    const hasArb = names.some((n) => n.includes('losartan') || n.includes('valsartan') || n.includes('telmisartan') || n.includes('aliskiren'));
    if (hasAceInhibitor && hasArb) {
      interactions.push({
        id: 'int-3',
        drugA: 'Lisinopril',
        drugB: 'Angiotensin Receptor Blocker (ARB)',
        severity: 'critical',
        description: 'Dual blockade of the renin-angiotensin system with ACE inhibitors and ARBs is associated with higher risks of hypotension, syncope, hyperkalemia, and acute kidney injury.',
        clinicalManagement: 'Dual RAAS blockade is generally contraindicated. Requires immediate clinician clarification.'
      });
    }

    // Rule 4: Acetaminophen + Excessive Dose or Hepatotoxins
    const hasAcetaminophen = names.some((n) => n.includes('acetaminophen') || n.includes('paracetamol'));
    const acetCount = active.filter((m) => m.name.toLowerCase().includes('acetaminophen') || m.name.toLowerCase().includes('paracetamol')).length;
    if (hasAcetaminophen && acetCount > 1) {
      interactions.push({
        id: 'int-4',
        drugA: 'Acetaminophen Regimen A',
        drugB: 'Acetaminophen Regimen B (Duplicate Product)',
        severity: 'critical',
        description: 'Duplicate acetaminophen-containing products detected. Accidental cumulative daily dose exceeding 3,000–4,000 mg carries risk of severe hepatotoxicity.',
        clinicalManagement: 'Do not take multiple acetaminophen-containing medications concurrently without pharmacist review.'
      });
    }

    return {
      hasInteractions: interactions.length > 0,
      screenDate: new Date().toISOString().split('T')[0],
      dataSource: 'NIH National Library of Medicine & FDA Drug Interaction Reference Database (Curated 2026)',
      disclaimer: 'This automated interaction screen is for personal medication tracking and educational safety only. It is not an autonomous prescribing system and does not replace professional clinical evaluation. Always consult your prescribing doctor or dispensing pharmacist before altering or discontinuing any medication.',
      interactions
    };
  }

  // Appointments
  public getAppointments(): AppointmentRecord[] {
    return [...this.appointments];
  }

  public addAppointment(apt: Omit<AppointmentRecord, 'id'>): AppointmentRecord {
    const newApt: AppointmentRecord = {
      ...apt,
      id: `apt-${Date.now()}`
    };
    this.appointments.unshift(newApt);
    this.notify();
    return newApt;
  }

  public updateAppointmentStatus(
    id: string,
    status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled',
    notes?: string
  ) {
    const apt = this.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      if (notes) apt.notes = notes;
      apt.updatedAt = new Date().toISOString();
      this.saveToStorage();
      this.notify();
    }
  }

  // Tasks & Notifications
  public getTasks(): HealthTaskItem[] {
    return [...this.tasks];
  }

  public addTask(task: Omit<HealthTaskItem, 'id'>): HealthTaskItem {
    const newTask: HealthTaskItem = {
      ...task,
      id: `task-${Date.now()}`
    };
    this.tasks.push(newTask);
    this.notify();
    return newTask;
  }

  public toggleTaskStatus(id: string) {
    const t = this.tasks.find((task) => task.id === id);
    if (t) {
      t.status = t.status === 'completed' ? 'pending' : 'completed';
      this.notify();
    }
  }

  // ==========================================
  // MEDICAL DOCUMENT REVIEW SYSTEM & REPORTS
  // ==========================================

  public getReports(patientId?: string): MedicalReportRecord[] {
    if (patientId && patientId !== 'all') {
      return this.reports.filter((r) => !r.patientId || r.patientId === patientId);
    }
    return [...this.reports];
  }

  public async fetchReports(patientId?: string): Promise<MedicalReportRecord[]> {
    try {
      const url = patientId ? `/api/clinical/reports?patientId=${encodeURIComponent(patientId)}` : '/api/clinical/reports';
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reports) {
          this.reports = json.reports;
          this.saveToStorage();
          this.notify();
          return json.reports;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch reports from server:', e);
    }
    return this.getReports(patientId);
  }

  public getReportById(id: string): MedicalReportRecord | undefined {
    return this.reports.find((r) => r.id === id);
  }

  public async uploadReport(
    payload: Partial<MedicalReportRecord> & { fileData?: string; fileName?: string }
  ): Promise<MedicalReportRecord> {
    const reportId = payload.id || `rep-${Date.now()}`;
    const newReport: MedicalReportRecord = {
      id: reportId,
      patientId: payload.patientId || 'pat-1',
      patientName: payload.patientName || 'Aryan Yadav',
      title: payload.title || payload.fileName?.replace(/\.[^/.]+$/, '') || 'Diagnostic Lab Report',
      date: payload.date || new Date().toISOString().split('T')[0],
      uploadDate: payload.uploadDate || new Date().toISOString(),
      laboratory: payload.laboratory || 'Clinical Reference Diagnostics',
      specimenType: payload.specimenType || 'Venous Blood (EDTA)',
      status: payload.status || 'normal',
      fileSize: payload.fileSize || '1.2 MB',
      fileType: payload.fileType || 'PDF',
      documentType: payload.documentType || 'blood_report',
      source: payload.source || 'patient_portal',
      processingStatus: payload.processingStatus || 'processed',
      reviewStatus: payload.reviewStatus || 'unreviewed',
      retryCount: payload.retryCount || 0,
      ocrConfidence: payload.ocrConfidence !== undefined ? payload.ocrConfidence : 96,
      fileData: payload.fileData,
      fileHash: payload.fileHash,
      originalFileName: payload.fileName || payload.originalFileName,
      results: payload.results || [],
      clinicalImpression: payload.clinicalImpression || 'Diagnostic report processed.',
      questionsForDoctor: payload.questionsForDoctor || [],
      clinicianComments: payload.clinicianComments || [],
      followUpTasks: payload.followUpTasks || [],
      auditHistory: payload.auditHistory || [
        {
          timestamp: new Date().toISOString(),
          action: 'UPLOADED',
          actor: payload.source === 'doctor_upload' ? 'Attending Physician' : 'Patient Portal',
          details: `Document uploaded: ${payload.title || payload.fileName}`
        }
      ]
    };

    this.reports.unshift(newReport);
    this.saveToStorage();
    this.notify();

    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/clinical/reports/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.report) {
            const idx = this.reports.findIndex((r) => r.id === reportId);
            if (idx >= 0) this.reports[idx] = json.report;
            this.saveToStorage();
            this.notify();
            return json.report;
          }
        }
      } catch (e) {
        console.warn('[ClinicalStore] Failed to upload report to server:', e);
      }
    }

    return newReport;
  }

  public addReport(rep: Partial<MedicalReportRecord> & { title: string }): MedicalReportRecord {
    const newReport: MedicalReportRecord = {
      id: rep.id || `rep-${Date.now()}`,
      patientId: rep.patientId || 'pat-1',
      title: rep.title,
      date: rep.date || new Date().toISOString().split('T')[0],
      uploadDate: rep.uploadDate || new Date().toISOString(),
      laboratory: rep.laboratory || 'Clinical Reference Diagnostics',
      specimenType: rep.specimenType || 'Serum / Venous Blood',
      status: rep.status || 'normal',
      fileSize: rep.fileSize || '1.4 MB',
      fileType: rep.fileType || 'PDF',
      documentType: rep.documentType || 'blood_report',
      source: rep.source || 'patient_portal',
      processingStatus: rep.processingStatus || 'processed',
      reviewStatus: rep.reviewStatus || 'unreviewed',
      retryCount: 0,
      ocrConfidence: 96,
      results: rep.results || [],
      clinicalImpression: rep.clinicalImpression || 'Diagnostic report processed.',
      questionsForDoctor: rep.questionsForDoctor || [],
      clinicianComments: [],
      followUpTasks: [],
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          action: 'UPLOADED',
          actor: 'Local Ingestion',
          details: `Report added to local patient chart`
        }
      ]
    };
    this.reports.unshift(newReport);
    this.saveToStorage();
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clinical/reports/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      }).catch((e) => console.warn('[SYNC] Report sync notice:', e));
    }

    return newReport;
  }

  public updateReport(id: string, updates: Partial<MedicalReportRecord>): MedicalReportRecord | null {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.reports[idx] = { ...this.reports[idx], ...updates };
      this.saveToStorage();
      this.notify();
      return this.reports[idx];
    }
    return null;
  }

  public async updateReportReviewStatus(
    reportId: string,
    reviewStatus: 'unreviewed' | 'reviewed' | 'requires_action',
    notes?: string
  ): Promise<{ success: boolean; report?: MedicalReportRecord; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/reports/${reportId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ reviewStatus, notes })
      });
      const json = await res.json();
      if (res.ok && json.success && json.report) {
        const idx = this.reports.findIndex((r) => r.id === reportId);
        if (idx >= 0) {
          this.reports[idx] = json.report;
        }
        if (reviewStatus === 'reviewed') {
          this.signedReports[reportId] = {
            signedBy: 'Dr. Sarah Chen, MD (NPI: 1942850192)',
            signedAt: new Date().toISOString(),
            notes: notes || 'Reviewed and signed off'
          };
        }
        this.saveToStorage();
        this.notify();
        return { success: true, report: json.report };
      }
      return { success: false, error: json.error || 'Failed to update review status' };
    } catch (e: any) {
      console.warn('[ClinicalStore] Failed to update review status:', e);
      // Local fallback
      const rep = this.updateReport(reportId, { reviewStatus });
      return { success: Boolean(rep), report: rep || undefined };
    }
  }

  public async addReportComment(
    reportId: string,
    comment: string
  ): Promise<{ success: boolean; comment?: ReportComment; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/reports/${reportId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ comment })
      });
      const json = await res.json();
      if (res.ok && json.success && json.comment) {
        const rep = this.getReportById(reportId);
        if (rep) {
          if (!rep.clinicianComments) rep.clinicianComments = [];
          rep.clinicianComments.unshift(json.comment);
          this.notify();
        }
        return { success: true, comment: json.comment };
      }
      return { success: false, error: json.error || 'Failed to add comment' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  public async retryReportProcessing(
    reportId: string
  ): Promise<{ success: boolean; report?: MedicalReportRecord; message?: string }> {
    try {
      const res = await fetch(`/api/clinical/reports/${reportId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      const json = await res.json();
      if (res.ok && json.success && json.report) {
        const idx = this.reports.findIndex((r) => r.id === reportId);
        if (idx >= 0) {
          this.reports[idx] = json.report;
        }
        this.saveToStorage();
        this.notify();
        return { success: true, report: json.report, message: json.message };
      }
      return { success: false, message: json.error || 'Retry failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error' };
    }
  }

  public async comparePatientReports(
    reportId1: string,
    reportId2: string
  ): Promise<{ success: boolean; comparison?: AnalyteComparisonItem[]; error?: string; patientId?: string }> {
    try {
      const res = await fetch(`/api/clinical/reports/${reportId1}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ compareWithReportId: reportId2 })
      });
      const json = await res.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Comparison request failed' };
    }
  }

  public async createReportFollowUpTask(
    reportId: string,
    payload: {
      taskTitle: string;
      description: string;
      dueDate?: string;
      assignedClinician?: string;
      priority?: string;
    }
  ): Promise<{ success: boolean; task?: ClinicalTask; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/reports/${reportId}/follow-up-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && json.success && json.task) {
        this.clinicalTasks.unshift(json.task);
        const rep = this.getReportById(reportId);
        if (rep) {
          if (!rep.followUpTasks) rep.followUpTasks = [];
          rep.followUpTasks.push(json.task.id);
        }
        this.saveToStorage();
        this.notify();
        return { success: true, task: json.task };
      }
      return { success: false, error: json.error || 'Failed to create follow-up task' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  public deleteReport(id: string): boolean {
    const prevLength = this.reports.length;
    this.reports = this.reports.filter((r) => r.id !== id);
    if (this.reports.length !== prevLength) {
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  // Handoffs (delegated to getHandoffs / getHandoffById below)

  public getHandoffByToken(token: string): DoctorHandoffRecord | null {
    const handoff = this.handoffs.find((h) => h.shareToken === token);
    if (!handoff) return null;
    if (handoff.isRevoked) return null;
    if (handoff.expiresAt && new Date(handoff.expiresAt).getTime() < Date.now()) return null;
    return handoff;
  }

  public createHandoff(h: Partial<DoctorHandoffRecord> & { patientId: string; chiefConcern: string }): DoctorHandoffRecord {
    // Generate cryptographically unguessable token
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const token = `sec-hnd-${randomHex}`;
    const nowIso = new Date().toISOString();
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newHandoff: DoctorHandoffRecord = {
      id: `h-${Date.now()}`,
      shareToken: token,
      date: nowIso.split('T')[0],
      patientId: h.patientId,
      patientName: h.patientName || 'Aryan Yadav',
      mrn: h.mrn || 'MAI-80429',
      dateOfBirth: h.dateOfBirth || '1998-09-14',
      bloodGroup: h.bloodGroup || 'O+',
      allergies: h.allergies || ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)'],
      chiefConcern: h.chiefConcern,
      duration: h.duration || '2 days',
      hpiSynopsis: h.hpiSynopsis || 'Patient reported symptoms summarized with verified clinical history.',
      currentMedications: h.currentMedications || ['Lisinopril 10mg daily', 'Vitamin D3 2000 IU daily'],
      medicalConditions: h.medicalConditions || ['Essential Hypertension (Stage 1, Controlled)'],
      recentVitalsSummary: h.recentVitalsSummary || 'BP: 118/76 mmHg · HR: 68 bpm · SpO2: 99%',
      labHighlights: h.labHighlights || ['CBC Normal', 'Fasting Glucose 104 mg/dL (Borderline)'],
      patientQuestions: h.patientQuestions || [],
      sourceAttributions: h.sourceAttributions || [],
      includedRecordIds: h.includedRecordIds || [],
      excludedSensitiveCategories: h.excludedSensitiveCategories || [],
      dataQualityWarnings: h.dataQualityWarnings || [],
      recipientName: h.recipientName || 'Dr. Sarah Chen, MD',
      recipientSpecialty: h.recipientSpecialty || 'Internal Medicine',
      recipientFacility: h.recipientFacility || 'Metro Clinical Reference Hospital',
      recipientEmail: h.recipientEmail || 's.chen@metrohealth.org',
      expiresAt: h.expiresAt || expiryDate,
      isRevoked: false,
      consentStatus: h.consentStatus || 'authorized',
      status: 'pending',
      auditLog: [
        {
          timestamp: nowIso,
          action: 'CREATED',
          actor: `${h.patientName || 'Patient'} (Authorized Owner)`,
          details: 'Grounded clinical summary generated with source attribution'
        },
        {
          timestamp: nowIso,
          action: 'TRANSMITTED',
          actor: `${h.patientName || 'Patient'} (Authorized Owner)`,
          details: `Doctor handoff access granted to ${h.recipientName || 'Dr. Sarah Chen, MD'}`
        }
      ]
    };

    this.handoffs.unshift(newHandoff);
    this.notify();

    if (typeof window !== 'undefined') {
      fetch('/api/clinical/handoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHandoff)
      }).catch((e) => console.warn('[SYNC] Handoff sync notice:', e));
    }

    return newHandoff;
  }

  public updateHandoff(id: string, updates: Partial<DoctorHandoffRecord>): DoctorHandoffRecord | null {
    const idx = this.handoffs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      const existing = this.handoffs[idx];
      const updatedLog = [
        ...(existing.auditLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'CREATED' as const,
          actor: 'Patient (Authorized Owner)',
          details: 'Patient inspected and modified clinical summary contents'
        }
      ];
      this.handoffs[idx] = {
        ...existing,
        ...updates,
        auditLog: updatedLog
      };
      this.notify();
      return this.handoffs[idx];
    }
    return null;
  }

  public revokeHandoff(id: string): boolean {
    const handoff = this.handoffs.find((h) => h.id === id);
    if (handoff && !handoff.isRevoked) {
      handoff.isRevoked = true;
      handoff.revokedAt = new Date().toISOString();
      handoff.status = 'revoked' as any;
      handoff.auditLog = [
        ...(handoff.auditLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'REVOKED',
          actor: 'Patient (Authorized Owner)',
          details: `Access revoked for token ${(handoff.shareToken || 'N/A').substring(0, 11)}...`
        }
      ];
      this.notify();
      return true;
    }
    return false;
  }

  public doctorReviewHandoff(handoffId: string, notes: string) {
    const handoff = this.handoffs.find((h) => h.id === handoffId);
    if (handoff) {
      handoff.status = 'reviewed';
      handoff.doctorReviewNotes = notes;
      handoff.auditLog = [
        ...(handoff.auditLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'VIEWED',
          actor: handoff.recipientName || 'Attending Physician',
          details: 'Doctor completed review and appended clinical encounter notes'
        }
      ];
      this.notify();
    }
  }

  // ==========================================
  // STRUCTURED PATIENT HANDOFF & FOLLOW-UP SUITE
  // ==========================================

  public async fetchHandoffs(patientId?: string, state?: string): Promise<DoctorHandoffRecord[]> {
    try {
      const params = new URLSearchParams();
      if (patientId) params.set('patientId', patientId);
      if (state) params.set('state', state);

      const res = await fetch(`/api/clinical/handoffs?${params.toString()}`, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.handoffs)) {
          this.handoffs = json.handoffs;
          this.saveToStorage();
          this.notify();
          return json.handoffs;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch handoffs from server:', e);
    }
    return this.getHandoffs(patientId);
  }

  public getHandoffs(patientId?: string): DoctorHandoffRecord[] {
    if (patientId && patientId !== 'all') {
      return this.handoffs.filter((h) => !h.patientId || h.patientId === patientId);
    }
    return [...this.handoffs];
  }

  public getHandoffById(id: string): DoctorHandoffRecord | undefined {
    return this.handoffs.find((h) => h.id === id);
  }

  public async generateAiHandoffDraft(
    patientId: string,
    clinicianName = 'Dr. Sarah Chen, MD',
    clinicianNpi = '1942850192'
  ): Promise<{ success: boolean; draft?: DoctorHandoffRecord; error?: string }> {
    try {
      const res = await fetch('/api/clinical/handoffs/generate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': clinicianName,
          'x-doctor-npi': clinicianNpi
        },
        body: JSON.stringify({ patientId, clinicianName, clinicianNpi })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.draft) {
          return { success: true, draft: json.draft };
        }
      }
    } catch (e: any) {
      console.warn('[ClinicalStore] Failed to generate AI handoff draft:', e);
    }

    // Local fallback: Synthesize draft from local store state
    const patient = this.getPatientById(patientId);
    if (!patient) return { success: false, error: 'Patient record not found' };

    const vitals = this.getVitals(patientId);
    const meds = this.getMedications(patientId);
    const reports = this.getReports(patientId);
    const tasks = this.clinicalTasks.filter((t) => t.patientId === patientId && t.status !== 'completed');

    const latestVital = vitals[0];
    const recentVitalsSummary = latestVital
      ? `BP: ${latestVital.systolic}/${latestVital.diastolic} mmHg, HR: ${latestVital.heartRate} bpm, SpO2: ${latestVital.oxygenSaturation ?? latestVital.spo2}%, Temp: ${latestVital.temperature ?? 98.6}°F (${latestVital.date})`
      : 'No vitals recorded during current session';

    const localDraft: DoctorHandoffRecord = {
      id: `h-draft-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      patientId: patient.id,
      patientName: patient.name,
      mrn: patient.mrn,
      dateOfBirth: '1985-06-12',
      bloodGroup: patient.bloodType,
      allergies: patient.allergies || ['No known allergies (NKDA)'],
      chiefConcern: patient.triageReason || 'Cardiopulmonary evaluation and care transition',
      duration: 'Shift admission',
      hpiSynopsis: `Patient presenting with ${patient.triageReason || 'acute symptoms'}. Evaluated during clinical shift.`,
      currentMedications: meds.filter((m) => m.status === 'active').map((m) => `${m.name} ${m.dosage || m.strength || ''}`.trim()),
      medicalConditions: patient.activeConditions || [],
      recentVitalsSummary,
      labHighlights: reports.slice(0, 3).map((r) => `${r.documentName || r.testName || r.title} (${r.date || r.uploadDate}): ${r.summary || r.clinicalImpression || r.status}`),
      patientQuestions: ['When is my next appointment?'],
      actionsCompleted: [
        'Shift intake assessment and triage categorization done',
        'Electronic telemetry vitals evaluated',
        'Current medication regimens and allergies cross-referenced'
      ],
      outstandingTasks: tasks.length > 0
        ? tasks.map((t) => `${t.title} (${t.priority.toUpperCase()})`)
        : ['Shift blood pressure re-evaluation', 'Pending metabolic panel verification'],
      followUpNeeds: 'Follow-up appointment within 7–14 days. Attending physician signoff required.',
      assignedClinician: clinicianName,
      assignedDepartment: patient.department || 'Internal Medicine',
      authorClinician: clinicianName,
      authorNpi: clinicianNpi,
      isAiDrafted: true,
      isClinicianApproved: false, // Strict Gating: cannot be published without clinician signoff
      handoffState: 'draft',
      version: 1,
      submissionToken: `tok-local-${Date.now()}`,
      consentStatus: 'authorized',
      status: 'pending',
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          action: 'CREATED',
          actor: 'AI Clinical Assistant (Drafting Mode)',
          details: `Local AI draft assembled for ${patient.name}. Pending attending review and certification.`
        }
      ]
    };

    return { success: true, draft: localDraft };
  }

  public async createStructuredHandoff(
    handoff: DoctorHandoffRecord
  ): Promise<{ success: boolean; handoff?: DoctorHandoffRecord; error?: string; isDuplicate?: boolean }> {
    try {
      const res = await fetch('/api/clinical/handoffs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': handoff.authorClinician || 'Dr. Sarah Chen, MD',
          'x-doctor-npi': handoff.authorNpi || '1942850192'
        },
        body: JSON.stringify(handoff)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.handoff) {
          const idx = this.handoffs.findIndex((h) => h.id === json.handoff.id);
          if (idx >= 0) {
            this.handoffs[idx] = json.handoff;
          } else {
            this.handoffs.unshift(json.handoff);
          }
          this.saveToStorage();
          this.notify();
          return json;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to save handoff to server:', e);
    }

    // Local fallback
    const savedHandoff: DoctorHandoffRecord = {
      ...handoff,
      id: handoff.id || `h-${Date.now()}`,
      version: 1,
      date: handoff.date || new Date().toISOString().split('T')[0],
      handoffState: handoff.handoffState || 'pending'
    };
    this.handoffs.unshift(savedHandoff);
    this.saveToStorage();
    this.notify();
    return { success: true, handoff: savedHandoff };
  }

  public async updateStructuredHandoff(
    id: string,
    updates: Partial<DoctorHandoffRecord>,
    expectedVersion?: number
  ): Promise<{ success: boolean; handoff?: DoctorHandoffRecord; error?: string; conflict?: boolean }> {
    try {
      const res = await fetch(`/api/clinical/handoffs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ ...updates, expectedVersion })
      });
      const json = await res.json();
      if (res.ok && json.success && json.handoff) {
        const idx = this.handoffs.findIndex((h) => h.id === id);
        if (idx >= 0) {
          this.handoffs[idx] = json.handoff;
          this.saveToStorage();
          this.notify();
        }
        return json;
      }
      if (res.status === 409 || json.conflict) {
        return { success: false, conflict: true, error: json.error || 'Concurrent update conflict detected.' };
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to update handoff on server:', e);
    }

    // Local update fallback
    const idx = this.handoffs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      const current = this.handoffs[idx];
      if (expectedVersion !== undefined && current.version !== undefined && current.version !== expectedVersion) {
        return { success: false, conflict: true, error: 'Concurrent update conflict. Please reload brief.' };
      }
      this.handoffs[idx] = {
        ...current,
        ...updates,
        version: (current.version || 1) + 1
      };
      this.saveToStorage();
      this.notify();
      return { success: true, handoff: this.handoffs[idx] };
    }
    return { success: false, error: 'Handoff brief not found' };
  }

  public async assignHandoff(
    id: string,
    newAssignee: string,
    reason?: string
  ): Promise<{ success: boolean; handoff?: DoctorHandoffRecord; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/handoffs/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ newAssignee, reason })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.handoff) {
          const idx = this.handoffs.findIndex((h) => h.id === id);
          if (idx >= 0) {
            this.handoffs[idx] = json.handoff;
            this.saveToStorage();
            this.notify();
          }
          return json;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to assign handoff on server:', e);
    }

    // Local fallback
    const idx = this.handoffs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      this.handoffs[idx].assignedClinician = newAssignee;
      this.handoffs[idx].version = (this.handoffs[idx].version || 1) + 1;
      this.saveToStorage();
      this.notify();
      return { success: true, handoff: this.handoffs[idx] };
    }
    return { success: false, error: 'Handoff brief not found' };
  }

  public async transitionHandoffState(
    id: string,
    newState: HandoffState,
    note?: string
  ): Promise<{ success: boolean; handoff?: DoctorHandoffRecord; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/handoffs/${id}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ newState, note })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.handoff) {
          const idx = this.handoffs.findIndex((h) => h.id === id);
          if (idx >= 0) {
            this.handoffs[idx] = json.handoff;
            this.saveToStorage();
            this.notify();
          }
          return json;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to transition handoff state:', e);
    }

    // Local fallback
    const idx = this.handoffs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      this.handoffs[idx].handoffState = newState;
      if (newState === 'accepted') this.handoffs[idx].status = 'reviewed';
      if (note) this.handoffs[idx].doctorReviewNotes = note;
      this.saveToStorage();
      this.notify();
      return { success: true, handoff: this.handoffs[idx] };
    }
    return { success: false, error: 'Handoff not found' };
  }

  public async approveAiHandoffDraft(
    id: string,
    clinicianName = 'Dr. Sarah Chen, MD',
    clinicianNpi = '1942850192',
    reviewNotes?: string
  ): Promise<{ success: boolean; handoff?: DoctorHandoffRecord; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/handoffs/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': clinicianName,
          'x-doctor-npi': clinicianNpi
        },
        body: JSON.stringify({ clinicianName, clinicianNpi, reviewNotes })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.handoff) {
          const idx = this.handoffs.findIndex((h) => h.id === id);
          if (idx >= 0) {
            this.handoffs[idx] = json.handoff;
            this.saveToStorage();
            this.notify();
          }
          return json;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to approve AI handoff draft:', e);
    }

    // Local fallback
    const idx = this.handoffs.findIndex((h) => h.id === id);
    if (idx !== -1) {
      this.handoffs[idx].isClinicianApproved = true;
      this.handoffs[idx].approvedBy = clinicianName;
      this.handoffs[idx].approvedAt = new Date().toISOString();
      this.handoffs[idx].handoffState = 'pending';
      if (reviewNotes) this.handoffs[idx].doctorReviewNotes = reviewNotes;
      this.saveToStorage();
      this.notify();
      return { success: true, handoff: this.handoffs[idx] };
    }
    return { success: false, error: 'Handoff draft not found' };
  }

  // ==========================================
  // SPECIALIST REFERRALS
  // ==========================================

  public async fetchReferrals(patientId?: string): Promise<ClinicalReferralRecord[]> {
    try {
      const url = patientId ? `/api/clinical/referrals?patientId=${encodeURIComponent(patientId)}` : '/api/clinical/referrals';
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.referrals)) {
          this.referrals = json.referrals;
          this.saveToStorage();
          this.notify();
          return json.referrals;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch referrals:', e);
    }
    return this.getReferrals(patientId);
  }

  public getReferrals(patientId?: string): ClinicalReferralRecord[] {
    if (patientId && patientId !== 'all') {
      return this.referrals.filter((r) => r.patientId === patientId);
    }
    return [...this.referrals];
  }

  public async createReferral(referral: Partial<ClinicalReferralRecord>): Promise<ClinicalReferralRecord> {
    const payload: ClinicalReferralRecord = {
      id: referral.id || `ref-${Date.now()}`,
      patientId: referral.patientId || 'pat-1',
      patientName: referral.patientName || 'Aryan Yadav',
      mrn: referral.mrn || 'MAI-80429',
      referringClinician: referral.referringClinician || 'Dr. Sarah Chen, MD',
      referringClinicianNpi: referral.referringClinicianNpi || '1942850192',
      destination: referral.destination || 'Specialist Clinic',
      specialty: referral.specialty || 'Cardiology',
      urgency: referral.urgency || 'routine',
      reason: referral.reason || 'Evaluation',
      clinicalNotes: referral.clinicalNotes || '',
      status: referral.status || 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      associatedHandoffId: referral.associatedHandoffId,
      auditLog: []
    };

    try {
      const res = await fetch('/api/clinical/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': payload.referringClinician,
          'x-doctor-npi': payload.referringClinicianNpi
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.referral) {
          this.referrals.unshift(json.referral);
          this.saveToStorage();
          this.notify();
          return json.referral;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to post referral to server:', e);
    }

    this.referrals.unshift(payload);
    this.saveToStorage();
    this.notify();
    return payload;
  }

  // ==========================================
  // CLINICAL NOTIFICATIONS
  // ==========================================

  public async fetchClinicalNotifications(recipientId?: string, role = 'doctor'): Promise<ClinicalNotificationRecord[]> {
    try {
      const params = new URLSearchParams();
      if (recipientId) params.set('recipientId', recipientId);
      if (role) params.set('role', role);

      const res = await fetch(`/api/clinical/notifications?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.notifications)) {
          this.clinicalNotifications = json.notifications;
          this.saveToStorage();
          this.notify();
          return json.notifications;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch notifications:', e);
    }
    return this.getClinicalNotifications(recipientId);
  }

  public getClinicalNotifications(recipientId?: string): ClinicalNotificationRecord[] {
    if (recipientId && recipientId !== 'all') {
      return this.clinicalNotifications.filter((n) => n.recipientId === recipientId || n.patientId === recipientId);
    }
    return [...this.clinicalNotifications];
  }

  public async markClinicalNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await fetch('/api/clinical/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const notif = this.clinicalNotifications.find((n) => n.id === id);
          if (notif) notif.isRead = true;
          this.saveToStorage();
          this.notify();
          return true;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to mark notification read:', e);
    }
    const notif = this.clinicalNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  // ==========================================
  // UNRESOLVED WORKITEMS & SCHEDULING
  // ==========================================

  public async fetchUnresolvedSummary(patientId?: string): Promise<{
    unresolvedTasks: ClinicalTask[];
    unreviewedReports: MedicalReportRecord[];
    totalUnresolved: number;
  }> {
    try {
      const url = patientId ? `/api/clinical/unresolved-summary?patientId=${encodeURIComponent(patientId)}` : '/api/clinical/unresolved-summary';
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            unresolvedTasks: json.unresolvedTasks || [],
            unreviewedReports: json.unreviewedReports || [],
            totalUnresolved: json.totalUnresolved || 0
          };
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch unresolved summary:', e);
    }

    const tasks = this.clinicalTasks.filter((t) => t.status !== 'completed' && (!patientId || t.patientId === patientId));
    const reports = this.reports.filter((r) => (r.reviewStatus === 'unreviewed' || (r as any).status === 'unreviewed' || !this.signedReports[r.id]) && (!patientId || r.patientId === patientId));
    return {
      unresolvedTasks: tasks,
      unreviewedReports: reports,
      totalUnresolved: tasks.length + reports.length
    };
  }

  public async scheduleFollowupAppointment(apt: Omit<AppointmentRecord, 'id'>): Promise<AppointmentRecord> {
    try {
      const res = await fetch('/api/clinical/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify(apt)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.appointment) {
          this.appointments.unshift(json.appointment);
          this.saveToStorage();
          this.notify();
          return json.appointment;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to schedule appointment on server:', e);
    }

    return this.addAppointment(apt);
  }

  public async fetchAppointments(filter?: { status?: string; date?: string; patientId?: string }): Promise<AppointmentRecord[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter?.date) params.append('date', filter.date);
      if (filter?.patientId && filter.patientId !== 'all') params.append('patientId', filter.patientId);

      const url = `/api/clinical/appointments${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.appointments)) {
          this.appointments = json.appointments;
          this.saveToStorage();
          this.notify();
          return this.appointments;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch appointments from server:', e);
    }
    return this.getAppointments();
  }

  public async updateAppointmentOnServer(
    id: string,
    updates: Partial<AppointmentRecord>
  ): Promise<{ success: boolean; appointment?: AppointmentRecord; error?: string }> {
    try {
      const res = await fetch(`/api/clinical/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success && json.appointment) {
        const idx = this.appointments.findIndex((a) => a.id === id);
        if (idx >= 0) {
          this.appointments[idx] = json.appointment;
        } else {
          this.appointments.unshift(json.appointment);
        }
        this.saveToStorage();
        this.notify();
        return { success: true, appointment: json.appointment };
      }
      return { success: false, error: json.error || 'Failed to update appointment on server' };
    } catch (e: any) {
      // Offline fallback: update locally
      const idx = this.appointments.findIndex((a) => a.id === id);
      if (idx >= 0) {
        this.appointments[idx] = { ...this.appointments[idx], ...updates, updatedAt: new Date().toISOString() };
        this.saveToStorage();
        this.notify();
        return { success: true, appointment: this.appointments[idx] };
      }
      return { success: false, error: e?.message || 'Network error updating appointment' };
    }
  }

  public async cancelAppointmentOnServer(
    id: string,
    reason = 'Cancelled by clinician'
  ): Promise<{ success: boolean; appointment?: AppointmentRecord; error?: string }> {
    return this.updateAppointmentOnServer(id, { status: 'cancelled', cancelReason: reason });
  }

  public async checkAppointmentSlot(
    date: string,
    time: string,
    provider = 'Dr. Sarah Chen, MD',
    excludeId?: string
  ): Promise<{ available: boolean; conflictingAppointment?: AppointmentRecord | null }> {
    try {
      const params = new URLSearchParams({ date, time, provider });
      if (excludeId) params.append('excludeId', excludeId);
      const res = await fetch(`/api/clinical/appointments/check-slot?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return {
          available: Boolean(json.available),
          conflictingAppointment: json.conflictingAppointment || null
        };
      }
    } catch {
      // Local check
    }

    const localCollision = this.appointments.find(
      (a) =>
        a.id !== excludeId &&
        a.status !== 'cancelled' &&
        a.date === date &&
        a.time.toLowerCase() === time.toLowerCase() &&
        a.providerName.toLowerCase() === provider.toLowerCase()
    );

    return {
      available: !localCollision,
      conflictingAppointment: localCollision || null
    };
  }

  // Patients (Doctor View)
  public getPatients(): PatientRecord[] {
    return [...this.patients];
  }

  public getPatientById(id: string): PatientRecord | undefined {
    return this.patients.find((p) => p.id === id || p.mrn === id);
  }

  public async fetchDoctorDashboard() {
    try {
      const res = await fetch('/api/clinical/doctor/dashboard', {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch doctor dashboard:', e);
    }
    return null;
  }

  public async fetchDoctorPatients(filter?: {
    tier?: string;
    department?: string;
    status?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params = new URLSearchParams();
      if (filter?.tier) params.set('tier', filter.tier);
      if (filter?.department) params.set('department', filter.department);
      if (filter?.status) params.set('status', filter.status);
      if (filter?.search) params.set('search', filter.search);
      if (filter?.sort) params.set('sort', filter.sort);
      if (filter?.page) params.set('page', String(filter.page));
      if (filter?.limit) params.set('limit', String(filter.limit));

      const res = await fetch(`/api/clinical/doctor/patients?${params.toString()}`, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.patients) {
          this.patients = json.data.patients;
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch doctor patients:', e);
    }
    return {
      patients: this.patients,
      total: this.patients.length,
      page: 1,
      totalPages: 1,
      tabCounts: {
        all: this.patients.length,
        emergency: this.patients.filter((p) => p.triageStatus === 'emergency').length,
        urgent: this.patients.filter((p) => p.triageStatus === 'urgent').length,
        prompt_evaluation: this.patients.filter((p) => p.triageStatus === 'prompt_evaluation').length,
        routine: this.patients.filter((p) => p.triageStatus === 'routine').length
      }
    };
  }

  public async fetchDoctorPatientDossier(patientId: string) {
    try {
      const res = await fetch(`/api/clinical/doctor/patient/${patientId}`, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.signedReports) {
            this.signedReports = json.data.signedReports;
          }
          if (json.data.assessments) {
            this.doctorAssessments = json.data.assessments;
          }
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch patient dossier:', e);
    }
    return null;
  }

  public async saveDoctorAssessment(assessmentPayload: any) {
    try {
      const res = await fetch('/api/clinical/doctor/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify(assessmentPayload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.doctorAssessments.findIndex((a) => a.id === json.data.id);
          if (idx >= 0) {
            this.doctorAssessments[idx] = json.data;
          } else {
            this.doctorAssessments.unshift(json.data);
          }
          if (json.data.triageCategory) {
            this.updatePatientTriage(json.data.patientId, json.data.triageCategory);
          }
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to save doctor assessment:', e);
    }
    return null;
  }

  public async signLabReport(reportId: string, notes?: string) {
    try {
      const res = await fetch('/api/clinical/doctor/lab-signoff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ reportId, notes })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          this.signedReports[reportId] = {
            signedBy: 'Dr. Sarah Chen, MD (NPI: 1942850192)',
            signedAt: json.data?.signedAt || new Date().toISOString(),
            notes: notes || 'Reviewed and signed off'
          };
          this.notify();
          return true;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to sign lab report:', e);
    }
    this.signedReports[reportId] = {
      signedBy: 'Dr. Sarah Chen, MD (NPI: 1942850192)',
      signedAt: new Date().toISOString(),
      notes: notes || 'Reviewed and signed off'
    };
    this.notify();
    return true;
  }

  public getSignedReports() {
    return { ...this.signedReports };
  }

  public isReportSigned(reportId: string) {
    return Boolean(this.signedReports[reportId]);
  }

  public async fetchClinicalTasks(clinician?: string) {
    try {
      const url = clinician ? `/api/clinical/doctor/tasks?clinician=${encodeURIComponent(clinician)}` : '/api/clinical/doctor/tasks';
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.clinicalTasks = json.data;
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch clinical tasks:', e);
    }
    return this.clinicalTasks;
  }

  public async actOnClinicalTask(taskId: string, action: string, reassignTo?: string, notes?: string) {
    try {
      const res = await fetch(`/api/clinical/doctor/tasks/${taskId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ action, reassignTo, notes })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.clinicalTasks.findIndex((t) => t.id === taskId);
          if (idx >= 0) {
            this.clinicalTasks[idx] = json.data;
          }
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to act on clinical task:', e);
    }
    return null;
  }

  public getClinicalTasks(): ClinicalTask[] {
    return [...this.clinicalTasks];
  }

  public async fetchTriageEscalations() {
    try {
      const res = await fetch('/api/clinical/doctor/triage-escalations', {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.triageEscalations = json.data;
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch triage escalations:', e);
    }
    return this.triageEscalations || [];
  }

  public async overridePatientPriority(
    patientId: string,
    newPriority: TriageCategory,
    overrideReason: string
  ) {
    try {
      const res = await fetch(`/api/clinical/doctor/patients/${patientId}/override-priority`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ newPriority, overrideReason })
      });
      const json = await res.json();
      if (res.ok && json.success && json.patient) {
        const idx = this.patients.findIndex((p) => p.id === patientId || p.mrn === patientId);
        if (idx >= 0) {
          this.patients[idx] = json.patient;
        }
        this.notify();
        return { success: true, patient: json.patient };
      }
      return { success: false, error: json.error || 'Failed to apply priority override' };
    } catch (e: any) {
      console.warn('[ClinicalStore] Failed to override priority:', e);
      return { success: false, error: e.message || 'Network error applying priority override' };
    }
  }

  public async acknowledgeTriageEscalation(id: string) {
    try {
      const res = await fetch(`/api/clinical/doctor/triage-escalations/${id}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.triageEscalations.findIndex((e) => e.id === id);
          if (idx >= 0) {
            this.triageEscalations[idx] = json.data;
          }
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to acknowledge triage escalation:', e);
    }
    return null;
  }

  public async assignTriageEscalation(id: string, assignedClinician: string, assignedTeam: string) {
    try {
      const res = await fetch(`/api/clinical/doctor/triage-escalations/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ assignedClinician, assignedTeam })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.triageEscalations.findIndex((e) => e.id === id);
          if (idx >= 0) {
            this.triageEscalations[idx] = json.data;
          }
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to assign triage escalation:', e);
    }
    return null;
  }

  public async respondToTriageEscalation(id: string, resolutionNotes?: string, clinicianName?: string) {
    try {
      const res = await fetch(`/api/clinical/doctor/triage-escalations/${id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': clinicianName || 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify({ resolutionNotes })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const idx = this.triageEscalations.findIndex((e) => e.id === id);
          if (idx >= 0) {
            this.triageEscalations[idx] = json.data;
          }
          this.notify();
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to respond to triage escalation:', e);
    }
    return null;
  }

  public async fetchEscalationPolicies() {
    try {
      const res = await fetch('/api/clinical/doctor/escalation-policies', {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch escalation policies:', e);
    }
    return [];
  }

  public async saveEscalationPolicy(policy: any) {
    try {
      const res = await fetch(`/api/clinical/doctor/escalation-policies/${policy.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        },
        body: JSON.stringify(policy)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to save escalation policy:', e);
    }
    return null;
  }

  public async fetchMaskedNotifications(unreadOnly = false) {
    try {
      const url = unreadOnly ? '/api/clinical/doctor/notifications?unread=true' : '/api/clinical/doctor/notifications';
      const res = await fetch(url, {
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch (e) {
      console.warn('[ClinicalStore] Failed to fetch masked notifications:', e);
    }
    return [];
  }

  public async markNotificationRead(id: string) {
    try {
      await fetch(`/api/clinical/doctor/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'x-role': 'doctor',
          'x-doctor-name': 'Dr. Sarah Chen, MD',
          'x-doctor-npi': '1942850192'
        }
      });
    } catch (e) {
      console.warn('[ClinicalStore] Failed to mark notification read:', e);
    }
  }

  public getTriageEscalations(): TriageEscalationRecord[] {
    return [...this.triageEscalations];
  }

  public addDoctorClinicalNote(patientId: string, consultationId: string, notes: string, doctorName: string) {
    const cons = this.consultations.find((c) => c.id === consultationId && c.patientId === patientId);
    if (cons) {
      cons.clinicianNotes = notes;
      cons.status = 'reviewed';
      cons.reviewedBy = doctorName;
      cons.reviewedAt = new Date().toLocaleString();
      this.notify();
    }
  }

  public updatePatientTriage(patientId: string, triage: TriageCategory) {
    const pat = this.patients.find((p) => p.id === patientId);
    if (pat) {
      pat.triageStatus = triage;
      this.notify();
    }
  }


  // Unified Timeline
  public getTimeline(): TimelineEntry[] {
    const list: TimelineEntry[] = [];

    // Map consultations (AI Intake / Assessments)
    for (const c of this.consultations) {
      list.push({
        id: `tl-${c.id}`,
        date: c.date,
        title: `Clinical Assessment: ${c.chiefComplaint}`,
        category: 'consultation',
        summary: `Triage: ${c.triageCategory.toUpperCase().replace('_', ' ')} · Severity ${c.severity}/10 · Status: ${c.status === 'reviewed' ? 'Clinician Reviewed' : 'Pending Review'}`,
        details: `${c.preliminaryGuidance}${c.clinicianNotes ? `\n\nDoctor Note (${c.reviewedBy || 'Attending'}): ${c.clinicianNotes}` : ''}`,
        verifiedContext: 'Clinical Assessment Intake',
        source: 'AI Clinical Assessment Protocol',
        status: c.emergencyFlag ? 'flagged' : c.status === 'reviewed' ? 'completed' : 'active',
        privacyScope: 'clinical'
      });
    }

    // Map vitals
    for (const v of this.vitals) {
      const parts = [
        `BP: ${v.systolic}/${v.diastolic} mmHg`,
        `HR: ${v.heartRate} bpm`,
        `SpO2: ${v.spo2}%`,
        v.temperature ? `Temp: ${v.temperature}°${v.temperatureUnit || 'F'}` : null,
        v.respiratoryRate ? `Resp: ${v.respiratoryRate} bpm` : null,
        v.bloodGlucose ? `Glucose: ${v.bloodGlucose} ${v.bloodGlucoseUnit || 'mg/dL'}` : null,
        v.weight ? `Weight: ${v.weight} ${v.weightUnit || 'lbs'}` : null,
        v.height ? `Height: ${v.height} ${v.heightUnit || 'in'}` : null
      ].filter(Boolean).join(' · ');

      list.push({
        id: `tl-${v.id}`,
        date: v.date,
        title: `Ambulatory Vitals Recorded`,
        category: 'vitals',
        summary: parts,
        details: v.notes ? `Observation Notes: ${v.notes}` : 'Resting physiological reading confirmed.',
        verifiedContext: 'Ambulatory Telemetry',
        source: v.source || 'Patient Logged',
        status: 'completed',
        privacyScope: 'clinical'
      });
    }

    // Map reports
    for (const r of this.reports) {
      list.push({
        id: `tl-${r.id}`,
        date: r.date,
        title: `Laboratory Diagnostic: ${r.title}`,
        category: 'lab',
        summary: `${r.laboratory} · ${(r.results || []).length} Analytes Tested · Status: ${r.status.toUpperCase()}`,
        details: `${r.clinicalImpression}${r.questionsForDoctor?.length ? `\n\nFollow-up items:\n- ${r.questionsForDoctor.join('\n- ')}` : ''}`,
        verifiedContext: 'Diagnostic Extraction',
        source: r.laboratory || 'Clinical Reference Laboratory',
        status: 'completed',
        privacyScope: 'clinical'
      });
    }

    // Map medications
    for (const m of this.medications) {
      list.push({
        id: `tl-${m.id}`,
        date: m.startDate || '2026-03-01',
        title: `Prescription Regimen: ${m.name} (${m.dosage})`,
        category: 'medication',
        summary: `${m.frequency} · ${m.timing} · Indication: ${m.indication}`,
        details: `${m.prescribingContext ? `Context: ${m.prescribingContext}. ` : ''}${m.foodNotes || ''}`,
        verifiedContext: 'Electronic Medication Reconciliation',
        source: 'Primary Care Prescription Records',
        status: m.status === 'active' ? 'active' : 'completed',
        privacyScope: 'clinical'
      });
    }

    // Map appointments
    for (const apt of this.appointments) {
      list.push({
        id: `tl-${apt.id}`,
        date: apt.date,
        title: `Clinical Appointment: ${apt.providerName}`,
        category: 'appointment',
        summary: `${apt.providerSpecialty} · ${apt.type === 'telehealth' ? 'Virtual Video Consultation' : 'In-Person Hospital Visit'} · ${apt.time}`,
        details: `Reason: ${apt.reason}\nLocation: ${apt.location}${apt.notes ? `\nNotes: ${apt.notes}` : ''}`,
        verifiedContext: 'Appointment Registry',
        source: apt.source || 'Clinical Scheduling Portal',
        status: apt.status === 'scheduled' ? 'scheduled' : 'completed',
        privacyScope: 'clinical'
      });
    }

    // Map handoffs
    for (const h of this.handoffs) {
      list.push({
        id: `tl-${h.id}`,
        date: h.date,
        title: `Doctor Handoff Brief: ${h.chiefConcern}`,
        category: 'handoff',
        summary: `Status: ${h.status.toUpperCase()} · Authorized by ${h.patientName} (MRN: ${h.mrn})`,
        details: `${h.hpiSynopsis}${h.doctorReviewNotes ? `\n\nReview Notes: ${h.doctorReviewNotes}` : ''}`,
        verifiedContext: 'Verified Handoff Record',
        source: 'Clinical Handoff Service',
        status: h.status === 'reviewed' ? 'completed' : 'active',
        privacyScope: 'clinical'
      });
    }

    // Map care-relevant profile updates
    list.push({
      id: 'tl-prof-1',
      date: '2026-03-10',
      title: 'Known Allergy Documentation Verified',
      category: 'profile',
      summary: 'Penicillin (Moderate) and Sulfa Drugs (Moderate) documented with acute reaction profiles.',
      details: 'Verified during digital patient identification onboarding. Cross-reactive beta-lactam warning logged in care instructions.',
      verifiedContext: 'Patient Safety Registry',
      source: 'Verified Patient Onboarding',
      status: 'completed',
      privacyScope: 'emergency'
    });

    list.push({
      id: 'tl-prof-2',
      date: '2026-03-12',
      title: 'Emergency Primary Contacts & SOS Protocol Configured',
      category: 'profile',
      summary: 'Sunita Yadav (Mother, Priority 1) and Rajesh Yadav (Father, Priority 2) confirmed.',
      details: 'Automated SMS/Voice broadcast protocol authorized for urgent emergency triage events.',
      verifiedContext: 'Safety Protocol',
      source: 'Patient Portal Settings',
      status: 'completed',
      privacyScope: 'emergency'
    });

    // Sort descending by date
    return list.sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  // ==========================================
  // AI CLINICAL COPILOT CLIENT METHODS
  // ==========================================

  public async fetchCopilotHealth(): Promise<{
    success: boolean;
    apiKeyConfigured: boolean;
    models: string[];
    defaultModel: string;
    capabilities: string[];
  }> {
    try {
      const res = await fetch('/api/clinical/copilot/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn('Failed to fetch Copilot health:', err);
      return {
        success: false,
        apiKeyConfigured: false,
        models: ['gemini-2.5-flash'],
        defaultModel: 'gemini-2.5-flash',
        capabilities: []
      };
    }
  }

  public async generateClinicalCopilot(
    payload: {
      patientId: string;
      mode: ClinicalCopilotMode;
      draftType?: ClinicalDraftType;
      question?: string;
      clinicianPrompt?: string;
    },
    abortSignal?: AbortSignal
  ): Promise<ClinicalCopilotResponse> {
    const headers = {
      ...this.getDoctorAuthHeaders(),
      'Content-Type': 'application/json'
    };

    try {
      const res = await fetch('/api/clinical/copilot/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...payload,
          stream: false
        }),
        signal: abortSignal
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          mode: payload.mode,
          draftType: payload.draftType,
          generatedContent: '',
          missingInformation: data.missingInformation || [],
          conflictingEntries: data.conflictingEntries || [],
          allergyMedicationAlerts: data.allergyMedicationAlerts || [],
          citations: data.citations || [],
          provenance: data.provenance || {
            model: 'error',
            generatedAt: new Date().toISOString(),
            patientId: payload.patientId,
            patientName: '',
            clinicianNpi: '',
            clinicianName: '',
            sourceCitations: [],
            dataFreshnessStatus: 'missing_vitals',
            isGrounded: false,
            hasSafetyConflicts: false,
            safetyNotices: []
          },
          error: data.error || `HTTP ${res.status}`,
          code: data.code || 'UNKNOWN_ERROR'
        };
      }

      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      return {
        success: false,
        mode: payload.mode,
        draftType: payload.draftType,
        generatedContent: '',
        missingInformation: [],
        conflictingEntries: [],
        allergyMedicationAlerts: [],
        citations: [],
        provenance: {
          model: 'error',
          generatedAt: new Date().toISOString(),
          patientId: payload.patientId,
          patientName: '',
          clinicianNpi: '',
          clinicianName: '',
          sourceCitations: [],
          dataFreshnessStatus: 'missing_vitals',
          isGrounded: false,
          hasSafetyConflicts: false,
          safetyNotices: []
        },
        error: err.message || 'Network connection failed while calling Clinical Copilot.',
        code: 'NETWORK_ERROR'
      };
    }
  }

  public async approveClinicalCopilot(
    payload: ClinicalCopilotApprovalPayload
  ): Promise<{ success: boolean; data?: ClinicalCopilotApprovalRecord; message?: string; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(),
      'Content-Type': 'application/json'
    };

    try {
      const res = await fetch('/api/clinical/copilot/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}`
        };
      }

      // Refresh local dossier / consultations / handoffs
      await this.fetchDoctorDashboard();

      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to save Copilot approval'
      };
    }
  }

  public async fetchCopilotHistory(
    patientId: string
  ): Promise<{ approvals: ClinicalCopilotApprovalRecord[]; auditLogs: any[] }> {
    const headers = this.getDoctorAuthHeaders();

    try {
      const res = await fetch(`/api/clinical/copilot/history/${patientId}`, {
        headers
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data || { approvals: [], auditLogs: [] };
    } catch (err) {
      console.warn('Failed to fetch Copilot history:', err);
      return { approvals: [], auditLogs: [] };
    }
  }

  // ==========================================
  // SECURE CLINICIAN ACCOUNT & CREDENTIALS API
  // ==========================================

  public async getClinicianProfile(clinicianId?: string, overrideActor?: { role?: ClinicianRole; id?: string }): Promise<{
    success: boolean;
    profile?: User;
    permissions?: ClinicianPermission[];
    viewerRole?: ClinicianRole;
    error?: string;
  }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}` : '';
    try {
      const res = await fetch(`/api/clinical/clinicians/profile${query}`, { headers });
      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn('Failed to fetch clinician profile:', err);
      return {
        success: false,
        error: err.message || 'Network connection failed'
      };
    }
  }

  public async updateClinicianProfile(
    updates: Partial<User>,
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; profile?: User; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ clinicianId, updates })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  }

  public async getClinicianCredentials(
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; credentials?: ClinicianCredentialDocument[]; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}` : '';
    try {
      const res = await fetch(`/api/clinical/clinicians/credentials${query}`, { headers });
      return await res.json();
    } catch (err: any) {
      return { success: false, credentials: [], error: err.message || 'Failed to fetch credentials' };
    }
  }

  public async uploadClinicianCredential(
    doc: Partial<ClinicianCredentialDocument>,
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; credential?: ClinicianCredentialDocument; message?: string; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/credentials/upload', {
        method: 'POST',
        headers,
        body: JSON.stringify({ clinicianId, ...doc })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to upload credential document' };
    }
  }

  public async verifyCredentialAuthoritative(
    credentialId: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{
    success: boolean;
    credential?: ClinicianCredentialDocument;
    registryRecord?: any;
    error?: string;
  }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(`/api/clinical/clinicians/credentials/${encodeURIComponent(credentialId)}/verify-authoritative`, {
        method: 'POST',
        headers
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect to authoritative registry' };
    }
  }

  public async adminReviewCredential(
    credentialId: string,
    review: { status: CredentialVerificationStatus; note?: string },
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; credential?: ClinicianCredentialDocument; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(`/api/clinical/clinicians/credentials/${encodeURIComponent(credentialId)}/admin-review`, {
        method: 'POST',
        headers,
        body: JSON.stringify(review)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit administrative review' };
    }
  }

  public async getClinicianTeam(
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; team?: ClinicianTeamMember[]; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}` : '';
    try {
      const res = await fetch(`/api/clinical/clinicians/team${query}`, { headers });
      return await res.json();
    } catch (err: any) {
      return { success: false, team: [], error: err.message || 'Failed to fetch clinical team' };
    }
  }

  public async getClinicianCaseAssignments(
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; assignments?: ClinicianCaseAssignment[]; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}` : '';
    try {
      const res = await fetch(`/api/clinical/clinicians/case-assignments${query}`, { headers });
      return await res.json();
    } catch (err: any) {
      return { success: false, assignments: [], error: err.message || 'Failed to fetch case assignments' };
    }
  }

  public async assignClinicianCase(
    assignment: ClinicianCaseAssignment,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; assignment?: ClinicianCaseAssignment; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/case-assignments', {
        method: 'POST',
        headers,
        body: JSON.stringify(assignment)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to reassign clinical case' };
    }
  }

  public async getClinicianSessions(
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; sessions?: ClinicianSession[]; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}` : '';
    try {
      const res = await fetch(`/api/clinical/clinicians/sessions${query}`, { headers });
      return await res.json();
    } catch (err: any) {
      return { success: false, sessions: [], error: err.message || 'Failed to fetch active sessions' };
    }
  }

  public async revokeClinicianSession(
    sessionId: string,
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(`/api/clinical/clinicians/sessions/${encodeURIComponent(sessionId)}/revoke`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ clinicianId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to revoke session' };
    }
  }

  public async revokeAllOtherClinicianSessions(
    currentSessionId: string = 'sess-current',
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; revokedCount?: number; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/sessions/revoke-others', {
        method: 'POST',
        headers,
        body: JSON.stringify({ clinicianId, currentSessionId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to revoke other sessions' };
    }
  }

  public async updateClinicianRole(
    targetClinicianId: string,
    newRole: ClinicianRole,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; error?: string; updatedUser?: User }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/roles/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetClinicianId, newRole })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update clinician role' };
    }
  }

  public async updateClinicianWorkingStatus(
    workingStatus: ClinicianWorkingStatus,
    clinicianId?: string,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; profile?: User; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/clinicians/working-status', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ clinicianId, workingStatus })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update working status' };
    }
  }

  public async getClinicianAuditLogs(
    clinicianId?: string,
    limit: number = 50,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; logs?: ClinicianAccountAuditLog[]; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const query = clinicianId ? `?clinicianId=${encodeURIComponent(clinicianId)}&limit=${limit}` : `?limit=${limit}`;
    try {
      const res = await fetch(`/api/clinical/clinicians/audit-logs${query}`, { headers });
      return await res.json();
    } catch (err: any) {
      return { success: false, logs: [], error: err.message || 'Failed to fetch audit logs' };
    }
  }

  // ==========================================
  // CLINICAL METRICS & SAFETY TELEMETRY CLIENT
  // ==========================================

  public async fetchClinicalMetrics(
    filter?: ClinicalMetricsFilter,
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; data?: ClinicalMetricsData; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const params = new URLSearchParams();
    if (filter?.dateRange) params.set('dateRange', filter.dateRange);
    if (filter?.department) params.set('department', filter.department);
    if (filter?.status) params.set('status', filter.status);

    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await fetch(`/api/clinical/analytics/metrics${qs}`, { headers });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || `HTTP ${res.status}` };
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Failed to fetch clinical metrics:', err);
      return { success: false, error: err.message || 'Network connection failed' };
    }
  }

  public async fetchProtectedAuditLogs(
    filter?: {
      action?: string;
      outcome?: string;
      dateRange?: string;
      search?: string;
      limit?: number;
    },
    overrideActor?: { role?: ClinicianRole; id?: string }
  ): Promise<{ success: boolean; logs?: ClinicalAuditLogEntry[]; total?: number; error?: string }> {
    const headers = this.getDoctorAuthHeaders(overrideActor);
    const params = new URLSearchParams();
    if (filter?.action) params.set('action', filter.action);
    if (filter?.outcome) params.set('outcome', filter.outcome);
    if (filter?.dateRange) params.set('dateRange', filter.dateRange);
    if (filter?.search) params.set('search', filter.search);
    if (filter?.limit) params.set('limit', String(filter.limit));

    const qs = params.toString() ? `?${params.toString()}` : '';
    try {
      const res = await fetch(`/api/clinical/analytics/audit-centre${qs}`, { headers });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, logs: [], total: 0, error: errJson.error || `HTTP ${res.status}` };
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Failed to fetch protected audit logs:', err);
      return { success: false, logs: [], total: 0, error: err.message || 'Network connection failed' };
    }
  }

  public async exportAuditLogs(
    overrideActor?: { role?: ClinicianRole; id?: string; name?: string }
  ): Promise<{ success: boolean; exportedAt?: string; count?: number; auditLogs?: ClinicalAuditLogEntry[]; error?: string }> {
    const headers = {
      ...this.getDoctorAuthHeaders(overrideActor),
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch('/api/clinical/analytics/audit-centre/export', {
        method: 'POST',
        headers
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to export audit logs' };
    }
  }
}

export const clinicalStore = new ClinicalStore();
