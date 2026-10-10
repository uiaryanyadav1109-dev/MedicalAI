import React, { useState } from 'react';
import { RoutePath } from '../../../types';
import { PatientSidebar } from './PatientSidebar';
import { PatientHeader } from './PatientHeader';
import { EmergencySosBanner } from './EmergencySosBanner';
import { EmergencySosModal } from '../../interactive/EmergencySosModal';
import { PatientCard } from './PatientCard';
import { MedicalChatLayout } from '../../chatbot/MedicalChatLayout';

// Patient Views
import { PatientOverviewView } from './views/PatientOverviewView';
import { PatientConsultationView } from './views/PatientConsultationView';
import { PatientReportsView } from './views/PatientReportsView';
import { PatientVitalsView } from './views/PatientVitalsView';
import { PatientMedicationsView } from './views/PatientMedicationsView';
import { PatientTimelineView } from './views/PatientTimelineView';
import { PatientTriageView } from './views/PatientTriageView';
import { PatientDoctorHandoffView } from './views/PatientDoctorHandoffView';
import { PatientQrSharingView } from './views/PatientQrSharingView';
import { PatientProfileView } from './views/PatientProfileView';
import { PatientSettingsView } from './views/PatientSettingsView';
import { PatientIdentityVerificationView } from './views/PatientIdentityVerificationView';
import { PatientEmergencyContactsView } from './views/PatientEmergencyContactsView';
import { PatientSosView } from './views/PatientSosView';

interface PatientDashboardPageProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({
  currentRoute,
  onNavigate
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const isChatRoute = currentRoute === '/dashboard/chat';

  const renderActiveView = () => {
    switch (currentRoute) {
      case '/dashboard/chat':
        return (
          <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col bg-white dark:bg-slate-900 transition-colors">
            <MedicalChatLayout onBack={() => onNavigate('/dashboard')} />
          </div>
        );

      case '/dashboard/patient-card':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Digital Patient Identification</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                  Digital Healthcare Patient Card
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Official clinical identifier, blood group registry, and machine-scannable emergency QR barcode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/dashboard/emergency-contacts')}
                  className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                >
                  Emergency Contacts
                </button>
                <button
                  onClick={() => onNavigate('/dashboard/qr-sharing')}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  QR Controls
                </button>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <PatientCard onNavigate={onNavigate} />
            </div>
          </div>
        );

      case '/dashboard/sos':
        return <PatientSosView onNavigate={onNavigate} />;

      case '/dashboard/emergency-contacts':
        return <PatientEmergencyContactsView onNavigate={onNavigate} />;

      case '/dashboard/consultation':
        return <PatientConsultationView />;

      case '/dashboard/health-records':
      case '/dashboard/reports':
        return <PatientReportsView onNavigate={onNavigate} />;

      case '/dashboard/vitals':
        return <PatientVitalsView onNavigate={onNavigate} />;

      case '/dashboard/medications':
        return <PatientMedicationsView onNavigate={onNavigate} />;

      case '/dashboard/timeline':
        return <PatientTimelineView onNavigate={onNavigate} />;

      case '/dashboard/triage':
        return <PatientTriageView onNavigate={onNavigate} />;

      case '/dashboard/doctor-handoff':
        return <PatientDoctorHandoffView onNavigate={onNavigate} />;

      case '/dashboard/qr-sharing':
        return <PatientQrSharingView onNavigate={onNavigate} />;

      case '/dashboard/profile':
        return <PatientProfileView onNavigate={onNavigate} />;

      case '/dashboard/settings':
        return <PatientSettingsView onNavigate={onNavigate} />;

      case '/dashboard/identity-verification':
        return <PatientIdentityVerificationView onNavigate={onNavigate} />;

      case '/dashboard':
      default:
        return (
          <PatientOverviewView
            onNavigate={onNavigate}
            onOpenSosModal={() => setIsSosModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
      {/* 1. Dedicated Patient Sidebar */}
      <PatientSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <PatientHeader
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSosModal={() => setIsSosModalOpen(true)}
        />

        <main
          className={`flex-1 w-full max-w-7xl mx-auto ${
            isChatRoute
              ? 'p-2 sm:p-4 lg:p-6 flex flex-col h-[calc(100vh-4.5rem)] overflow-hidden'
              : 'p-4 sm:p-6 lg:p-8 space-y-6'
          }`}
        >
          {/* Emergency SOS Active Alert Bar (shown on standard pages) */}
          {!isChatRoute && <EmergencySosBanner onOpenSosModal={() => setIsSosModalOpen(true)} />}

          {/* Active View Component */}
          {renderActiveView()}
        </main>
      </div>

      {/* Emergency SOS Modal (Broadcast Protocol) */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onNavigateToContacts={() => onNavigate('/dashboard/emergency-contacts')}
      />
    </div>
  );
};
