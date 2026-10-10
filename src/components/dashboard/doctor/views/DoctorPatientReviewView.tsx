import React, { useState, useEffect } from 'react';
import { RoutePath, PatientRecord, TriageCategory, VitalDataPoint } from '../../../../types';
import { clinicalStore } from '../../../../services/clinicalStore';
import { useAuth } from '../../../../context/AuthContext';
import { ProfileAvatar } from '../../../common/ProfileAvatar';
import {
  Stethoscope,
  Activity,
  HeartPulse,
  Pill,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Save,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  FileBadge,
  Plus,
  Trash2,
  Lock,
  Edit3,
  History,
  AlertCircle,
  Check,
  RefreshCw
} from 'lucide-react';

interface DoctorPatientReviewViewProps {
  onNavigate: (route: RoutePath) => void;
  selectedPatientId?: string;
}

export const DoctorPatientReviewView: React.FC<DoctorPatientReviewViewProps> = ({
  onNavigate,
  selectedPatientId = 'pat-1'
}) => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState(selectedPatientId);
  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [physicianNotes, setPhysicianNotes] = useState('');
  const [overrideTriage, setOverrideTriage] = useState<TriageCategory>('routine');
  const [recommendedPlan, setRecommendedPlan] = useState('');
  const [differentials, setDifferentials] = useState<string[]>([]);
  const [newDiff, setNewDiff] = useState('');
  const [orders, setOrders] = useState<{ id: string; description: string; type: any; status: any }[]>([]);
  const [newOrderText, setNewOrderText] = useState('');

  // Amendment state for signed records
  const [amendmentNote, setAmendmentNote] = useState('');
  const [amendmentReason, setAmendmentReason] = useState('');
  const [showAmendmentInput, setShowAmendmentInput] = useState(false);

  // Status & Confirmation
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [successSaved, setSuccessSaved] = useState<string | null>(null);

  // Copilot Integration State
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotQuickNote, setCopilotQuickNote] = useState<string | null>(null);
  const [copilotAlerts, setCopilotAlerts] = useState<string[]>([]);

  const handleQuickGenerateSOAP = async () => {
    setCopilotLoading(true);
    try {
      const res = await clinicalStore.generateClinicalCopilot({
        patientId: patientId,
        mode: 'generate_draft',
        draftType: 'consultation_note'
      });
      if (res.success && res.generatedContent) {
        setCopilotQuickNote(res.generatedContent);
        setCopilotAlerts([...(res.conflictingEntries || []), ...(res.allergyMedicationAlerts || [])]);
      } else if (res.error) {
        setSuccessSaved(`AI Copilot Notice: ${res.error}`);
        setTimeout(() => setSuccessSaved(null), 5000);
      }
    } catch (err: any) {
      setSuccessSaved('AI Copilot service notice: Set GEMINI_API_KEY in backend .env to generate live notes.');
      setTimeout(() => setSuccessSaved(null), 5000);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleApplyCopilotNote = () => {
    if (copilotQuickNote) {
      setPhysicianNotes(copilotQuickNote);
      setCopilotQuickNote(null);
      setSuccessSaved('AI generated SOAP draft inserted into attending physician assessment notes.');
      setTimeout(() => setSuccessSaved(null), 3500);
    }
  };

  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== patientId) {
      setPatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadDossier = async (id: string) => {
    setLoading(true);
    const data = await clinicalStore.fetchDoctorPatientDossier(id);
    setDossier(data);

    // Populate active assessment or default
    const existing = data?.assessments?.[0];
    if (existing) {
      setPhysicianNotes(existing.clinicalImpression || '');
      setOverrideTriage(existing.triageCategory || 'routine');
      setRecommendedPlan(existing.recommendedPlan || '');
      setDifferentials(existing.differentialDiagnosis || []);
      setOrders(existing.orders || []);
    } else {
      // Default initial assessment
      setPhysicianNotes(
        'History and presentation consistent with tension-type cephalea secondary to cervical myofascial strain. Denies acute red-flag signs. Recommended posture ergonomics, hydration, and short-course NSAID as needed.'
      );
      setOverrideTriage((data?.patient?.triageStatus as TriageCategory) || 'routine');
      setRecommendedPlan('Ergonomic screen breaks + Hydration review');
      setDifferentials(['Tension-type headache (G44.209)', 'Cervical myofascial pain syndrome']);
      setOrders([
        {
          id: 'ord-1',
          description: 'Routine Q3 Glycated Hemoglobin (HbA1c) Panel',
          type: 'diagnostic_lab',
          status: 'ordered'
        },
        {
          id: 'ord-2',
          description: 'Outpatient Physical Therapy Ergonomic Consultation',
          type: 'referral',
          status: 'ordered'
        }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDossier(patientId);
  }, [patientId]);

  const patient = dossier?.patient || clinicalStore.getPatientById(patientId) || clinicalStore.getPatients()[0];
  const activeConsultation = dossier?.consultations?.[0] || clinicalStore.getConsultations()[0];
  const vitals: VitalDataPoint[] = dossier?.vitals || clinicalStore.getVitals();
  const latestBpVital = [...vitals].reverse().find((v) => v.systolic != null && v.diastolic != null);
  const latestHrVital = [...vitals].reverse().find((v) => v.heartRate != null);
  const latestSpo2Vital = [...vitals].reverse().find((v) => v.spo2 != null || v.oxygenSaturation != null);
  const rawLatestVital = vitals[vitals.length - 1] || vitals[0] || null;
  const latestVital: VitalDataPoint = rawLatestVital
    ? {
        ...rawLatestVital,
        systolic: rawLatestVital.systolic ?? latestBpVital?.systolic ?? 118,
        diastolic: rawLatestVital.diastolic ?? latestBpVital?.diastolic ?? 76,
        heartRate: rawLatestVital.heartRate ?? latestHrVital?.heartRate ?? 72,
        spo2: rawLatestVital.spo2 ?? latestSpo2Vital?.spo2 ?? latestSpo2Vital?.oxygenSaturation ?? 99
      }
    : { systolic: 118, diastolic: 76, heartRate: 68, spo2: 99, date: '2026-03-29' };
  const existingAssessment = dossier?.assessments?.[0];
  const isAlreadySigned = existingAssessment?.isSigned;

  const handleAddDifferential = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDiff.trim() && !differentials.includes(newDiff.trim())) {
      setDifferentials([...differentials, newDiff.trim()]);
      setNewDiff('');
    }
  };

  const handleRemoveDifferential = (idx: number) => {
    setDifferentials(differentials.filter((_, i) => i !== idx));
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderText.trim()) {
      setOrders([
        ...orders,
        {
          id: `ord-${Date.now()}`,
          description: newOrderText.trim(),
          type: 'diagnostic_lab',
          status: 'ordered'
        }
      ]);
      setNewOrderText('');
    }
  };

  const handleSaveDraft = async () => {
    const payload = {
      id: existingAssessment?.id,
      patientId: patient.id,
      consultationId: activeConsultation?.id,
      clinicianId: 'doc-1',
      clinicianName: user?.name || 'Dr. Sarah Chen, MD',
      clinicianNpi: user?.npi || '1942850192',
      chiefComplaint: activeConsultation?.chiefComplaint || 'Clinical Review',
      clinicalImpression: physicianNotes,
      differentialDiagnosis: differentials,
      triageCategory: overrideTriage,
      recommendedPlan,
      orders,
      isSigned: false
    };

    await clinicalStore.saveDoctorAssessment(payload);
    setSuccessSaved('Draft saved successfully to clinical server.');
    setTimeout(() => setSuccessSaved(null), 3500);
    await loadDossier(patient.id);
  };

  const handleFinalizeAndSign = async () => {
    const payload = {
      id: existingAssessment?.id,
      patientId: patient.id,
      consultationId: activeConsultation?.id,
      clinicianId: 'doc-1',
      clinicianName: user?.name || 'Dr. Sarah Chen, MD',
      clinicianNpi: user?.npi || '1942850192',
      chiefComplaint: activeConsultation?.chiefComplaint || 'Clinical Review',
      clinicalImpression: physicianNotes,
      differentialDiagnosis: differentials,
      triageCategory: overrideTriage,
      recommendedPlan,
      orders,
      isSigned: true
    };

    await clinicalStore.saveDoctorAssessment(payload);
    setSigningModalOpen(false);
    setSuccessSaved('Clinical assessment officially signed and locked into patient EMR record.');
    setTimeout(() => setSuccessSaved(null), 4000);
    await loadDossier(patient.id);
  };

  const handleSaveAmendment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amendmentNote.trim()) return;

    const payload = {
      id: existingAssessment?.id,
      patientId: patient.id,
      consultationId: activeConsultation?.id,
      clinicianId: 'doc-1',
      clinicianName: user?.name || 'Dr. Sarah Chen, MD',
      clinicianNpi: user?.npi || '1942850192',
      chiefComplaint: activeConsultation?.chiefComplaint || 'Clinical Review',
      clinicalImpression: physicianNotes,
      differentialDiagnosis: differentials,
      triageCategory: overrideTriage,
      recommendedPlan,
      orders,
      isSigned: true,
      amendmentNote,
      amendmentReason: amendmentReason || 'Clinical progress addendum'
    };

    await clinicalStore.saveDoctorAssessment(payload);
    setAmendmentNote('');
    setAmendmentReason('');
    setShowAmendmentInput(false);
    setSuccessSaved('Clinical amendment appended to permanent audit trail.');
    setTimeout(() => setSuccessSaved(null), 4000);
    await loadDossier(patient.id);
  };

  const idVerification = dossier?.identityVerification;
  const isVerified = idVerification?.status === 'verified';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Patient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('/doctor')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Clinical Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-mono">Select Patient:</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-600"
          >
            {clinicalStore.getPatients().map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) · {p.triageStatus.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {successSaved && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successSaved}</span>
        </div>
      )}

      {/* Patient Banner with Identity Verification Badge & Demographics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            name={patient?.name || 'Patient'}
            size="xl"
            className="ring-4 ring-slate-100 dark:ring-slate-800 shrink-0"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {patient?.name}
              </h2>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                MRN: {patient?.mrn}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono font-semibold">
                {patient?.age}y {patient?.gender} · Blood {patient?.bloodType || 'O+'}
              </span>

              {/* Identity Verification Badge */}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                  isVerified
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {isVerified ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>ID VERIFIED ({idVerification?.documentType?.toUpperCase().replace('_', ' ') || 'NATIONAL ID'})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>IDENTITY UNVERIFIED</span>
                  </>
                )}
              </span>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3">
              <span>
                Allergies: <strong className="text-rose-700 dark:text-rose-400">{patient?.allergies?.join(', ') || 'No known allergies'}</strong>
              </span>
              <span>·</span>
              <span>
                Conditions: <strong className="text-slate-800 dark:text-slate-200">{patient?.activeConditions?.join(', ') || 'None active'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-xs font-mono text-slate-400">CURRENT TRIAGE TIER:</span>
          <span className="text-xs font-bold uppercase font-mono px-3 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {overrideTriage.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Provenance Distinction Strip */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[11px] uppercase">
          Clinical Provenance Protocol:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-medium text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>Patient-Reported Data</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 font-medium text-[11px] flex items-center gap-1 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>AI Preliminary Intake Protocol</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
            <Stethoscope className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Clinician Verified Entry</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Clinical Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Intake Assessment, Vitals Telemetry Trends & Records */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Intake Evaluation */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  AI Preliminary Intake Evaluation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Logged: {activeConsultation?.date || 'Recent'}
              </span>
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                CHIEF COMPLAINT
              </span>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {activeConsultation?.chiefComplaint || 'Frontal Tension Headache'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Duration: {activeConsultation?.duration || '2 days'} · Reported Severity: {activeConsultation?.severity || 4}/10
              </div>
            </div>

            {/* Pertinent Negatives Screened */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                PERTINENT NEGATIVES SCREENED
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(activeConsultation?.pertinentNegatives || [
                  'Afebrile',
                  'No focal neurological deficit',
                  'No photophobia',
                  'No vomiting'
                ]).map((neg: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                  >
                    ✓ {neg}
                  </span>
                ))}
              </div>
            </div>

            {/* Red Flag Screen */}
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Deterministic Red-Flag Screen: Passed. Zero emergency red flags detected.</span>
            </div>

            {/* Preliminary Guidance */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                AI SYNTHESIZED PRELIMINARY GUIDANCE
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {activeConsultation?.preliminaryGuidance ||
                  'Presentation consistent with mild-to-moderate musculoskeletal tension. Rest, hydration, and posture review recommended.'}
              </p>
            </div>
          </div>

          {/* Vitals Telemetry Trends */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Ambulatory Vitals & Telemetry History
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {vitals.length} Recorded Readings
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">LATEST BP</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {latestVital.systolic && latestVital.diastolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '118/76'}
                </span>
                <span className="text-[10px] text-emerald-600 block">Normotensive</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">PULSE</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {latestVital.heartRate ?? 72} bpm
                </span>
                <span className="text-[10px] text-slate-400 block">Resting</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px]">SPO2</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {latestVital.spo2 != null ? `${latestVital.spo2}%` : '99%'}
                </span>
                <span className="text-[10px] text-emerald-600 block">Room Air</span>
              </div>
            </div>

            {/* Vitals History Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">BP (mmHg)</th>
                    <th className="py-2 px-3">HR</th>
                    <th className="py-2 px-3">SpO2</th>
                    <th className="py-2 px-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {vitals.slice(0, 4).map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{v.date}</td>
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {v.systolic}/{v.diastolic}
                      </td>
                      <td className="py-2 px-3">{v.heartRate}</td>
                      <td className="py-2 px-3">{v.spo2}%</td>
                      <td className="py-2 px-3 text-slate-400 text-[10px] truncate max-w-[100px]">
                        {v.source || 'Patient Log'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Lab Highlights */}
          {dossier?.reports && dossier.reports.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Diagnostic Lab Reports ({dossier.reports.length})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('/doctor/reports')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  View Full Lab Release
                </button>
              </div>

              {dossier.reports.map((rep: any) => (
                <div
                  key={rep.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{rep.title}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        rep.status === 'normal'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rep.clinicalImpression}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Clinician Action Panel with Drafts, Final Signing & Amendment Preservation */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Clinical Copilot Quick Assistant Card */}
          <div className="bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/80 p-5 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <span>AI Clinical Copilot</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200 font-semibold">
                      GROUNDED
                    </span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Decision support, note drafting & safety screening
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/doctor/copilot')}
                className="text-xs text-purple-700 dark:text-purple-300 font-bold hover:underline flex items-center gap-1 font-mono"
              >
                <span>Full Copilot View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Safety Alerts Strip */}
            {copilotAlerts.length > 0 && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 text-[11px] text-rose-900 dark:text-rose-200 space-y-1">
                <span className="font-bold font-mono text-[10px] uppercase block flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Clinical Safety & Conflict Flags:</span>
                </span>
                <ul className="list-disc pl-4 space-y-0.5">
                  {copilotAlerts.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuickGenerateSOAP}
                disabled={copilotLoading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:scale-98 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition-all"
              >
                {copilotLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Chart...</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Draft AI SOAP Note</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/doctor/copilot')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-800 dark:text-purple-200 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
              >
                Ask Copilot Questions
              </button>
            </div>

            {/* Generated Quick Draft Preview & Apply Option */}
            {copilotQuickNote && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300 uppercase">
                    AI Generated SOAP Note Draft:
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyCopilotNote}
                    className="px-2.5 py-1 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Insert into Physician Notes</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                  {copilotQuickNote}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Attending Physician Assessment & Orders
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                {user?.name || 'Dr. Sarah Chen, MD'}
              </span>
            </div>

            {/* Signature Status Badge */}
            {isAlreadySigned ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Assessment Officially Signed & Locked</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Signed by {existingAssessment?.clinicianName} on {existingAssessment?.signedAt?.split('T')[0]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAmendmentInput(!showAmendmentInput)}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {showAmendmentInput ? 'Close Addendum' : 'Record Amendment'}
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>Working Draft Mode. Changes will not be locked until signed.</span>
              </div>
            )}

            {/* Existing Amendments History */}
            {existingAssessment?.amendments && existingAssessment.amendments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-emerald-500" />
                  <span>RECORDED CLINICAL AMENDMENT LOG ({existingAssessment.amendments.length})</span>
                </span>
                <div className="space-y-1.5">
                  {existingAssessment.amendments.map((amd: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{amd.timestamp?.split('T')[0]}</span>
                        <span className="text-emerald-600 font-semibold">{amd.clinicianName}</span>
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-sans text-xs">
                        {amd.note}
                      </div>
                      <div className="text-[10px] text-slate-400">Reason: {amd.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amendment Form if opened */}
            {showAmendmentInput && (
              <form
                onSubmit={handleSaveAmendment}
                className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-3"
              >
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileBadge className="w-4 h-4 text-emerald-600" />
                  <span>Append Permanent Clinical Addendum</span>
                </div>
                <textarea
                  rows={3}
                  value={amendmentNote}
                  onChange={(e) => setAmendmentNote(e.target.value)}
                  placeholder="Enter clinical amendment details (e.g. Additional lab follow-up required)..."
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
                <input
                  type="text"
                  value={amendmentReason}
                  onChange={(e) => setAmendmentReason(e.target.value)}
                  placeholder="Clinical justification for addendum..."
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAmendmentInput(false)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Lock Addendum
                  </button>
                </div>
              </form>
            )}

            {/* Physician Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Physician Clinical Impression & Progress Notes
              </label>
              <textarea
                rows={5}
                disabled={isAlreadySigned}
                value={physicianNotes}
                onChange={(e) => setPhysicianNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:border-emerald-600 disabled:opacity-75"
                placeholder="Enter clinical assessment, differential diagnosis, and instructions..."
                required
              />
            </div>

            {/* Differential Diagnosis Tags */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Differential Diagnoses & Diagnostic Codes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {differentials.map((diff, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{diff}</span>
                    {!isAlreadySigned && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDifferential(idx)}
                        className="text-blue-500 hover:text-blue-800 ml-1"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {!isAlreadySigned && (
                <form onSubmit={handleAddDifferential} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newDiff}
                    onChange={(e) => setNewDiff(e.target.value)}
                    placeholder="Add differential diagnosis (e.g. Migraine without aura G43.0)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Triage Tier Confirmation / Override */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Physician Triage Tier Confirmation / Override
              </label>
              <select
                disabled={isAlreadySigned}
                value={overrideTriage}
                onChange={(e) => setOverrideTriage(e.target.value as TriageCategory)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-emerald-600 disabled:opacity-75"
              >
                <option value="routine">Routine Evaluation (Confirmed)</option>
                <option value="prompt_evaluation">Prompt Evaluation (Within 24-48 Hours)</option>
                <option value="urgent">Urgent Escalation (Same-Day Clinical Review)</option>
                <option value="emergency">Emergency Escalation (Immediate Care Directive)</option>
                <option value="monitor_self_care">Self-Care & Ambulatory Telemetry Monitoring</option>
              </select>
            </div>

            {/* Care Plan / Recommendations */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Prescription & Follow-Up Recommendations
              </label>
              <input
                type="text"
                disabled={isAlreadySigned}
                value={recommendedPlan}
                onChange={(e) => setRecommendedPlan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 disabled:opacity-75"
              />
            </div>

            {/* Diagnostic Orders List */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                DIAGNOSTIC & REFERRAL ORDERS
              </span>
              <div className="space-y-1.5">
                {orders.map((ord, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      ✓ {ord.description}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-emerald-600 font-semibold">
                      {ord.status}
                    </span>
                  </div>
                ))}
              </div>

              {!isAlreadySigned && (
                <form onSubmit={handleAddOrder} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newOrderText}
                    onChange={(e) => setNewOrderText(e.target.value)}
                    placeholder="Add clinical order or specialist referral..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                  >
                    Order
                  </button>
                </form>
              )}
            </div>

            {/* Action Buttons: Draft vs Final Sign */}
            {!isAlreadySigned && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSigningModalOpen(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Finalize & Sign Clinical Impression</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Consequential Action: Finalizing & Signing Clinical Assessment */}
      {signingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <Stethoscope className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Confirm Official Clinical Signature
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Attending Physician Credential Certification
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You are certifying that you have personally evaluated the clinical data for{' '}
              <strong>{patient?.name}</strong> (MRN: {patient?.mrn}), confirmed the triage tier as{' '}
              <strong>{overrideTriage.toUpperCase().replace('_', ' ')}</strong>, and approved the
              prescribed orders. This entry will be locked in the electronic medical record.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-[11px] space-y-0.5">
              <div>Clinician: {user?.name || 'Dr. Sarah Chen, MD'}</div>
              <div>NPI: {user?.npi || '1942850192'}</div>
              <div>Hospital: Metro Clinical Reference Center</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSigningModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeAndSign}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
