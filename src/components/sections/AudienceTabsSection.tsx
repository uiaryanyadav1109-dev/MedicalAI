import React, { useState } from 'react';
import {
  User,
  Stethoscope,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Bell,
  Languages,
  Share2,
  Clock,
  FileText,
  Users,
  Calendar,
  Lock,
  PhoneCall
} from 'lucide-react';
import { RoutePath } from '../../types';
import { HEALTHCARE_IMAGES } from '../../data/healthcareImages';

interface AudienceTabsSectionProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const AudienceTabsSection: React.FC<AudienceTabsSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'doctors'>('patients');

  return (
    <section
      className="py-20 lg:py-28 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47] transition-colors"
      id="audience"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <span>User Portals</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            Designed for Patients & Clinicians
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 font-normal">
            Purpose-built tools for personal health management and high-efficiency clinical practice.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#F5F9FC] dark:bg-[#111D30] p-1.5 rounded-2xl flex items-center gap-2 border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs">
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-[#1769AA] text-white shadow-md'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#102A43] dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>For Patients</span>
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-[#16865C] text-white shadow-md'
                  : 'text-[#64748B] dark:text-slate-300 hover:text-[#102A43] dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>For Clinicians</span>
            </button>
          </div>
        </div>

        {/* Tab 1: For Patients */}
        {activeTab === 'patients' && (
          <div className="rounded-3xl bg-[#F5F9FC] dark:bg-[#0F172A] p-6 sm:p-8 border border-[#DCE6EF] dark:border-[#1E2E47] shadow-lg transition-all animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Patient Capabilities */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                    Clarity and Peace of Mind for Patients
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
                    Organize symptoms, track medications, and share records securely with your care team.
                  </p>
                </div>

                {/* Patient Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Personal Health Hub</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Centralized vitals, allergy lists, and past consultation history.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Medication Reminders</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Automated schedule alerts with dosage and refill tracking.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#16A6A1] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Encrypted QR Sharing</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Time-limited QR codes for secure check-in with your doctor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Languages className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Multilingual Voice Support</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Natural conversation in English, Hindi (हिंदी), and Bengali (বাংলা).
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">1-Tap Emergency SOS</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Instant distress notification with live location dispatched to designated emergency contacts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onNavigate('/for-patients');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#1769AA] hover:bg-[#102A43] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenAssessment}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1769AA] dark:text-[#38BDF8] bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Try Triage Sandbox
                  </button>
                </div>
              </div>

              {/* Right Column: Authentic Photography */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DCE6EF] dark:border-[#1E2E47]">
                  <img
                    src={HEALTHCARE_IMAGES.patientConsultation.url}
                    alt={HEALTHCARE_IMAGES.patientConsultation.alt}
                    className="w-full h-[400px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                      Patient Experience
                    </span>
                    <h4 className="text-sm font-bold mt-1.5">
                      Informed Consultations
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Arrive at appointments with organized symptoms and prioritized questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: For Doctors */}
        {activeTab === 'doctors' && (
          <div className="rounded-3xl bg-[#F5F9FC] dark:bg-[#0F172A] p-6 sm:p-8 border border-[#DCE6EF] dark:border-[#1E2E47] shadow-lg transition-all animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Doctor Capabilities */}
              <div className="lg:col-span-7 space-y-5 text-left">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                    Clinical Precision for Providers
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mt-1">
                    Streamline intake narratives, prioritize urgent cases, and reduce documentation overhead.
                  </p>
                </div>

                {/* Doctor Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16865C] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Rapid Patient Intake</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Structured chief concerns and symptom duration before rooming.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Medical History Timeline</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Instant access to allergies, chronic diagnoses, and vitals trends.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-[#16A6A1] dark:text-[#2DD4BF] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">1-Page SBAR Summaries</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Standard clinical briefs formatted for fast review and handoffs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Acuity Queue Triage</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Triage-sorted patient queues with live urgency flags and vitals alerts.
                      </p>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47]">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#102A43] dark:text-slate-300 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#102A43] dark:text-white">Audit & Provenance</h4>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                        Explicit timestamps distinguishing AI-assisted intake summaries from clinician notes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onNavigate('/for-doctors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#16865C] hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Clinician Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('/doctor');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#16865C] dark:text-emerald-400 bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    Doctor Dashboard
                  </button>
                </div>
              </div>

              {/* Right Column: Authentic Doctor Photography */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#DCE6EF] dark:border-[#1E2E47]">
                  <img
                    src={HEALTHCARE_IMAGES.doctorSarahChen.url}
                    alt={HEALTHCARE_IMAGES.doctorSarahChen.alt}
                    className="w-full h-[400px] object-cover object-top"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold uppercase tracking-wider">
                      Physician Interface
                    </span>
                    <h4 className="text-sm font-bold mt-1.5">
                      Dr. Sarah Chen, MD · Clinical Triage Lead
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Prioritized patient queues with verified lab panels and SBAR handoffs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AudienceTabsSection;
