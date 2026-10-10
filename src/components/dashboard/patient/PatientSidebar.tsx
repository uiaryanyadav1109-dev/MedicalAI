import React from 'react';
import { RoutePath } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../i18n';
import { ProfileAvatar } from '../../common/ProfileAvatar';
import {
  Activity,
  LayoutDashboard,
  Bot,
  MessageSquareText,
  FileText,
  HeartPulse,
  Pill,
  Clock,
  Compass,
  Stethoscope,
  Share2,
  User,
  Settings,
  LogOut,
  X,
  ShieldCheck,
  CreditCard,
  Users,
  Radio,
  AlertTriangle
} from 'lucide-react';

interface PatientSidebarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSosModal?: () => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  currentRoute,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  onOpenSosModal
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems: { labelKey: string; route: RoutePath; icon: React.ReactNode }[] = [
    { labelKey: 'dashboard.overview', route: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 text-sky-400" /> },
    { labelKey: 'dashboard.aiAssistant', route: '/dashboard/chat', icon: <Bot className="w-4 h-4 text-indigo-400" /> },
    { labelKey: 'dashboard.emergencySos', route: '/dashboard/sos', icon: <Radio className="w-4 h-4 text-rose-500 animate-pulse" /> },
    { labelKey: 'dashboard.digitalCard', route: '/dashboard/patient-card', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
    { labelKey: 'dashboard.emergencyContacts', route: '/dashboard/emergency-contacts', icon: <Users className="w-4 h-4 text-rose-400" /> },
    { labelKey: 'dashboard.startAssessment', route: '/dashboard/consultation', icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { labelKey: 'dashboard.healthRecords', route: '/dashboard/health-records', icon: <FileText className="w-4 h-4 text-teal-400" /> },
    { labelKey: 'dashboard.vitalsIntelligence', route: '/dashboard/vitals', icon: <HeartPulse className="w-4 h-4 text-rose-400" /> },
    { labelKey: 'dashboard.medications', route: '/dashboard/medications', icon: <Pill className="w-4 h-4 text-purple-400" /> },
    { labelKey: 'dashboard.healthTimeline', route: '/dashboard/timeline', icon: <Clock className="w-4 h-4 text-amber-400" /> },
    { labelKey: 'dashboard.triageAssessment', route: '/dashboard/triage', icon: <Compass className="w-4 h-4 text-orange-400" /> },
    { labelKey: 'dashboard.doctorHandoff', route: '/dashboard/doctor-handoff', icon: <Stethoscope className="w-4 h-4 text-cyan-400" /> },
    { labelKey: 'dashboard.shareQr', route: '/dashboard/qr-sharing', icon: <Share2 className="w-4 h-4 text-emerald-400" /> },
    { labelKey: 'settings.privacy', route: '/dashboard/identity-verification', icon: <ShieldCheck className="w-4 h-4 text-sky-400" /> },
    { labelKey: 'settings.profile', route: '/dashboard/profile', icon: <User className="w-4 h-4 text-violet-400" /> },
    { labelKey: 'settings.title', route: '/dashboard/settings', icon: <Settings className="w-4 h-4 text-blue-400" /> }
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs group-hover:bg-blue-700 transition-colors">
            <Activity className="w-4 h-4 text-white" />
          </span>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">MEDICAL AI</span>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
              {t('dashboard.patientPortal')}
            </span>
          </div>
        </button>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label={t('nav.closeMenu')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Patient Profile Badge */}
      <div className="p-3.5 mx-3 my-2.5 bg-slate-800/70 rounded-2xl border border-slate-800 flex items-center gap-3">
        <ProfileAvatar
          name={user?.name || 'Aryan Yadav'}
          imageUrl={user?.profileImageUrl}
          size="sm"
          className="ring-2 ring-slate-700"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">{user?.name || 'Aryan Yadav'}</div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>ID: {user?.patientId || user?.mrn || 'MAI-80429'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{t('dashboard.verifiedSession')}</span>
          </div>
        </div>
      </div>

      {/* Emergency SOS Quick Trigger in Sidebar */}
      {onOpenSosModal && (
        <div className="px-3 pb-1">
          <button
            type="button"
            onClick={onOpenSosModal}
            className="w-full px-3 py-2 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 group"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-200" />
            <span>{t('emergency.sosButton')}</span>
          </button>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto text-xs" aria-label="Patient portal navigation">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors text-left ${
                isActive
                  ? 'bg-slate-800 text-white shadow-xs font-semibold ring-1 ring-blue-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              <span className="truncate">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold tracking-wide">{t('dashboard.patientSovereignty')}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all border border-transparent hover:border-rose-800/60 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>{t('dashboard.signOut')}</span>
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
