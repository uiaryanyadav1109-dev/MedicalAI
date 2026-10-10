import React, { useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { User, Stethoscope, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { RoutePath } from '../../types';

interface AudienceTabsSectionProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const AudienceTabsSection: React.FC<AudienceTabsSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors'>('patients');

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors" id="audience">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Stakeholder Perspectives"
          title="Bridging the communication gap between individuals and clinicians."
          description="Designed from the ground up to respect both the vulnerability of patients seeking answers and the operational realities of practicing clinicians."
        />

        {/* Tab Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>For Patients</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>For Healthcare Providers</span>
            </button>
          </div>
        </div>

        {/* Patients View */}
        {activeTab === 'patients' && (
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase text-blue-700 dark:text-blue-400 font-semibold">
                  Patient Experience
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  More clarity before your next healthcare conversation.
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Walking into an appointment unprepared can feel intimidating. Medical AI provides a thoughtful space to reflect on what you are experiencing, decode medical jargon, and formulate clear questions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Organize complex symptom chronologies naturally</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Demystify blood tests and laboratory abbreviations</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Formulate prioritized questions for your physician</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Maintain an unfragmented historical health timeline</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Control who views your records with tokenized sharing</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">Multilingual support in English, Hindi, Bengali & Hinglish</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={onOpenAssessment}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Start a Demo Assessment
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/for-patients');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Read Patient Guide
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs shadow-xs transition-colors">
                <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase">
                  Patient Preparation Checklist
                </div>
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/40 rounded border border-blue-100 dark:border-blue-900/40 text-slate-800 dark:text-slate-200">
                  <strong>✓ Prioritized Chief Concern:</strong> Articulated onset, trajectory, and mitigating factors.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <strong>✓ Reconciled Medications:</strong> Active prescriptions, dosages, and OTC supplements listed.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <strong>✓ Recent Labs & Vitals:</strong> Analyte summaries and 30-day BP trends ready to share.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <strong>✓ 3 Prepared Clinical Questions:</strong> Clear inquiries ready for the consultation.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors View */}
        {activeTab === 'doctors' && (
          <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-mono uppercase text-blue-400 font-semibold">
                  Clinician Support Engine
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Better context. Better conversations.
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Physicians routinely face compressed appointment slots burdened by repetitive intake questioning. Medical AI structures the patient narrative into a 1-page pre-consultation HPI brief, giving clinicians instant longitudinal context.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Concise 1-page standardized clinical brief</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Explicit pertinent positives and pertinent negatives</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Clean ambulatory vitals data without raw telemetry clutter</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Patient-approved question roster ready before room entry</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Zero automated clinical decision-making or diagnosis claims</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">Frictionless browser-based QR verification</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      onNavigate('/for-doctors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
                  >
                    View Clinician Handoff Overview
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                  >
                    Institutional Inquiries
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Clinician HPI Preview
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-slate-300 space-y-1">
                  <div><strong>CC:</strong> Bilateral Frontal Headache × 2d</div>
                  <div><strong>Characteristics:</strong> Constant pressure band, 4/10</div>
                  <div><strong>Associated:</strong> Screen strain; denies photophobia</div>
                  <div><strong>Red Flags:</strong> Screened NEGATIVE for acute meningismus</div>
                  <div><strong>Vitals:</strong> 118/76 mmHg · HR 68 · SpO2 99%</div>
                </div>
                <div className="text-[11px] text-slate-400">
                  Strictly assistive. Replaces tedious data-entry; reinforces physician autonomy.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
