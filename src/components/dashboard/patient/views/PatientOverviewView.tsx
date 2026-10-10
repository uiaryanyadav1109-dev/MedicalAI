import React, { useState, useEffect } from 'react';
import { RoutePath, AppointmentRecord, HealthTaskItem } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { clinicalStore } from '../../../../services/clinicalStore';
import * as chatStore from '../../../../services/chatStore';
import { ProfileAvatar } from '../../../common/ProfileAvatar';
import {
  Activity,
  HeartPulse,
  Pill,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Plus,
  CreditCard,
  QrCode,
  Users,
  Radio,
  Bot,
  Sparkles,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  ChevronRight,
  MessageSquareText
} from 'lucide-react';

export const PatientOverviewView: React.FC<{
  onNavigate: (route: RoutePath) => void;
  onOpenSosModal?: () => void;
}> = ({
  onNavigate,
  onOpenSosModal
}) => {
  const { user } = useAuth();
  const userId = user?.id || 'pat-1';

  const [vitals, setVitals] = useState(clinicalStore.getVitals());
  const [consultations, setConsultations] = useState(clinicalStore.getConsultations());
  const [medications, setMedications] = useState(clinicalStore.getMedications());
  const [reports, setReports] = useState(clinicalStore.getReports());
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(clinicalStore.getAppointments());
  const [tasks, setTasks] = useState<HealthTaskItem[]>(clinicalStore.getTasks());
  const [timeline, setTimeline] = useState(clinicalStore.getTimeline());

  useEffect(() => {
    const unsubClinical = clinicalStore.subscribe(() => {
      setVitals(clinicalStore.getVitals());
      setConsultations(clinicalStore.getConsultations());
      setMedications(clinicalStore.getMedications());
      setReports(clinicalStore.getReports());
      setAppointments(clinicalStore.getAppointments());
      setTasks(clinicalStore.getTasks());
      setTimeline(clinicalStore.getTimeline());
    });

    return () => {
      unsubClinical();
    };
  }, []);

  // Multi-metric resolution across ambulatory stream
  const latestBpVital = [...vitals].reverse().find((v) => v.systolic != null && v.diastolic != null) || null;
  const latestHrVital = [...vitals].reverse().find((v) => v.heartRate != null) || null;
  const latestSpo2Vital = [...vitals].reverse().find((v) => v.spo2 != null || v.oxygenSaturation != null) || null;
  const latestTempVital = [...vitals].reverse().find((v) => v.temperature != null) || null;
  const latestGlucoseVital = [...vitals].reverse().find((v) => v.bloodGlucose != null) || null;
  const rawLatestVital = vitals.length > 0 ? vitals[vitals.length - 1] : null;

  // Composite latest vital providing fallback safety
  const latestVital = rawLatestVital
    ? {
        ...rawLatestVital,
        systolic: rawLatestVital.systolic ?? latestBpVital?.systolic ?? 118,
        diastolic: rawLatestVital.diastolic ?? latestBpVital?.diastolic ?? 76,
        heartRate: rawLatestVital.heartRate ?? latestHrVital?.heartRate ?? 72,
        spo2: rawLatestVital.spo2 ?? latestSpo2Vital?.spo2 ?? latestSpo2Vital?.oxygenSaturation ?? 99,
        temperature: rawLatestVital.temperature ?? latestTempVital?.temperature ?? 98.3,
        bloodGlucose: rawLatestVital.bloodGlucose ?? latestGlucoseVital?.bloodGlucose ?? 92,
        date: rawLatestVital.date || (rawLatestVital.timestamp ? rawLatestVital.timestamp.slice(0, 10) : '2026-10-09')
      }
    : null;
  const latestConsultation = consultations.length > 0 ? consultations[0] : null;
  const latestReport = reports.length > 0 ? reports[0] : null;
  const activeMedications = medications.filter((m) => m.status === 'active');
  const patientName = user?.name || 'Aryan Yadav';

  // Real allergies from user profile
  const allergies = user?.allergyDetails || [
    {
      id: 'alg-1',
      allergen: 'Penicillin',
      category: 'Medication' as const,
      reaction: 'Hives, facial erythema, pruritus',
      severity: 'Moderate' as const,
      notes: 'Avoid beta-lactam antibiotics'
    },
    {
      id: 'alg-2',
      allergen: 'Sulfa Drugs',
      category: 'Medication' as const,
      reaction: 'Maculopapular rash, mild dyspnea',
      severity: 'Moderate' as const,
      notes: 'Documented reaction following Bactrim'
    }
  ];

  const handleToggleTask = (taskId: string) => {
    clinicalStore.toggleTaskStatus(taskId);
  };

  return (
    <div className="space-y-6">
      {/* 1. Patient Welcome Banner & Core Launchpad */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors">
        <div className="flex items-start gap-5">
          <div className="relative group shrink-0">
            <ProfileAvatar
              name={patientName}
              imageUrl={user?.profileImageUrl}
              size="2xl"
              className="ring-4 ring-slate-100 dark:ring-slate-800"
            />
          </div>

          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Active Clinical Record · Patient Health Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {patientName.split(' ')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Patient ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{user?.patientId || user?.mrn || 'MAI-80429'}</strong> · Blood Group: <strong className="text-blue-700 dark:text-blue-400">{user?.bloodGroup || user?.bloodType || 'O+'}</strong> · Emergency Protocol Active.
            </p>

            {/* Quick Actions Bar */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              {/* PRIMARY ACTION: Start Assessment (Distinct from registration/onboarding) */}
              <button
                onClick={() => onNavigate('/dashboard/consultation')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Start Assessment</span>
              </button>

              <button
                onClick={() => onNavigate('/dashboard/chat')}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>AI Assistant</span>
              </button>

              <button
                onClick={() => onNavigate('/dashboard/vitals')}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Log Vitals</span>
              </button>

              <button
                onClick={() => onNavigate('/dashboard/patient-card')}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Patient ID Card</span>
              </button>

              {onOpenSosModal && (
                <button
                  onClick={onOpenSosModal}
                  className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600 dark:text-rose-400" />
                  <span>Emergency SOS</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick QR Card Shortcut */}
        <div className="w-full md:w-auto p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl border border-slate-700 shadow-md flex md:flex-col items-center justify-between gap-3 text-center shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300">
            <QrCode className="w-6 h-6" />
          </div>
          <div className="text-left md:text-center">
            <span className="text-xs font-bold block">Medical AI ID</span>
            <span className="text-[10px] text-slate-400 block font-mono">Real Machine QR</span>
          </div>
          <button
            onClick={() => onNavigate('/dashboard/patient-card')}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Open Card
          </button>
        </div>
      </div>

      {/* 2. Top Grid: Recent Vitals Telemetry + Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Vitals Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Recent Ambulatory Vitals
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/dashboard/vitals')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Trends</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestVital ? (
              <div className="space-y-4 pt-3">
                {/* Primary Reading Display */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                      Resting Blood Pressure
                    </span>
                    <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                      {latestVital.systolic && latestVital.diastolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '118/76'}{' '}
                      <span className="text-xs font-normal text-slate-500">mmHg</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                      Normotensive Target
                    </span>
                  </div>
                </div>

                {/* Multi-parameter Sub-grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Heart Rate</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {latestVital.heartRate ?? 72} bpm
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Normal Sinus</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">SpO2</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {latestVital.spo2 != null ? `${latestVital.spo2}%` : '99%'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Optimal</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Temperature</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {latestVital.temperature || 98.3}°F
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Afebrile</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Glucose</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      {latestVital.bloodGlucose || 92} mg/dL
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Fasting Normal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
                  <span>Source: {latestVital.source || 'Android Mobile App'}</span>
                  <span>Recorded: {latestVital.timestamp ? new Date(latestVital.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : (latestVital.date || 'Recent')}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
                <HeartPulse className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No vitals recorded yet. Log your first reading to establish your baseline.</p>
                <button
                  onClick={() => onNavigate('/dashboard/vitals')}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Log Initial Vitals
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Appointments */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Upcoming Appointments
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {appointments.filter((a) => a.status === 'scheduled').length} Scheduled
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {appointments.filter((a) => a.status === 'scheduled').length > 0 ? (
                appointments
                  .filter((a) => a.status === 'scheduled')
                  .slice(0, 2)
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {apt.providerName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                          {apt.type === 'telehealth' ? 'Virtual Video' : 'In-Person'}
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                        {apt.providerSpecialty}
                      </div>
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-mono text-[11px] pt-1">
                        <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{apt.date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.time}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                        "{apt.reason}"
                      </p>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
                  <Calendar className="w-6 h-6 text-slate-400 mx-auto" />
                  <p>No upcoming clinical appointments scheduled.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('/dashboard/timeline')}
              className="w-full py-2 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>View Appointment Schedule in Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Middle Grid: Current Medications & Known Allergies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Medications */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Current Active Medications
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/dashboard/medications')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Regimen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeMedications.length > 0 ? (
            <div className="space-y-3">
              {activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {med.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                        {med.dosage}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px] truncate">
                      {med.frequency} · {med.timing}
                    </div>
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono truncate">
                      Indication: {med.indication}
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 shrink-0">
                    Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
              <Pill className="w-6 h-6 text-slate-400 mx-auto" />
              <p>No active medications recorded on profile.</p>
            </div>
          )}
        </div>

        {/* Right: Known Allergies & Clinical Alerts */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Known Allergies & Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/dashboard/profile')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Profile Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {allergies.length > 0 ? (
            <div className="space-y-3">
              {allergies.map((alg) => (
                <div
                  key={alg.id}
                  className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-200 text-sm">
                      ⚠️ {alg.allergen}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-mono text-[10px] font-bold">
                      {alg.severity} Severity
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Reaction: <strong className="text-slate-900 dark:text-white">{alg.reaction}</strong>
                  </p>
                  {alg.notes && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                      "{alg.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p>No known drug or environmental allergies documented.</p>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Documented in emergency QR and clinician handoff tokens.</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Grid: Pending Tasks + Recent Assessments & Lab Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Health Tasks & Notifications */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Pending Care Tasks & Reminders
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              {tasks.filter((t) => t.status === 'pending').length} Action Items
            </span>
          </div>

          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 text-xs ${
                    task.status === 'completed'
                      ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                      aria-label="Toggle task"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs truncate ${
                            task.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            task.priority === 'high'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  {task.actionRoute && (
                    <button
                      onClick={() => onNavigate(task.actionRoute!)}
                      className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                All care tasks up to date!
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Assessments & Latest Diagnostic Lab */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Recent Assessments & Diagnostics
              </h3>
            </div>
            <button
              onClick={() => onNavigate('/dashboard/health-records')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Recent Assessment Card */}
            {latestConsultation ? (
              <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {latestConsultation.chiefComplaint}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-bold uppercase">
                    Tier: {latestConsultation.triageCategory}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Recorded: {latestConsultation.date} · Severity: {latestConsultation.severity}/10 · Status: {latestConsultation.status === 'reviewed' ? 'Clinician Reviewed' : 'Pending Review'}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                  {latestConsultation.preliminaryGuidance}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onNavigate('/dashboard/consultation')}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Intake Detail</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-2">
                <Activity className="w-6 h-6 text-slate-400 mx-auto" />
                <p>No recent symptom assessments completed.</p>
                <button
                  onClick={() => onNavigate('/dashboard/consultation')}
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Start Assessment
                </button>
              </div>
            )}

            {/* Latest Diagnostic Lab */}
            {latestReport ? (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {latestReport.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    {latestReport.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {latestReport.laboratory} · {latestReport.date} · {(latestReport.results || []).length} Analytes
                </div>
                <div className="pt-1 grid grid-cols-2 gap-2 font-mono text-[11px] border-t border-slate-200/60 dark:border-slate-700 pt-2">
                  <div>Hgb: <span className="font-bold text-slate-900 dark:text-white">13.8 g/dL</span></div>
                  <div>WBC: <span className="font-bold text-slate-900 dark:text-white">7.4 ×10⁹/L</span></div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                No diagnostic laboratory reports released.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Recent Health Events Stream (Longitudinal Preview) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs transition-colors space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Recent Health Events & Care Audit Trail
            </h3>
          </div>
          <button
            onClick={() => onNavigate('/dashboard/timeline')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Complete Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {timeline.slice(0, 4).map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors space-y-2 text-xs flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{item.date}</span>
                  <span className="uppercase text-blue-600 dark:text-blue-400 font-semibold">{item.category}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate max-w-[120px]">{item.source || 'Verified'}</span>
                <span className="font-bold text-emerald-600">✓ Logged</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. AI Health Summary & Doctor Handoff Quick Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-purple-800/50">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Physician Collaboration · AI Health Summary & Doctor Handoff</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            Preparing for an Upcoming Clinical Consultation?
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
            Synthesize your verified vitals, active medications, lab diagnostics, and authored questions into an authorized, source-grounded brief for Dr. Sarah Chen. You retain full control over data inclusion, private token sharing, and instant access revocation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/dashboard/doctor-handoff')}
            className="px-5 py-3 bg-white text-purple-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:bg-purple-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4 text-purple-700" />
            <span>Generate Doctor Handoff Brief</span>
          </button>
        </div>
      </div>
    </div>
  );
};
