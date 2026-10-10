import React from 'react';
import { ShieldCheck, Lock, Eye, Heart, Stethoscope } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustPillars = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
      title: 'AI-Assisted',
      description: 'Augments understanding without replacing clinician diagnosis'
    },
    {
      icon: <Lock className="w-4 h-4 text-blue-600" />,
      title: 'Privacy-Focused',
      description: 'Patient consent required before any record bundle is shared'
    },
    {
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      title: 'Explainable',
      description: 'Transparent reasoning anchored in standard biological references'
    },
    {
      icon: <Heart className="w-4 h-4 text-blue-600" />,
      title: 'Human-Centered',
      description: 'Prioritizes patient dignity, calm communication, and clarity'
    },
    {
      icon: <Stethoscope className="w-4 h-4 text-blue-600" />,
      title: 'Designed for Clinicians',
      description: 'Converts unstructured narratives into structured intake context'
    }
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-xs font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Architectural Principles
          </p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Built around safety, privacy, and clinical context.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 lg:gap-8">
          {trustPillars.map((pillar, idx) => (
            <div key={idx} className="flex flex-col items-center text-center space-y-2 p-2">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
                {pillar.icon}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{pillar.title}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal max-w-[190px]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
