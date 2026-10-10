import React from 'react';
import { RoutePath } from '../../types';
import { Lock, ShieldCheck } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const PrivacyPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Data Sovereignty & Policy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Effective Date: March 2026 · Version 2.4
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs transition-colors">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">1. Architectural Privacy Philosophy</h2>
            <p>
              Medical AI is architected on the premise that personal health information is sensitive biological context that belongs strictly to the individual. We never sell, monetize, broker, or leverage health narratives for commercial advertising profiles.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">2. Information Handled</h2>
            <p>
              In our public sandbox demonstration environments, conversational inputs and simulated vitals remain entirely within your local browser runtime. In authenticated deployments, data is encrypted both in transit (TLS 1.3) and at rest with user-managed cryptographic keys.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">3. Zero-Payload Ephemeral QR Tokens</h2>
            <p>
              When generating a health pass or QR code for clinician review, no raw medical text, diagnostic codes, or patient identification numbers are encoded within the visual QR pattern. The code encapsulates solely an ephemeral, time-limited cryptographic pointer that expires according to user settings.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">4. User Revocation Rights</h2>
            <p>
              Users maintain instantaneous revocation authority. Terminating a shared link or QR token immediately deletes access tokens and invalidates external viewer permissions across all active sessions.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">5. Data Retention & Deletion</h2>
            <p>
              You have the right to request comprehensive deletion of any archived timeline records or structured briefs at any time. We do not maintain hidden shadow backups of deleted clinical records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
