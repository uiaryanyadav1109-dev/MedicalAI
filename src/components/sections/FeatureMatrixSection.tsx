import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { FEATURE_MATRIX_ITEMS } from '../../data/features';
import { Check, CheckCircle2 } from 'lucide-react';

export const FeatureMatrixSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200" id="matrix">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Value Matrix"
          title="Designed for patient clarity. Built for clinical utility."
          description="A balanced architecture where every consumer-facing convenience maps directly to structured clinical utility for healthcare professionals."
        />

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700">
                  <th className="py-4 px-6 font-semibold uppercase font-mono tracking-wider text-[11px] w-1/4">
                    Core Capability
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase font-mono tracking-wider text-[11px] w-3/8 text-blue-900">
                    Patient Experience & Clarity
                  </th>
                  <th className="py-4 px-6 font-semibold uppercase font-mono tracking-wider text-[11px] w-3/8 text-slate-900">
                    Clinician & Healthcare Team Impact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FEATURE_MATRIX_ITEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span>{item.feature}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 leading-relaxed">
                      {item.patientBenefit}
                    </td>
                    <td className="py-4 px-6 text-slate-600 leading-relaxed">
                      {item.clinicianBenefit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Standardized data exchange models support HL7 / FHIR compatibility.</span>
          <span className="font-mono text-[11px]">10 Core System Capabilities</span>
        </div>
      </div>
    </section>
  );
};
