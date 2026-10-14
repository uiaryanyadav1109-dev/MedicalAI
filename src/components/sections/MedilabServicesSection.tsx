import React from 'react';
import {
  HeartPulse,
  Activity,
  Video,
  ShieldAlert,
  Pill,
  Microscope,
  ArrowRight
} from 'lucide-react';
import { RoutePath } from '../../types';

interface MedilabServicesSectionProps {
  onNavigate?: (route: RoutePath) => void;
  onOpenAssessment?: () => void;
}

const SERVICES = [
  {
    icon: Activity,
    title: 'Rapid AI Preliminary Triage',
    description: 'Algorithmic urgency stratification across 5 acute tiers with emergency red-flag safeguards.',
    route: '/assessment' as RoutePath
  },
  {
    icon: HeartPulse,
    title: 'Cardiopulmonary Intelligence',
    description: 'Instant multi-lead rhythm interpretation, chest pain categorization, and hemodynamics monitoring.',
    route: '/cardiology' as RoutePath
  },
  {
    icon: Video,
    title: 'Tele-Consultation Bridge',
    description: 'Direct secure video link connecting triaged patients with verified on-call specialists.',
    route: '/teleconsultation' as RoutePath
  },
  {
    icon: ShieldAlert,
    title: 'Zero-Tolerance Red-Flag Detection',
    description: 'Immediate detection of stroke, sepsis, anaphylaxis, and acute coronary syndrome with EMS routing.',
    route: '/emergency-redflags' as RoutePath
  },
  {
    icon: Pill,
    title: 'Smart Medication Safety',
    description: 'Comprehensive cross-interaction checks, allergy warnings, dosage titration, and contraindications.',
    route: '/medications' as RoutePath
  },
  {
    icon: Microscope,
    title: 'Diagnostic Lab & Biomarker Interpretation',
    description: 'Decodes complete metabolic panels, CBC, cardiac enzymes, and imaging differentials into plain English.',
    route: '/lab-analysis' as RoutePath
  }
];

export const MedilabServicesSection: React.FC<MedilabServicesSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  return (
    <section id="services" className="py-20 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header in MediLab Style */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[#194376] dark:text-white uppercase tracking-wider text-sm mb-2 text-[#1977cc] dark:text-[#38BDF8]">
            Services
          </h2>
          <p className="text-2xl sm:text-3xl font-bold text-[#194376] dark:text-white">
            Comprehensive Clinical Intelligence Services
          </p>
          <div className="w-16 h-1 bg-[#1977cc] mx-auto my-4 rounded-full" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered to empower patients with immediate clarity and equip clinicians with structured diagnostic telemetry.
          </p>
        </div>

        {/* 3x2 Grid of MediLab Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-xl bg-white dark:bg-[#132238] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1977cc] dark:text-[#38BDF8] flex items-center justify-center mb-6 group-hover:bg-[#1977cc] group-hover:text-white transition-colors duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#194376] dark:text-white group-hover:text-[#1977cc] transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                    {service.description}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (service.route === '/assessment' && onOpenAssessment) {
                        onOpenAssessment();
                      } else if (onNavigate) {
                        onNavigate(service.route);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1977cc] dark:text-[#38BDF8] group-hover:translate-x-1 transition-transform cursor-pointer"
                  >
                    <span>Explore Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MedilabServicesSection;
