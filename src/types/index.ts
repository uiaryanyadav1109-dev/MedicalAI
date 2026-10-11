export type PublicRoutePath =
  | '/'
  | '/chat'
  | '/platform'
  | '/features'
  | '/how-it-works'
  | '/safety'
  | '/for-patients'
  | '/for-doctors'
  | '/security'
  | '/resources'
  | '/faq'
  | '/contact'
  | '/about'
  | '/privacy'
  | '/terms'
  | '/medical-disclaimer';

export type AuthRoutePath =
  | '/signin'
  | '/login'
  | '/signup'
  | '/onboarding'
  | '/forgot-password'
  | '/reset-password'
  | '/verify-email';

export type PatientDashboardRoutePath =
  | '/dashboard'
  | '/dashboard/chat'
  | '/dashboard/patient-card'
  | '/dashboard/emergency-contacts'
  | '/dashboard/sos'
  | '/dashboard/consultation'
  | '/dashboard/health-records'
  | '/dashboard/reports'
  | '/dashboard/vitals'
  | '/dashboard/medications'
  | '/dashboard/timeline'
  | '/dashboard/triage'
  | '/dashboard/doctor-handoff'
  | '/dashboard/qr-sharing'
  | '/dashboard/data-access-requests'
  | '/dashboard/profile'
  | '/dashboard/settings'
  | '/dashboard/identity-verification';

export type DoctorDashboardRoutePath =
  | '/doctor'
  | '/doctor/patients'
  | '/doctor/consultations'
  | '/doctor/reports'
  | '/doctor/medications'
  | '/doctor/triage'
  | '/doctor/handoffs'
  | '/doctor/copilot'
  | '/doctor/analytics'
  | '/doctor/settings';

export type RoutePath =
  | PublicRoutePath
  | AuthRoutePath
  | PatientDashboardRoutePath
  | DoctorDashboardRoutePath
  | string;

export type UserRole = 'patient' | 'doctor';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'Spouse' | 'Mother' | 'Father' | 'Brother' | 'Sister' | 'Child' | 'Guardian' | 'Physician' | 'Friend' | 'Other' | string;
  phone: string;
  email?: string;
  preferredMethod?: 'sms' | 'phone' | 'email';
  priority?: number; // 1 = Highest / Immediate, 2 = Secondary, 3 = Tertiary
  isPrimary: boolean;
  isActive: boolean;
  notifyOnTriage?: boolean;
}

export interface EmergencyEvent {
  id: string;
  patientId: string;
  patientName: string;
  activatedAt: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  locationTimestamp?: string;
  locationLink?: string;
  locationError?: string;
  permissionStatus?: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'prompt';
  locationSource?: 'gps' | 'manual' | 'profile_fallback' | 'simulated';
  manualLocationDescription?: string;
  secureDispatchToken?: string;
  status: 'active' | 'resolved';
  contactsAlertedCount?: number;
  notes?: string;
  notificationStatus?: 'delivered' | 'partial' | 'failed' | 'service_not_configured';
  notificationMessage?: string;
  notifiedContacts?: {
    contactId: string;
    name: string;
    phone: string;
    relationship: string;
    status: 'sent' | 'failed' | 'unconfigured' | 'pending';
    directDispatchLink?: string;
    personalizedMessage?: string;
  }[];
  resolvedAt?: string;
  createdAt?: string;
}

export interface PatientShareRecord {
  token: string;
  patientId: string;
  patientName: string;
  patientIdCode: string; // e.g. MAI-80429
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  importantMedicalNotes?: string;
  profileImageUrl?: string;
  createdAt: string;
  expiresAt: string;
  isRevoked: boolean;
  revokedAt?: string;
  allowedScopes: {
    bloodGroup: boolean;
    allergies: boolean;
    emergencyContacts: boolean;
    emergencyNotes: boolean;
    medications: boolean;
  };
  accessCount?: number;
  lastAccessedAt?: string;
  accessLog: {
    timestamp: string;
    userAgent?: string;
    action: string;
  }[];
}

export type QrAccessReasonKey =
  | 'consultation_treatment'
  | 'emergency_assistance'
  | 'admission_assessment'
  | 'followup_care'
  | 'caregiver_assistance'
  | 'insurance_admin'
  | 'other';

export interface QrAccessScope {
  bloodGroup: boolean;
  allergies: boolean;
  vitals: boolean;
  medications: boolean;
  emergencyContacts: boolean;
  emergencyNotes: boolean;
  clinicalNotes: boolean;
  labReports: boolean;
}

export type QrAccessRequestStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'expired'
  | 'revoked'
  | 'completed';

export interface QrAccessAuditLogEntry {
  id: string;
  timestamp: string;
  action:
    | 'QR_TOKEN_RESOLVED'
    | 'ACCESS_REQUEST_SUBMITTED'
    | 'PATIENT_CONSENT_GRANTED'
    | 'PATIENT_CONSENT_DENIED'
    | 'EMERGENCY_BREAK_GLASS_INVOKED'
    | 'PROTECTED_DATA_ACCESSED'
    | 'ACCESS_REVOKED'
    | 'ACCESS_EXPIRED'
    | 'UNAUTHORIZED_ATTEMPT_BLOCKED';
  requestId?: string;
  qrToken?: string;
  patientId: string;
  requesterId: string;
  requesterRole: string;
  requesterName?: string;
  reason?: string;
  explanation?: string;
  scopes?: string[];
  outcome: 'SUCCESS' | 'DENIED' | 'BLOCKED' | 'REVOKED';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

export interface QrAccessRequest {
  id: string;
  qrToken: string;
  patientId: string;
  patientName: string;
  patientIdCode: string;
  requesterId: string;
  requesterName: string;
  requesterRole: 'doctor' | 'clinician' | 'paramedic' | 'caregiver' | 'patient' | 'admin' | 'guest' | string;
  requesterEmail?: string;
  requesterOrganization?: string;
  reason: QrAccessReasonKey;
  reasonLabel: string;
  explanation: string;
  requestedScopes: QrAccessScope;
  approvedScopes?: QrAccessScope;
  status: QrAccessRequestStatus;
  isEmergencyBreakGlass: boolean;
  requiresPatientConsent: boolean;
  createdAt: string;
  decidedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revocationReason?: string;
  lastAccessedAt?: string;
  accessCount?: number;
  patientDecisionBy?: string;
  auditLog: QrAccessAuditLogEntry[];
}

export interface QrTokenResolution {
  token: string;
  isValid: boolean;
  status: 'active' | 'expired' | 'revoked' | 'not_found';
  patientIdCode: string;
  maskedPatientName: string;
  institutionName: string;
  requiresReasonAndConsent: boolean;
  expiresAt?: string;
}

export interface DetailedAllergy {
  id: string;
  allergen: string;
  category: 'Medication' | 'Food' | 'Environmental' | 'Insect' | 'Latex' | 'Other';
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe / Life-Threatening';
  notes?: string;
}

export interface DetailedMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  route?: string;
  reason?: string;
  prescribedBy?: string;
  startDate?: string;
  notes?: string;
}

export interface SurgeryRecord {
  id: string;
  procedure: string;
  approximateDate: string;
  hospitalOrDoctor?: string;
  notes?: string;
}

export interface PatientAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface HealthcareProviderInfo {
  providerName?: string;
  clinicHospital?: string;
  phone?: string;
  email?: string;
}

export interface PreferredPharmacyInfo {
  pharmacyName?: string;
  location?: string;
  phone?: string;
}

export interface InsuranceInfo {
  hasInsurance: boolean;
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
  policyHolderName?: string;
  relationshipToHolder?: string;
}

export interface PatientPreferences {
  preferredLanguage: string;
  communication: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    emergencyNotifications: boolean;
    healthReminders: boolean;
  };
  accessibility: {
    largerText: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
  };
}

export interface PatientConsents {
  termsOfService: boolean;
  privacyPolicy: boolean;
  aiAssistanceDisclaimer: boolean;
  medicalDataProcessing: boolean;
  emergencySosConsent: boolean;
  timestamp: string;
}

export interface PatientOnboardingData {
  // Step 1: Account
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  // Step 2: Personal
  dateOfBirth: string;
  gender: string;
  preferredName?: string;
  profileImageUrl?: string;
  preferredLanguage: string;
  country: string;
  nationality?: string;
  // Step 3: Contact & Address
  primaryPhone: string;
  alternatePhone?: string;
  contactEmail: string;
  preferredContactMethod: 'Email' | 'Phone Call' | 'SMS' | 'WhatsApp';
  address: PatientAddress;
  // Step 4: Emergency Contacts
  emergencyContacts: EmergencyContact[];
  // Step 5: Medical Information
  bloodGroup: string;
  rhFactor?: string;
  medicalConditions: string[];
  // Step 6: Allergies & Medications
  hasAllergies: 'Yes' | 'No' | 'Not Sure';
  allergies: DetailedAllergy[];
  takingMedications: 'Yes' | 'No';
  medications: DetailedMedication[];
  // Step 7: Medical History
  pastConditions: string[];
  surgeries: SurgeryRecord[];
  familyHistory: string[];
  additionalMedicalNotes?: string;
  // Step 8: Healthcare Information
  primaryProvider: HealthcareProviderInfo;
  preferredPharmacy: PreferredPharmacyInfo;
  insurance: InsuranceInfo;
  // Step 9: Preferences & Accessibility
  preferences: PatientPreferences;
  // Step 10: Privacy & Consent
  consents: PatientConsents;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authProvider?: 'google' | 'email' | 'demo';
  avatarUrl?: string;
  profileImageUrl?: string; // High-res patient photo or data URL
  phone?: string;
  // Patient specific fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  gender?: string;
  preferredLanguage?: string;
  country?: string;
  nationality?: string;
  address?: PatientAddress;
  alternatePhone?: string;
  preferredContactMethod?: 'Email' | 'Phone Call' | 'SMS' | 'WhatsApp';
  mrn?: string;
  patientId?: string; // e.g. MAI-80429
  dateOfBirth?: string;
  bloodType?: string;
  bloodGroup?: string;
  allergies?: string[];
  allergyDetails?: DetailedAllergy[];
  medicationDetails?: DetailedMedication[];
  medicalConditions?: string[];
  pastConditions?: string[];
  surgicalHistory?: SurgeryRecord[];
  familyMedicalHistory?: string[];
  additionalNotes?: string;
  primaryProvider?: HealthcareProviderInfo;
  preferredPharmacy?: PreferredPharmacyInfo;
  insurance?: InsuranceInfo;
  preferences?: PatientPreferences;
  consents?: PatientConsents;
  hasCompletedOnboarding?: boolean;
  emergencyContacts?: EmergencyContact[];
  emergencyNotes?: string;
  cardStatus?: 'active' | 'restricted' | 'suspended';
  identityVerification?: IdentityVerificationRecord;
  lastUpdated?: string;
  // Doctor & Clinician specific fields
  npi?: string;
  specialty?: string;
  hospitalAffiliation?: string;
  licenseNumber?: string;
  department?: string;
  workingStatus?: ClinicianWorkingStatus;
  officePhone?: string;
  pagerNumber?: string;
  clinicianRole?: ClinicianRole;
  teamId?: string;
  teamName?: string;
}

export type IdentityVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'needs_review';

export type IdentityDocumentType =
  | 'drivers_license'
  | 'passport'
  | 'national_id'
  | 'residence_permit';

export interface IdentityVerificationRecord {
  status: IdentityVerificationStatus;
  documentType?: IdentityDocumentType;
  maskedDocumentNumber?: string; // e.g. "•••• •••• 4821" - strictly never full sensitive unmasked number
  issuingCountry?: string;
  expirationDate?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  reviewNotes?: string;
  providerId: 'stripe_identity' | 'persona' | 'sandbox_simulator' | 'unconfigured';
  providerStatus: 'unconfigured' | 'sandbox_simulated' | 'live_connected';
  consentGiven: boolean;
  consentTimestamp?: string;
  retentionPolicy: string;
}


export type TriageCategory =
  | 'emergency'
  | 'urgent'
  | 'prompt_evaluation'
  | 'routine'
  | 'monitor_self_care';

export interface TriageLevelInfo {
  id: TriageCategory;
  name: string;
  timeframe: string;
  badgeColor: string;
  description: string;
  actionGuidance: string;
  exampleScenarios: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'safety' | 'features' | 'clinical' | 'privacy';
}

export interface LabResultItem {
  testName: string;
  code?: string;
  parameter?: string;
  value: string;
  unit: string;
  referenceRange?: string;
  normalRange?: string;
  status: 'normal' | 'low' | 'high' | 'attention' | 'critical' | 'abnormal';
  explanation?: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  category: 'consultation' | 'vitals' | 'lab' | 'handoff' | 'medication' | 'profile' | 'appointment';
  summary: string;
  details?: string;
  verifiedContext: string;
  source?: string;
  status?: 'active' | 'completed' | 'flagged' | 'scheduled';
  privacyScope?: 'patient' | 'clinical' | 'emergency';
}

export interface VitalDataPoint {
  id?: string;
  patientId?: string;
  type?: string;
  value?: number | string;
  date: string;
  timestamp?: string; // ISO 8601 string for timezone-accurate sorting and display
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // bpm
  spo2: number; // %
  oxygenSaturation?: number; // % (alias for spo2 in clinical telemetry)
  temperature?: number; // degrees
  temperatureUnit?: 'F' | 'C';
  respiratoryRate?: number; // breaths/min
  weight?: number; // weight value
  weightUnit?: 'lbs' | 'kg';
  height?: number; // height value
  heightUnit?: 'in' | 'cm';
  bloodGlucose?: number; // glucose value
  bloodGlucoseUnit?: 'mg/dL' | 'mmol/L';
  source?: string; // e.g. "Patient Logged (Manual)", "Bluetooth Omron BP Monitor", "Clinic Triage", etc.
  notes?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  providerName: string;
  providerSpecialty: string;
  date: string; // e.g. '2026-04-15'
  time: string; // e.g. '10:30 AM'
  type: 'in_person' | 'telehealth';
  location: string;
  status: 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  source?: string;
  notes?: string;
  cancelReason?: string;
  rescheduleReason?: string;
  previousDate?: string;
  previousTime?: string;
  updatedAt?: string;
}

export interface HealthTaskItem {
  id: string;
  patientId: string;
  title: string;
  description: string;
  category: 'vitals' | 'medication' | 'lab' | 'assessment' | 'appointment';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  actionRoute?: RoutePath;
}

export type MedicationSourceType = 'patient_entered' | 'extracted_from_prescription' | 'clinician_verified';
export type MedicationRoute =
  | 'Oral'
  | 'Sublingual'
  | 'Inhalation'
  | 'Topical'
  | 'Subcutaneous'
  | 'Intravenous'
  | 'Ophthalmic'
  | 'Otic'
  | 'Transdermal'
  | 'Rectal'
  | 'Other';
export type MedicationStatus = 'active' | 'paused' | 'discontinued' | 'completed';
export type DoseLogStatus = 'taken' | 'snoozed' | 'missed';

export interface MedicationDoseLog {
  id: string;
  timestamp: string; // ISO string when logged
  scheduledTime: string; // e.g. "08:00"
  status: DoseLogStatus;
  snoozedUntil?: string; // ISO string if snoozed
  notes?: string;
}

export interface MedicationChangeLogEntry {
  id: string;
  timestamp: string;
  changedBy: string;
  action: 'CREATED' | 'UPDATED' | 'PAUSED' | 'RESUMED' | 'DISCONTINUED' | 'CONFIRMED' | 'REMINDERS_UPDATED';
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  rationale?: string;
}

export interface MedicationReminderConfig {
  enabled: boolean;
  paused: boolean;
  pausedUntil?: string;
  times: string[]; // e.g. ['08:00', '20:00'] in 24hr format
  timezone: string; // e.g. 'Asia/Kolkata', 'America/New_York'
  repeatSchedule: 'daily' | 'weekdays' | 'specific_days' | 'interval_days' | 'prn';
  specificDays?: string[]; // e.g. ['Mon', 'Wed', 'Fri']
  maskNotificationPreview: boolean; // Privacy: if true, preview is generic to prevent lockscreen PHI leakage
}

export interface MedicationItem {
  id: string;
  patientId?: string;
  name: string;
  strength?: string; // e.g. "10 mg"
  dosage: string; // e.g. "1 tablet (10 mg)"
  route?: MedicationRoute; // e.g. "Oral"
  frequency: string; // e.g. "Once daily", "Twice daily", "PRN"
  duration?: string; // e.g. "14 days", "30 days", "Ongoing / Chronic"
  timing: string; // e.g. "Morning (08:00 AM)"
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional, missing != discontinued)
  prescribingClinician?: string; // e.g. "Dr. Sarah Chen, MD"
  prescriptionInstructions?: string; // Exact SIG verbatim from Rx
  patientFriendlyInstructions?: string; // Plain language instructions visible only after clinician approval
  indication: string; // Clinical indication
  prescribingContext: string; // Context (e.g. Primary Care, Specialist)
  foodNotes: string; // Dietary / administration notes
  notes?: string; // Notes
  sourceType: MedicationSourceType; // Provenance
  sourceDocumentRef?: string; // e.g. "Prescription Rx-80429-01"
  requiresConfirmation: boolean; // Ambiguous extraction flag
  confirmationNotes?: string;
  status: MedicationStatus; // 'active' | 'paused' | 'discontinued' | 'completed'
  discontinuedDate?: string;
  discontinuationReason?: string;
  reminders: MedicationReminderConfig;
  doseLogs: MedicationDoseLog[];
  changeLog: MedicationChangeLogEntry[];
}

export type MedicationOrderStatus = 'draft' | 'pending_review' | 'authorized' | 'cancelled' | 'discontinued';

export interface MedicationOrderAuditEntry {
  id: string;
  timestamp: string;
  action: 'DRAFTED' | 'AMENDED' | 'REVIEWED' | 'AUTHORIZED' | 'CANCELLED' | 'DISCONTINUED';
  actorName: string;
  actorNpi?: string;
  actorRole: string;
  details: string;
  reason?: string;
}

export interface MedicationAllergyWarning {
  allergen: string;
  severity: 'critical' | 'warning';
  message: string;
}

export interface MedicationDrugInteractionWarning {
  interactingDrug: string;
  severity: 'critical' | 'moderate' | 'minor';
  description: string;
  clinicalManagement: string;
  source: string;
}

export interface MedicationOrder {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  orderType: 'new' | 'change' | 'discontinue';
  medicationId?: string; // Target medication if change/discontinue
  name: string;
  strength: string; // e.g. "10 mg"
  dosage: string; // e.g. "1 tablet"
  route: MedicationRoute; // e.g. "Oral"
  frequency: string; // e.g. "Once daily", "Twice daily"
  duration: string; // e.g. "14 days", "30 days", "Ongoing / Chronic"
  instructions: string; // Prescriber SIG
  patientFriendlyInstructions?: string; // Plain-English instructions (unlocked post-authorization)
  indication: string; // e.g. "Essential Hypertension"
  foodNotes?: string;
  prescriberName: string;
  prescriberNpi?: string;
  prescriberRole?: string;
  status: MedicationOrderStatus;
  statusReason?: string;
  createdAt: string;
  updatedAt: string;
  authorizedAt?: string;
  authorizedBy?: string;
  authorizedNpi?: string;
  auditHistory: MedicationOrderAuditEntry[];
  allergyWarnings: MedicationAllergyWarning[];
  interactionWarnings: MedicationDrugInteractionWarning[];
  transmissionStatus: 'not_transmitted' | 'draft_only' | 'local_chart_updated';
}

export interface DrugInteractionCheckResult {
  hasInteractions: boolean;
  screenDate: string;
  dataSource: string; // e.g. "NIH National Library of Medicine & FDA Drug Interaction Reference"
  disclaimer: string;
  interactions: {
    id: string;
    drugA: string;
    drugB: string;
    severity: 'critical' | 'moderate' | 'minor';
    description: string;
    clinicalManagement: string;
  }[];
}

export interface ReportComment {
  id: string;
  timestamp: string;
  clinicianName: string;
  clinicianNpi?: string;
  comment: string;
}

export interface ReportAuditEntry {
  timestamp: string;
  action:
    | 'UPLOADED'
    | 'VIEWED'
    | 'DOWNLOADED'
    | 'OCR_PROCESSED'
    | 'RETRY_INITIATED'
    | 'REVIEWED'
    | 'COMMENTED'
    | 'SIGNED_OFF'
    | 'FOLLOWUP_TASK_CREATED';
  actor: string;
  details?: string;
}

export interface SourceLinkedFinding {
  finding: string;
  pageNumber?: number;
  section?: string;
  originalTextExcerpt: string;
  confidenceScore: number;
}

export interface AnalyteComparisonItem {
  analyteName: string;
  currentValue: string;
  currentUnit: string;
  currentDate: string;
  previousValue?: string;
  previousUnit?: string;
  previousDate?: string;
  numericDelta?: number;
  percentageChange?: number;
  trend?: 'increased' | 'decreased' | 'stable' | 'incomparable';
  unitMismatch: boolean;
  statusChange?: string;
  notes?: string;
}

export interface MedicalReportRecord {
  id: string;
  patientId?: string;
  patientName?: string;
  title: string;
  documentName?: string;
  testName?: string;
  category?: string;
  type?: string;
  summary?: string;
  date: string;
  laboratory?: string;
  doctor?: string;
  hospital?: string;
  specimenType?: string;
  status: 'normal' | 'review_recommended' | 'critical' | 'abnormal';
  fileSize?: string;
  fileType?: string;
  results?: LabResultItem[];
  clinicalImpression?: string;
  questionsForDoctor?: string[];

  // Document Review Upgrade Fields
  documentType?: 'blood_report' | 'prescription' | 'imaging' | 'discharge_summary' | 'pathology' | 'general';
  uploadDate?: string;
  source?: 'patient_portal' | 'mobile_app' | 'doctor_upload' | 'external_lab';
  processingStatus?: 'pending' | 'processing' | 'processed' | 'failed';
  reviewStatus?: 'unreviewed' | 'reviewed' | 'requires_action';
  failureReason?: string;
  retryCount?: number;
  ocrConfidence?: number;
  ocrUncertaintyNotes?: string;
  fileHash?: string;
  originalFileName?: string;
  fileData?: string; // base64 Data URL or file URI for preview/download
  downloadToken?: string;
  sourceLinkedFindings?: SourceLinkedFinding[];
  clinicianComments?: ReportComment[];
  followUpTasks?: string[];
  auditHistory?: ReportAuditEntry[];
}

export interface ConsultationRecord {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  chiefComplaint: string;
  duration: string;
  severity: number;
  location?: string;
  symptoms?: string[];
  subjective?: string;
  assessment?: string;
  associatedSymptoms: string[];
  pertinentNegatives: string[];
  triageCategory: TriageCategory;
  emergencyFlag: boolean;
  emergencyWarningMessage?: string;
  preliminaryGuidance: string;
  status: 'pending_review' | 'reviewed';
  clinicianNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export type HandoffState = 'draft' | 'pending' | 'accepted' | 'completed' | 'escalated';

export interface DoctorHandoffAuditEntry {
  timestamp: string;
  action: 'CREATED' | 'TRANSMITTED' | 'VIEWED' | 'MODIFIED' | 'REVOKED' | 'ASSIGNED' | 'REASSIGNED' | 'ACCEPTED' | 'COMPLETED' | 'ESCALATED' | 'APPROVED';
  actor: string;
  details?: string;
}

export interface DoctorHandoffSourceAttribution {
  id: string;
  item: string;
  sourceType: 'patient_entered' | 'extracted_record' | 'clinician_verified' | 'ai_synthesized';
  originalRecordRef?: string;
  recordDate?: string;
  isUncertain?: boolean;
  uncertaintyNote?: string;
}

export interface DoctorHandoffRecord {
  id: string;
  shareToken?: string; // Unguessable cryptographically random access token
  date: string;
  patientId: string;
  patientName: string;
  mrn: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  allergies?: string[];
  chiefConcern: string; // Presenting Concern
  duration: string;
  hpiSynopsis: string; // Relevant Clinical History
  currentMedications: string[];
  medicalConditions?: string[];
  recentVitalsSummary: string;
  labHighlights: string[]; // Available Results
  patientQuestions: string[];

  // Structured Care Transition Workflow Fields
  actionsCompleted?: string[]; // Shift/consultation actions completed
  outstandingTasks?: string[]; // Pending diagnostic, nursing, or therapy tasks
  followUpNeeds?: string; // Clear follow-up timeframe, clinician review needs
  assignedClinician?: string; // Target responsible clinician
  assignedDepartment?: string;
  authorClinician?: string;
  authorNpi?: string;

  // AI-Assisted Drafting & Clinician Approval Controls
  isAiDrafted?: boolean;
  isClinicianApproved?: boolean; // AI draft cannot be shared until true
  approvedBy?: string;
  approvedAt?: string;

  // State Machine & Concurrency Control
  handoffState?: HandoffState;
  version?: number; // Concurrency protection against race conditions
  submissionToken?: string; // Idempotent submission token to prevent duplicate saves

  // Connected Care Integrations
  referralId?: string;
  appointmentId?: string;

  // Source Grounding & Attribution Badges
  sourceAttributions?: DoctorHandoffSourceAttribution[];

  // Document inclusions & sensitive data filters
  includedRecordIds?: string[];
  excludedSensitiveCategories?: string[];

  // Data Quality & Currency Warnings
  dataQualityWarnings?: string[];

  // Recipient & Transmission Controls
  recipientName?: string;
  recipientSpecialty?: string;
  recipientFacility?: string;
  recipientEmail?: string;
  expiresAt?: string;
  isRevoked?: boolean;
  revokedAt?: string;

  consentStatus: 'authorized' | 'revoked';
  status: 'pending' | 'reviewed';
  doctorReviewNotes?: string;
  auditLog?: DoctorHandoffAuditEntry[];
}

export interface ClinicalReferralRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  referringClinician: string;
  referringClinicianNpi: string;
  destination: string;
  specialty: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  reason: string;
  clinicalNotes: string;
  status: 'draft' | 'submitted' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  associatedHandoffId?: string;
  auditLog: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }>;
}

export interface ClinicalNotificationRecord {
  id: string;
  recipientRole: 'doctor' | 'patient';
  recipientId: string;
  patientId: string;
  patientName: string;
  type: 'handoff_assigned' | 'handoff_accepted' | 'handoff_escalated' | 'appointment_scheduled' | 'referral_created' | 'task_reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sourceRefId?: string;
  sourceRefType?: 'handoff' | 'task' | 'appointment' | 'referral';
}

export type PrioritySource = 'clinician' | 'configured_rule' | 'ai_suggestion';
export type DataQualityStatus = 'complete' | 'stale' | 'missing_vitals' | 'contradictory';

export interface PriorityOverrideEntry {
  id: string;
  previousPriority: TriageCategory;
  newPriority: TriageCategory;
  overrideReason: string;
  overriddenBy: string;
  overriddenByNpi?: string;
  timestamp: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  lastVisit: string;
  triageStatus: TriageCategory;
  activeConditions: string[];
  allergies: string[];
  assignedDoctor: string;
  department?: string;
  triageReason?: string;
  waitTimeMinutes?: number;
  admittedAt?: string;
  caseStatus?: 'pending_review' | 'in_review' | 'reviewed' | 'escalated' | 'discharged';
  vitalsSummary?: string;
  lastUpdated?: string;
  recentConsultationId?: string;
  recentHandoffId?: string;

  // Triage Explanation & Provenance
  prioritySource?: PrioritySource;
  priorityAssignedAt?: string;
  priorityAssignedBy?: string;
  priorityExplanation?: string;
  priorityOverrides?: PriorityOverrideEntry[];
  reportedSymptoms?: string[];
  riskIndicators?: string[];
  assessmentTimestamp?: string;

  // Safe Fallback & Data Quality Indicators
  dataQualityStatus?: DataQualityStatus;
  dataQualityNotes?: string;
  isClinicianConfirmedEmergency?: boolean; // Emergency protection: never silently downgrade clinician-confirmed emergencies
  isEscalated?: boolean;
}

export type ClinicalTaskStatus = 'pending' | 'in_progress' | 'acknowledged' | 'completed' | 'escalated' | 'cancelled';
export type ClinicalTaskPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ClinicalTaskAuditEntry {
  timestamp: string;
  action: 'CREATED' | 'ASSIGNED' | 'REASSIGNED' | 'ACKNOWLEDGED' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED';
  actor: string;
  details?: string;
}

export interface ClinicalTask {
  id: string;
  patientId: string;
  patientName: string;
  mrn?: string;
  title: string;
  description?: string;
  category?: 'triage_review' | 'lab_review' | 'handoff_ack' | 'prescription_order' | 'specialist_referral' | 'safety_followup';
  type?: string;
  priority: ClinicalTaskPriority;
  status: ClinicalTaskStatus;
  isOverdue?: boolean;
  assignedClinician: string;
  assignedDepartment?: string;
  createdAt: string;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  auditLog: ClinicalTaskAuditEntry[];
}

export interface ClinicalAssessmentAmendment {
  id: string;
  timestamp: string;
  clinicianName: string;
  clinicianNpi?: string;
  note: string;
  reason: string;
}

export interface DoctorClinicalAssessment {
  id: string;
  patientId: string;
  consultationId?: string;
  clinicianId: string;
  clinicianName: string;
  clinicianNpi?: string;
  hospitalAffiliation?: string;
  chiefComplaint: string;
  clinicalImpression: string;
  differentialDiagnosis?: string[];
  triageCategory: TriageCategory;
  recommendedPlan: string;
  orders: {
    id: string;
    description: string;
    type: 'diagnostic_lab' | 'imaging' | 'referral' | 'medication';
    status: 'ordered' | 'pending';
  }[];
  isDraft: boolean;
  isSigned: boolean;
  signedAt?: string;
  lastSavedAt: string;
  amendments: ClinicalAssessmentAmendment[];
  auditLog: {
    timestamp: string;
    action: 'DRAFT_SAVED' | 'FINALIZED_AND_SIGNED' | 'AMENDED';
    actor: string;
  }[];
}

export interface TriageEscalationRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  severity?: number;
  triageTier: TriageCategory;
  acuityLevel?: 'critical' | 'high' | 'medium' | 'low' | string;
  triggeredFlags?: string[];
  reason?: string;
  triggerReason?: string;
  vitalAlert?: string;
  escalatedAt: string;
  status: 'active' | 'in_progress' | 'resolved';
  assignedTeam?: string;
  assignedDepartment?: string;
  assignedClinician?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  overdueMinutesThreshold?: number;
  isOverdue?: boolean;
  responseTimeMinutes?: number;
  escalationTimestamp?: string;
  policyResponseTimeMinutes?: number;
  escalationPolicyId?: string;
  vitalSignsSnapshot?: {
    bloodPressure?: string;
    heartRate?: string;
    oxygenSaturation?: string;
    respiratoryRate?: string;
    temperature?: string;
    [key: string]: string | undefined;
  };
  auditLog?: {
    timestamp: string;
    action: 'CREATED' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'OVERDUE_ALERT' | 'RESOLVED' | 'ESCALATION_TRIGGERED';
    actor: string;
    details?: string;
  }[];
}

export interface EscalationPolicy {
  id: string;
  tier: TriageCategory;
  name: string;
  redFlags: string[];
  maxResponseMinutes: number;
  routingTarget: string;
  reviewedByClinician: string;
  reviewedAt: string;
  version: string;
  active: boolean;
  staleDataThresholdHours: number;
  description: string;
}

export interface MaskedClinicalNotification {
  id: string;
  timestamp: string;
  urgency: 'critical' | 'urgent' | 'routine';
  previewText: string;
  fullDetails: {
    patientId: string;
    patientName: string;
    mrn: string;
    reason: string;
  };
  read: boolean;
  targetDepartment?: string;
}

// ==========================================
// AI CLINICAL COPILOT SCHEMAS & PROTOCOLS
// ==========================================

export type ClinicalCopilotMode =
  | 'summarize_history'
  | 'summarize_reports'
  | 'ask_question'
  | 'generate_draft';

export type ClinicalDraftType =
  | 'consultation_note'
  | 'handoff_brief'
  | 'patient_explanation';

export interface ClinicalCitation {
  id: string;
  sourceType: 'vital_log' | 'lab_report' | 'consultation' | 'medication_record' | 'patient_intake';
  documentName: string;
  date: string;
  sectionOrParameter?: string;
  excerpt: string;
}

export interface ClinicalCopilotProvenance {
  model: string;
  generatedAt: string;
  patientId: string;
  patientName: string;
  clinicianNpi: string;
  clinicianName: string;
  sourceCitations: ClinicalCitation[];
  dataFreshnessStatus: 'complete' | 'stale' | 'missing_vitals';
  isGrounded: boolean;
  hasSafetyConflicts: boolean;
  safetyNotices: string[];
}

export interface ClinicalCopilotResponse {
  success: boolean;
  mode: ClinicalCopilotMode;
  draftType?: ClinicalDraftType;
  generatedContent: string;
  missingInformation: string[];
  conflictingEntries: string[];
  allergyMedicationAlerts: string[];
  citations: ClinicalCitation[];
  provenance: ClinicalCopilotProvenance;
  unavailableSources?: boolean;
  unavailableReason?: string;
  error?: string;
  code?: string;
}

export interface ClinicalCopilotApprovalPayload {
  patientId: string;
  action: 'approve' | 'reject';
  draftType: ClinicalDraftType;
  originalAiContent: string;
  approvedContent: string;
  wasEdited: boolean;
  rejectionReason?: string;
  citations?: ClinicalCitation[];
  notes?: string;
}

export interface ClinicalCopilotApprovalRecord {
  id: string;
  timestamp: string;
  patientId: string;
  patientName: string;
  mrn: string;
  clinicianName: string;
  clinicianNpi: string;
  action: 'approved' | 'rejected';
  draftType: ClinicalDraftType;
  originalContent: string;
  finalContent: string;
  wasEdited: boolean;
  rejectionReason?: string;
  citations: ClinicalCitation[];
  associatedRecordId?: string;
  auditTrailId: string;
}

// ============================================================================
// CLINICIAN CREDENTIALS & SECURE ACCOUNT MANAGEMENT
// ============================================================================

export type ClinicianRole = 'doctor' | 'nurse' | 'lab_reviewer' | 'admin';

export type ClinicianWorkingStatus = 'on_duty' | 'off_duty' | 'on_call' | 'in_surgery';

export type CredentialDocumentType =
  | 'medical_license'
  | 'state_medical_license'
  | 'dea_registration'
  | 'board_certification'
  | 'hospital_privileges'
  | 'npi_registration'
  | 'nursing_license'
  | 'clia_lab_director';

export type CredentialVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'unverified_demo';

export interface ClinicianCredentialDocument {
  id: string;
  clinicianId: string;
  documentType: CredentialDocumentType;
  title: string;
  issuingBody: string;
  issuingAuthority?: string;
  identifier: string; // Internal identifier
  documentNumber?: string;
  maskedIdentifier: string; // Sanitized masked format (e.g. "•••• ••8291")
  documentNumberMasked?: string;
  issueDate: string;
  expiryDate: string;
  verificationStatus: CredentialVerificationStatus;
  verificationSource?: string;
  verifiedAt?: string;
  verificationDate?: string;
  verifiedBy?: string;
  verificationNotes?: string;
  isAuthoritativeVerification: boolean; // Strictly false for simple uploads
  isDemoOrSimulated: boolean; // Flag for clear UI labelling
  fileName?: string;
  fileSize?: string;
  documentUrl?: string;
  stateOrJurisdiction?: string;
  expirationDate?: string;
  reviewNote?: string;
  uploadedAt: string;
  auditTrailId?: string;
}

export type ClinicianPermission =
  | 'prescribe_medications'
  | 'override_triage_acuity'
  | 'review_and_sign_labs'
  | 'sign_handoffs'
  | 'manage_clinician_roles'
  | 'verify_physician_credentials'
  | 'view_audit_logs'
  | 'revoke_sessions'
  | 'assign_patient_teams'
  | 'prescribe:order'
  | 'prescribe:sign'
  | 'reports:review'
  | 'credentials:approve'
  | 'emergency:override'
  | 'roles:manage'
  | 'sessions:revoke'
  | 'audit:view';

export interface ClinicianSession {
  id: string;
  clinicianId: string;
  deviceName?: string;
  deviceType: 'Desktop Workstation' | 'Mobile Device' | 'Hospital Tablet' | 'Clinic Terminal';
  browser: string;
  ipAddress: string;
  location: string;
  loginAt: string;
  lastActiveAt: string;
  isCurrentSession: boolean;
  isCurrent?: boolean;
  status: 'active' | 'revoked' | 'expired';
}

export interface ClinicianTeamMember {
  id: string;
  name: string;
  email: string;
  role: ClinicianRole;
  specialty: string;
  department: string;
  workingStatus: ClinicianWorkingStatus;
  status?: string;
  assignedPatientsCount: number;
  npi?: string;
  avatarUrl?: string;
  pagerNumber?: string;
  phone?: string;
}

export interface ClinicianCaseAssignment {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  chiefConcern?: string;
  triageCategory: string;
  triageTier?: string;
  primaryClinicianId: string;
  primaryClinicianName: string;
  assignedToClinicianId?: string;
  assignedToName?: string;
  assignedToRole?: string;
  assignedTeam: string;
  assignedDepartment: string;
  assignedAt: string;
  status: 'active' | 'in_consultation' | 'transferred' | 'discharged';
  notes?: string;
  reassignedFromClinician?: string;
  reassignmentReason?: string;
  reassignmentRationale?: string;
}

export interface ClinicianAccountAuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetClinicianId: string;
  targetClinicianName: string;
  action:
    | 'ROLE_UPDATED'
    | 'ROLE_ELEVATION_DENIED'
    | 'CREDENTIAL_SUBMITTED'
    | 'CREDENTIAL_VERIFIED'
    | 'CREDENTIAL_REJECTED'
    | 'CREDENTIAL_SELF_APPROVAL_DENIED'
    | 'SESSION_REVOKED'
    | 'ALL_SESSIONS_REVOKED'
    | 'WORKING_STATUS_UPDATED'
    | 'CASE_ASSIGNED'
    | 'CASE_REASSIGNED'
    | 'ACCESS_REVOKED'
    | 'PROFILE_UPDATED';
  details: string;
  ipAddress?: string;
}

export type ClinicalAuditAction =
  | 'RECORD_VIEWED'
  | 'RECORD_EDITED'
  | 'CHART_EXPORTED'
  | 'AUDIT_LOG_EXPORTED'
  | 'ROLE_MODIFIED'
  | 'PERMISSION_CHANGED'
  | 'CREDENTIAL_REVIEWED'
  | 'CREDENTIAL_VERIFIED'
  | 'SESSION_REVOKED'
  | 'TASK_OVERRIDE'
  | 'EMERGENCY_ESCALATION'
  | 'TRIAGE_STATUS_CHANGED'
  | 'PRESCRIPTION_SIGNED'
  | 'DIAGNOSTIC_REPORT_REVIEWED'
  | 'DATA_PROCESSING_RETRY'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'MEDICATION_DISCONTINUED'
  | 'MEDICATION_ORDER_DRAFTED'
  | 'MEDICATION_ORDER_AUTHORIZED'
  | 'MEDICATION_ORDER_CANCELLED'
  | 'CLINICIAN_PRIORITY_OVERRIDE'
  | 'CREATE_HANDOFF_BRIEF'
  | 'UPDATE_HANDOFF_BRIEF'
  | 'CREATE_REFERRAL'
  | 'UPDATE_REPORT_REVIEW_STATUS'
  | 'CLINICAL_COPILOT_APPROVED'
  | 'CLINICAL_COPILOT_REJECTED'
  | 'UNAUTHORIZED_COPILOT_ACCESS_ATTEMPT'
  | 'UNAUTHORIZED_PATIENT_ACCESS_BLOCKED'
  | 'CLINICAL_COPILOT_QUERY'
  | 'SIGNED_CLINICAL_ASSESSMENT'
  | 'SAVED_ASSESSMENT_DRAFT'
  | 'REVIEWED'
  | 'DOWNLOADED'
  | 'UPLOADED'
  | 'VIEWED'
  | (string & {});

export type ClinicalAuditOutcome = 'SUCCESS' | 'DENIED' | 'WARNING';

export interface ClinicalAuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorId?: string;
  actorRole?: string;
  action: ClinicalAuditAction;
  targetEntity?: string;
  patientId?: string;
  recordId?: string;
  outcome: ClinicalAuditOutcome;
  details: string;
  ip?: string;
  ipAddress?: string;
  platform?: string;
}

export interface WaitingTimeDistributionBuckets {
  under15: number;
  between15And30: number;
  between31And60: number;
  over60: number;
}

export interface ClinicalMetricsData {
  totalActiveCases: number;
  activeCasesByUrgency: {
    emergency: number;
    urgent: number;
    prompt_evaluation: number;
    routine: number;
    percentages: {
      emergency: number;
      urgent: number;
      prompt_evaluation: number;
      routine: number;
    };
  };
  patientsWaitingForReview: {
    total: number;
    emergencyCount: number;
    urgentCount: number;
    promptCount: number;
    routineCount: number;
    byDepartment: Record<string, number>;
  };
  waitingTimeDistribution: {
    minMinutes: number;
    medianMinutes: number;
    maxMinutes: number;
    averageMinutes: number;
    totalWaiting: number;
    buckets: WaitingTimeDistributionBuckets;
  };
  abnormalReportsAwaitingReview: {
    total: number;
    criticalCount: number;
    abnormalCount: number;
    oldestUnreviewedTimestamp?: string;
    byDepartment: Record<string, number>;
  };
  overdueFollowUpTasks: {
    total: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    oldestOverdueHours: number;
  };
  openEscalations: {
    total: number;
    activeCount: number;
    inProgressCount: number;
    overdueCount: number;
    meanTimeToAcknowledgeMinutes: number;
    meanTimeToResolveMinutes: number;
  };
  completedHandoffs: {
    totalCompleted: number;
    totalHandoffs: number;
    completionRatePercent: number;
    averageReviewTimeMinutes: number;
  };
  dataProcessingFailures: {
    total: number;
    unrecoveredCount: number;
    byFailureReason: Record<string, number>;
    retryAttemptedCount: number;
    unresolvedList: Array<{
      id: string;
      title: string;
      failureReason: string;
      retryCount: number;
      timestamp: string;
    }>;
  };
  filterMeta: {
    dateRange: string;
    department: string;
    status: string;
    computedAt: string;
    totalRecordsEvaluated: number;
  };
  metricDefinitions: Record<
    string,
    {
      title: string;
      definition: string;
      calculationRule: string;
      sourceCollection: string;
    }
  >;
}

export interface ClinicalMetricsFilter {
  dateRange?: '24h' | '7d' | '30d' | 'all';
  department?: string;
  status?: string;
}

