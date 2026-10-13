import React from 'react';
import { RoutePath } from '../../types';
import { FileText, ArrowLeft } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const TermsPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement &amp; Operational Rules</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            Last Updated: March 2026 · Clinical Software Licensing Agreement
          </p>
        </div>

        <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] p-6 sm:p-8 space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs transition-colors">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Medical AI platform, interactive clinical demonstrations, or related services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should refrain from using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">2. Non-Clinical Informational Purpose</h2>
            <p>
              Medical AI is designed strictly as an assistive educational and preliminary triage organization utility. It is not licensed to practice medicine independently and cannot provide formal medical advice, definitive diagnoses, or pharmaceutical treatment plans.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">3. Prohibited Uses</h2>
            <p>
              You agree not to use the platform in situations where urgent emergency care is indicated, nor attempt to reverse-engineer diagnostic algorithms, circumvent safety red-flag interceptors, or submit malicious payloads into document extraction endpoints.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">4. Intellectual Property &amp; Brand</h2>
            <p>
              All trademarks, algorithms, UI patterns, and structured intake schemas associated with Medical AI are the proprietary intellectual property of Medical AI Technologies Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
