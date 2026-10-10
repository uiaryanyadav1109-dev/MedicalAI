import { TimelineEntry, VitalDataPoint } from '../types';

export const DEMO_TIMELINE: TimelineEntry[] = [
  {
    id: 'tl-1',
    date: 'March 12, 2026',
    title: 'AI Clinical Consultation',
    category: 'consultation',
    summary: 'Evaluated bilateral frontal tension headache persisting 36 hours. Red flags excluded.',
    details: 'Adaptive intake completed: pain intensity 4/10, no photophobia, no neurological deficit. Suggested hydration and posture evaluation.',
    verifiedContext: 'Structured Patient Intake'
  },
  {
    id: 'tl-2',
    date: 'March 15, 2026',
    title: 'Blood Pressure Recorded',
    category: 'vitals',
    summary: 'Resting ambulatory vital: 118/76 mmHg · Pulse 68 bpm · SpO2 99%.',
    details: 'Automated cuff sync verified at 08:30 AM before breakfast. All metrics within optimal clinical thresholds.',
    verifiedContext: 'Connected Vitals Telemetry'
  },
  {
    id: 'tl-3',
    date: 'March 20, 2026',
    title: 'Lab Report Added: CBC Panel',
    category: 'lab',
    summary: 'Analyzed complete blood count. Hemoglobin 13.8 g/dL, WBC 7.4 ×10⁹/L, Platelets 245 ×10⁹/L.',
    details: 'OCR document extraction validated against standard LOINC references. No critical hematologic deviations flagged.',
    verifiedContext: 'Diagnostic Extraction'
  },
  {
    id: 'tl-4',
    date: 'March 24, 2026',
    title: 'Doctor Handoff Created',
    category: 'handoff',
    summary: 'Synthesized 14-day symptom context, medication schedule, and lab trends into a 1-page clinical brief.',
    details: 'Patient approved 4 key clinical questions regarding tension triggers prior to upcoming consultation.',
    verifiedContext: 'Validated Clinical Brief'
  }
];

export const DEMO_VITALS_DATA: VitalDataPoint[] = [
  { date: 'Mar 01', systolic: 122, diastolic: 80, heartRate: 72, spo2: 98 },
  { date: 'Mar 05', systolic: 120, diastolic: 78, heartRate: 70, spo2: 99 },
  { date: 'Mar 10', systolic: 124, diastolic: 82, heartRate: 74, spo2: 98 },
  { date: 'Mar 15', systolic: 118, diastolic: 76, heartRate: 68, spo2: 99 },
  { date: 'Mar 20', systolic: 121, diastolic: 79, heartRate: 71, spo2: 98 },
  { date: 'Mar 25', systolic: 119, diastolic: 77, heartRate: 69, spo2: 99 },
  { date: 'Mar 30', systolic: 117, diastolic: 75, heartRate: 66, spo2: 100 }
];
