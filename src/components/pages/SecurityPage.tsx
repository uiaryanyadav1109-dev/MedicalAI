import React from 'react';
import { RoutePath } from '../../types';
import { PrivacySecuritySection } from '../sections/PrivacySecuritySection';
import { QrSharePreview } from '../interactive/QrSharePreview';
import { Lock, Key, ShieldCheck, Database, FileCheck } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const SecurityPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Infrastructure & Cryptography
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Security & Privacy Architecture
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Health information requires zero-trust privacy controls. Our architectural philosophy enforces strict data sovereignty, tokenized sharing, and client-side encryption.
          </p>
        </div>

        {/* Interactive QR Token Demonstration */}
        <div className="space-y-4">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ephemeral Token Sharing Model</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Test token generation, expiry windows, and instant revocation in this live simulation.
            </p>
          </div>
          <QrSharePreview />
        </div>

        {/* Complete Security Architecture Section */}
        <PrivacySecuritySection />

        {/* Security Principles Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Architectural Guarantees & Non-Negotiables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Zero Commercial Data Resale
              </span>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Health information is never packaged into advertising audiences, sold to data brokers, or monetized for commercial intelligence.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Explicit Revocation Rights
              </span>
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                Any shared link or QR pass can be instantly terminated by the user, rendering existing bearer tokens immediately invalid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
