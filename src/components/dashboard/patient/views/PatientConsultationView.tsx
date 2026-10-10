import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import {
  clinicalStore,
  checkEmergencyRedFlags,
  computeTriageTier
} from '../../../../services/clinicalStore';
import { ConsultationRecord, TriageCategory } from '../../../../types';
import {
  MessageSquareText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck,
  Radio,
  PhoneCall,
  Activity,
  User,
  Pill,
  ShieldAlert,
  Info
} from 'lucide-react';

export const PatientConsultationView: React.FC = () => {
  const { user } = useAuth();

  // Intake Form State
  const [complaint, setComplaint] = useState('');
  const [onset, setOnset] = useState<'sudden' | 'gradual' | 'recurrent'>('gradual');
  const [duration, setDuration] = useState('2 days');
  const [severity, setSeverity] = useState(4);
  const [location, setLocation] = useState('Frontal head & cervical neck');
  const [character, setCharacter] = useState('Dull pressure band');
  const [aggravatingFactors, setAggravatingFactors] = useState('Prolonged screen time & neck flexion');
  const [relievingFactors, setRelievingFactors] = useState('Rest in dark room, hydration');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Screen fatigue', 'Neck tightness']);
  const [pertinentNegatives, setPertinentNegatives] = useState<string[]>([
    'No chest pain',
    'No facial weakness',
    'No shortness of breath',
    'Afebrile'
  ]);
  const [notes, setNotes] = useState('');

  // Processing & Output States
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedResult, setCompletedResult] = useState<ConsultationRecord | null>(null);
  const [emergencyAlert, setEmergencyAlert] = useState<{
    isEmergency: boolean;
    trigger?: string;
    guidance: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const symptomOptions = [
    'Screen fatigue',
    'Neck tightness',
    'Mild dizziness',
    'Post-nasal drip',
    'Transient nausea',
    'Dull joint ache',
    'Low energy / lethargy',
    'Cough with clear mucus',
    'Muscle soreness',
    'Throat irritation'
  ];

  const negativeOptions = [
    'No chest pain or pressure',
    'No shortness of breath',
    'No facial droop or slurred speech',
    'No limb weakness or numbness',
    'No high fever (> 101°F)',
    'No severe vision changes'
  ];

  const quickConcerns = [
    'Bilateral frontal tension headache',
    'Lingering dry post-viral cough',
    'Mild ankle sprain from exertion',
    'Localized lumbar back muscular stiffness'
  ];

  const handleToggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleToggleNegative = (neg: string) => {
    if (pertinentNegatives.includes(neg)) {
      setPertinentNegatives(pertinentNegatives.filter((n) => n !== neg));
    } else {
      setPertinentNegatives([...pertinentNegatives, neg]);
    }
  };

  const handleStartIntake = () => {
    setValidationError(null);
    setEmergencyAlert(null);
    setCompletedResult(null);
    setSaveSuccess(false);

    if (!complaint.trim()) {
      setValidationError('Please articulate your primary health concern.');
      return;
    }

    // 1. Deterministic Emergency Red Flag Screening
    const safetyCheck = checkEmergencyRedFlags(complaint + ' ' + notes, selectedSymptoms);
    if (safetyCheck.isEmergency) {
      setEmergencyAlert({
        isEmergency: true,
        trigger: safetyCheck.matchedTrigger,
        guidance: safetyCheck.urgentGuidance
      });
      return;
    }

    // 2. Process Clinical Symptom Intake
    setIsProcessing(true);

    setTimeout(() => {
      const triage = computeTriageTier(severity, duration, false);

      const guidanceText =
        severity >= 8
          ? 'Acute symptom intensity reported. Same-day clinical assessment or urgent care evaluation advised today.'
          : triage === 'prompt_evaluation'
          ? 'Persistent symptom pattern. Schedule an evaluation with your primary clinician within 24–48 hours for examination.'
          : 'Stable presentation without high-risk indicators. Supportive care, hydration, rest, and monitoring recommended. Seek clinical consultation if symptoms persist or escalate.';

      const newRecord = clinicalStore.addConsultation({
        patientId: user?.id || 'pat-1',
        patientName: user?.name || 'Aryan Yadav',
        chiefComplaint: complaint.trim(),
        duration: `${duration} (${onset} onset)`,
        severity,
        location,
        associatedSymptoms: [...selectedSymptoms],
        pertinentNegatives: [...pertinentNegatives],
        triageCategory: triage,
        emergencyFlag: false,
        preliminaryGuidance: guidanceText,
        status: 'pending_review'
      });

      setCompletedResult(newRecord);
      setIsProcessing(false);
      setSaveSuccess(true);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Clear Non-Diagnostic Labeling */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
          <MessageSquareText className="w-4 h-4" />
          <span>Clinical Intake & Preliminary Care Prioritization</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Start Symptom Assessment & Clinical Intake
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Articulate your current health concern in everyday terms. The engine screens for deterministic emergency red flags, structures symptom duration and severity, incorporates your verified profile context, and provides structured guidance for your clinician.
        </p>

        {/* Mandatory Non-Diagnostic Protocol Notice */}
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 mt-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Informational Clinical Protocol Notice:</strong> This intake flow provides structured preliminary symptom categorization to help you identify the appropriate timeframe for care. It is <strong>NOT a definitive medical diagnosis</strong> and never a substitute for a physical evaluation by a licensed healthcare professional.
          </p>
        </div>
      </div>

      {/* 2. Critical Red Flag Interceptor Alert (If Triggered) */}
      {emergencyAlert && (
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-500 text-rose-950 dark:text-rose-100 space-y-4 shadow-lg animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-rose-700 dark:text-rose-300 tracking-wider">
                Immediate Emergency Override Triggered
              </span>
              <h3 className="text-xl font-black text-rose-900 dark:text-white">
                Critical Red Flag Detected: "{emergencyAlert.trigger}"
              </h3>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-200 leading-relaxed">
                {emergencyAlert.guidance}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-rose-200 dark:border-rose-900 text-xs text-slate-800 dark:text-slate-200 space-y-2">
            <strong className="text-rose-700 dark:text-rose-400 block uppercase font-mono text-[11px]">
              Mandatory Patient Safety Directive:
            </strong>
            <p className="leading-relaxed">
              Do not rely on online triage or software algorithms for acute red flags. Immediately call emergency medical services or proceed directly to the nearest hospital emergency room.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="tel:112"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency EMS (112)</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setEmergencyAlert(null);
                  setComplaint('');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
              >
                Reset Intake Form
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Assessment Intake Form & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Structured Intake Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Symptom Articulation & Clinical Details
            </h3>
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              Step 1 of 2
            </span>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Quick Concern Templates */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Quick concern presets or articulate below:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickConcerns.map((qc) => (
                <button
                  key={qc}
                  type="button"
                  onClick={() => setComplaint(qc)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                    complaint === qc
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {qc}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Symptom Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Primary Symptom / Chief Complaint <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              placeholder="e.g. Throbbing band-like pressure across forehead and upper neck after 8 hours of screen work..."
              className="w-full text-xs p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Onset, Duration, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Onset Character
              </label>
              <select
                value={onset}
                onChange={(e) => setOnset(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="gradual">Gradual Onset</option>
                <option value="sudden">Sudden Onset</option>
                <option value="recurrent">Recurrent Episodic</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Under 24 hours">Under 24 hours</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="Over 1 week">Over 1 week</option>
                <option value="Over 2 weeks">Over 2 weeks</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Anatomical Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Forehead & Temples"
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Severity Range */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Symptom Severity (1 to 10 Scale)
              </label>
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                {severity} / 10 {severity <= 3 ? '(Mild)' : severity <= 6 ? '(Moderate)' : severity <= 8 ? '(Severe)' : '(Excruciating)'}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 (Mild / Distracting)</span>
              <span>5 (Moderate / Interferes)</span>
              <span>10 (Worst Imaginable)</span>
            </div>
          </div>

          {/* Associated Symptoms Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Associated Characteristics (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {symptomOptions.map((sym) => {
                const checked = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleToggleSymptom(sym)}
                    className={`p-2.5 rounded-xl border text-[11px] text-left transition-colors flex items-center justify-between cursor-pointer ${
                      checked
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{sym}</span>
                    {checked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pertinent Negatives Confirmation */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Pertinent Negatives (Confirm absence of severe symptoms)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {negativeOptions.map((neg) => {
                const checked = pertinentNegatives.includes(neg);
                return (
                  <button
                    key={neg}
                    type="button"
                    onClick={() => handleToggleNegative(neg)}
                    className={`p-2 rounded-xl border text-[11px] text-left transition-colors flex items-center justify-between cursor-pointer ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>✓ {neg}</span>
                    {checked && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Integrated Profile Context Notice */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
            <User className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Connected to patient profile: <strong className="text-slate-900 dark:text-white">{user?.name || 'Aryan Yadav'}</strong> · Documented Allergies: <strong className="text-rose-600">Penicillin, Sulfa</strong> · Active Regimen: <strong>Lisinopril 10mg</strong>.
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">
              Deterministic red-flag safety active
            </span>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleStartIntake}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <span>Synthesizing Context...</span>
              ) : (
                <>
                  <span>Complete Assessment Intake</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Synthesized Clinical Assessment & Triage Output */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Clinical Assessment Summary
            </h3>
            {saveSuccess && (
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                ✓ Recorded to Database
              </span>
            )}
          </div>

          {completedResult ? (
            <div className="space-y-4 text-xs">
              {/* Triage Tier Badge Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    {completedResult.chiefComplaint}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      completedResult.triageCategory === 'emergency'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : completedResult.triageCategory === 'urgent'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                    }`}
                  >
                    Tier: {completedResult.triageCategory.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                  Duration: {completedResult.duration} · Severity: {completedResult.severity}/10 · Location: {completedResult.location}
                </div>
              </div>

              {/* Guidance Recommendation */}
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 space-y-1.5 text-slate-800 dark:text-slate-200">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Preliminary Care Direction & Timeframe</span>
                </div>
                <p className="leading-relaxed">{completedResult.preliminaryGuidance}</p>
              </div>

              {/* Pertinent Negatives Evaluated */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-[11px] uppercase font-mono tracking-wider">
                  Pertinent Negatives Evaluated:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {completedResult.pertinentNegatives.map((pn, i) => (
                    <span
                      key={i}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-[10px]"
                    >
                      ✓ {pn}
                    </span>
                  ))}
                </div>
              </div>

              {/* Questions for Doctor */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Suggested Discussion Points for Your Doctor:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li>"Could cervical posture strain or screen fatigue explain these symptoms?"</li>
                  <li>"What red flags should prompt immediate re-evaluation before our next visit?"</li>
                  <li>"Are there posture or ergonomic physical therapy exercises indicated?"</li>
                </ul>
              </div>

              {/* Verified Care Team Stamp */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Synchronized with your Longitudinal Health Timeline for Dr. Sarah Chen's review.</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500 space-y-3 text-xs">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="max-w-xs mx-auto">
                Fill in your symptoms and click "Complete Assessment Intake" to generate your preliminary care summary.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
