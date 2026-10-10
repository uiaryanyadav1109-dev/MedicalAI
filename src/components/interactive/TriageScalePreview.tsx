import React, { useState } from 'react';
import { TRIAGE_LEVELS } from '../../data/triage';
import { TriageCategory } from '../../types';
import { AlertTriangle, Clock, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export const TriageScalePreview: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TriageCategory>('prompt_evaluation');

  const currentLevel = TRIAGE_LEVELS.find((l) => l.id === selectedCategory) || TRIAGE_LEVELS[2];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800">5-Tier Preliminary Triage Taxonomy</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-slate-500">Operational Care Timing</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Clinical Protocol Model</span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {TRIAGE_LEVELS.map((level) => {
            const isSelected = selectedCategory === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setSelectedCategory(level.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? `${level.badgeColor} ring-2 ring-offset-1 ring-blue-500 shadow-xs font-semibold`
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">
                  Tier {level.id === 'emergency' ? '1' : level.id === 'urgent' ? '2' : level.id === 'prompt_evaluation' ? '3' : level.id === 'routine' ? '4' : '5'}
                </div>
                <div className="text-xs font-bold mt-1 line-clamp-1">{level.name}</div>
                <div className="text-[11px] mt-0.5 opacity-90">{level.timeframe}</div>
              </button>
            );
          })}
        </div>

        {/* Detailed Breakdown Card */}
        <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs font-mono uppercase text-slate-400">Operational Category</div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                {currentLevel.id === 'emergency' && <ShieldAlert className="w-5 h-5 text-rose-600" />}
                {currentLevel.name}
              </h3>
            </div>
            <div className="text-xs font-mono px-3 py-1 bg-white rounded border border-slate-200 self-start sm:self-auto">
              Clinical Window: <span className="font-semibold text-slate-900">{currentLevel.timeframe}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-900 block mb-1">Clinical Scope & Rationale</span>
                <p className="text-slate-600 leading-relaxed">{currentLevel.description}</p>
              </div>

              <div className="p-3 bg-white rounded-md border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Recommended Action Protocol</span>
                <p className="text-slate-700 leading-relaxed">{currentLevel.actionGuidance}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-md border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-2">Example Clinical Scenarios</span>
              <ul className="space-y-2 text-slate-600">
                {currentLevel.exampleScenarios.map((sc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{sc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* System Factors Evaluated */}
        <div className="mt-5 pt-4 border-t border-slate-200 text-xs">
          <div className="font-semibold text-slate-900 mb-2">
            Multi-Variable Context Evaluated by Triage Engine:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] text-slate-600">
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">1. Reported Symptoms</div>
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">2. Severity (1–10)</div>
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">3. Chronology & Duration</div>
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">4. Comorbid History</div>
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">5. Red-Flag Warning Signs</div>
            <div className="p-2 bg-slate-100 rounded border border-slate-200 text-center font-medium">6. Missing Clinical Data</div>
          </div>
        </div>

        <div className="mt-4 text-[11px] text-slate-500">
          *Important: Preliminary triage categories provide guidance on care timing and preparation. They are not medical diagnoses. Always use personal judgment and seek qualified medical attention when concerned.
        </div>
      </div>
    </div>
  );
};
