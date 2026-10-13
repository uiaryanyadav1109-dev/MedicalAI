import React from 'react';
import { RoutePath } from '../../types';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const PrivacyPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Sovereignty &amp; Privacy Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Privacy Policy &amp; Data Ethics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
            Effective Date: March 2026 · Clinical Data Sovereignty Standard
          </p>
        </div>

        <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] p-6 sm:p-8 space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs transition-colors">
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">1. Architectural Privacy Philosophy</h2>
            <p>
              Medical AI is architected on the premise that personal health information is sensitive biological context that belongs strictly to the individual. We never sell, monetize, broker, or leverage health narratives for commercial advertising profiles.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">2. Information Handled</h2>
            <p>
              In our public sandbox demonstration environments, conversational inputs and simulated vitals remain entirely within your local browser runtime. In authenticated deployments, data is encrypted both in transit (TLS 1.3) and at rest with user-managed cryptographic keys.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">3. Zero-Payload Ephemeral QR Tokens</h2>
            <p>
              When generating a health pass or QR code for clinician review, no raw medical text, diagnostic codes, or patient identification numbers are encoded within the visual QR pattern. The code encapsulates solely an ephemeral, time-limited cryptographic pointer that expires according to user settings.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">4. User Revocation Rights</h2>
            <p>
              Users maintain instantaneous revocation authority. Terminating a shared link or QR token immediately deletes access tokens and invalidates external viewer permissions across all active sessions.
            </p>
          </div>

          <div>
            <h2 className="text-base font-heading font-bold text-slate-900 dark:text-white mb-2">5. Data Retention &amp; Deletion</h2>
            <p>
              You have the right to request comprehensive deletion of any archived timeline records or structured briefs at any time. We do not maintain hidden shadow backups of deleted clinical records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
