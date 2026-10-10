import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldCheck, Stethoscope, Layers, FileCheck2 } from 'lucide-react';
import { RoutePath } from '../../types';

interface ConsultationPreviewProps {
  onNavigate?: (route: RoutePath) => void;
}

interface IntakeScenario {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  patientNarrative: string;
  structuredExtraction: {
    chiefComplaint: string;
    onsetDuration: string;
    anatomicDistribution: string;
    severityScore: string;
    associatedSigns: string;
    safetyScreening: string;
    clinicalDisposition: string;
  };
}

export const ConsultationPreview: React.FC<ConsultationPreviewProps> = ({ onNavigate }) => {
  const scenarios: IntakeScenario[] = [
    {
      id: 'tension',
      label: 'Bilateral Frontal Pressure',
      badge: 'Tier 4 · Non-Urgent',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      patientNarrative:
        '"Feels like a dull, tight band across my temples after prolonged screen work. No nausea, photophobia, or vision changes."',
      structuredExtraction: {
        chiefComplaint: 'Bilateral frontal cephalalgia',
        onsetDuration: 'Subacute (~24h post-screen exertion)',
        anatomicDistribution: 'Frontal band / Temporoparietal',
        severityScore: 'Mild to Moderate (3-4/10)',
        associatedSigns: 'Digital eyestrain, neck myofascial tension',
        safetyScreening: 'Negative for meningismus, negative for acute focal deficits',
        clinicalDisposition: 'Routine Ambulatory Primary Care / Ergonomic Review'
      }
    },
    {
      id: 'migraine',
      label: 'Unilateral Throbbing + Photophobia',
      badge: 'Tier 3 · Urgent / Next-Day',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      patientNarrative:
        '"Pulsatile pain concentrated on right temple accompanied by nausea, sensitivity to daylight, and mild aura."',
      structuredExtraction: {
        chiefComplaint: 'Hemicranial pulsatile cephalalgia',
        onsetDuration: 'Acute recurrent onset (~8h)',
        anatomicDistribution: 'Right frontotemporal unilateral',
        severityScore: 'Moderate to High (6-7/10)',
        associatedSigns: 'Photophobia, phonophobia, mild nausea',
        safetyScreening: 'Typical migrainous aura features; no motor loss',
        clinicalDisposition: 'Outpatient Neurological / Primary Care Evaluation'
      }
    },
    {
      id: 'redflag',
      label: 'Sudden Thunderclap Onset',
      badge: 'Tier 1 · Immediate Emergency',
      badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      patientNarrative:
        '"Sudden, explosive headache that reached maximal intensity within seconds, accompanied by neck stiffness."',
      structuredExtraction: {
        chiefComplaint: 'Hyperacute maximal headache ("thunderclap")',
        onsetDuration: 'Peak intensity in <60 seconds',
        anatomicDistribution: 'Diffuse occipital & nuchal region',
        severityScore: 'Severe (9-10/10)',
        associatedSigns: 'Meningismus, nuchal rigidity, diaphoresis',
        safetyScreening: 'CRITICAL RED FLAG: Suspicion of subarachnoid event',
        clinicalDisposition: 'Immediate Emergency Department (ED) Transfer'
      }
    }
  ];

  const [activeScenario, setActiveScenario] = useState<IntakeScenario>(scenarios[0]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
            Clinical Intake Engine
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Natural Language Ingestion to FHIR Clinical Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Interactive Model Demo</span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Scenario Selector Pills */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
            Select Symptom Narrative Scenario to Inspect Token Synthesis:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((sc) => {
              const isSelected = activeScenario.id === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {sc.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                      {sc.badge.split('·')[0].trim()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    {sc.patientNarrative}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Extraction Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Raw Clinical Ingestion */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>1. Patient Free-Text Narrative</span>
              </div>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                {activeScenario.patientNarrative}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                Patients provide unstructured symptom descriptions in their native voice or language without requiring medical jargon.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Clinical Guardrails & Triage Safety</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
                AI extracts operational tokens for clinician review and emergency tiering. No definitive diagnoses are issued.
              </p>
            </div>
          </div>

          {/* Right: Structured Clinical Extraction Engine */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 shadow-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>2. Synthesized Clinical Data Tokens</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${activeScenario.badgeColor}`}>
                  {activeScenario.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Chief Complaint</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {activeScenario.structuredExtraction.chiefComplaint}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Onset / Duration</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {activeScenario.structuredExtraction.onsetDuration}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Anatomical Site</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {activeScenario.structuredExtraction.anatomicDistribution}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Severity Index</span>
                  <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                    {activeScenario.structuredExtraction.severityScore}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Associated Modifiers</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {activeScenario.structuredExtraction.associatedSigns}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono uppercase font-bold block">Safety Red Flag Screening</span>
                  <span className="font-bold text-xs mt-0.5 block">
                    {activeScenario.structuredExtraction.safetyScreening}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Disposition & Authenticated Dashboard Link */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                Operational Disposition: <strong className="text-slate-900 dark:text-white">{activeScenario.structuredExtraction.clinicalDisposition}</strong>
              </div>

              {onNavigate && (
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>Experience Inside Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
