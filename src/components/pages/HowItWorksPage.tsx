import React from 'react';
import { RoutePath } from '../../types';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { TriageScalePreview } from '../interactive/TriageScalePreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const HowItWorksPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Intake Methodology
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Medical AI Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A transparent walkthrough of the entire care-preparation journey: from everyday symptom description to clinician collaboration.
          </p>
        </div>

        {/* 5 Steps Interactive Section */}
        <HowItWorksSection onOpenAssessment={onOpenAssessment} />

        {/* Deep Dive into Step 2: Adaptive Questioning */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">Deep Dive · Step 2</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adaptive Clinical Interview in Action</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Watch how the assistant updates structured medical fields in real time based on user feedback.
            </p>
          </div>
          <ConsultationPreview />
        </div>

        {/* Deep Dive into Step 4: Triage Guidance */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">Deep Dive · Step 4</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5-Tier Triage Classification System</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Understand the operational criteria for Emergency, Urgent, Prompt Evaluation, Routine, and Monitoring.
            </p>
          </div>
          <TriageScalePreview />
        </div>

        {/* Deep Dive into Step 5: Doctor Handoff */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">Deep Dive · Step 5</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1-Page Doctor Preparation Brief</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              The synthesized output ready for patient review and clinician consultation.
            </p>
          </div>
          <DoctorHandoffPreview />
        </div>

        {/* Bottom CTA */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-xl font-bold">Ready to walk through an intake yourself?</h3>
            <p className="text-xs text-blue-100 mt-1">
              Experience the 5-step intake flow with demonstration data in our sandbox.
            </p>
          </div>
          <button
            onClick={onOpenAssessment}
            className="px-6 py-3 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl whitespace-nowrap shadow-xs cursor-pointer"
          >
            Start Assessment Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
