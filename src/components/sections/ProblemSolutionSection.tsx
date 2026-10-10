import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { XCircle, CheckCircle, ArrowRight, FileQuestion, Layers, MessageSquare, AlertCircle } from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="The Information Gap"
          title="Healthcare information is often fragmented."
          description="Patients struggle to articulate nuanced physical sensations under exam-room time pressure. Medical AI provides a calm preparatory layer before your appointment."
        />

        {/* Before / After Side-by-Side Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* BEFORE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                    Before: Fragmented Information
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Traditional Intake</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Symptoms are difficult to describe</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Patients struggle to remember exact onset dates, pain trajectories, or situational triggers when asked on the spot.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Medical reports are dense and confusing</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Laboratory sheets filled with abbreviations (CBC, MCV, eGFR) often trigger anxiety without clear biological reference ranges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Records spread across disparate portals</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Bloodwork from clinic A, prescriptions from pharmacy B, and vitals from home cuffs remain entirely disconnected.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Clinicians receive incomplete context</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      With brief appointment slots, doctors spend the majority of the visit reconstructing basic chronology rather than examining.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
              Result: Rushed visits, missed context, patient hesitation
            </div>
          </div>

          {/* AFTER CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-blue-200/90 dark:border-blue-900/60 shadow-md flex flex-col justify-between relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-950/40 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                    After: Organized Health Context
                  </span>
                </div>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-mono bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded font-semibold border border-blue-200 dark:border-blue-800">
                  Medical AI Framework
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Adaptive conversational intake</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Patients articulate concerns naturally at home; dynamic questions clarify timing, intensity, and pertinent negatives.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Plain-language laboratory explanations</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Analyzers decode blood panels into educational summaries and prepare pertinent questions to ask your physician.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Single longitudinal health timeline</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Consultation summaries, vital trends, and lab reports unite into an organized, chronological record.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">1-page structured doctor handoff</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Physicians receive a concise, standardized pre-consultation summary so appointment time focuses on meaningful clinical care.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-blue-900 dark:text-blue-300 font-medium flex items-center justify-between">
              <span>Outcome: Calm patients, structured context, collaborative care</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
