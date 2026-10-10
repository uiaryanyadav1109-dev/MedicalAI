import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Activity, ShieldCheck, AlertTriangle, CheckCircle, Copy, Check, Download } from 'lucide-react';
import { TriageCategory } from '../../types';

interface AssessmentDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssessmentDemoModal: React.FC<AssessmentDemoModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [concern, setConcern] = useState('Bilateral tension headache');
  const [customConcern, setCustomConcern] = useState('');
  const [duration, setDuration] = useState('2 days');
  const [severity, setSeverity] = useState('4');
  const [hasRedFlag, setHasRedFlag] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickConcerns = [
    'Bilateral tension headache',
    'Lingering dry cough after viral illness',
    'Mild ankle strain after running',
    'Localized lower back stiffness'
  ];

  const handleNextFromStep1 = () => {
    if (customConcern.trim()) {
      setConcern(customConcern.trim());
    }
    setStep(2);
  };

  const computedTriage: {
    category: TriageCategory;
    title: string;
    guidance: string;
    urgencyColor: string;
  } = hasRedFlag
    ? {
        category: 'emergency',
        title: 'Emergency Response Indicated',
        guidance: 'High-risk clinical indicators reported. Do not rely on digital software. Seek immediate professional emergency evaluation or call emergency services right away.',
        urgencyColor: 'bg-rose-50 border-rose-300 text-rose-900'
      }
    : Number(severity) >= 7
    ? {
        category: 'urgent',
        title: 'Urgent Care Evaluation Recommended',
        guidance: 'Elevated discomfort index. Consult an urgent care clinic or same-day clinical service today.',
        urgencyColor: 'bg-amber-50 border-amber-300 text-amber-900'
      }
    : duration.includes('week') || duration.includes('7')
    ? {
        category: 'prompt_evaluation',
        title: 'Prompt Primary Care Evaluation',
        guidance: 'Symptoms persisting over several days warrant an in-person evaluation by your primary physician within 24–48 hours.',
        urgencyColor: 'bg-blue-50 border-blue-300 text-blue-900'
      }
    : {
        category: 'routine',
        title: 'Routine Evaluation / Supportive Observation',
        guidance: 'Stable, mild presentation with no high-risk signs. Rest, adequate hydration, track in your Health Timeline, and schedule routine consultation if symptoms persist.',
        urgencyColor: 'bg-emerald-50 border-emerald-300 text-emerald-900'
      };

  const handleCopySummary = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setConcern('Bilateral tension headache');
    setCustomConcern('');
    setDuration('2 days');
    setSeverity('4');
    setHasRedFlag(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </span>
            <span id="modal-headline" className="font-bold text-sm text-slate-900">
              Medical AI · Interactive Preliminary Assessment Sandbox
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            aria-label="Close assessment demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 h-1.5 w-full">
          <div
            className="bg-blue-600 h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Concern */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-blue-700 font-semibold">
                  Step 1 of 4 · Chief Concern
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  What health concern would you like to explore?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Describe symptoms in everyday terms. The AI engine will ask adaptive questions to clarify context.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select a sample concern or type your own:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {quickConcerns.map((qc) => (
                    <button
                      key={qc}
                      onClick={() => {
                        setConcern(qc);
                        setCustomConcern('');
                      }}
                      className={`text-left p-3 rounded-lg text-xs font-medium border transition-colors ${
                        concern === qc && !customConcern
                          ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {qc}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={customConcern}
                    onChange={(e) => setCustomConcern(e.target.value)}
                    placeholder="Or type another health concern (e.g. pain in right knee when climbing stairs)..."
                    className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Boundary:</strong> This is an interactive demo simulation. It does not replace a clinical examination or provide a medical diagnosis.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Adaptive Questions */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-blue-700 font-semibold">
                  Step 2 of 4 · Adaptive Context Clarification
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Contextual Inquiry: {customConcern || concern}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  The clinical interview adapts questions based on known clinical presentation pathways.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Duration */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="font-semibold text-slate-900 block mb-2">
                    How long have you noticed this concern?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Under 24 hours', '2 days', '5 to 7 days', 'Over 2 weeks'].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          duration === dur
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-900">
                      Discomfort / Severity Index (1 to 10)
                    </label>
                    <span className="font-mono font-bold text-blue-700">{severity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>1 (Barely noticeable)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Severe distress)</span>
                  </div>
                </div>

                {/* Red flag check */}
                <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-200">
                  <label className="font-semibold text-rose-950 block mb-1">
                    Emergency Red-Flag Screening
                  </label>
                  <p className="text-slate-600 mb-2">
                    Are you experiencing sudden chest tightness, facial weakness, acute breathing distress, or fainting?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHasRedFlag(false)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        !hasRedFlag
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      No red flags present
                    </button>
                    <button
                      onClick={() => setHasRedFlag(true)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        hasRedFlag
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-rose-700 border-rose-200'
                      }`}
                    >
                      Yes, potential warning sign
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Structured Context Preview */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-blue-700 font-semibold">
                  Step 3 of 4 · Structured Health Extraction
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Synthesized Clinical Schema
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Raw conversational symptoms translated into standardized, clinician-ready categories.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Chief Complaint</span>
                  <span className="font-bold text-slate-900">{customConcern || concern}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Chronology</span>
                  <span className="font-medium text-slate-900">{duration}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Subjective Severity</span>
                  <span className="font-medium text-slate-900">{severity} / 10</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Warning Signs Status</span>
                  <span className={`font-semibold ${hasRedFlag ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {hasRedFlag ? 'Red Flag Alerted' : 'Negative for acute red flags'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Output Target</span>
                  <span className="font-mono text-slate-700">Preliminary Triage & Doctor Handoff</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  All information remains on your device in this sandbox. No data is stored or transmitted.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Triage Guidance & Handoff Summary */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-blue-700 font-semibold">
                  Step 4 of 4 · Preliminary Care Guidance
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Preliminary Triage Assessment
                </h3>
              </div>

              {/* Triage Tier Result Card */}
              <div className={`p-4 rounded-xl border ${computedTriage.urgencyColor}`}>
                <div className="text-xs font-mono uppercase font-bold tracking-wider opacity-75">
                  Guidance Category
                </div>
                <div className="text-lg font-bold mt-1">{computedTriage.title}</div>
                <p className="text-xs mt-2 leading-relaxed opacity-95">{computedTriage.guidance}</p>
              </div>

              {/* Prepared Doctor Handoff Brief */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">1-Page Doctor Preparation Brief</span>
                  <button
                    onClick={handleCopySummary}
                    className="text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="font-mono text-[11px] text-slate-700 bg-white p-3 rounded border border-slate-200 space-y-1">
                  <div><strong>CONCERN:</strong> {customConcern || concern}</div>
                  <div><strong>DURATION:</strong> {duration} | <strong>SEVERITY:</strong> {severity}/10</div>
                  <div><strong>RED FLAGS:</strong> {hasRedFlag ? 'POSITIVE' : 'NONE DETECTED'}</div>
                  <div className="pt-2 text-slate-600 font-sans">
                    <strong>Suggested questions for clinician:</strong><br />
                    1. What potential underlying triggers could explain these symptoms?<br />
                    2. Are diagnostic blood tests or imaging warranted at this stage?<br />
                    3. What red flags should prompt immediate emergency care?
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500">
                Medical AI provides preliminary triage context, not clinical medical diagnosis.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1) handleNextFromStep1();
                else setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
              >
                Start Over
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
