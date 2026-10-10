import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { ShieldCheck, CheckCircle2, XCircle, AlertOctagon, Sliders, ArrowRight } from 'lucide-react';

export const SafetyLimitsSection: React.FC = () => {
  const safetyFilters = [
    {
      title: 'Unsupported Certainty Detection',
      desc: 'Prevents definitive diagnostic assertions (e.g., "You definitely have..."). Replaces with exploratory questions and clinician triage tiers.'
    },
    {
      title: 'Unsafe Recommendation Interceptor',
      desc: 'Blocks invasive home remedies, unverified pharmaceutical dosages, or dangerous self-medication recommendations.'
    },
    {
      title: 'Missing Safety Warning Guard',
      desc: 'Ensures clinical disclaimers, red-flag checklists, and follow-up consultation advisories are permanently appended to every generated output.'
    },
    {
      title: 'Hallucination Minimization',
      desc: 'Constrains language generation to verified biological laboratory reference tables and documented clinical intake ontologies.'
    },
    {
      title: 'Emergency Circumvention Prevention',
      desc: 'Ensures urgent symptoms bypass standard multi-step questionnaires immediately, routing to emergency guidance.'
    },
    {
      title: 'Scope of Practice Enforcement',
      desc: 'Strictly refuses requests for prescription authorization, medical certificate sign-offs, or claims of licensed medical authority.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-900 text-white border-b border-slate-800" id="safety-limits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-semibold tracking-wider text-blue-400 uppercase mb-3 font-mono">
            Clinical Governance & Alignment
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            AI should know its limits.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Medical AI operates within bounded guardrails. Every inference passes through programmatic filters before reaching the user.
          </p>
        </div>

        {/* Validation Pipeline Visualization */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 mb-12 shadow-2xl">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-6 flex items-center justify-between">
            <span>Runtime Safety Arbitration Pipeline</span>
            <span className="text-emerald-400">Strict Enforcement Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Stage 1 */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-xs font-mono text-blue-400">Stage 01</span>
              <div className="text-sm font-bold text-white">Synthesized AI Response</div>
              <p className="text-xs text-slate-400">Raw contextual response formulated from patient intake dialogue.</p>
            </div>

            {/* Stage 2 */}
            <div className="bg-blue-950/60 p-5 rounded-xl border border-blue-800 text-center space-y-2 relative">
              <span className="text-xs font-mono text-blue-300 font-semibold">Stage 02</span>
              <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Deterministic Safety Engine</span>
              </div>
              <p className="text-xs text-slate-300">
                Cross-validates against 6 safety guardrails: certainty, emergency flags, and non-prescriptive limits.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-mono text-slate-400 text-center">Stage 03 · Tri-State Decision</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-emerald-950/40 border border-emerald-800/80 text-emerald-300">
                  <span className="font-semibold">APPROVED</span>
                  <span className="text-[10px] text-emerald-400">Complies with safety rules</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-amber-950/40 border border-amber-800/80 text-amber-300">
                  <span className="font-semibold">REVISED</span>
                  <span className="text-[10px] text-amber-400">Claims toned to advisory</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-rose-950/40 border border-rose-800/80 text-rose-300">
                  <span className="font-semibold">BLOCKED</span>
                  <span className="text-[10px] text-rose-400">Diverted to Emergency Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Safety Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {safetyFilters.map((sf, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h3 className="text-sm font-semibold text-white">{sf.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{sf.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
