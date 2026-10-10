import React from 'react';
import { RoutePath } from '../../types';
import { CORE_FEATURES } from '../../data/features';
import { SectionHeader } from '../ui/SectionHeader';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import { TimelinePreview } from '../interactive/TimelinePreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { QrSharePreview } from '../interactive/QrSharePreview';
import { VoiceWaveformPreview } from '../interactive/VoiceWaveformPreview';
import { TriageScalePreview } from '../interactive/TriageScalePreview';
import { Check, ArrowRight } from 'lucide-react';

interface FeaturesPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            Features & Capabilities Directory
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for clinical clarity.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Every feature is designed to reduce cognitive friction for patients and provide structured, actionable context for doctors.
          </p>
        </div>

        {/* Feature Grid Catalog */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_FEATURES.map((feat) => (
            <div
              key={feat.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">
                  {feat.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 mb-1">{feat.title}</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{feat.tagline}</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{feat.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
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
              <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. AI Clinical Assistant Simulation</h2>
            </div>
            <ConsultationPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Medical Report Analyzer (CBC Panel)</h2>
            </div>
            <ReportAnalyzerPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. Longitudinal Vitals Telemetry</h2>
            </div>
            <VitalsChartPreview />
          </div>

          <div>
            <div className="mb-4">
              <span className="text-xs font-mono text-blue-700 dark:text-blue-400 uppercase font-semibold">Live Sandbox Module</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. 1-Page Clinician Handoff Synthesizer</h2>
            </div>
            <DoctorHandoffPreview />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <button
            onClick={onOpenAssessment}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs cursor-pointer"
          >
            Launch Interactive Assessment Demo
          </button>
        </div>
      </div>
    </div>
  );
};
