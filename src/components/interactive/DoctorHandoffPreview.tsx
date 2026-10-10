import React, { useState } from 'react';
import { Stethoscope, CheckCircle2, Copy, Check, FileCheck, Share2, Lock } from 'lucide-react';

export const DoctorHandoffPreview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'patient_review' | 'clinician_format'>('patient_review');
  const [copied, setCopied] = useState(false);
  const [approvedState, setApprovedState] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800">1-Page Doctor Handoff Synthesizer</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-slate-500">Structured Clinical Summary</span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('patient_review')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'patient_review'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient Review Mode
          </button>
          <button
            onClick={() => setViewMode('clinician_format')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'clinician_format'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinician HPI View
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {/* Verification Status Banner */}
        <div className="mb-5 p-3 rounded-lg border bg-blue-50/50 border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Consent Protocol:</strong> Patient reviews and explicitly authorizes every section prior to clinician transmission.
            </span>
          </div>
          <button
            onClick={() => setApprovedState(!approvedState)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              approvedState
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {approvedState ? '✓ Approved by Patient' : 'Review & Approve'}
          </button>
        </div>

        {/* Document Frame */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-5 font-sans text-xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                Clinical Intake Brief · Medical AI
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                Pre-Consultation Clinical Synopsis
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              Generated: Mar 24, 2026<br />
              Status: Preliminary Intake
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">
                Chief Concern
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                Bilateral Frontal Tension Headache
              </span>
            </div>
            <div className="bg-white p-3 rounded border border-slate-200">
              <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">
                Duration & Onset
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                2 Days · Gradual onset, exacerbated by visual strain
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded border border-slate-200 space-y-2">
            <span className="font-mono text-[10px] uppercase text-slate-400 block">
              History of Present Illness (HPI) & Pertinent Negatives
            </span>
            <p className="text-slate-700 leading-relaxed">
              Patient reports dull, bilateral aching band across forehead and temporal regions (rated 4/10). Symptoms worsen after sustained screen exposure.
            </p>
            <div className="pt-1.5 flex flex-wrap gap-2 text-[11px]">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Denies photophobia</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Denies nausea/emesis</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Denies focal sensory loss</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">Afebrile (98.4°F)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
              <span className="font-mono text-[10px] uppercase text-slate-400 block">
                Current Medications & Allergies
              </span>
              <div className="text-slate-800">
                • Acetaminophen 500mg PRN (1 dose taken yesterday)<br />
                • Multivitamin daily<br />
                • NKDA (No Known Drug Allergies)
              </div>
            </div>

            <div className="bg-white p-3 rounded border border-slate-200 space-y-1">
              <span className="font-mono text-[10px] uppercase text-slate-400 block">
                Recorded Vitals (30-day baseline)
              </span>
              <div className="font-mono text-slate-800">
                • Resting BP: 118/76 mmHg (Normotensive)<br />
                • Pulse: 68 bpm (Regular rate & rhythm)<br />
                • SpO2: 99% on room air
              </div>
            </div>
          </div>

          <div className="bg-blue-50/40 p-3.5 rounded border border-blue-200/80">
            <span className="font-mono text-[10px] uppercase text-blue-800 font-semibold block mb-1">
              Prioritized Questions for Clinician (Patient-Approved)
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>"Could this headache be linked to cervical posture or recent eye strain?"</li>
              <li>"Would a preventive ergonomics adjustment or vision screening be advisable?"</li>
              <li>"What specific warning symptoms should prompt urgent follow-up?"</li>
            </ol>
          </div>
        </div>

        {/* Action strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            Demonstration preview. Never transmitted without active patient consent.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={() => alert('In connected deployments, this exports an encrypted PDF or transmits directly to verified provider portals.')}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Export Clinical Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
