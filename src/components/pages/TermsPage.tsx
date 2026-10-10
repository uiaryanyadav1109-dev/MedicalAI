import React from 'react';
import { RoutePath } from '../../types';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const TermsPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Legal Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Last Updated: March 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs transition-colors">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Medical AI public website, interactive feature demonstrations, or related services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should refrain from using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">2. Non-Clinical Informational Purpose</h2>
            <p>
              Medical AI is designed strictly as an assistive educational and preliminary triage organization utility. It is not licensed to practice medicine and cannot provide formal medical advice, definitive diagnoses, or pharmaceutical treatment plans.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">3. Prohibited Uses</h2>
            <p>
              You agree not to use the platform in situations where urgent emergency care is indicated, nor attempt to reverse-engineer diagnostic algorithms, circumvent safety red-flag interceptors, or submit malicious payloads into document extraction endpoints.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">4. Intellectual Property & Brand</h2>
            <p>
              All trademarks, algorithms, UI patterns, and structured intake schemas associated with Medical AI are the proprietary intellectual property of Medical AI Technologies Inc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
