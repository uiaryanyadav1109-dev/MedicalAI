import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { BookOpen, CheckCircle, Database, ShieldAlert, Award } from 'lucide-react';

export const EvidenceSection: React.FC = () => {
  const sources = [
    {
      title: 'Peer-Reviewed Clinical Ontologies',
      description: 'Grounded in established anatomical taxonomies and standardized nomenclature such as SNOMED CT and LOINC laboratory codes.'
    },
    {
      title: 'Public Health Reference Guidelines',
      description: 'Aligned with published public health advisory guidelines for triage timing and preventive health screenings.'
    },
    {
      title: 'Biological Laboratory Intervals',
      description: 'Standardized analyte intervals referencing consensus clinical reference ranges (e.g. CBC, Metabolic, Lipid panels).'
    },
    {
      title: 'Red-Flag Symptom Registers',
      description: 'Emergency protocols synthesized from international acute care and emergency medicine triage standards.'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-200" id="evidence">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Knowledge Grounding"
          title="Built to work with trusted health information."
          description="Medical AI does not generate medical claims in a vacuum. The clinical engine is grounded in established medical taxonomies and verified clinical references."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{src.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{src.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] font-mono text-slate-500">
                Verified Category
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-100 rounded-xl p-5 text-xs text-slate-600 flex items-start gap-3 border border-slate-200">
          <ShieldAlert className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency Notice:</strong> While the platform is grounded in verified clinical guidelines and references, software inferences cannot substitute for independent clinical judgment by a licensed medical provider. We do not claim automated universal verification of every conversational utterance.
          </p>
        </div>
      </div>
    </section>
  );
};
