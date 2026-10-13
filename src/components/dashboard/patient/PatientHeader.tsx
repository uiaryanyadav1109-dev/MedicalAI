import React, { useState } from 'react';
import { RoutePath } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { ProfileAvatar } from '../../common/ProfileAvatar';
import { ThemeToggle } from '../../common/ThemeToggle';
import { LanguageSelector } from '../../common/LanguageSelector';
import { useLanguage } from '../../../i18n';
import {
  Menu,
  Bell,
  AlertTriangle,
  Stethoscope,
  LogOut,
  ShieldCheck,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

interface PatientHeaderProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  onOpenMobileSidebar: () => void;
  onOpenSosModal?: () => void;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenMobileSidebar,
  onOpenSosModal
}) => {
  const { user, logout, loginAsDemo } = useAuth();
  const { t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const getPageTitle = (route: RoutePath) => {
    switch (route) {
      case '/dashboard':
        return t('dashboard.overview');
      case '/dashboard/patient-card':
        return t('dashboard.digitalCard');
      case '/dashboard/emergency-contacts':
        return t('dashboard.emergencyContacts');
      case '/dashboard/consultation':
        return t('dashboard.startAssessment');
      case '/dashboard/health-records':
        return t('dashboard.healthRecords');
      case '/dashboard/reports':
        return t('reports.title');
      case '/dashboard/vitals':
        return t('vitals.bloodPressure') + ' & ' + t('dashboard.vitalsIntelligence');
      case '/dashboard/medications':
        return t('medications.title');
      case '/dashboard/timeline':
        return t('dashboard.healthTimeline');
      case '/dashboard/triage':
        return t('triage.title');
      case '/dashboard/doctor-handoff':
        return t('handoff.title');
      case '/dashboard/qr-sharing':
        return 'Patient Health Pass & QR Controls';
      case '/dashboard/data-access-requests':
        return 'Data Access Requests & Consent';
      case '/dashboard/settings':
        return t('settings.title');
      default:
        return t('dashboard.patientPortal');
    }
  };

  const notifications = [
    { id: 1, title: 'Lab Panel Analyzed', desc: 'Complete Blood Count ready for review.', time: '2 hours ago' },
    { id: 2, title: 'Clinician Reviewed Handoff', desc: 'Dr. Sarah Chen reviewed your pre-consultation note.', time: 'Yesterday' }
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Aryan';

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors shadow-2xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white leading-tight">
                {getPageTitle(currentRoute)}
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-medium text-slate-400 dark:text-slate-500">
                · {getGreeting()}, {firstName}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              <span>{currentDateFormatted}</span>
              <span aria-hidden="true">·</span>
              <span>{t('dashboard.patientId')}: {user?.patientId || user?.mrn || 'MAI-80429'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{t('dashboard.verifiedSession')}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <LanguageSelector variant="compact" />

          {/* Theme Toggle */}
          <ThemeToggle variant="icon" />

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative focus:outline-none transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-medical-blue animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#0E1A2D] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-heading font-bold text-slate-900 dark:text-white">Clinical Notifications</span>
                  <span className="text-[10px] text-medical-blue dark:text-teal-400 font-semibold">2 New</span>
                </div>
                <div className="space-y-1.5">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px]">{n.desc}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip with Genuine Profile Avatar */}
          <button
            onClick={() => onNavigate('/dashboard/profile')}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 group text-left transition-colors"
            title="View Profile and Digital Patient Card"
          >
            <ProfileAvatar
              name={user?.name || 'Aryan Yadav'}
              imageUrl={user?.profileImageUrl}
              size="sm"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-medical-blue dark:group-hover:text-teal-400 block transition-colors leading-tight truncate max-w-[110px]">
                {user?.name || 'Aryan Yadav'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                {user?.bloodGroup || user?.bloodType || 'O+'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Emergency Guidance Modal */}
      {showEmergencyModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#0E1A2D] rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-300 dark:border-rose-900/60 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">Emergency Care Protocols</h3>
                  <p className="text-xs text-rose-800 dark:text-rose-400 font-medium">Deterministic Safety Policy</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Medical AI provides AI-assisted clinical context and preliminary triage. <strong>It cannot diagnose emergencies or dispatch first responders.</strong>
              </p>
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1.5 text-rose-950 dark:text-rose-200 font-medium">
                <span>Immediately seek emergency medical care or call local emergency services if you experience:</span>
                <ul className="list-disc list-inside text-rose-900 dark:text-rose-300 text-xs space-y-1 pt-1">
                  <li>Sudden crushing chest pressure radiating to arm or jaw</li>
                  <li>Facial droop, arm weakness, or slurred speech (FAST signs)</li>
                  <li>Acute severe shortness of breath or cyanosis (blue lips)</li>
                  <li>Sudden thunderclap headache or loss of consciousness</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-medical-blue hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
