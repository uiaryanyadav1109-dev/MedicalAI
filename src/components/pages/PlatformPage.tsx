import React from 'react';
import { RoutePath } from '../../types';
import { SectionHeader } from '../ui/SectionHeader';
import { CoreCapabilitiesSection } from '../sections/CoreCapabilitiesSection';
import { ConsultationPreview } from '../interactive/ConsultationPreview';
import { ReportAnalyzerPreview } from '../interactive/ReportAnalyzerPreview';
import { VitalsChartPreview } from '../interactive/VitalsChartPreview';
import { DoctorHandoffPreview } from '../interactive/DoctorHandoffPreview';
import { QrSharePreview } from '../interactive/QrSharePreview';
import { Layers, Database, ShieldCheck, Cpu, GitBranch, ArrowRight } from 'lucide-react';

interface SubPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const PlatformPage: React.FC<SubPageProps> = ({ onNavigate, onOpenAssessment }) => {
  return (
    <div className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider mb-2">
            System Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The Medical AI Platform
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            An assistive clinical intelligence layer engineered to ingest unstructured health narratives, validate findings against biological standards, and prepare structured clinical briefings.
          </p>
        </div>

        {/* Multi-Tier Architectural Diagram */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-8 transition-colors">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Stack & Operational Layers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              End-to-end separation between patient intake, safety arbitration, and clinical export.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                L1
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ingestion Layer</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Multimodal voice acoustics, natural conversational text in 4 languages, and optical document OCR for lab results.
              </p>
            </div>

            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                L2
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Adaptive Inquiry</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Adaptive clinical pathways identify missing timeline variables, symptom intensity, and pertinent negatives.
              </p>
            </div>

            <div className="p-5 bg-rose-50/50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                L3
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Safety Guardrails</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deterministic red-flag filter detecting emergency presentations. Blocks unsupported diagnostic assertions.
              </p>
            </div>

            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                L4
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clinical Export</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                1-page standardized handoff synthesis, FHIR/HL7 compatible schemas, and ephemeral tokenized QR distribution.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Demonstrations on Platform */}
        <div className="space-y-12">
          <SectionHeader
            title="Interactive Platform Sandbox"
            description="Explore key modules of the Medical AI stack using illustrative demonstration data."
          />

          <div className="space-y-10">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Module A: Conversational Intake Engine</h3>
              <ConsultationPreview />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Module B: Diagnostic Laboratory Analyzer</h3>
              <ReportAnalyzerPreview />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Module C: Pre-Consultation Clinician Handoff</h3>
              <DoctorHandoffPreview />
            </div>
          </div>
        </div>

        {/* CTA banner */}
        <div className="bg-slate-900 dark:bg-slate-900/90 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div>
            <h3 className="text-xl font-bold">Ready to test the preliminary triage engine?</h3>
            <p className="text-xs text-slate-400 mt-1">Open the interactive assessment demo with zero sign-up required.</p>
          </div>
          <button
            onClick={onOpenAssessment}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl whitespace-nowrap shadow-xs cursor-pointer"
          >
            Start Assessment Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};
