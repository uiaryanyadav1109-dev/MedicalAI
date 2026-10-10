export interface ProductFeature {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconName: string;
  category: 'clinical' | 'records' | 'collaboration' | 'security';
  previewHighlights: string[];
}

export const CORE_FEATURES: ProductFeature[] = [
  {
    id: 'clinical-assistant',
    title: 'AI Clinical Assistant',
    tagline: 'Conversational clinical intake with adaptive inquiry',
    description: 'Describe symptoms naturally in plain language. The assistant asks dynamic, context-aware follow-up questions to clarify severity, timing, and associated factors without diagnostic claims.',
    iconName: 'MessageSquareText',
    category: 'clinical',
    previewHighlights: ['Adaptive follow-up questions', 'Structured chief concern extraction', 'No diagnostic certainty claims']
  },
  {
    id: 'preliminary-triage',
    title: 'Preliminary Triage',
    tagline: 'Calm, evidence-informed guidance on appropriate care timing',
    description: 'Categorizes reported symptom patterns across 5 clear operational levels (Emergency, Urgent, Prompt Evaluation, Routine, Monitor) so you know when and where to seek professional care.',
    iconName: 'Activity',
    category: 'clinical',
    previewHighlights: ['5-tier triage classification', 'Duration & severity weighting', 'Immediate emergency safety rails']
  },
  {
    id: 'report-analyzer',
    title: 'Medical Report Analyzer',
    tagline: 'Plain-language clarity for complex laboratory and imaging reports',
    description: 'Transforms dense CBCs, metabolic panels, and imaging impressions into organized, readable summaries with benchmark reference intervals and questions to discuss with your doctor.',
    iconName: 'FileText',
    category: 'records',
    previewHighlights: ['Automated analyte recognition', 'Biological reference intervals', 'Trend comparison across visits']
  },
  {
    id: 'health-timeline',
    title: 'Health Timeline',
    tagline: 'Chronological continuity for all consultations, labs, and vitals',
    description: 'Consolidates consultations, wearable telemetry, lab results, and clinician appointments into an intuitive historical record that eliminates fragmented paperwork.',
    iconName: 'Clock',
    category: 'records',
    previewHighlights: ['Consolidated visit history', 'Chronological milestone tracking', 'Context-rich clinical timeline']
  },
  {
    id: 'vitals-intelligence',
    title: 'Vitals Intelligence',
    tagline: 'Longitudinal telemetry tracking without pseudo-scientific scoring',
    description: 'Visualizes resting blood pressure, pulse, SpO2, and temperature trends with clinically sound graphing, contextual percentiles, and clean tabular statistics.',
    iconName: 'HeartPulse',
    category: 'records',
    previewHighlights: ['Resting BP & pulse trends', 'SpO2 variance tracking', 'Tabular clinical metrics']
  },
  {
    id: 'medication-intelligence',
    title: 'Medication Intelligence',
    tagline: 'Clear dosing schedules, interaction awareness, and refill tracking',
    description: 'Keeps an active register of prescribed therapies, schedule frequency, and food interaction guidelines. Strictly educational—Medical AI does not prescribe medication.',
    iconName: 'Pill',
    category: 'records',
    previewHighlights: ['Active therapy schedules', 'Interaction awareness', 'Explicit non-prescriptive safety']
  },
  {
    id: 'doctor-handoff',
    title: 'Doctor Handoff',
    tagline: 'Distill lengthy symptom chronologies into a 1-page clinical briefing',
    description: 'Generates a standardized clinical intake brief—including Chief Concern, HPI timeline, pertinent negatives, and prioritized patient questions—ready for clinician review.',
    iconName: 'Stethoscope',
    category: 'collaboration',
    previewHighlights: ['Standardized clinical summary', 'Prioritized patient questions', 'Patient consent review before dispatch']
  },
  {
    id: 'secure-health-sharing',
    title: 'Secure Health Sharing & QR Token',
    tagline: 'Granular, time-bound access control with instant revocation',
    description: 'Share specific health records using cryptographically tokenized links or QR passes. Set access windows from 15 minutes to 7 days, with full audit trail and immediate revocation.',
    iconName: 'ShieldCheck',
    category: 'security',
    previewHighlights: ['Ephemeral tokenized QR passes', 'Zero raw medical data in QR payload', 'Granular field-level consent']
  }
];

export const FEATURE_MATRIX_ITEMS = [
  { feature: 'Conversational Clinical Intake', patientBenefit: 'Express concerns in natural everyday words', clinicianBenefit: 'Receives structured chief complaint & timeline' },
  { feature: 'Adaptive Context Inquiry', patientBenefit: 'Clarifies key details you might otherwise forget', clinicianBenefit: 'Reduces intake interview time by 40%' },
  { feature: 'Emergency Red-Flag Interceptor', patientBenefit: 'Urgent immediate prompt for high-risk signs', clinicianBenefit: 'Ensures emergent cases bypass routine queues' },
  { feature: 'Laboratory OCR & Plain Explanations', patientBenefit: 'Understands lab numbers and biological ranges', clinicianBenefit: 'Patients arrive informed without erroneous panic' },
  { feature: 'Longitudinal Vitals Graphing', patientBenefit: 'Monitors resting vitals trends over weeks & months', clinicianBenefit: 'Reviews clean ambulatory data without telemetry clutter' },
  { feature: 'Medication Schedule Organization', patientBenefit: 'Never forgets dosage timing or dietary guidance', clinicianBenefit: 'Instant reconciled medication adherence view' },
  { feature: '1-Page Clinical Brief Generator', patientBenefit: 'Walks into the appointment confident and organized', clinicianBenefit: 'Instant HPI synopsis ready before entering exam room' },
  { feature: 'Tokenized QR & Ephemeral Access', patientBenefit: 'Complete sovereignty over who sees which records', clinicianBenefit: 'Zero-friction browser access without portal friction' },
  { feature: 'Multilingual Natural Processing', patientBenefit: 'Consult in English, Hindi, Bengali, or Hinglish', clinicianBenefit: 'Bridges linguistic barriers for diverse patient populations' },
  { feature: 'Strict Evidence Grounding', patientBenefit: 'Information anchored in verified clinical references', clinicianBenefit: 'Mitigates misinformation and unverified advice' }
];
