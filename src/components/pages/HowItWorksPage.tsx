import React from 'react';
import { RoutePath } from '../../types';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { TriageScalePreview } from '../interactive/TriageScalePreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { ArrowLeft, ArrowRight, CheckCircle2, GitMerge } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const HowItWorksPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
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

        <div className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <GitMerge className="w-3.5 h-3.5" />
              <span>Care Preparation Methodology</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              How Medical AI Works
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              A transparent walkthrough of the entire care-preparation journey: from everyday symptom description to clinician collaboration.
            </p>
          </div>

          {/* 4 Steps Interactive Section */}
          <HowItWorksSection
            onOpenAssessment={onOpenAssessment}
            hideHeader={true}
            className="py-0 bg-transparent border-0"
          />
        </div>

        {/* Deep Dive into Step 2: Adaptive Questioning */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Deep Dive · Step 2</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">Adaptive Clinical Interview in Action</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Watch how the assistant updates structured medical fields in real time based on user feedback.
            </p>
          </div>
          <ConsultationPreview />
        </div>

        {/* Deep Dive into Step 3: Triage Guidance */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Deep Dive · Step 3</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">5-Tier Triage Classification System</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Understand the operational criteria for Emergency, Urgent, Prompt Evaluation, Routine, and Supportive Monitoring.
            </p>
          </div>
          <TriageScalePreview />
        </div>

        {/* Deep Dive into Step 4: Doctor Handoff */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Deep Dive · Step 4</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">1-Page Doctor Preparation Brief</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              The synthesized output ready for patient review and clinician consultation.
            </p>
          </div>
          <DoctorHandoffPreview />
        </div>

        {/* Bottom CTA */}
        <div className="bg-medical-blue dark:bg-[#102A43] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-blue-400/20">
          <div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold">Ready to walk through an intake yourself?</h3>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              Experience the complete flow with demonstration data in our sandbox.
            </p>
          </div>
          <button
            onClick={onOpenAssessment}
            className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl whitespace-nowrap shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Launch Interactive Demo
          </button>
        </div>
      </div>
    </div>
  );
};
