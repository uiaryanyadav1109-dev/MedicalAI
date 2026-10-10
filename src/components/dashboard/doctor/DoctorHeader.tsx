import React, { useState, useEffect, useRef } from 'react';
import { RoutePath, PatientRecord } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { clinicalStore } from '../../../services/clinicalStore';
import { ThemeToggle } from '../../common/ThemeToggle';
import { LanguageSelector } from '../../common/LanguageSelector';
import { useLanguage } from '../../../i18n';
import {
  Menu,
  Bell,
  Search,
  User,
  Activity,
  AlertTriangle,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ArrowRight,
  Clock
} from 'lucide-react';

interface DoctorHeaderProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  onOpenMobileSidebar: () => void;
  onSearchChange?: (query: string) => void;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenMobileSidebar,
  onSearchChange,
  onSelectPatient
}) => {
  const { user, loginAsDemo } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [matchingPatients, setMatchingPatients] = useState<PatientRecord[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clinicalStore.fetchDoctorDashboard().then((data) => {
      if (data) setDashboardData(data);
    });
  }, [currentRoute]);

  const getPageTitle = (route: RoutePath) => {
    switch (route) {
      case '/doctor':
        return 'Incoming Clinical Queue & Triage Stratification';
      case '/doctor/patients':
        return 'Patient Clinical Evaluation & Assessment';
      case '/doctor/reports':
        return 'Diagnostic Laboratory & Imaging Review';
      case '/doctor/triage':
        return 'Triage Escalations & Protocol Audits';
      case '/doctor/handoffs':
        return 'Pre-Encounter Patient Handoffs & Clinical Tasks';
      case '/doctor/analytics':
        return 'Clinical Workflow Metrics & Safety';
      case '/doctor/settings':
        return 'Physician Credentials & EMR Integration';
      default:
        return 'Clinician EMR Portal';
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (onSearchChange) onSearchChange(val);

    if (val.trim().length > 0) {
      const q = val.toLowerCase().trim();
      const results = clinicalStore
        .getPatients()
        .filter((p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q));
      setMatchingPatients(results);
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  };

  const handleSelectPatientResult = (patientId: string) => {
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
    setShowSearchDropdown(false);
    setSearch('');
  };

  const emergencyAlertCount = Math.max(
    dashboardData?.emergencyAlertsCount || 0,
    dashboardData?.urgencyCounts?.emergency || 0,
    clinicalStore.getPatients().filter((p) => p.triageStatus === 'emergency').length
  );

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {getPageTitle(currentRoute)}
            </h1>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>{user?.hospitalAffiliation || 'Metro Clinical Reference Center'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Internal Medicine & Triage
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Alert Shortcut Badge if any critical escalations exist */}
          {emergencyAlertCount > 0 && (
            <button
              onClick={() => onNavigate('/doctor/triage')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-xs transition-colors animate-pulse"
              title="Open Emergency Triage Escalations"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{emergencyAlertCount} CRITICAL ALERT</span>
            </button>
          )}

          {/* Search by MRN or Name with Autocomplete Dropdown */}
          <div className="hidden md:flex items-center relative w-48 lg:w-64" ref={dropdownRef}>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => {
                if (search.trim().length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search MRN or Name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 transition-colors"
            />

            {/* Suggestions Dropdown */}
            {showSearchDropdown && matchingPatients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase border-b border-slate-100 dark:border-slate-800">
                  Matching Patients ({matchingPatients.length})
                </div>
                {matchingPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatientResult(p.id)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">MRN: {p.mrn} · {p.triageStatus}</div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Role Switcher for testing */}
          <button
            onClick={() => {
              loginAsDemo('patient');
              onNavigate('/dashboard');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Switch to Patient Dashboard view"
          >
            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Patient Portal</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector variant="compact" />

          {/* Theme Toggle */}
          <ThemeToggle variant="icon" />

          {/* Clinical Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative focus:outline-none transition-colors"
              aria-label="Clinician alerts"
            >
              <Bell className="w-4 h-4" />
              {(dashboardData?.pendingTasksCount > 0 || emergencyAlertCount > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-84 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Clinical Queue Alerts</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                    {dashboardData?.pendingTasksCount || 3} Tasks Pending
                  </span>
                </div>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {emergencyAlertCount > 0 && (
                    <div
                      onClick={() => {
                        setShowNotifications(false);
                        onNavigate('/doctor/triage');
                      }}
                      className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                    >
                      <div className="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                        <Flame className="w-3 h-3 text-rose-600" />
                        <span>Emergency STEMI Escalation</span>
                      </div>
                      <div className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
                        Priya Sharma: Acute chest pain with cold sweat.
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('/doctor/reports');
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Abnormal Diagnostic Lab Released
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Fasting Glucose 104 mg/dL requires physician sign-off.
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('/doctor/handoffs');
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Pre-Consultation Handoff Received
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Aryan Yadav transmitted tension headache brief & ambulatory BP.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clinician Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              SC
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || 'Dr. Sarah Chen, MD'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

