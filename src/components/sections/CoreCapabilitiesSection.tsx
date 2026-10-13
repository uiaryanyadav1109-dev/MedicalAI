import React, { useState } from 'react';
import {
  MessageSquareText,
  Activity,
  FileText,
  Calendar,
  Pill,
  AlertTriangle,
  QrCode,
  Mic,
  FolderHeart,
  Stethoscope,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { RoutePath } from '../../types';

interface CoreCapabilitiesSectionProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

interface HealthcareServiceCard {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  bgDark: string;
  route: RoutePath;
  buttonLabel: string;
  badge: string;
}

export const CoreCapabilitiesSection: React.FC<CoreCapabilitiesSectionProps> = ({
  onNavigate,
  onOpenAssessment
}) => {
  const services: HealthcareServiceCard[] = [
    {
      id: 'ai-assistant',
      title: 'AI Health Assistant',
      tagline: 'Conversational intake',
      description: 'Conversational guidance gathering symptom context, duration, and clinical history.',
      icon: MessageSquareText,
      color: '#1769AA',
      bgLight: 'bg-blue-50/70',
      bgDark: 'dark:bg-blue-950/40',
      route: '/chat',
      buttonLabel: 'Launch Assistant',
      badge: 'Interactive'
    },
    {
      id: 'symptom-triage',
      title: 'Symptom Triage',
      tagline: 'Urgency tiering',
      description: 'Scores symptom urgency across 5 clinical severity tiers with red-flag detection.',
      icon: Activity,
      color: '#16A6A1',
      bgLight: 'bg-teal-50/70',
      bgDark: 'dark:bg-teal-950/40',
      route: '/dashboard/triage',
      buttonLabel: 'View Triage',
      badge: 'Clinical Protocol'
    },
    {
      id: 'patient-records',
      title: 'Health Records',
      tagline: 'Medical history',
      description: 'Securely stores chronic conditions, verified allergies, medications, and vitals.',
      icon: FolderHeart,
      color: '#102A43',
      bgLight: 'bg-slate-100/70',
      bgDark: 'dark:bg-slate-800/50',
      route: '/dashboard/health-records',
      buttonLabel: 'Open Records',
      badge: 'Longitudinal'
    },
    {
      id: 'doctor-portal',
      title: 'Doctor Portal',
      tagline: 'Clinical cockpit',
      description: 'Physician triage workspace with patient queues, lab views, and clinical notes.',
      icon: Stethoscope,
      color: '#16865C',
      bgLight: 'bg-emerald-50/70',
      bgDark: 'dark:bg-emerald-950/40',
      route: '/for-doctors',
      buttonLabel: 'Doctor Portal',
      badge: 'Clinician'
    },
    {
      id: 'medicine-reminders',
      title: 'Medicine Reminders',
      tagline: 'Dosage alerts',
      description: 'Manages prescription schedules, dosage alerts, and refill tracking.',
      icon: Pill,
      color: '#8B5CF6',
      bgLight: 'bg-purple-50/70',
      bgDark: 'dark:bg-purple-950/40',
      route: '/dashboard/medications',
      buttonLabel: 'Medications',
      badge: 'Adherence'
    },
    {
      id: 'emergency-sos',
      title: 'Emergency SOS',
      tagline: 'Rapid alert',
      description: 'One-tap distress alert broadcasting location link to emergency contacts.',
      icon: AlertTriangle,
      color: '#DC2626',
      bgLight: 'bg-rose-50/70',
      bgDark: 'dark:bg-rose-950/40',
      route: '/dashboard/emergency-contacts',
      buttonLabel: 'SOS Setup',
      badge: 'Safety'
    },
    {
      id: 'patient-id-qr',
      title: 'Digital Health QR',
      tagline: 'Tokenized sharing',
      description: 'Generates time-limited cryptographic QR codes for consented doctor review.',
      icon: QrCode,
      color: '#0284C7',
      bgLight: 'bg-sky-50/70',
      bgDark: 'dark:bg-sky-950/40',
      route: '/dashboard/patient-card',
      buttonLabel: 'Digital Card',
      badge: 'Encrypted'
    },
    {
      id: 'multilingual-voice',
      title: 'Voice Assistance',
      tagline: 'Multilingual speech',
      description: 'Voice input and accessibility read-aloud in English, Hindi, and Bengali.',
      icon: Mic,
      color: '#D97706',
      bgLight: 'bg-amber-50/70',
      bgDark: 'dark:bg-amber-950/40',
      route: '/how-it-works',
      buttonLabel: 'Voice Tools',
      badge: 'Voice'
    },
    {
      id: 'reports-documents',
      title: 'Lab Report Insights',
      tagline: 'Report translation',
      description: 'Translates lab panels and metabolic markers into clear, plain-language insights.',
      icon: FileText,
      color: '#0D9488',
      bgLight: 'bg-teal-50/70',
      bgDark: 'dark:bg-teal-950/40',
      route: '/dashboard/reports',
      buttonLabel: 'Lab Reports',
      badge: 'Diagnostic'
    },
    {
      id: 'appointment-management',
      title: 'Clinical Handoffs',
      tagline: 'SBAR summary',
      description: 'Summarizes symptom timelines into a structured 1-page clinician brief.',
      icon: Calendar,
      color: '#4F46E5',
      bgLight: 'bg-indigo-50/70',
      bgDark: 'dark:bg-indigo-950/40',
      route: '/dashboard/consultation',
      buttonLabel: 'Handoff Brief',
      badge: 'Continuity'
    }
  ];

  const handleAction = (service: HealthcareServiceCard) => {
    if (service.id === 'ai-assistant') {
      onOpenAssessment();
    } else {
      onNavigate(service.route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-white dark:bg-[#0B1320] border-b border-[#DCE6EF] dark:border-[#1E2E47] transition-colors" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#1769AA] dark:text-[#38BDF8] text-xs font-bold uppercase tracking-wider">
            <span>Essential Platform Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
            Connected Healthcare Tools
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 font-normal">
            Preliminary symptom triage, health records, and clinical collaboration in one platform.
          </p>
        </div>

        {/* 10-Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.id}
                onClick={() => handleAction(service)}
                className="p-4 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-white dark:hover:bg-[#111D30] hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between cursor-pointer group text-left hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${service.bgLight} ${service.bgDark}`}
                      style={{ color: service.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-[#102A43] dark:text-white leading-snug mb-1 group-hover:text-[#1769AA] dark:group-hover:text-[#38BDF8] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-[#1769AA] dark:text-[#38BDF8]">
                  <span>{service.buttonLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoreCapabilitiesSection;
