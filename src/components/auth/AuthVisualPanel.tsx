import React from 'react';
import { Activity, ShieldCheck, FileText, Stethoscope, Lock, CheckCircle2 } from 'lucide-react';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';

export const AuthVisualPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#102A43] text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-[#1E2E47]">
      {/* Background Medical Photography with Navy/Teal Dual Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={HEALTHCARE_IMAGES.authDoctorConsult.url}
          alt={HEALTHCARE_IMAGES.authDoctorConsult.alt}
          className="w-full h-full object-cover opacity-20 filter saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102A43] via-[#102A43]/90 to-[#102A43]/80" />
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#1769AA]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#16A6A1]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Lockup */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1769AA] to-[#16A6A1] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Medical<span className="text-[#38BDF8]">AI</span>
          </span>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-700/50 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <span>Clinical Intelligence Platform</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Healthcare intelligence, <br />
            designed for clarity & care.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Access encrypted health records, AI-assisted symptom intake, lab biomarker explanations, and structured clinician briefs in one calm, secure space.
          </p>
        </div>
      </div>

      {/* Architectural Health Intelligence Badges */}
      <div className="relative z-10 my-8 bg-[#0B1320]/80 backdrop-blur-md rounded-2xl border border-[#1E2E47] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E2E47] pb-3">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
            Unified Patient Context
          </span>
          <span className="text-[10px] font-semibold text-[#2DD4BF] bg-teal-950/80 border border-teal-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Encrypted Session</span>
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#111D30]/90 border border-[#1E2E47] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">AI Clinical Intake Assistant</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Adaptive questioning clarifies duration, anatomical location, and red-flag screening.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111D30]/90 border border-[#1E2E47] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-950 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Diagnostic Lab Panel Analyzer</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Plain-language interpretations of blood counts, metabolic markers, and reference ranges.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#111D30]/90 border border-[#1E2E47] flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Physician Handoff Brief</div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                1-page SBAR clinical brief with prioritized questions for your consulting doctor.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Security Reassurance */}
      <div className="relative z-10 pt-4 border-t border-[#1E2E47] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Patient-controlled access with explicit consent gates.</span>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Zero Public Indexing</span>
      </div>
    </div>
  );
};

export default AuthVisualPanel;
