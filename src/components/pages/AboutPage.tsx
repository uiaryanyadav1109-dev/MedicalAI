import React from 'react';
import { RoutePath } from '../../types';
import { Activity, ShieldCheck, Heart, Stethoscope, Users, ArrowRight } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const AboutPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Mission & Principles
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Restoring clarity to health information.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Medical AI was conceived around a single foundational conviction: technology should make health context calmer, more structured, and more collaborative between humans—never more robotic or disconnected.
          </p>
        </div>

        {/* Founding Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Safety Above Sensation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We reject the hype of "AI doctors replacing humans". True clinical safety requires knowing limits, acknowledging uncertainty, and directing patients toward real clinical care.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Patient Dignity & Calm</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Medical anxiety thrives in ambiguity. We design interfaces with calm typography, restrained color usage, and understandable translations rather than alarming pseudo-scores.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Clinician Partnership</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              We build tools to empower doctors, not sideline them. By turning messy symptom narratives into structured 1-page intake briefs, we help clinicians focus on examination and empathy.
            </p>
          </div>
        </div>

        {/* Anti-Slop Manifesto */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono uppercase text-blue-400">Our Governance Pledge</span>
            <h2 className="text-2xl font-bold text-white mt-1">What Medical AI Will Never Do</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">No Robot Doctor Gimmicks</span>
              <p className="text-slate-400 leading-relaxed">
                We will never market this software as a substitute for licensed medical practitioners or claim infallible automated diagnoses.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">No Fabricated Hospital Badges</span>
              <p className="text-slate-400 leading-relaxed">
                We never display manufactured endorsements, invented statistics, or fake clinic reviews to engineer unearned trust.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">No Commercial Health Ad Tracking</span>
              <p className="text-slate-400 leading-relaxed">
                We never monetize user health vulnerabilities through behavioral ad trackers, affiliate pharmaceuticals, or audience reselling.
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-white block">No Pharmacological Prescriptions</span>
              <p className="text-slate-400 leading-relaxed">
                We will never prescribe prescription medications, alter clinical dosages, or encourage dangerous self-treatment regimens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
