import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { RoutePath } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface FinalCtaSectionProps {
  onOpenAssessment: () => void;
  onNavigate: (route: RoutePath) => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({
  onOpenAssessment,
  onNavigate
}) => {
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
    <section className="py-20 lg:py-24 bg-gradient-to-b from-white to-slate-100 dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Patient-Centered · Clinician-Aligned · Free Educational Sandbox</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight text-balance">
          Start with a clearer picture of your health.
        </h2>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed text-pretty">
          Explore an AI-assisted approach to understanding symptoms, organizing health information, and preparing for better healthcare conversations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onNavigate('/platform');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-7 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Explore the Platform</span>
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-500 dark:text-slate-400">
          No credit card required · Zero diagnostic claims · Private session sandbox
        </div>
      </div>
    </section>
  );
};
