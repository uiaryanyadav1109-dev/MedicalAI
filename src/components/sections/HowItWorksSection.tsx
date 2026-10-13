import React, { useState } from 'react';
import {
  UserPlus,
  FileHeart,
  BrainCircuit,
  Share2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Stethoscope
} from 'lucide-react';
import { RoutePath } from '../../types';

interface HowItWorksSectionProps {
  onOpenAssessment?: () => void;
  onNavigate?: (route: RoutePath) => void;
  hideHeader?: boolean;
  className?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  onNavigate,
  hideHeader = false,
  className
}) => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Create Account',
      badge: 'Step 1',
      description: 'Sign up securely with email or Google Authentication with encrypted identity.',
      icon: UserPlus,
      color: '#1769AA',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-950/50',
      consentNote: 'Encrypted & isolated'
    },
    {
      stepNumber: '02',
      title: 'Add Health Context',
      badge: 'Step 2',
      description: 'Record conditions, allergies, active medications, and routine vitals.',
      icon: FileHeart,
      color: '#16A6A1',
      bgLight: 'bg-teal-50',
      bgDark: 'dark:bg-teal-950/50',
      consentNote: 'User-controlled records'
    },
    {
      stepNumber: '03',
      title: 'Get AI Guidance',
      badge: 'Step 3',
      description: 'Input symptoms by text or voice to receive preliminary triage urgency scoring.',
      icon: BrainCircuit,
      color: '#8B5CF6',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-950/50',
      consentNote: 'Informational triage'
    },
    {
      stepNumber: '04',
      title: 'Share with Doctor',
      badge: 'Step 4',
      description: 'Share a structured 1-page clinician brief or ephemeral cryptographic QR pass.',
      icon: Stethoscope,
      color: '#16865C',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-950/50',
      consentNote: 'Explicit QR consent'
    }
  ];

  return (
    <section
      className={
        className !== undefined
          ? className
          : 'py-16 lg:py-20 bg-[#F5F9FC] dark:bg-[#090E17] border-b border-[#DCE6EF] dark:border-[#1E2E47] transition-colors'
      }
      id="how-it-works"
    >
      <div className={hideHeader ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {/* Section Header */}
        {!hideHeader && (
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
              <span>Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 font-normal">
              A simple 4-step path from symptom evaluation to structured clinician collaboration.
            </p>
          </div>
        )}

        {/* 4 Clean Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => {
            const Icon = st.icon;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] bg-white dark:bg-[#111D30] flex flex-col justify-between text-left shadow-2xs hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-2xl font-black tracking-tight"
                      style={{ color: st.color }}
                    >
                      {st.stepNumber}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs ${st.bgLight} ${st.bgDark}`}
                      style={{ color: st.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1769AA] dark:text-[#38BDF8]">
                    {st.badge}
                  </span>
                  <h3 className="text-sm font-bold text-[#102A43] dark:text-white mt-0.5 mb-1.5">
                    {st.title}
                  </h3>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
                    {st.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16865C] shrink-0" />
                  <span>{st.consentNote}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
