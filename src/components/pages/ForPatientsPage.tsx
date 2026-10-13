import React from 'react';
import { RoutePath } from '../../types';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { TimelinePreview } from '../interactive/TimelinePreview';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';
import {
  Heart,
  FileText,
  Clock,
  ShieldCheck,
  Globe2,
  ListOrdered,
  ArrowRight,
  Activity,
  CheckCircle2,
  Stethoscope
} from 'lucide-react';
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

  const patientFeatures = [
    {
      icon: Activity,
      title: 'Organize Symptoms Naturally',
      desc: 'No medical jargon needed. Speak or type in everyday words. The AI asks adaptive questions to capture your complete health narrative.'
    },
    {
      icon: FileText,
      title: 'Understand Medical Reports',
      desc: 'Turn confusing lab paperwork (like Complete Blood Counts or metabolic panels) into plain-language summaries with standard baseline references.'
    },
    {
      icon: ListOrdered,
      title: 'Prepare Priority Questions',
      desc: 'Arrive at your appointment with 3 to 5 clinically structured questions, ensuring your most pressing concerns are addressed during the visit.'
    },
    {
      icon: Clock,
      title: 'Central Health Timeline',
      desc: 'Keep an organized chronological history of past consultations, blood pressure logs, and lab results securely in one private place.'
    },
    {
      icon: ShieldCheck,
      title: 'Sovereign Record Sharing',
      desc: 'You choose what to share. Generate short-lived tokenized QR passes for your clinician, and revoke access anytime with one tap.'
    },
    {
      icon: Globe2,
      title: 'Multilingual Comfort',
      desc: 'Consult in English, Hindi, or Bengali to communicate intimate health symptoms in your most comfortable native language.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Two-Column Hero with Authentic Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Patient Experience &amp; Empowerment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              More clarity before your next healthcare conversation.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Healthcare can feel overwhelming. Medical AI provides a calm, private space to understand what you are experiencing, decode diagnostic lab tests, and arrive at your doctor's appointment prepared.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleGetStarted}
                className="px-6 py-3.5 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started as Patient</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenAssessment}
                className="px-6 py-3.5 bg-white dark:bg-[#0E1A2D] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Try Preliminary Triage Demo</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={HEALTHCARE_IMAGES.patientConsultation?.url || HEALTHCARE_IMAGES.doctorSarahChen.url}
                alt={HEALTHCARE_IMAGES.patientConsultation?.alt || 'Patient consultation'}
                className="w-full h-80 sm:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified Patient Empowerment Workflow</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">
                    Structured patient history enables doctors to spend more time examining and answering questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Benefits for Patients */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
              Designed For Patient Clarity
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
              Everything you need for an informed medical visit
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-[#0E1A2D] rounded-2xl border border-slate-200 dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-medical-blue dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Patient Previews */}
        <div className="space-y-14 pt-4">
          <div>
            <div className="mb-4">
              <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Interactive Module</span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Conversational Symptom Clarification</h3>
            </div>
            <ConsultationPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Diagnostic Intelligence</span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Diagnostic Report Translation</h3>
            </div>
            <ReportAnalyzerPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Longitudinal Records</span>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">Your Historical Care Timeline</h3>
            </div>
            <TimelinePreview />
          </div>
        </div>

        {/* Bottom Call to Action Card */}
        <div className="bg-medical-blue dark:bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-blue-400/20 text-center space-y-5 max-w-4xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-teal-300 flex items-center justify-center mx-auto">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold">Take control of your personal health narrative</h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto leading-relaxed">
              Join thousands of patients who arrive at their consultations organized, informed, and confident.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Create Free Patient Account
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
