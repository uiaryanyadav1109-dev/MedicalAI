/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoutePath } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MedicalDisclaimerBanner } from './components/layout/MedicalDisclaimerBanner';
import { AssessmentDemoModal } from './components/interactive/AssessmentDemoModal';
import { DownloadAppModal } from './components/interactive/DownloadAppModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Stethoscope } from 'lucide-react';

// Dedicated Protected Dashboards
import { PatientDashboardPage } from './components/dashboard/patient/PatientDashboardPage';
import { DoctorDashboardPage } from './components/dashboard/doctor/DoctorDashboardPage';

// Main Website Pages
import { HomePage } from './components/pages/HomePage';
import { PlatformPage } from './components/pages/PlatformPage';
import { FeaturesPage } from './components/pages/FeaturesPage';
import { HowItWorksPage } from './components/pages/HowItWorksPage';
import { SafetyPage } from './components/pages/SafetyPage';
import { ForPatientsPage } from './components/pages/ForPatientsPage';
import { ForDoctorsPage } from './components/pages/ForDoctorsPage';
import { SecurityPage } from './components/pages/SecurityPage';
import { ResourcesPage } from './components/pages/ResourcesPage';
import { FaqPage } from './components/pages/FaqPage';
import { ContactPage } from './components/pages/ContactPage';
import { AboutPage } from './components/pages/AboutPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TermsPage } from './components/pages/TermsPage';
import { MedicalDisclaimerPage } from './components/pages/MedicalDisclaimerPage';

// Redesigned Dedicated Authentication Pages
import { LoginPage } from './components/pages/LoginPage';
import { SignupPage } from './components/pages/SignupPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { VerifyEmailPage } from './components/pages/VerifyEmailPage';

// Public Machine-Scannable QR Destination Page
import { QrScanSharePage } from './components/pages/QrScanSharePage';

// Emergency SOS Lock-Screen & Hardware Bypass Modal & Service
import { EmergencySosCountdownModal } from './components/interactive/EmergencySosCountdownModal';
import { sosManager } from './services/sosManager';

function AppContent() {
  const { isAuthenticated, role, user, logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<RoutePath>(() => {
    try {
      const p = window.location.pathname;
      return p && (p.startsWith('/share') || p.startsWith('/dashboard') || p.startsWith('/doctor')) ? p : '/';
    } catch {
      return '/';
    }
  });
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Check for immediate emergency SOS triggers bypassing all auth
  useEffect(() => {
    sosManager.checkUrlDeepLinkTrigger();
    if (window.location.hash === '#download-app') {
      setIsDownloadModalOpen(true);
    }
  }, []);

  // List of valid routes for popstate sync
  const validRoutes: RoutePath[] = [
    '/',
    '/chat',
    '/platform',
    '/features',
    '/how-it-works',
    '/safety',
    '/for-patients',
    '/for-doctors',
    '/security',
    '/resources',
    '/faq',
    '/contact',
    '/about',
    '/privacy',
    '/terms',
    '/medical-disclaimer',
    '/signin',
    '/login',
    '/signup',
    '/onboarding',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    // Patient Dashboard routes
    '/dashboard',
    '/dashboard/chat',
    '/dashboard/patient-card',
    '/dashboard/emergency-contacts',
    '/dashboard/consultation',
    '/dashboard/health-records',
    '/dashboard/reports',
    '/dashboard/vitals',
    '/dashboard/medications',
    '/dashboard/timeline',
    '/dashboard/triage',
    '/dashboard/doctor-handoff',
    '/dashboard/qr-sharing',
    '/dashboard/data-access-requests',
    '/dashboard/profile',
    '/dashboard/settings',
    // Doctor Dashboard routes
    '/doctor',
    '/doctor/patients',
    '/doctor/consultations',
    '/doctor/reports',
    '/doctor/triage',
    '/doctor/handoffs',
    '/doctor/analytics',
    '/doctor/settings'
  ];

  const navigateTo = (route: RoutePath, replace = false) => {
    if (route === currentRoute) return;
    setCurrentRoute(route);
    try {
      if (replace) {
        window.history.replaceState({}, '', route);
      } else {
        window.history.pushState({}, '', route);
      }
    } catch {
      // safe fallback if sandbox disallows pushState
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enforce authentication guards: protect /dashboard, /doctor, and redirect /chat
  useEffect(() => {
    if (currentRoute === '/chat') {
      if (isAuthenticated) {
        navigateTo('/dashboard/chat', true);
      } else {
        navigateTo('/login', true);
      }
    } else if (
      (currentRoute.startsWith('/dashboard') || currentRoute.startsWith('/doctor')) &&
      !isAuthenticated
    ) {
      try {
        sessionStorage.setItem('medical_ai_intended_route', currentRoute);
      } catch {
        // storage quota safety
      }
      navigateTo('/login', true);
    }
  }, [currentRoute, isAuthenticated]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = (window.location.pathname as RoutePath) || '/';
      if (validRoutes.includes(path) || path.startsWith('/share')) {
        setCurrentRoute(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isShareRoute = currentRoute.startsWith('/share');
  const isPatientDashboard = currentRoute.startsWith('/dashboard');
  const isDoctorDashboard = currentRoute.startsWith('/doctor');
  const isAuthRoute =
    currentRoute === '/signin' ||
    currentRoute === '/login' ||
    currentRoute === '/signup' ||
    currentRoute === '/onboarding' ||
    currentRoute === '/forgot-password' ||
    currentRoute === '/reset-password' ||
    currentRoute === '/verify-email';

  const renderContent = () => {
    // 0. Public Machine-Readable QR Share Destination Gate
    if (isShareRoute) {
      const token = currentRoute.startsWith('/share/')
        ? currentRoute.replace('/share/', '')
        : window.location.pathname.replace('/share/', '').replace('/share', '');

      return (
        <QrScanSharePage
          token={token}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // 1. Private Patient Dashboard Experience (Protected)
    if (isPatientDashboard) {
      if (!isAuthenticated) {
        return (
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <main className="flex-1 flex flex-col">
              <LoginPage onNavigate={navigateTo} onOpenAssessment={() => setIsAssessmentModalOpen(true)} />
            </main>
          </div>
        );
      }
      return (
        <PatientDashboardPage
          currentRoute={currentRoute}
          onNavigate={navigateTo}
        />
      );
    }

    // 2. Private Doctor Dashboard Experience (Strictly Protected with Clinician Role Validation)
    if (isDoctorDashboard) {
      if (!isAuthenticated) {
        return (
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            <main className="flex-1 flex flex-col">
              <LoginPage onNavigate={navigateTo} onOpenAssessment={() => setIsAssessmentModalOpen(true)} />
            </main>
          </div>
        );
      }

      // Security Guard: Prevent patient accounts from accessing Doctor Portal
      if (role !== 'doctor') {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto font-bold text-2xl shadow-inner">
                🛡️
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Access Restricted: Clinician Credentials Required
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You are currently signed in as a patient ({user?.email || 'Patient Account'}). The Doctors Portal requires verified physician or licensed clinician credentials (NPI / State Medical Board registration).
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    logout();
                    navigateTo('/login');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Sign In with Clinician Credentials</span>
                </button>
                <button
                  onClick={() => navigateTo('/dashboard')}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                >
                  Return to Patient Portal
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <ErrorBoundary fallbackTitle="Doctor Portal Dashboard Error">
          <DoctorDashboardPage
            currentRoute={currentRoute}
            onNavigate={navigateTo}
          />
        </ErrorBoundary>
      );
    }

    // 3. Dedicated Authentication Experience
    if (isAuthRoute) {
      const renderAuthPage = () => {
        switch (currentRoute) {
          case '/signin':
          case '/login':
            return (
              <LoginPage
                onNavigate={navigateTo}
                onOpenAssessment={() => setIsAssessmentModalOpen(true)}
              />
            );
          case '/signup':
          case '/onboarding':
            return (
              <SignupPage
                onNavigate={navigateTo}
                onOpenAssessment={() => setIsAssessmentModalOpen(true)}
                onRegisteredEmailChange={(em) => setRegisteredEmail(em)}
              />
            );
          case '/forgot-password':
            return <ForgotPasswordPage onNavigate={navigateTo} />;
          case '/reset-password':
            return <ResetPasswordPage onNavigate={navigateTo} />;
          case '/verify-email':
            return <VerifyEmailPage email={registeredEmail} onNavigate={navigateTo} />;
          default:
            return <LoginPage onNavigate={navigateTo} onOpenAssessment={() => setIsAssessmentModalOpen(true)} />;
        }
      };

      return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
          <main className="flex-1 flex flex-col">{renderAuthPage()}</main>
          <AssessmentDemoModal
            isOpen={isAssessmentModalOpen}
            onClose={() => setIsAssessmentModalOpen(false)}
          />
        </div>
      );
    }

    // 4. Public Landing Website Experience
    const renderPublicPage = () => {
      switch (currentRoute) {
        case '/platform':
          return (
            <PlatformPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/features':
          return (
            <FeaturesPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/how-it-works':
          return (
            <HowItWorksPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/safety':
          return (
            <SafetyPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/for-patients':
          return (
            <ForPatientsPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/for-doctors':
          return (
            <ForDoctorsPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/security':
          return (
            <SecurityPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/resources':
          return (
            <ResourcesPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/faq':
          return (
            <FaqPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/contact':
          return (
            <ContactPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/about':
          return (
            <AboutPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/privacy':
          return (
            <PrivacyPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/terms':
          return (
            <TermsPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/medical-disclaimer':
          return (
            <MedicalDisclaimerPage
              onNavigate={navigateTo}
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
            />
          );
        case '/':
        default:
          return (
            <HomePage
              onOpenAssessment={() => setIsAssessmentModalOpen(true)}
              onNavigate={navigateTo}
              onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            />
          );
      }
    };

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-blue-900 transition-colors">
        {/* Clinical Disclaimer Top Strip */}
        <MedicalDisclaimerBanner onNavigate={navigateTo} />

        {/* Sticky Navbar with 3-zone contract */}
        <Navbar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          onOpenAssessment={() => setIsAssessmentModalOpen(true)}
          onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
        />

        {/* Main Page Content */}
        <main className="flex-1">{renderPublicPage()}</main>

        {/* Global Footer */}
        <Footer
          onNavigate={navigateTo}
          onOpenDownloadApp={() => setIsDownloadModalOpen(true)}
        />

        {/* Assessment Sandbox Interactive Modal */}
        <AssessmentDemoModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
        />
      </div>
    );
  };

  return (
    <>
      <EmergencySosCountdownModal />
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
      <ErrorBoundary fallbackTitle="Medical AI Application Guard">
        {renderContent()}
      </ErrorBoundary>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
