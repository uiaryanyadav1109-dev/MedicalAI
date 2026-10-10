import React from 'react';
import { ArrowRight, ShieldCheck, Activity, Users, FileText, Stethoscope, ChevronRight, Sparkles } from 'lucide-react';
import { RoutePath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';

interface HeroSectionProps {
  onOpenAssessment: () => void;
  onNavigate: (route: RoutePath) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenAssessment, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

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
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Background subtle clinical grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#0F172A 1px, transparent 1px), radial-gradient(#0F172A 1px, #F8FAFC 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Kicker */}
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-400 tracking-wider uppercase mb-5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>{t('home.heroBadge')}</span>
        </div>

        {/* Hero Title & Value Proposition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] text-balance">
              {t('home.heroTitle')}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl text-pretty">
              {t('home.heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleGetStarted}
                className="px-6 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer"
              >
                <span>{t('nav.getStarted')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onNavigate('/how-it-works');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
              >
                <span>{t('home.startAssessment')}</span>
              </button>
            </div>

            {/* Micro-proof strip */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('footer.compliance')}</span>
              </span>
            </div>
          </div>

          {/* Conceptual Architecture Visualization: Patient -> AI Assistant -> Insights -> Doctor */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 relative transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
                <div className="text-xs font-mono font-semibold uppercase text-slate-400 dark:text-slate-500">
                  Care Continuity Pipeline
                </div>
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
                  Connected Intelligence
                </span>
              </div>

              {/* 4-Step Pipeline Flow */}
              <div className="space-y-3">
                {/* 1. Patient */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Input Node</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">1. Patient Concern</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Symptom narrative, timeline & medical history</div>
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* 2. AI Assistant */}
                <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/40 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-blue-700 dark:text-blue-400 uppercase font-semibold">Adaptive Intake</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">2. AI Clinical Assistant</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">Dynamic inquiry & red-flag safety screening</div>
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* 3. Health Insights */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Contextual Synthesis</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">3. Structured Health Insights</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Preliminary triage, lab translations & timeline</div>
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-0.5 h-3 bg-slate-200 dark:bg-slate-700" />
                </div>

                {/* 4. Doctor */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">Clinical Endpoint</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">4. Clinician Consultation</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">1-page handoff brief & shared decision making</div>
                  </div>
                </div>
              </div>

              {/* Bottom reassurance */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>Continuity of Care</span>
                <span>Clinician-in-the-loop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
