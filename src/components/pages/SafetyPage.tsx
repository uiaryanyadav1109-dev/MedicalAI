import React from 'react';
import { RoutePath } from '../../types';
import { EmergencySafetySection } from '../sections/EmergencySafetySection';
import { SafetyLimitsSection } from '../sections/SafetyLimitsSection';
import { EvidenceSection } from '../sections/EvidenceSection';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, FileWarning, ArrowLeft } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const SafetyPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <button
          onClick={() => {
            onNavigate('/');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-medical-blue dark:hover:text-teal-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clinical Safety &amp; Governance Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Safety is our architectural baseline.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            In healthcare software, safety cannot be an afterthought. Medical AI employs deterministic safety rules, non-prescriptive boundaries, and strict emergency red-flag interceptors.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-medical-blue dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">Zero Diagnostic Claims</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Medical AI explicitly does not provide clinical diagnoses. It prepares triage context and structured intake summaries to assist licensed physicians.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">Deterministic Red-Flag Interceptor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Acute warning signs (e.g. stroke FAST criteria, crushing chest pressure, acute dyspnea) immediately halt automated intake to provide urgent emergency directions.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileWarning className="w-5 h-5" />
            </div>
            <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">Strict Non-Prescription Boundary</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The platform never prescribes, recommends specific pharmaceutical dosages, or modifies existing therapies without licensed physician oversight.
            </p>
          </div>
        </div>

        {/* Emergency Section */}
        <EmergencySafetySection />

        {/* Safety Limits Section */}
        <SafetyLimitsSection />

        {/* Evidence Section */}
        <EvidenceSection />
      </div>
    </div>
  );
};
