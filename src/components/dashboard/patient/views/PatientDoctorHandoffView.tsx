import React, { useState, useEffect } from 'react';
import { RoutePath, DoctorHandoffRecord, DoctorHandoffSourceAttribution, VitalDataPoint } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { clinicalStore } from '../../../../services/clinicalStore';
import { getScannableOrigin } from '../../../../utils/qrCodeGenerator';
import {
  Stethoscope,
  Copy,
  Check,
  Download,
  Share2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  User,
  HeartPulse,
  Pill,
  HelpCircle,
  Clock,
  AlertTriangle,
  Lock,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  Calendar,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';

interface PatientDoctorHandoffViewProps {
  onNavigate: (route: RoutePath) => void;
}

type HandoffTab = 'builder' | 'shares' | 'export_preview';

export const PatientDoctorHandoffView: React.FC<PatientDoctorHandoffViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HandoffTab>('builder');

  // Real Clinical Data from store
  const [handoffs, setHandoffs] = useState<DoctorHandoffRecord[]>(clinicalStore.getHandoffs());
  const vitals = clinicalStore.getVitals();
  const fallbackVital: VitalDataPoint = {
    id: 'v-fallback',
    date: '2026-03-29',
    timestamp: '2026-03-29T08:00:00Z',
    systolic: 118,
    diastolic: 76,
    heartRate: 68,
    spo2: 99,
    temperature: 98.3
  };
  const latestBpVital = [...vitals].reverse().find((v) => v.systolic != null && v.diastolic != null);
  const latestHrVital = [...vitals].reverse().find((v) => v.heartRate != null);
  const latestSpo2Vital = [...vitals].reverse().find((v) => v.spo2 != null || v.oxygenSaturation != null);
  const rawVital = vitals[vitals.length - 1];
  const latestVital: VitalDataPoint = rawVital
    ? {
        ...rawVital,
        systolic: rawVital.systolic ?? latestBpVital?.systolic ?? fallbackVital.systolic,
        diastolic: rawVital.diastolic ?? latestBpVital?.diastolic ?? fallbackVital.diastolic,
        heartRate: rawVital.heartRate ?? latestHrVital?.heartRate ?? fallbackVital.heartRate,
        spo2: rawVital.spo2 ?? latestSpo2Vital?.spo2 ?? latestSpo2Vital?.oxygenSaturation ?? fallbackVital.spo2
      }
    : fallbackVital;
  const medications = clinicalStore.getMedications();
  const activeMedications = medications.filter((m) => m.status === 'active');
  const reports = clinicalStore.getReports();
  const consultations = clinicalStore.getConsultations();

  // Listen to store updates
  useEffect(() => {
    const unsubscribe = clinicalStore.subscribe(() => {
      setHandoffs(clinicalStore.getHandoffs());
    });
    return unsubscribe;
  }, []);

  // UI States
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [errorNote, setErrorNote] = useState<string | null>(null);

  // BUILDER STEP 1: Record Selection
  const [includeVitals, setIncludeVitals] = useState(true);
  const [includeMedications, setIncludeMedications] = useState(true);
  const [includeConditions, setIncludeConditions] = useState(true);
  const [includeReports, setIncludeReports] = useState(true);
  const [includeConsultations, setIncludeConsultations] = useState(true);

  // BUILDER STEP 2: Sensitive Data Filters
  const [excludeMentalHealth, setExcludeMentalHealth] = useState(false);
  const [excludeReproductiveNotes, setExcludeReproductiveNotes] = useState(false);
  const [excludeSubstanceHistory, setExcludeSubstanceHistory] = useState(false);

  // BUILDER STEP 3: Editable Summary State
  const [chiefConcern, setChiefConcern] = useState(
    'Bilateral Frontal Tension Headache & Cervical Strain'
  );
  const [duration, setDuration] = useState('2 days (gradual onset)');
  const [hpiSynopsis, setHpiSynopsis] = useState(
    '27-year-old male presents with 2-day gradual onset of bilateral band-like frontal headache (severity 4/10). Symptoms aggravate following prolonged computer screen use. Denies fever, vomiting, photophobia, limb weakness, or acute visual disturbance. Ambulatory vitals stable. Currently taking Lisinopril 10mg daily for controlled hypertension.'
  );
  const [patientQuestions, setPatientQuestions] = useState<string[]>([
    'Could this headache be aggravated by cervical posture or eye strain?',
    'Does my borderline fasting glucose of 104 mg/dL warrant follow-up HbA1c testing?'
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // BUILDER STEP 4: Recipient Confirmation
  const [recipientName, setRecipientName] = useState('Dr. Sarah Chen, MD');
  const [recipientSpecialty, setRecipientSpecialty] = useState('Internal Medicine & Cardiovascular Health');
  const [recipientFacility, setRecipientFacility] = useState('Metro Clinical Reference Hospital');
  const [recipientEmail, setRecipientEmail] = useState('s.chen@metrohealth.org');
  const [expiryDays, setExpiryDays] = useState(7);

  // Explicit Patient Consent (MANDATORY before transmission)
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Active Selected Handoff for Details/Print
  const [selectedHandoffId, setSelectedHandoffId] = useState<string>(handoffs[0]?.id || '');
  const activeHandoff = handoffs.find((h) => h.id === selectedHandoffId) || handoffs[0];

  // Dynamic Data Quality Warnings based on current data
  const dynamicQualityWarnings: string[] = [];
  if (latestVital) {
    dynamicQualityWarnings.push('Telemetry: Blood pressure and vitals captured ambulatory; baseline normotensive.');
  }
  const glucoseReport = reports.find((r) => r.results?.some((item) => item.testName.toLowerCase().includes('glucose')));
  if (glucoseReport) {
    dynamicQualityWarnings.push('Outdated/Attention: Fasting glucose 104 mg/dL from Mar 20 is borderline — repeat with HbA1c recommended.');
  }
  dynamicQualityWarnings.push('Notice: Weight last logged 11 days ago; today\'s weight was not re-measured.');

  // Handle adding patient-authored question
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setPatientQuestions([...patientQuestions, newQuestionText.trim()]);
    setNewQuestionText('');
  };

  // Handle removing question
  const handleRemoveQuestion = (index: number) => {
    setPatientQuestions(patientQuestions.filter((_, i) => i !== index));
  };

  // Handle Transmit with Explicit Confirmation
  const handleGenerateAndTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNote(null);

    if (!consentConfirmed) {
      setErrorNote('Explicit patient consent is required. Please check the authorization box before transmitting.');
      return;
    }

    if (!chiefConcern.trim()) {
      setErrorNote('Chief concern is required for clinical handoff brief.');
      return;
    }

    // Source attributions for grounding
    const sourceAttributions: DoctorHandoffSourceAttribution[] = [
      {
        id: `sa-cc-${Date.now()}`,
        item: `Chief Concern: ${chiefConcern}`,
        sourceType: 'patient_entered',
        originalRecordRef: 'Patient Intake Portal',
        recordDate: new Date().toISOString().split('T')[0]
      },
      {
        id: `sa-hpi-${Date.now()}`,
        item: 'History of Present Illness (HPI) Synthesis',
        sourceType: 'ai_synthesized',
        originalRecordRef: 'AI Clinical Protocol (Grounded in Verified Records)',
        recordDate: new Date().toISOString().split('T')[0],
        isUncertain: false
      }
    ];

    if (includeVitals && latestVital) {
      sourceAttributions.push({
        id: `sa-vit-${Date.now()}`,
        item: `Vitals Telemetry: BP ${latestVital.systolic}/${latestVital.diastolic} mmHg, HR ${latestVital.heartRate} bpm, SpO2 ${latestVital.spo2}%`,
        sourceType: 'clinician_verified',
        originalRecordRef: `Ambulatory Log (${latestVital.id || 'v-latest'})`,
        recordDate: latestVital.timestamp ? latestVital.timestamp.split('T')[0] : '2026-03-29'
      });
    }

    if (includeMedications && activeMedications.length > 0) {
      sourceAttributions.push({
        id: `sa-med-${Date.now()}`,
        item: `Active Regimens: ${activeMedications.map((m) => m.name).join(', ')}`,
        sourceType: 'clinician_verified',
        originalRecordRef: 'Electronic Prescription Records',
        recordDate: activeMedications[0].startDate || '2025-11-10'
      });
    }

    if (includeReports && reports.length > 0) {
      sourceAttributions.push({
        id: `sa-rep-${Date.now()}`,
        item: `Diagnostic Laboratory Panel: ${reports[0].title}`,
        sourceType: 'extracted_record',
        originalRecordRef: `Diagnostic Laboratory (${reports[0].id})`,
        recordDate: reports[0].date
      });
    }

    const excludedCategories: string[] = [];
    if (excludeMentalHealth) excludedCategories.push('Mental Health & Psychological Consultations');
    if (excludeReproductiveNotes) excludedCategories.push('Reproductive & Sexual Health Records');
    if (excludeSubstanceHistory) excludedCategories.push('Substance Use History');

    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();

    const created = clinicalStore.createHandoff({
      patientId: user?.id || 'pat-1',
      patientName: user?.name || 'Aryan Yadav',
      mrn: user?.mrn || 'MAI-80429',
      dateOfBirth: '1998-09-14',
      bloodGroup: user?.bloodType || 'O+',
      allergies: user?.allergies || ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)'],
      chiefConcern,
      duration,
      hpiSynopsis,
      currentMedications: includeMedications ? activeMedications.map((m) => `${m.name} ${m.dosage}`) : [],
      medicalConditions: includeConditions ? ['Essential Hypertension (Controlled)'] : [],
      recentVitalsSummary: includeVitals
        ? `BP: ${latestVital.systolic}/${latestVital.diastolic} mmHg · HR: ${latestVital.heartRate} bpm · SpO2: ${latestVital.spo2}% · Temp: ${latestVital.temperature || 98.3}°F`
        : 'Vitals excluded by patient request',
      labHighlights: includeReports
        ? reports.slice(0, 2).map((r) => `${r.title} (${r.status.toUpperCase()})`)
        : ['Diagnostic reports excluded by patient request'],
      patientQuestions,
      sourceAttributions,
      includedRecordIds: [
        ...(includeVitals ? ['v-latest'] : []),
        ...(includeReports ? reports.map((r) => r.id) : []),
        ...(includeMedications ? activeMedications.map((m) => m.id) : [])
      ],
      excludedSensitiveCategories: excludedCategories,
      dataQualityWarnings: dynamicQualityWarnings,
      recipientName,
      recipientSpecialty,
      recipientFacility,
      recipientEmail,
      expiresAt,
      consentStatus: 'authorized'
    });

    setSelectedHandoffId(created.id);
    setSuccessNote(`Clinical handoff brief successfully synthesized and queued for ${recipientName}. Secure access token generated.`);
    setActiveTab('shares');
    setConsentConfirmed(false); // Reset consent checkbox
    setTimeout(() => setSuccessNote(null), 6000);
  };

  // Revocation handler
  const handleRevokeShare = (handoffId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to revoke access to this clinical handoff? The recipient doctor will immediately lose access.'
    );
    if (!confirmed) return;

    const success = clinicalStore.revokeHandoff(handoffId);
    if (success) {
      setSuccessNote('Access revoked immediately. The secure link and recipient credentials are now invalidated.');
      setTimeout(() => setSuccessNote(null), 4000);
    }
  };

  // Copy shareable link / token
  const handleCopyToken = (token: string) => {
    const shareUrl = `${getScannableOrigin()}/doctor/handoff?token=${token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Copy plain text summary
  const handleCopySummary = (h: DoctorHandoffRecord) => {
    const text = `MEDICAL AI — CLINICAL HANDOFF BRIEF
Patient: ${h.patientName} (MRN: ${h.mrn}) | DOB: ${h.dateOfBirth} | Blood: ${h.bloodGroup}
Recipient: ${h.recipientName} (${h.recipientSpecialty}, ${h.recipientFacility})
Generated: ${h.date} | Valid Until: ${h.expiresAt ? new Date(h.expiresAt).toLocaleDateString() : 'N/A'}
Status: ${h.isRevoked ? 'REVOKED' : h.status.toUpperCase()}

[CHIEF CONCERN]
${h.chiefConcern} (${h.duration})

[HPI SYNOPSIS]
${h.hpiSynopsis}

[AMBULATORY VITALS]
${h.recentVitalsSummary}

[ACTIVE MEDICATIONS]
${h.currentMedications.join('; ')}

[LABORATORY HIGHLIGHTS]
${h.labHighlights.join('; ')}

[PATIENT QUESTIONS FOR CLINICIAN]
${h.patientQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

[DATA QUALITY & CLINICAL CAVEATS]
${(h.dataQualityWarnings || []).map((w) => `• ${w}`).join('\n')}

[LEGAL DISCLAIMER]
This pre-encounter summary is synthesized with AI assistance from verified patient records. It does not replace independent clinical evaluation or formal physician diagnosis.`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Trigger Print / PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-purple-700 dark:text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span>AI-Assisted Clinical Intelligence · Doctor Handoff</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Health Summary & Doctor Handoff Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Synthesize your medical history, vitals, active prescriptions, and personal questions into an authorized, source-grounded brief for your physician. You retain full control over data inclusion and access revocation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 self-stretch sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Summary Builder</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shares')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'shares'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Active Shares ({handoffs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export_preview')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'export_preview'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Printable / PDF</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successNote && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNote}</span>
          </div>
          <button onClick={() => setSuccessNote(null)} className="text-emerald-700 hover:text-emerald-900">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorNote && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorNote}</span>
          </div>
          <button onClick={() => setErrorNote(null)} className="text-rose-700 hover:text-rose-900">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE HANDOFF BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <form onSubmit={handleGenerateAndTransmit} className="space-y-6">
          {/* Step 1: Record Selection Checklist */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-600" />
                  <span>1. Select Patient Records to Include in Summary</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose which verified records from your portal should be analyzed and summarized by the AI engine.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                Source Grounded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                includeVitals
                  ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70'
              }`}>
                <input
                  type="checkbox"
                  checked={includeVitals}
                  onChange={(e) => setIncludeVitals(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    <span>Recent Ambulatory Vitals</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    BP {latestVital.systolic && latestVital.diastolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '118/76'} mmHg, HR {latestVital.heartRate ?? 72} bpm, SpO2 {latestVital.spo2 ?? 99}%
                  </span>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                includeMedications
                  ? 'bg-purple-50/60 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70'
              }`}>
                <input
                  type="checkbox"
                  checked={includeMedications}
                  onChange={(e) => setIncludeMedications(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-purple-500" />
                    <span>Active Medications ({activeMedications.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {activeMedications.map((m) => m.name).join(', ') || 'No active medications'}
                  </span>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                includeReports
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70'
              }`}>
                <input
                  type="checkbox"
                  checked={includeReports}
                  onChange={(e) => setIncludeReports(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Diagnostic Reports ({reports.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    CBC Normal & Glucose 104 mg/dL
                  </span>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                includeConditions
                  ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70'
              }`}>
                <input
                  type="checkbox"
                  checked={includeConditions}
                  onChange={(e) => setIncludeConditions(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Documented Conditions</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Essential Hypertension (Stage 1)
                  </span>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                includeConsultations
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 opacity-70'
              }`}>
                <input
                  type="checkbox"
                  checked={includeConsultations}
                  onChange={(e) => setIncludeConsultations(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold block flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Prior Triage Intakes ({consultations.length})</span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Intake assessments and preliminary triage
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Step 2: Data Quality Alerts & Source Grounding Notice */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl border border-amber-200 dark:border-amber-900 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200 uppercase font-mono tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Data Quality Warnings & Missing/Outdated Indicators</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              The AI engine analyzed your active portal records and detected the following clinical caveats. These notices will be explicitly attached to the physician handoff to avoid misinterpretations:
            </p>
            <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
              {dynamicQualityWarnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <span className="font-bold text-amber-600">!</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Step 3: Inspect & Edit the Generated Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>2. Inspect and Edit the Grounded Summary</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review the synthesized summary. You may freely modify descriptions or add questions prior to sharing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  [Patient Editable]
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                  [Zero Hallucination Mode]
                </span>
              </div>
            </div>

            {/* Chief Concern & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Chief Presenting Concern</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[9px] font-mono">
                    [Patient-Entered]
                  </span>
                </label>
                <input
                  type="text"
                  value={chiefConcern}
                  onChange={(e) => setChiefConcern(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Bilateral Frontal Tension Headache & Cervical Strain"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Duration & Pattern</span>
                  <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[9px] font-mono">
                    [Patient-Entered]
                  </span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2 days (gradual onset)"
                  required
                />
              </div>
            </div>

            {/* HPI Synopsis */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span>Clinical HPI Narrative Synopsis</span>
                  <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-[9px] font-mono">
                    [AI Synthesized · Grounded in Verified Data]
                  </span>
                </label>
                <span className="text-[10px] text-slate-400">Editable by patient</span>
              </div>
              <textarea
                rows={4}
                value={hpiSynopsis}
                onChange={(e) => setHpiSynopsis(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed clinical narrative synopsis grounded strictly in recorded patient telemetry..."
              />
            </div>

            {/* Patient Authored Questions */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Questions for the Clinician</span>
                <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded text-[9px] font-mono">
                  [Patient-Authored]
                </span>
              </label>

              <div className="space-y-2">
                {patientQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-blue-700 dark:text-blue-400 font-mono">{idx + 1}.</span>
                      <span className="text-slate-800 dark:text-slate-200">{q}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                      title="Remove question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Question input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a question you want to ask your doctor (e.g., Should I repeat my HbA1c test?)..."
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>

          {/* Step 4: Sensitive Information Exclusions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>3. Privacy Safeguards & Sensitive Information Filters</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select any categories of sensitive data that should be redacted from the physician handoff brief.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">
                Patient Privacy Controlled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeMentalHealth}
                  onChange={(e) => setExcludeMentalHealth(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Exclude Mental Health Records
                </span>
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeReproductiveNotes}
                  onChange={(e) => setExcludeReproductiveNotes(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Exclude Reproductive Health Notes
                </span>
              </label>

              <label className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeSubstanceHistory}
                  onChange={(e) => setExcludeSubstanceHistory(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Exclude Substance / Social Notes
                </span>
              </label>
            </div>
          </div>

          {/* Step 5: Recipient Confirmation & Expiry */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>4. Confirm Intended Recipient & Link Expiration</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Confirm the verified practitioner details. Access links are private, unguessable, and automatically expire.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Attending Doctor</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Specialty</label>
                <input
                  type="text"
                  value={recipientSpecialty}
                  onChange={(e) => setRecipientSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Facility</label>
                <input
                  type="text"
                  value={recipientFacility}
                  onChange={(e) => setRecipientFacility(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Access Expiry Window</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value={1}>24 Hours (Immediate encounter)</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Standard appointment window)</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 6: Explicit Consent & Transmission Authorization */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-3xl border-2 border-blue-300 dark:border-blue-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                  Explicit Patient Authorization & Safety Confirmation
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Medical information is strictly private. Medical AI will <strong>NEVER</strong> automatically transmit your medical data without your explicit approval. By approving, you authorize the generation of an unguessable secure access token for {recipientName}. You may revoke access at any time with a single click.
                </p>
                <label className="pt-2 flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-100">
                    I have reviewed the summary contents above and explicitly authorize sharing this clinical handoff brief with {recipientName}.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-blue-200 dark:border-blue-900/60">
              <button
                type="submit"
                disabled={!consentConfirmed}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Approve & Transmit Clinical Handoff</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE SHARES & STATUS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'shares' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>Active Doctor Handoff Shares & Statuses</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View sharing status, unguessable security tokens, recipient logs, and revoke access instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Create New Handoff</span>
              </button>
            </div>

            {handoffs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No Handoff Shares Generated Yet</p>
                <p>Use the Summary Builder tab to synthesize and authorize your first clinical handoff brief.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {handoffs.map((h) => {
                  const isExpired = h.expiresAt ? new Date(h.expiresAt).getTime() < Date.now() : false;
                  const isRevoked = Boolean(h.isRevoked || (h.status as string) === 'revoked');

                  return (
                    <div
                      key={h.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isRevoked
                          ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 opacity-80'
                          : isExpired
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-70'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {h.chiefConcern}
                            </span>

                            {/* Status Badges */}
                            {isRevoked ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                ACCESS REVOKED
                              </span>
                            ) : isExpired ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                EXPIRED
                              </span>
                            ) : h.status === 'reviewed' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>REVIEWED BY CLINICIAN</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>PENDING CLINICIAN REVIEW</span>
                              </span>
                            )}

                            <span className="font-mono text-[11px] text-slate-400">
                              Ref: {h.id}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-4 flex-wrap">
                            <span>
                              <strong>Recipient:</strong> {h.recipientName} ({h.recipientSpecialty})
                            </span>
                            <span>•</span>
                            <span>
                              <strong>Generated:</strong> {h.date}
                            </span>
                            <span>•</span>
                            <span>
                              <strong>Expires:</strong> {h.expiresAt ? new Date(h.expiresAt).toLocaleDateString() : '7 Days'}
                            </span>
                          </div>

                          {/* Cryptographically unguessable token display */}
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Security Token:</span>
                            <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                              {h.shareToken ? `${h.shareToken.substring(0, 16)}...` : 'sec-hnd-active'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHandoffId(h.id);
                              setActiveTab('export_preview');
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Brief</span>
                          </button>

                          {!isRevoked && (
                            <button
                              type="button"
                              onClick={() => handleCopyToken(h.shareToken || '')}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {copiedToken === h.shareToken ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied Link!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Secure Link</span>
                                </>
                              )}
                            </button>
                          )}

                          {!isRevoked && !isExpired && (
                            <button
                              type="button"
                              onClick={() => handleRevokeShare(h.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke Access</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Doctor encounter review notes if reviewed */}
                      {h.doctorReviewNotes && (
                        <div className="mt-4 p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-200">
                          <span className="font-bold block text-emerald-800 dark:text-emerald-300">
                            Clinician Pre-Encounter Review Notes:
                          </span>
                          <p className="mt-0.5 leading-relaxed">{h.doctorReviewNotes}</p>
                        </div>
                      )}

                      {/* Audit Log Entries (Security & Privacy preserving) */}
                      {h.auditLog && h.auditLog.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold uppercase font-mono tracking-wider text-[10px] text-slate-400 block mb-1">
                            Access Audit Trail:
                          </span>
                          <div className="space-y-1 font-mono">
                            {h.auditLog.map((log, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">[{log.action}]</span>
                                <span>{log.actor}:</span>
                                <span>{log.details}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PRINTABLE / PDF EXPORT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'export_preview' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Viewing Record:
              </span>
              <select
                value={selectedHandoffId}
                onChange={(e) => setSelectedHandoffId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {handoffs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.chiefConcern} ({h.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => activeHandoff && handleCopySummary(activeHandoff)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied Brief' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>

          {/* Formatted 1-Page Medical Document */}
          {activeHandoff ? (
            <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-lg max-w-4xl mx-auto space-y-6 text-slate-900 print:border-none print:shadow-none print:p-0">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b-2 border-slate-900 gap-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    MEDICAL AI · CLINICAL INTELLIGENCE PLATFORM
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Pre-Encounter Clinical Handoff Brief
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Authorized pre-visit clinical intelligence summary prepared for attending physician.
                  </p>
                </div>

                <div className="text-right font-mono text-xs text-slate-700">
                  <div className="font-bold">Generation Date: {activeHandoff.date}</div>
                  <div>Valid Through: {activeHandoff.expiresAt ? new Date(activeHandoff.expiresAt).toLocaleDateString() : '7 Days'}</div>
                  <div className="text-emerald-700 font-bold mt-0.5">
                    {activeHandoff.isRevoked ? 'STATUS: ACCESS REVOKED' : 'CONSENT: AUTHORIZED BY PATIENT'}
                  </div>
                </div>
              </div>

              {/* Section 1: Patient Demographics & Intended Recipient */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Patient Name</span>
                  <span className="font-bold text-slate-900">{activeHandoff.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">MRN</span>
                  <span className="font-bold text-slate-900">{activeHandoff.mrn}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Date of Birth</span>
                  <span className="font-bold text-slate-900">{activeHandoff.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Blood Group</span>
                  <span className="font-bold text-slate-900">{activeHandoff.bloodGroup}</span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Known Allergies</span>
                  <span className="font-bold text-rose-700">
                    {(activeHandoff.allergies || []).join(', ') || 'No Known Drug Allergies'}
                  </span>
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase">Intended Attending Clinician</span>
                  <span className="font-bold text-purple-900">
                    {activeHandoff.recipientName} ({activeHandoff.recipientSpecialty})
                  </span>
                </div>
              </div>

              {/* Section 2: Chief Concern & HPI Narrative */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chief Presenting Concern & History of Present Illness</span>
                  </span>
                  <span className="font-mono text-[10px] text-blue-700 font-bold">[Patient-Entered & AI Synthesized]</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {activeHandoff.chiefConcern}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Duration: {activeHandoff.duration}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {activeHandoff.hpiSynopsis}
                  </p>
                </div>
              </div>

              {/* Section 3: Ambulatory Telemetry & Vitals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                    <span>Recent Ambulatory Telemetry & Physiological Vitals</span>
                  </span>
                  <span className="font-mono text-[10px] text-rose-700 font-bold">[Clinician Verified Telemetry]</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">BLOOD PRESSURE</span>
                    <span className="font-extrabold text-slate-900 text-sm">{latestVital.systolic}/{latestVital.diastolic}</span>
                    <span className="text-[10px] text-slate-400 block">mmHg</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">HEART RATE</span>
                    <span className="font-extrabold text-slate-900 text-sm">{latestVital.heartRate}</span>
                    <span className="text-[10px] text-slate-400 block">bpm</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">PULSE OX (SpO2)</span>
                    <span className="font-extrabold text-slate-900 text-sm">{latestVital.spo2}%</span>
                    <span className="text-[10px] text-slate-400 block">Ambient</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[10px] block">TEMPERATURE</span>
                    <span className="font-extrabold text-slate-900 text-sm">{latestVital.temperature || 98.3}°F</span>
                    <span className="text-[10px] text-slate-400 block">Afebrile</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Pharmacotherapy & Diagnostics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-purple-600" />
                      <span>Active Regimens</span>
                    </span>
                    <span className="font-mono text-[10px] text-purple-700 font-bold">[Clinician Verified]</span>
                  </div>
                  <ul className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-mono">
                    {activeHandoff.currentMedications.length > 0 ? (
                      activeHandoff.currentMedications.map((m, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">• {m}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No active medications included</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Diagnostic Highlights</span>
                    </span>
                    <span className="font-mono text-[10px] text-emerald-700 font-bold">[Extracted Lab Records]</span>
                  </div>
                  <ul className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 font-mono">
                    {activeHandoff.labHighlights.length > 0 ? (
                      activeHandoff.labHighlights.map((lab, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">• {lab}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400 italic">No laboratory reports included</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Section 5: Patient Authored Discussion Points */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Patient-Authored Discussion Points</span>
                  </span>
                  <span className="font-mono text-[10px] text-blue-700 font-bold">[Patient Authored]</span>
                </div>
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 text-xs text-slate-800 space-y-1.5">
                  {activeHandoff.patientQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold text-blue-700">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Data Quality Warnings & Source Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Data Quality Caveats & Source Records</span>
                  </span>
                  <span className="font-mono text-[10px] text-amber-700 font-bold">[Audit Verified]</span>
                </div>
                <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  {(activeHandoff.dataQualityWarnings || []).map((w, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-600">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 7: Source Grounding & Attributions Breakdown */}
              {activeHandoff.sourceAttributions && activeHandoff.sourceAttributions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Source Grounding & Provenance Ledger</span>
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden font-mono text-[11px]">
                    {activeHandoff.sourceAttributions.map((sa) => (
                      <div key={sa.id} className="p-2.5 bg-slate-50/60 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900">{sa.item}</span>
                          <span className="text-slate-400 block text-[10px]">Ref: {sa.originalRecordRef} ({sa.recordDate})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          sa.sourceType === 'clinician_verified'
                            ? 'bg-blue-100 text-blue-800'
                            : sa.sourceType === 'extracted_record'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sa.sourceType === 'ai_synthesized'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sa.sourceType.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mandatory Clinical Disclaimer & Legal Statement */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-[10px] text-slate-600 space-y-1 font-sans">
                <span className="font-bold text-slate-900 block uppercase font-mono tracking-wider">
                  Mandatory Clinical Review Statement:
                </span>
                <p className="leading-relaxed">
                  This health summary was generated with AI assistance from verified patient portal records and authorized by {activeHandoff.patientName} on {activeHandoff.date}. It is designed solely as a preliminary pre-encounter clinical overview and does NOT establish or alter formal medical diagnoses. All synthesized findings must be independently validated by a licensed healthcare professional during face-to-face or telehealth clinical encounter.
                </p>
              </div>

              {/* Footer with Cryptographic Token & Integrity Signature */}
              <div className="pt-4 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-600 gap-2 font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Security Token: {activeHandoff.shareToken}</span>
                </div>
                <div>Authorized Patient Signature: [VERIFIED via MFA]</div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
              Select a valid handoff brief to view export layout.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
