import React from 'react';
import {
  ArrowRight,
  Compass
} from 'lucide-react';
import { RoutePath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';

interface HeroSectionProps {
  onOpenAssessment: () => void;
  onNavigate: (route: RoutePath) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
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
    <section className="relative pt-10 pb-16 md:pt-14 md:pb-20 overflow-hidden bg-gradient-to-b from-[#F5F9FC] via-white to-[#F5F9FC] dark:from-[#0B1320] dark:via-[#0F1B2F] dark:to-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47] transition-colors">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#1769AA 1px, transparent 1px), radial-gradient(#1769AA 1px, #F5F9FC 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-7 max-w-2xl space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#16A6A1] animate-pulse" />
              <span>AI-Assisted Healthcare</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight leading-[1.15]">
              Smarter Healthcare. <br />
              <span className="bg-gradient-to-r from-[#1769AA] via-[#16A6A1] to-[#102A43] dark:from-[#38BDF8] dark:via-[#2DD4BF] dark:to-white bg-clip-text text-transparent">
                More Informed Decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              AI-assisted health guidance and connected healthcare tools in one place.
            </p>

            {/* Primary and Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={handleGetStarted}
                className="px-6 py-3 text-sm font-bold text-white bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group whitespace-nowrap cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  onNavigate('/features');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 text-sm font-semibold text-[#243447] dark:text-slate-200 bg-white dark:bg-[#111D30] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-[#DCE6EF] dark:border-[#1E2E47] rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs"
              >
                <Compass className="w-4 h-4 text-[#1769AA] dark:text-[#38BDF8]" />
                <span>Explore Features</span>
              </button>
            </div>
          </div>

          {/* Right Column: Healthcare Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl max-w-sm w-full bg-white dark:bg-slate-900">
              <img
                src={HEALTHCARE_IMAGES.heroDoctorHero.url}
                alt={HEALTHCARE_IMAGES.heroDoctorHero.alt}
                className="w-full h-84 object-cover object-top"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/40 dark:border-slate-800 text-left shadow-xs">
                <span className="text-[11px] font-bold text-[#1769AA] dark:text-[#38BDF8] uppercase tracking-wider block">
                  Connected Healthcare
                </span>
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Intelligent Guidance for Patients &amp; Doctors
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
