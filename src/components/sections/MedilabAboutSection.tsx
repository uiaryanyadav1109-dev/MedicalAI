import React from 'react';
import {
  CheckCircle2,
  Stethoscope,
  ShieldAlert,
  Activity,
  Play
} from 'lucide-react';
import { RoutePath } from '../../types';

interface MedilabAboutSectionProps {
  onNavigate?: (route: RoutePath) => void;
  onOpenAssessment?: () => void;
}

export const MedilabAboutSection: React.FC<MedilabAboutSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-white dark:bg-[#0B1320] transition-colors border-b border-[#DCE6EF] dark:border-[#1E2E47]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Visual with Play Overlay */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80"
                alt="Physician having clinical consultation with patient"
                className="w-full h-[380px] sm:h-[450px] object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 via-transparent to-transparent pointer-events-none" />
              
              {/* MediLab Play Button */}
              <button
                type="button"
                onClick={onOpenAssessment}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#1977cc] hover:bg-[#156cb9] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                aria-label="Start AI consultation"
              >
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Right Column: MediLab About Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1977cc] dark:text-[#38BDF8]">
                About Medical AI
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#194376] dark:text-white tracking-tight mt-1">
                Pioneering Clinical-Grade Preliminary Triage & Physician Collaboration
              </h2>
            </div>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Medical AI connects patients with immediate, protocol-driven preliminary intelligence while streamlining the workflow of attending clinicians. Built on evidence-based triage guidelines, our platform ensures timely identification of acute health risks and seamless physician handoffs.
            </p>

            <ul className="space-y-4 pt-2">
              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1977cc] dark:text-[#38BDF8] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Validated Triage Algorithms
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Evaluates urgency across 5 clinical tiers with automated red-flag triggers for emergency symptoms.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1977cc] dark:text-[#38BDF8] shrink-0 mt-0.5">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Board-Certified Doctor Verification
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Direct integration with practicing physicians, hospital telemetry, and unified Electronic Health Records.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1977cc] dark:text-[#38BDF8] shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Zero-Tolerance Emergency Red-Flag Interceptors
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Immediate local EMS routing and real-time distress dispatch whenever critical presentations are detected.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
