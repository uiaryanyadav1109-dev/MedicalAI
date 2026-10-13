import React from 'react';
import { RoutePath } from '../../types';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';
import {
  Stethoscope,
  CheckCircle2,
  Shield,
  FileText,
  Clock,
  Users,
  ArrowRight,
  Activity,
  Building2,
  FileCheck
} from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const ForDoctorsPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const clinicalPillars = [
    {
      icon: Clock,
      title: '40% Less Repetitive Intake',
      desc: 'Patients arrive with onset chronology, severity scores, and pertinent negatives already synthesized into a standardized 1-page pre-consultation brief.'
    },
    {
      icon: Shield,
      title: 'Physician Autonomy Preserved',
      desc: 'Zero automated diagnostic claims. Medical AI produces preliminary triage context while keeping the attending clinician as the sole authority.'
    },
    {
      icon: FileText,
      title: 'Longitudinal Telemetry Review',
      desc: 'Review aggregated ambulatory resting blood pressure and pulse telemetry in standardized tabular formats, eliminating random scraps of paper.'
    },
    {
      icon: Users,
      title: 'Collaborative Patient Dialogue',
      desc: 'Patients bring 3 to 5 prioritized, structured questions to their visit, enabling focused examination and shared clinical decision-making.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Two-Column Clinician Hero with Authentic Photography */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Clinician Support &amp; Clinical Handoffs</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Better clinical context. More focused face-to-face time.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Medical AI prepares structured, standardized intake briefs prior to the clinical encounter. Reclaim examination time without sacrificing thorough clinical history or patient trust.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-6 py-3.5 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Access Doctor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onNavigate('/contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-white dark:bg-[#0E1A2D] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Request Practice Integration</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={HEALTHCARE_IMAGES.heroDoctorHero.url}
                alt={HEALTHCARE_IMAGES.heroDoctorHero.alt}
                className="w-full h-80 sm:h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 font-mono">
                    <FileCheck className="w-4 h-4" />
                    <span>SBAR &amp; SOAP Pre-Encounter Synthesis</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug">
                    Verified intake history structured for fast clinician review before entering the exam room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars for Clinicians */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold tracking-wider">
              Clinical Utility &amp; Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">
              Built to support, never replace, clinician judgment
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinicalPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white dark:bg-[#0E1A2D] rounded-2xl border border-slate-200 dark:border-[#1E2E47] shadow-xs space-y-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-medical-blue dark:text-teal-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Handoff Preview Section */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Standardized Clinical Artifact</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">The 1-Page Pre-Consultation Synopsis</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Toggle between Patient Review Mode and Clinician HPI View below to examine the structured output.
            </p>
          </div>
          <DoctorHandoffPreview />
        </div>

        {/* Vitals Telemetry Review */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-medical-blue dark:text-teal-400 font-semibold">Telemetry Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white">Ambulatory Vitals Review</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Standardized trends showing resting cardiovascular telemetry, blood pressure distribution, and oxygen saturation.
            </p>
          </div>
          <VitalsChartPreview />
        </div>

        {/* Institutional Contact Bar */}
        <div className="bg-medical-blue dark:bg-[#102A43] text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-blue-400/20">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-teal-300 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Hospital &amp; Network Collaborations</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-heading font-bold">Interested in clinical pilot integration?</h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
              We collaborate with outpatient practices, specialty clinics, and academic health systems to streamline intake.
            </p>
          </div>
          <button
            onClick={() => {
              onNavigate('/contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Schedule Pilot Discussion
          </button>
        </div>
      </div>
    </div>
  );
};
