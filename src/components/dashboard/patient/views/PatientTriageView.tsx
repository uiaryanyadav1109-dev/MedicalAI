import React, { useState } from 'react';
import { RoutePath, TriageCategory } from '../../../../types';
import { TRIAGE_LEVELS } from '../../../../data/triage';
import { checkEmergencyRedFlags, computeTriageTier } from '../../../../services/clinicalStore';
import {
  Compass,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Activity,
  Info,
  PhoneCall,
  ShieldCheck
} from 'lucide-react';

export const PatientTriageView: React.FC<{ onNavigate: (route: RoutePath) => void }> = ({
  onNavigate
}) => {
  const [activeTier, setActiveTier] = useState<TriageCategory>('prompt_evaluation');
  const [symptomInput, setSymptomInput] = useState('');
  const [durationInput, setDurationInput] = useState('3 days');
  const [severityInput, setSeverityInput] = useState(5);
  const [evaluationResult, setEvaluationResult] = useState<{
    tier: TriageCategory;
    isEmergency: boolean;
    urgentMessage?: string;
  } | null>(null);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    const redFlagCheck = checkEmergencyRedFlags(symptomInput);
    if (redFlagCheck.isEmergency) {
      setEvaluationResult({
        tier: 'emergency',
        isEmergency: true,
        urgentMessage: redFlagCheck.urgentGuidance
      });
      setActiveTier('emergency');
      return;
    }

    const tier = computeTriageTier(severityInput, durationInput, false);
    setEvaluationResult({
      tier,
      isEmergency: false
    });
    setActiveTier(tier);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Protocol Disclaimer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Clinical Prioritization · Triage Framework</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Preliminary Triage Scale & Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            5-tier clinical stratification framework to assist in identifying the appropriate venue, timeframe, and urgency for healthcare evaluation.
          </p>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Non-Diagnostic Advisory:</strong> This framework provides clinical timeframe guidance based on reported symptoms. It does not replace physical examination or clinician judgment.
            </span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/dashboard/consultation')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Start Full Intake Wizard</span>
        </button>
      </div>

      {/* 2. Interactive Quick Triage Runner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Preliminary Triage Tier Simulator
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Deterministic Safety Screening</span>
        </div>

        <form onSubmit={handleEvaluate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Describe Current Symptoms
              </label>
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="e.g. Throbbing frontal headache with neck tension, persistent since morning"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duration
              </label>
              <select
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="A few hours">A few hours</option>
                <option value="1-2 days">1-2 days</option>
                <option value="3-5 days">3-5 days</option>
                <option value="Over 1 week">Over 1 week</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Symptom Severity (1 to 10 Scale)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{severityInput} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={severityInput}
              onChange={(e) => setSeverityInput(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Calculate Triage Tier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {evaluationResult && (
          <div
            className={`p-5 rounded-2xl border mt-4 text-xs space-y-3 ${
              evaluationResult.isEmergency
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-950 dark:text-rose-100 shadow-md'
                : 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900 text-slate-800 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {evaluationResult.isEmergency ? (
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
              )}
              <span>Triage Classification: {evaluationResult.tier.toUpperCase().replace('_', ' ')}</span>
            </div>

            {evaluationResult.urgentMessage && (
              <p className="font-bold text-rose-800 dark:text-rose-200 text-sm">
                {evaluationResult.urgentMessage}
              </p>
            )}

            <p className="leading-relaxed">
              Based on reported symptom intensity ({severityInput}/10) and timeframe ({durationInput}), this presentation corresponds to the <strong>{evaluationResult.tier.replace('_', ' ')}</strong> clinical guidance protocol.
            </p>

            {evaluationResult.isEmergency && (
              <div className="pt-2 flex gap-2">
                <a
                  href="tel:112"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Emergency EMS (112) Now</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. 5-Tier Scale Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
          Standard Clinical Stratification Levels
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {TRIAGE_LEVELS.map((level) => {
            const isCurrent = activeTier === level.id;
            return (
              <div
                key={level.id}
                onClick={() => setActiveTier(level.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 bg-white dark:bg-slate-900 shadow-sm border-blue-400 dark:border-blue-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-1.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${level.badgeColor}`}>
                    {level.name}
                  </span>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{level.timeframe}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                    {level.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                  {level.actionGuidance}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
