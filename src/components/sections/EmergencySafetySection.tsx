import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { AlertTriangle, ShieldAlert, ArrowRight, PhoneCall, CheckCircle2 } from 'lucide-react';

export const EmergencySafetySection: React.FC = () => {
  const emergencySteps = [
    {
      step: '01',
      title: 'Symptom Ingestion',
      desc: 'Patient articulates symptoms in conversational text or voice.'
    },
    {
      step: '02',
      title: 'Safety Interceptor',
      desc: 'Real-time rule engine evaluates text against high-risk acute clinical red flags.'
    },
    {
      step: '03',
      title: 'Red Flag Detection',
      desc: 'Cardiovascular, neurological, or respiratory emergencies immediately halt automated triage.'
    },
    {
      step: '04',
      title: 'Urgent Guidance',
      desc: 'Displays unambiguous prompt to contact local emergency services or proceed to the nearest emergency department.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-200/80 dark:border-rose-900/60 transition-colors" id="safety-interceptor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Clinical Safety Protocol"
          title="When something may be urgent, safety comes first."
          description="Medical AI employs deterministic safety guardrails. When acute red flags are identified, automated intake stops immediately in favor of urgent professional care guidance."
        />

        {/* 4-Step Safety Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {emergencySteps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col justify-between transition-colors"
            >
              <div>
                <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 block mb-2">
                  PHASE {s.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>

              {idx < emergencySteps.length - 1 && (
                <div className="hidden md:flex items-center text-slate-300 dark:text-slate-700 pt-3">
                  <ArrowRight className="w-4 h-4 text-rose-300 dark:text-rose-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Card Box */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border-2 border-rose-300 dark:border-rose-800 shadow-md transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Critical Red Flags That Trigger Immediate Care Alerts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automated parsing detects critical presentations across all language inputs.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono px-3 py-1 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded font-semibold self-start md:self-auto">
              Zero-Tolerance Safety Protocol
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Cardiovascular</span>
              Sudden crushing retrosternal pain radiating to left arm or jaw with diaphoresis.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Neurological</span>
              Sudden unilateral facial droop, arm weakness, or severe expressive aphasia (FAST).
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Respiratory</span>
              Severe stridor, inability to speak full sentences, central cyanosis, or acute choking.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Anaphylaxis</span>
              Sudden lip/tongue angioedema accompanied by wheezing or hives following allergen.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Severe Trauma</span>
              High-velocity kinetic trauma, uncontrolled arterial hemorrhage, or head injury with emesis.
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Altered Mentation</span>
              Acute disorientation, lethargy, sudden unresponsiveness, or refractory seizure activity.
            </div>
          </div>

          {/* Explicit Unambiguous Disclaimer */}
          <div className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-950 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Mandatory Safety Boundary:</strong> Medical AI does not replace emergency medical services or a licensed healthcare professional. Medical AI does not dispatch ambulances or route automatically to hospital trauma bays. If you believe you are experiencing a medical emergency, seek immediate professional help or contact your regional emergency phone service.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
