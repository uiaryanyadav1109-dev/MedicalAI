import React, { useEffect, useState } from 'react';
import { RoutePath } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { clinicalStore } from '../../../services/clinicalStore';
import {
  Activity,
  Users,
  Stethoscope,
  FileText,
  Clock,
  Compass,
  BarChart3,
  UserCheck,
  LogOut,
  X,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Pill
} from 'lucide-react';

interface DoctorSidebarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  currentRoute,
  onNavigate,
  mobileOpen,
  onCloseMobile
}) => {
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState<{
    emergency: number;
    abnormalLabs: number;
    escalations: number;
    tasks: number;
    totalPatients: number;
    draftOrders: number;
  }>({
    emergency: 0,
    abnormalLabs: 0,
    escalations: 0,
    tasks: 0,
    totalPatients: 0,
    draftOrders: 0
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCounts = async () => {
      try {
        const data = await clinicalStore.fetchDoctorDashboard();
        const orders = clinicalStore.getMedicationOrders();
        const drafts = orders.filter((o) => o.status === 'draft').length;
        if (isMounted && data) {
          setCounts({
            emergency: data.urgentEmergencyCount || 0,
            abnormalLabs: data.abnormalLabsCount || 0,
            escalations: data.emergencyAlertsCount || 0,
            tasks: data.pendingHandoffsCount || 0,
            totalPatients: data.totalActivePatients || 0,
            draftOrders: drafts
          });
        }
      } catch (err) {
        console.error('Failed to load navigation badge counts', err);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems: {
    label: string;
    route: RoutePath;
    icon: React.ReactNode;
    badge?: { count: number; className: string };
  }[] = [
    {
      label: 'Clinical Queue & Triage',
      route: '/doctor',
      icon: <Users className="w-4 h-4 text-blue-400" />,
      badge: counts.emergency > 0
        ? { count: counts.emergency, className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' }
        : undefined
    },
    {
      label: 'Patient Clinical Review',
      route: '/doctor/patients',
      icon: <Stethoscope className="w-4 h-4 text-teal-400" />,
      badge: counts.totalPatients > 0
        ? { count: counts.totalPatients, className: 'bg-slate-800 text-slate-300' }
        : undefined
    },
    {
      label: 'AI Clinical Copilot',
      route: '/doctor/copilot',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      badge: { count: 0, className: '' } // optional
    },
    {
      label: 'Diagnostic Lab Review',
      route: '/doctor/reports',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      badge: counts.abnormalLabs > 0
        ? { count: counts.abnormalLabs, className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' }
        : undefined
    },
    {
      label: 'Medication Management',
      route: '/doctor/medications',
      icon: <Pill className="w-4 h-4 text-cyan-400" />,
      badge: counts.draftOrders > 0
        ? { count: counts.draftOrders, className: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' }
        : undefined
    },
    {
      label: 'Triage Escalations',
      route: '/doctor/triage',
      icon: <Compass className="w-4 h-4 text-rose-400" />,
      badge: counts.escalations > 0
        ? { count: counts.escalations, className: 'bg-rose-600 text-white font-bold animate-pulse' }
        : undefined
    },
    {
      label: 'Patient Handoff Briefs',
      route: '/doctor/handoffs',
      icon: <FileText className="w-4 h-4 text-indigo-400" />,
      badge: counts.tasks > 0
        ? { count: counts.tasks, className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' }
        : undefined
    },
    {
      label: 'Clinical Metrics & Safety',
      route: '/doctor/analytics',
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />
    },
    {
      label: 'Physician Credentials',
      route: '/doctor/settings',
      icon: <UserCheck className="w-4 h-4 text-emerald-400" />
    }
  ];

  const handleNav = (route: RoutePath) => {
    onNavigate(route);
    onCloseMobile();
  };

  const handleSignOut = () => {
    logout();
    onNavigate('/signin');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs group-hover:bg-emerald-500 transition-colors">
            <Activity className="w-4 h-4 text-white" />
          </span>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">MEDICAL AI</span>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
              Clinician EMR
            </span>
          </div>
        </button>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Doctor Profile Badge */}
      <div className="p-4 mx-3 my-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-3">
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.name || 'Doctor'}
            className="w-10 h-10 rounded-lg object-cover border border-emerald-500/40 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            MD
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate" title={user?.name || 'Physician'}>
            {user?.name || 'Dr. Sarah Chen, MD'}
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate" title={user?.specialty || `NPI: ${user?.npi || '1942850192'}`}>
            {user?.specialty || `NPI: ${user?.npi || '1942850192'}`}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>On-Duty Triage</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-xs" aria-label="Doctor portal navigation">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && item.badge.count > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full shrink-0 ${item.badge.className}`}
                >
                  {item.badge.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold tracking-wide">FHIR & HIPAA Audit Active</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-800/60 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-xs h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
