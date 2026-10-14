import React from 'react';
import { RoutePath } from '../../types';
import {
  Activity,
  ShieldCheck,
  HeartHandshake,
  Smartphone
import { useLanguage } from '../../i18n';
import { MedicalLogo } from '../common/MedicalLogo';

interface FooterProps {
  onNavigate: (route: RoutePath) => void;
  onOpenDownloadApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDownloadApp }) => {
  const { t } = useLanguage();

  const handleNav = (route: RoutePath) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#102A43] text-slate-300 border-t border-[#1E2E47] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        {/* Rebalanced Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Brand & Purpose Column */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="cursor-pointer" onClick={() => handleNav('/')}>
              <MedicalLogo size="md" layout="compact" />
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-sm leading-relaxed">
              AI-assisted health guidance and connected healthcare tools in one place.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Patient Consent First • Role-Based Clinician Access</span>
            </div>

            {onOpenDownloadApp && (
              <div className="pt-1">
                <button
                  onClick={onOpenDownloadApp}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1769AA]/20 hover:bg-[#1769AA]/40 text-[#38BDF8] border border-[#1769AA]/40 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Get MedicalAI Android APK</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links (3 Proportional Columns) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Clinical Platform */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Clinical Platform
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button onClick={() => handleNav('/features')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    AI Symptom Triage
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/platform')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Clinical Assistant
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/for-patients')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Patient Health Records
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/for-doctors')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Physician Handoff Brief
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/security')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Emergency QR Identity
                  </button>
                </li>
              </ul>
            </div>

            {/* Care Solutions */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Care Solutions
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button onClick={() => handleNav('/for-patients')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    For Individuals &amp; Families
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/for-doctors')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    For Doctors &amp; Clinics
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/how-it-works')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    How MedicalAI Works
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/safety')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Clinical Safety Limits
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/faq')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Frequently Asked Questions
                  </button>
                </li>
              </ul>
            </div>

            {/* Trust & Legal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5">
                Trust &amp; Legal
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <button onClick={() => handleNav('/medical-disclaimer')} className="text-amber-400 font-semibold hover:text-amber-300 transition-colors cursor-pointer">
                    Medical Disclaimer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/privacy')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/terms')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/security')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Data Security Practices
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNav('/contact')} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Clinical Inquiries &amp; Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Clinical Reassurance Bar */}
        <div className="mt-10 pt-5 border-t border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} MedicalAI Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-center md:text-right">
            <HeartHandshake className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span>Preliminary educational triage only. Always consult a licensed physician for diagnosis and medical decisions.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
