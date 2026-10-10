import React from 'react';
import { Activity, ShieldCheck, FileText, Stethoscope, Lock, CheckCircle2 } from 'lucide-react';

export const AuthVisualPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-slate-800">
      {/* Subtle background radial tint */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Lockup */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs">
            <Activity className="w-4 h-4 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">MEDICAL AI</span>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
            Clinical Intelligence & Preliminary Triage
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight text-balance">
            Healthcare intelligence, <br />
            designed around you.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed text-pretty">
            Access your health information, AI-assisted consultations, medical reports, and personalized health tools in one secure place.
          </p>
        </div>
      </div>

      {/* Calm, Sophisticated Healthcare Architecture Visual */}
      <div className="relative z-10 my-8 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Unified Health Context
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            Encrypted Session
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-blue-900/60 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-white">AI Clinical Assistant Intake</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Adaptive clinical questions clarify duration, severity, and pertinent negatives.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-emerald-900/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-white">Diagnostic Laboratory Analyzer</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Plain-language explanations for bloodwork and metabolic reference intervals.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-purple-900/60 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-white">1-Page Clinician Handoff Brief</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Pre-consultation clinical summary with prioritized questions for your doctor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security Assurance */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Privacy-by-design architecture with explicit patient consent gates.</span>
      </div>
    </div>
  );
};
