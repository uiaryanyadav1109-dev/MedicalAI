import React from 'react';
import { RoutePath } from '../../types';
import { CORE_FEATURES } from '../../data/features';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { Check, ArrowRight, Sparkles, Activity } from 'lucide-react';

interface FeaturesPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-medical-blue dark:text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Features &amp; Capabilities Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Engineered for clinical clarity &amp; safety.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Every feature is intentionally designed to reduce cognitive friction for patients while delivering structured, actionable context to clinicians.
          </p>
        </div>

        {/* Feature Grid Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="bg-white dark:bg-[#0E1A2D] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#1E2E47] shadow-xs flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-medical-blue dark:text-teal-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/40">
                  {feat.category}
                </span>
                <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white mt-3 mb-1">{feat.title}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{feat.tagline}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{feat.description}</p>
                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {feat.previewHighlights.map((hl, i) => (
                    <div key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live Feature Showcase Previews */}
        <div className="space-y-14 pt-8">
          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-medical-blue dark:text-teal-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">1. AI Clinical Assistant Simulation</h2>
            </div>
            <ConsultationPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-medical-blue dark:text-teal-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">2. Medical Report Analyzer (CBC Panel)</h2>
            </div>
            <ReportAnalyzerPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-medical-blue dark:text-teal-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">3. Longitudinal Vitals Telemetry</h2>
            </div>
            <VitalsChartPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-medical-blue dark:text-teal-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">4. 1-Page Clinician Handoff Synthesizer</h2>
            </div>
            <DoctorHandoffPreview />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-medical-blue dark:bg-[#102A43] text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-blue-400/20 text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading font-bold">Experience the Preliminary Triage Sandbox</h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Test the adaptive context questioning and doctor preparation brief right now in simulated mode.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenAssessment}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Launch Interactive Assessment Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
