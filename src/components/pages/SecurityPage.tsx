import React from 'react';
import { RoutePath } from '../../types';
import { PrivacySecuritySection } from '../sections/PrivacySecuritySection';
import { QrSharePreview } from '../interactive/QrSharePreview';
import { Lock, Key, ShieldCheck, Database, FileCheck, ArrowLeft } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const SecurityPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Infrastructure &amp; Cryptography Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Security &amp; Privacy Architecture
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Health information requires zero-trust privacy controls. Our architectural philosophy enforces strict data sovereignty, tokenized sharing, and client-side encryption.
          </p>
        </div>

        {/* Interactive QR Token Demonstration */}
        <div className="space-y-4">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white">Ephemeral Token Sharing Model</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Test token generation, expiry windows, and instant revocation in this live simulation.
            </p>
          </div>
          <QrSharePreview />
        </div>

        {/* Complete Security Architecture Section */}
        <PrivacySecuritySection />

        {/* Security Principles Table */}
        <div className="bg-white dark:bg-[#0E1A2D] rounded-3xl border border-slate-200 dark:border-[#1E2E47] p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
          <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Architectural Guarantees &amp; Non-Negotiables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-5 bg-slate-50 dark:bg-[#15233C] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero Commercial Data Resale</span>
              </span>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Health information is never packaged into advertising audiences, sold to data brokers, or monetized for commercial intelligence.
              </p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-[#15233C] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Explicit Revocation Authority</span>
              </span>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Any shared link or QR pass can be instantly terminated by the user, rendering existing bearer tokens immediately invalid across all active sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
