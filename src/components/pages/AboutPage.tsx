import React from 'react';
import { RoutePath } from '../../types';
import { Activity, ShieldCheck, Heart, Stethoscope, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const AboutPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-[#F5F9FC] dark:bg-[#0B1320] min-h-screen transition-colors text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
              <span>Mission & Principles</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
              Restoring clarity to health information.
            </h1>
            <p className="text-base sm:text-lg text-[#64748B] dark:text-slate-300 leading-relaxed font-normal">
              MedicalAI was conceived around a single foundational conviction: technology should make health context calmer, more structured, and more collaborative between humans—never more disconnected or alarming.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#DCE6EF] dark:border-[#1E2E47]">
              <img
                src={HEALTHCARE_IMAGES.doctorTeamDiscussion.url}
                alt={HEALTHCARE_IMAGES.doctorTeamDiscussion.alt}
                className="w-full h-80 object-cover"
                loading="lazy"
              />
              <div className="p-4 bg-white dark:bg-[#111D30] border-t border-[#DCE6EF] dark:border-[#1E2E47]">
                <div className="text-xs font-bold text-[#102A43] dark:text-white">
                  Multidisciplinary Clinical Collaboration
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Built to support physician workflows and patient understanding.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Founding Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111D30] p-6 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#102A43] dark:text-white">Safety Above Sensation</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              We reject the hype of "AI doctors replacing humans". True clinical safety requires recognizing limitations, transparent uncertainty, and directing patients toward real clinical care.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111D30] p-6 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#16A6A1] dark:text-[#2DD4BF] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#102A43] dark:text-white">Patient Dignity & Calm</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Medical anxiety thrives in ambiguity. We design interfaces with calm typography, restrained color usage, and understandable translations rather than alarming pseudo-scores.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111D30] p-6 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16865C] dark:text-emerald-400 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#102A43] dark:text-white">Clinician Partnership</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              We build tools to empower doctors, not sideline them. By turning messy symptom narratives into structured 1-page intake briefs, we help clinicians focus on physical examination and empathy.
            </p>
          </div>
        </div>

        {/* Governance Pledge */}
        <div className="bg-[#102A43] text-white rounded-3xl p-8 sm:p-12 border border-[#1E2E47] shadow-2xl space-y-6">
          <div className="border-b border-[#1E2E47] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">Our Ethical Pledge</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">What MedicalAI Will Never Do</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="p-5 bg-[#0B1320]/80 rounded-2xl border border-[#1E2E47] space-y-1.5">
              <span className="font-bold text-white text-sm block">No Robot Doctor Gimmicks</span>
              <p className="text-slate-400 leading-relaxed">
                We will never market this software as a replacement for licensed medical practitioners or claim infallible automated diagnoses.
              </p>
            </div>

            <div className="p-5 bg-[#0B1320]/80 rounded-2xl border border-[#1E2E47] space-y-1.5">
              <span className="font-bold text-white text-sm block">No Fabricated Hospital Badges</span>
              <p className="text-slate-400 leading-relaxed">
                We never display manufactured certifications, invented statistics, or fake clinic reviews to engineer unearned trust.
              </p>
            </div>

            <div className="p-5 bg-[#0B1320]/80 rounded-2xl border border-[#1E2E47] space-y-1.5">
              <span className="font-bold text-white text-sm block">No Commercial Health Ad Tracking</span>
              <p className="text-slate-400 leading-relaxed">
                We never monetize user health vulnerabilities through behavioral ad trackers, affiliate pharmaceuticals, or audience reselling.
              </p>
            </div>

            <div className="p-5 bg-[#0B1320]/80 rounded-2xl border border-[#1E2E47] space-y-1.5">
              <span className="font-bold text-white text-sm block">No Pharmacological Prescriptions</span>
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

export default AboutPage;
