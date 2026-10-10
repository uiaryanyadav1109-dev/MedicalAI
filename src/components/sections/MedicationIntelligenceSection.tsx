import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { Pill, Clock, AlertCircle, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const MedicationIntelligenceSection: React.FC = () => {
  const sampleMeds = [
    {
      name: 'Lisinopril',
      indication: 'Cardiovascular Support (Demo)',
      dosage: '10 mg',
      frequency: 'Once daily',
      schedule: '08:00 AM · Morning with water',
      prescribingContext: 'Primary Care Physician',
      foodNotes: 'Consistent food intake; avoid high-potassium supplements without advice'
    },
    {
      name: 'Metformin HCl',
      indication: 'Metabolic Balance (Demo)',
      dosage: '500 mg',
      frequency: 'Twice daily',
      schedule: '08:00 AM & 07:00 PM',
      prescribingContext: 'Endocrinology Clinic',
      foodNotes: 'Administer with or immediately after meals to reduce GI upset'
    },
    {
      name: 'Vitamin D3 (Cholecalciferol)',
      indication: 'Nutritional Supplement (Demo)',
      dosage: '2,000 IU',
      frequency: 'Once daily',
      schedule: '12:00 PM · Lunchtime',
      prescribingContext: 'Self-reported Routine',
      foodNotes: 'Fat-soluble; optimal absorption when taken with dietary fats'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-b border-slate-200" id="medications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Therapy Management"
          title="Medication Intelligence"
          description="Keep your prescribed pharmaceutical regimens organized, understand food interactions, and prepare reconciled medication lists for clinic appointments."
        />

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Active Regimen Schedule (Demonstration Roster)</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
              Reconciled: March 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {sampleMeds.map((med, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Therapy #{idx + 1}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{med.name}</h4>
                  <div className="text-xs text-slate-500">{med.indication}</div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dosage</span>
                      <span className="font-semibold font-mono text-slate-800">{med.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frequency</span>
                      <span className="text-slate-800">{med.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule</span>
                      <span className="text-slate-800 font-mono text-[11px]">{med.schedule}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded">
                  <span className="font-medium text-slate-700 block mb-0.5">Instructional Context:</span>
                  {med.foodNotes}
                </div>
              </div>
            ))}
          </div>

          {/* Strict Non-Prescribing Safety Disclaimer */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Explicit Clinical Boundary:</strong> Medical AI does not prescribe, adjust, discontinue, or recommend medication dosages. All pharmacological modifications must be supervised and prescribed exclusively by your licensed medical doctor.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
