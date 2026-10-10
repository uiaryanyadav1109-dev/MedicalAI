import React from 'react';
import { RoutePath } from '../../types';
import { EmergencySafetySection } from '../sections/EmergencySafetySection';
import { SafetyLimitsSection } from '../sections/SafetyLimitsSection';
import { EvidenceSection } from '../sections/EvidenceSection';
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, FileWarning } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const SafetyPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Clinical Safety & Governance
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Safety is our architectural baseline.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            In healthcare software, safety cannot be an afterthought. Medical AI employs deterministic rules, non-prescriptive boundaries, and strict emergency interceptors.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero Diagnostic Claims</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Medical AI explicitly does not provide clinical diagnoses. It prepares triage context and structured intake summaries to assist human physicians.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Deterministic Red-Flag Interceptor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Acute warning signs (e.g. signs of stroke, acute chest pain, severe dyspnea) immediately halt automated intake to provide urgent emergency care directions.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <FileWarning className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Non-Prescription Boundary</h3>
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

        {/* Full Medical Disclaimer Link */}
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1 text-xs text-amber-950 dark:text-amber-200">
            <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">Complete Clinical Disclaimer</h4>
            <p>Read our complete medical scope of practice, emergency rules, and legal boundaries.</p>
          </div>
          <button
            onClick={() => {
              onNavigate('/medical-disclaimer');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-5 py-2.5 bg-amber-900 dark:bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-950 dark:hover:bg-amber-700 whitespace-nowrap cursor-pointer shadow-xs"
          >
            View Full Disclaimer Document
          </button>
        </div>
      </div>
    </div>
  );
};
