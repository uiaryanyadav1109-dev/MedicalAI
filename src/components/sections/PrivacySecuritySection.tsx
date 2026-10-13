import React from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  FileKey,
  History,
  UserCheck,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RoutePath } from '../../types';

interface PrivacySecuritySectionProps {
  onNavigate?: (route: RoutePath) => void;
}

export const PrivacySecuritySection: React.FC<PrivacySecuritySectionProps> = ({ onNavigate }) => {
  const securityPillars = [
    {
      icon: Lock,
      title: 'Authentication & Account Protection',
      desc: 'Secured with enterprise Firebase Authentication and multi-factor session validation. Passwords and tokens are never stored in plaintext.',
      tag: 'Identity Guard'
    },
    {
      icon: Key,
      title: 'Role-Based Access Control',
      desc: 'Strict server-enforced boundaries separate Patient Portal views from Doctor Clinical Cockpits. Patients cannot access clinician tools and vice-versa.',
      tag: 'Role Enforcement'
    },
    {
      icon: UserCheck,
      title: 'Patient-Controlled Sharing',
      desc: 'Your medical narrative is private by default. You explicitly generate time-limited QR passes when consulting with attending physicians.',
      tag: 'Explicit Consent'
    },
    {
      icon: FileKey,
      title: 'Secure Medical Data Handling',
      desc: 'All records and document OCR extracts are transmitted over TLS with modern ciphers and stored within isolated Firestore databases.',
      tag: 'Data Segregation'
    },
    {
      icon: History,
      title: 'Audit Trails & Access Records',
      desc: 'Every QR token scan, document view, and data export request generates an indelible audit log with verified timestamps for patient review.',
      tag: 'Audit Logs'
    },
    {
      icon: EyeOff,
      title: 'Zero Behavioral Advertising',
      desc: 'Your health conditions and questions are never monetized, brokered to advertisers, or used to build commercial marketing profiles.',
      tag: 'No Data Brokerage'
    }
  ];

  return (
    <section
      className="py-20 lg:py-28 bg-[#F5F9FC] dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47] transition-colors"
      id="security"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest Security & Governance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            Trust, Privacy, and Data Governance
          </h2>
          <p className="text-base text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
            We treat your health data as confidential clinical context. Our protections stem from verified engineering practices, role segregation, and transparent consent.
          </p>
        </div>

        {/* 6-Grid Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#111D30] p-6 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-400">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#102A43] dark:text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#DCE6EF]/60 dark:border-[#1E2E47] flex items-center gap-1.5 text-[11px] text-[#16865C] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Architecture</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verified Practices Banner with Legal Links */}
        <div className="rounded-2xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1 max-w-2xl">
            <h4 className="text-sm font-bold text-[#102A43] dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D97706]" />
              <span>Transparent Compliance Commitment</span>
            </h4>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              We present our security capabilities truthfully without claiming unverified third-party certifications. Data is retained under patient-directed consent models.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigate && (
              <>
                <button
                  onClick={() => {
                    onNavigate('/privacy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#1769AA] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => {
                    onNavigate('/terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Terms of Service
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacySecuritySection;
