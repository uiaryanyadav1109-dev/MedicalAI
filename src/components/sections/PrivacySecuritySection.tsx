import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Lock, Key, ShieldCheck, FileKey, History, UserCheck, EyeOff } from 'lucide-react';

export const PrivacySecuritySection: React.FC = () => {
  const privacyPillars = [
    {
      icon: <Lock className="w-5 h-5 text-blue-600" />,
      title: 'End-to-End Transport Encryption',
      desc: 'All conversational and document data is transmitted exclusively over encrypted TLS connections with modern cipher suites.'
    },
    {
      icon: <Key className="w-5 h-5 text-blue-600" />,
      title: 'Granular Access Control',
      desc: 'You decide which portions of your health narrative or lab tests are visible to a provider, and for how many hours.'
    },
    {
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      title: 'Explicit Consent Handshakes',
      desc: 'Zero background data brokering. Records are never dispatched to a clinician or third party without active patient confirmation.'
    },
    {
      icon: <History className="w-5 h-5 text-blue-600" />,
      title: 'Comprehensive Audit Logging',
      desc: 'Every access event, QR token generation, and export request is timestamped and recorded in your private activity journal.'
    },
    {
      icon: <FileKey className="w-5 h-5 text-blue-600" />,
      title: 'Ephemeral Token Sharing',
      desc: 'QR passes contain temporary cryptographically signed hashes that point to authorized records, never raw clinical data.'
    },
    {
      icon: <EyeOff className="w-5 h-5 text-blue-600" />,
      title: 'Zero Advertising Monetization',
      desc: 'Your health struggles are never used to build behavioral ad profiles or sold to data aggregators.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200" id="privacy-security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Security & Privacy"
          title="Your health information deserves stronger protection."
          description="We treat health data as strictly private biological context. Privacy controls are built directly into the architectural foundation, not added as an afterthought."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {privacyPillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-400">
                Security Requirement
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-center justify-between">
          <span>Security architecture adheres to privacy-by-design and rigorous data segregation principles.</span>
          <span className="font-mono text-slate-400 text-[11px] hidden sm:inline">Zero-Knowledge Token Model</span>
        </div>
      </div>
    </section>
  );
};
