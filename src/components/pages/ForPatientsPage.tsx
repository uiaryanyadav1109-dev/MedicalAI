import React from 'react';
import { RoutePath } from '../../types';
import { SectionHeader } from '../ui/SectionHeader';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { TimelinePreview } from '../interactive/TimelinePreview';
import { CheckCircle2, UserCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const ForPatientsPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const { user, isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.hasCompletedOnboarding === false) {
        onNavigate('/onboarding');
      } else {
        onNavigate('/dashboard');
      }
    } else {
      onNavigate('/signup');
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Patient Experience Guide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            More clarity before your next healthcare conversation.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Healthcare can be overwhelming. Medical AI provides a calm, private space to understand what you are experiencing, decode medical reports, and arrive at your doctor's visit prepared.
          </p>
        </div>

        {/* 6 Key Benefits for Patients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Organize Symptoms Naturally</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No need to memorize technical terms. Speak or type in everyday words. The AI asks adaptive questions to capture your complete health narrative.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Understand Medical Reports</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Turn confusing laboratory paperwork (like Complete Blood Counts or metabolic tests) into clear, plain-language explanations with normal baseline ranges.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Prepare Priority Questions</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Arrive at your appointment with 3 to 5 clinically meaningful questions, ensuring your most pressing concerns are addressed during the visit.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Keep a Central Health Timeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Eliminate paper clutter. Chronologically organize past consultations, home blood pressure measurements, and laboratory results in one private place.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Sovereign Record Sharing</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              You choose what to share. Generate short-lived tokenized QR links for your doctor, and revoke access at any time with a single tap.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">6. Multilingual Comfort</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Consult in English, Hindi, Bengali, or conversational Hinglish to express intimate health symptoms in your most comfortable dialect.
            </p>
          </div>
        </div>

        {/* Live Patient Previews */}
        <div className="space-y-12">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Interactive Symptom Clarification</h3>
            <ConsultationPreview />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Diagnostic Report Translation</h3>
            <ReportAnalyzerPreview />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Your Historical Timeline</h3>
            <TimelinePreview />
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAssessment}
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Try Educational Assessment Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
