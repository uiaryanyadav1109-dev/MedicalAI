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
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-[#1E2E47] overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#12233C] border-b border-slate-200 dark:border-[#1E2E47] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-medical-blue text-white flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <span id="modal-headline" className="font-heading font-bold text-sm text-slate-900 dark:text-white block">
                Interactive Preliminary Assessment Sandbox
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Simulated adaptive clinical guidance &amp; doctor handoff
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close assessment demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-100 dark:bg-slate-800 h-1.5 w-full">
          <div
            className="bg-medical-blue h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Concern */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
                  Step 1 of 4 · Chief Concern
                </span>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                  What health concern would you like to explore?
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Describe symptoms in everyday terms. The AI engine will ask adaptive questions to clarify context.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
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
                          ? 'border-medical-blue bg-blue-50/80 dark:bg-blue-950/40 text-medical-blue dark:text-blue-300 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
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
                    className="w-full text-xs p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#15233C] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-medical-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
                  Step 2 of 4 · Adaptive Context Clarification
                </span>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                  Contextual Inquiry: {customConcern || concern}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  The clinical interview adapts questions based on known clinical presentation pathways.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Duration */}
                <div className="p-4 bg-slate-50 dark:bg-[#12233C] rounded-xl border border-slate-200 dark:border-slate-800">
                  <label className="font-semibold text-slate-900 dark:text-white block mb-2">
                    How long have you noticed this concern?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Under 24 hours', '2 days', '5 to 7 days', 'Over 2 weeks'].map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                          duration === dur
                            ? 'bg-medical-blue text-white border-medical-blue'
                            : 'bg-white dark:bg-[#0E1A2D] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div className="p-4 bg-slate-50 dark:bg-[#12233C] rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-semibold text-slate-900 dark:text-white">
                      Discomfort / Severity Index (1 to 10)
                    </label>
                    <span className="font-mono font-bold text-medical-blue dark:text-teal-400">{severity} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full accent-medical-blue"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>1 (Barely noticeable)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Severe distress)</span>
                  </div>
                </div>

                {/* Red flag check */}
                <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60">
                  <label className="font-semibold text-rose-950 dark:text-rose-200 block mb-1">
                    Emergency Red-Flag Screening
                  </label>
                  <p className="text-slate-600 dark:text-slate-300 mb-2.5">
                    Are you experiencing sudden chest tightness, facial weakness, acute breathing distress, or fainting?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHasRedFlag(false)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        !hasRedFlag
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-[#0E1A2D] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      No red flags present
                    </button>
                    <button
                      onClick={() => setHasRedFlag(true)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        hasRedFlag
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-[#0E1A2D] text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
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
                <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
                  Step 3 of 4 · Structured Health Extraction
                </span>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                  Synthesized Clinical Schema
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Raw conversational symptoms translated into standardized, clinician-ready categories.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#12233C] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Chief Complaint</span>
                  <span className="font-bold text-slate-900 dark:text-white">{customConcern || concern}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Chronology</span>
                  <span className="font-medium text-slate-900 dark:text-white">{duration}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Subjective Severity</span>
                  <span className="font-medium text-slate-900 dark:text-white">{severity} / 10</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">Warning Signs Status</span>
                  <span className={`font-semibold ${hasRedFlag ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {hasRedFlag ? 'Red Flag Alerted' : 'Negative for acute red flags'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Output Target</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Preliminary Triage &amp; Doctor Handoff</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-medical-blue dark:text-teal-400 shrink-0" />
                <span>
                  All information remains on your device in this sandbox. No personal data is stored or transmitted.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Triage Guidance & Handoff Summary */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
                  Step 4 of 4 · Preliminary Care Guidance
                </span>
                <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mt-1">
                  Preliminary Triage Assessment
                </h3>
              </div>

              {/* Triage Tier Result Card */}
              <div className={`p-4 rounded-xl border ${computedTriage.urgencyColor}`}>
                <div className="text-xs font-mono uppercase font-bold tracking-wider opacity-85">
                  Guidance Category
                </div>
                <div className="text-lg font-heading font-bold mt-1">{computedTriage.title}</div>
                <p className="text-xs mt-2 leading-relaxed opacity-95">{computedTriage.guidance}</p>
              </div>

              {/* Prepared Doctor Handoff Brief */}
              <div className="p-4 bg-slate-50 dark:bg-[#12233C] rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="font-bold text-slate-900 dark:text-white">1-Page Doctor Preparation Brief</span>
                  <button
                    onClick={handleCopySummary}
                    className="text-medical-blue hover:text-blue-700 dark:text-teal-400 font-medium flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0E1A2D] p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div><strong>CONCERN:</strong> {customConcern || concern}</div>
                  <div><strong>DURATION:</strong> {duration} | <strong>SEVERITY:</strong> {severity}/10</div>
                  <div><strong>RED FLAGS:</strong> {hasRedFlag ? 'POSITIVE' : 'NONE DETECTED'}</div>
                  <div className="pt-2 text-slate-600 dark:text-slate-400 font-sans">
                    <strong>Suggested questions for clinician:</strong><br />
                    1. What potential underlying triggers could explain these symptoms?<br />
                    2. Are diagnostic blood tests or imaging warranted at this stage?<br />
                    3. What red flags should prompt immediate emergency care?
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[11px] text-slate-500 dark:text-slate-400">
                Medical AI provides preliminary triage context, not clinical medical diagnosis.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#12233C] border-t border-slate-200 dark:border-[#1E2E47] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-medical-blue hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#0E1A2D] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={onClose}
                className="px-4.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-medical-blue dark:hover:bg-blue-700 rounded-lg transition-colors"
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
