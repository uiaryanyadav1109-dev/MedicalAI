import React, { useState } from 'react';
import { RoutePath } from '../../../types';
import { DoctorSidebar } from './DoctorSidebar';
import { DoctorHeader } from './DoctorHeader';

// Doctor Views
import { DoctorQueueView } from './views/DoctorQueueView';
import { DoctorPatientReviewView } from './views/DoctorPatientReviewView';
import { DoctorLabReviewView } from './views/DoctorLabReviewView';
import { DoctorHandoffsView } from './views/DoctorHandoffsView';
import { DoctorAnalyticsView } from './views/DoctorAnalyticsView';
import { DoctorProfileView } from './views/DoctorProfileView';
import { DoctorTriageEscalationsView } from './views/DoctorTriageEscalationsView';
import { DoctorClinicalCopilotView } from './views/DoctorClinicalCopilotView';
import { DoctorMedicationManagementView } from './views/DoctorMedicationManagementView';

import { useAuth } from '../../../context/AuthContext';

interface DoctorDashboardPageProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({
  currentRoute,
  onNavigate
}) => {
  const { user, role, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [activeQueueFilter, setActiveQueueFilter] = useState<string>('all');
  const [headerSearchQuery, setHeaderSearchQuery] = useState<string>('');

  if (role !== 'doctor') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🛡️
          </div>
          <h2 className="text-lg font-bold">Unauthorized Clinician View</h2>
          <p className="text-xs text-slate-500">
            This terminal requires authorized physician credentials. Your current account ({user?.email || 'patient'}) is not credentialed as a medical provider.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Go to Patient Portal
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('/login');
              }}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
            >
              Sign Out & Log In as Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (currentRoute) {
      case '/doctor/patients':
      case '/doctor/consultations':
        return (
          <DoctorPatientReviewView
            onNavigate={onNavigate}
            selectedPatientId={selectedPatientId}
          />
        );
      case '/doctor/copilot':
        return (
          <DoctorClinicalCopilotView
            onNavigate={onNavigate}
            selectedPatientId={selectedPatientId}
          />
        );
      case '/doctor/reports':
        return <DoctorLabReviewView onNavigate={onNavigate} />;
      case '/doctor/medications':
        return (
          <DoctorMedicationManagementView
            onNavigate={onNavigate}
            selectedPatientId={selectedPatientId}
          />
        );
      case '/doctor/handoffs':
        return <DoctorHandoffsView onNavigate={onNavigate} />;
      case '/doctor/analytics':
        return <DoctorAnalyticsView onNavigate={onNavigate} />;
      case '/doctor/settings':
        return <DoctorProfileView onNavigate={onNavigate} />;
      case '/doctor/triage':
        return (
          <DoctorTriageEscalationsView
            onNavigate={onNavigate}
            onSelectPatient={(id) => setSelectedPatientId(id)}
          />
        );
      case '/doctor':
      default:
        return (
          <DoctorQueueView
            onNavigate={onNavigate}
            onSelectPatient={(id) => setSelectedPatientId(id)}
            initialFilterTier={activeQueueFilter}
            searchQuery={headerSearchQuery}
          />
        );
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* 1. Dedicated Clinician Sidebar */}
      <DoctorSidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Clinician Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DoctorHeader
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSearchChange={(q) => setHeaderSearchQuery(q)}
          onSelectPatient={(id) => {
            setSelectedPatientId(id);
            onNavigate('/doctor/patients');
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
