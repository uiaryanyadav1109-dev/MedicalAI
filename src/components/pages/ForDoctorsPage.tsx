import React from 'react';
import { RoutePath } from '../../types';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import { Stethoscope, CheckCircle2, Shield, FileText, Clock, Users, ArrowRight } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const ForDoctorsPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Clinician Support Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Better context. Better conversations.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Medical AI prepares structured, standardized intake briefs prior to the clinical encounter. Reclaim face-to-face examination time without sacrificing thorough clinical history.
          </p>
        </div>

        {/* 4 Pillars for Clinicians */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">40% Less Repetitive Intake</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Patients arrive with onset timelines, severity indices, and pertinent negatives already synthesized into a 1-page summary.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinician Autonomy Preserved</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Zero automated diagnostic claims. Medical AI produces preliminary triage context while keeping the physician as the sole decision-maker.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clean Longitudinal Vitals</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Review aggregated 30-day resting blood pressure and pulse telemetry in standardized tabular formats, eliminating random scraps of paper.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Empowered Patient Dialogue</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Patients bring 3 prioritized questions approved beforehand, enabling focused, collaborative decision-making during the visit.
            </p>
          </div>
        </div>

        {/* Doctor Handoff Preview Section */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">Standardized Artifact</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">The 1-Page Pre-Consultation Synopsis</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Toggle between Patient Review Mode and Clinician HPI View below to examine the structured format.
            </p>
          </div>
          <DoctorHandoffPreview />
        </div>

        {/* Vitals Telemetry Review */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">Telemetry Module</span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ambulatory Vitals Review</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Standardized graphs showing resting cardiovascular trends and oxygen saturation.
            </p>
          </div>
          <VitalsChartPreview />
        </div>

        {/* Institutional Contact Bar */}
        <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Interested in clinical pilot integration?</h3>
            <p className="text-xs text-slate-400">
              We collaborate with clinical practices, hospital groups, and academic health systems.
            </p>
          </div>
          <button
            onClick={() => {
              onNavigate('/contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xs cursor-pointer"
          >
            Contact Clinical Partnership Team
          </button>
        </div>
      </div>
    </div>
  );
};
