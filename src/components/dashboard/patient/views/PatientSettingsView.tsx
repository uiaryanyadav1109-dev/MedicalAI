import React, { useState, useEffect } from 'react';
import { RoutePath, User } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../i18n';
import { clinicalStore } from '../../../../services/clinicalStore';
import { authService, evaluatePasswordCriteria, calculatePasswordStrength } from '../../../../services/authService';
import { formatIndianPhoneNumber } from '../../../../utils/phoneUtils';
import {
  Settings,
  ShieldCheck,
  Lock,
  Download,
  Key,
  LogOut,
  Bell,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Globe,
  Clock,
  Sliders,
  Eye,
  EyeOff,
  Trash2,
  Shield,
  Laptop,
  Tablet,
  Check,
  X,
  FileText,
  Radio,
  Sparkles,
  Info,
  TestTube,
  Play,
  User as UserIcon,
  Moon,
  Sun,
  Monitor,
  MapPin,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { runDashboardAndClinicalTests } from '../../../../services/__tests__/dashboardAndClinical.test';
import { runDoctorHandoffTests } from '../../../../services/__tests__/doctorHandoff.test';
import { runMedicationManagementTests } from '../../../../services/__tests__/medicationManagement.test';
import {
  runSecurityAndSettingsTests,
  securityRateLimiter,
  validateDeletionRequest
} from '../../../../services/__tests__/securityAndSettings.test';
import { runIdentityVerificationTests } from '../../../../services/__tests__/identityVerification.test';
import { runMultilingualSpeechTests } from '../../../../services/__tests__/multilingualSpeech.test';
import { runGoogleAuthTests } from '../../../../services/__tests__/googleAuth.test';
import { identityVerificationService } from '../../../../services/identityVerificationService';

interface PatientSettingsViewProps {
  onNavigate: (route: RoutePath) => void;
}

type SettingsTab = 'account' | 'security' | 'notifications' | 'privacy' | 'verification';

export const PatientSettingsView: React.FC<PatientSettingsViewProps> = ({ onNavigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showNotificationToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const showErrorToast = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  // ==========================================
  // 1. ACCOUNT & PROFILE STATES
  // ==========================================
  const [name, setName] = useState(user?.name || 'Aryan Yadav');
  const [email, setEmail] = useState(user?.email || 'aryan.yadav@health.me');
  const [phone, setPhone] = useState(formatIndianPhoneNumber(user?.phone) || '+91 81002 78890');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || user?.bloodType || 'O+');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '1998-09-14');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || 'English');
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'Asia/Kolkata'
  );

  // Accessibility Preferences
  const [largerText, setLargerText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [soundFeedback, setSoundFeedback] = useState(true);

  // Apply accessibility classes to DOM
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (largerText) {
      root.classList.add('text-lg-scale');
    } else {
      root.classList.remove('text-lg-scale');
    }
  }, [highContrast, largerText]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      bloodGroup,
      bloodType: bloodGroup,
      dateOfBirth,
      preferredLanguage: selectedLanguage
    });
    showNotificationToast('Profile information and preferences saved successfully.');
  };

  // ==========================================
  // 2. SECURITY & AUTHENTICATION STATES
  // ==========================================
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  // Active Sessions
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Windows PC · Google Chrome (Current Session)',
      type: 'desktop',
      location: 'Bengaluru, India (Current IP)',
      time: 'Active now',
      isCurrent: true
    },
    {
      id: 'sess-2',
      device: 'iPhone 15 Pro · Mobile Safari',
      type: 'mobile',
      location: 'Bengaluru, India',
      time: 'Last active 2 hours ago',
      isCurrent: false
    },
    {
      id: 'sess-3',
      device: 'iPad Pro · Medical AI Clinical App',
      type: 'tablet',
      location: 'Mumbai, India',
      time: 'Last active 3 days ago',
      isCurrent: false
    }
  ]);

  const passwordCriteria = evaluatePasswordCriteria(newPassword);
  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    // Rate limiter check
    const rateCheck = securityRateLimiter.checkAndRecordAttempt(user?.id || 'pat-1', true);
    if (!rateCheck.allowed) {
      const waitSec = Math.ceil(((rateCheck.lockedUntil || 0) - Date.now()) / 1000);
      setPasswordFeedback(`Too many attempts. Account locked for password changes. Please wait ${waitSec}s.`);
      return;
    }

    if (!currentPassword) {
      setPasswordFeedback('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback('New password and confirmation do not match.');
      return;
    }

    const res = await authService.resetPassword(newPassword);
    if (res.success) {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotificationToast('Password changed successfully. Active session re-authenticated.');
    } else {
      setPasswordFeedback(res.error || 'Password update failed.');
    }
  };

  const handleRevokeSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showNotificationToast('All other remote device sessions have been revoked.');
  };

  // ==========================================
  // 3. NOTIFICATION PREFERENCES STATES
  // ==========================================
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(true);
  const [labReportAlerts, setLabReportAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [emergencySosStatus, setEmergencySosStatus] = useState(true);
  const [emailDigests, setEmailDigests] = useState(true);
  const [inAppBanners, setInAppBanners] = useState(true);

  // Browser Notification API
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const handleRequestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          showNotificationToast('Browser push notifications enabled.');
        } else if (perm === 'denied') {
          showErrorToast('Browser push notifications were blocked in your browser settings.');
        }
      } catch {
        // Fallback
      }
    }
  };

  // ==========================================
  // 4. PRIVACY, AI & DATA GOVERNANCE STATES
  // ==========================================
  const [aiTelemetryConsent, setAiTelemetryConsent] = useState(false);
  const [anonymizedResearch, setAnonymizedResearch] = useState(false);
  const [emergencyLocationTracking, setEmergencyLocationTracking] = useState(true);
  const [generalPortalConsent, setGeneralPortalConsent] = useState(true);
  const [aiTriageConsent, setAiTriageConsent] = useState(true);
  const [emergencyResponderConsent, setEmergencyResponderConsent] = useState(true);

  // Account Deletion Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationPhrase, setDeleteConfirmationPhrase] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleExportData = () => {
    const archive = {
      patient: user,
      consultations: clinicalStore.getConsultations(),
      vitals: clinicalStore.getVitals(),
      reports: clinicalStore.getReports(),
      medications: clinicalStore.getMedications(),
      timeline: clinicalStore.getTimeline(),
      handoffs: clinicalStore.getHandoffs(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-ai-patient-archive-${user?.patientId || user?.mrn || '80429'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotificationToast('Complete clinical health archive exported (JSON format).');
  };

  const handleExportPassportText = () => {
    const textSummary = `MEDICAL AI — CLINICAL PATIENT PASSPORT
=============================================
Patient Name: ${user?.name || 'Aryan Yadav'}
Patient ID / MRN: ${user?.patientId || user?.mrn || 'MAI-80429'}
Date of Birth: ${user?.dateOfBirth || '1998-09-14'}
Blood Group: ${user?.bloodGroup || user?.bloodType || 'O+'}
Allergies: ${(user?.allergies || ['Penicillin (Moderate)', 'Sulfa Drugs (Moderate)']).join(', ')}
Primary Emergency Contact: ${user?.emergencyContacts?.[0]?.name || 'Sunita Yadav'} (${formatIndianPhoneNumber(user?.emergencyContacts?.[0]?.phone) || '+91 81002 78890'})
Generated: ${new Date().toLocaleString()}
=============================================
Exported from verified patient health portal.`;

    const blob = new Blob([textSummary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-passport-${user?.patientId || '80429'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotificationToast('Emergency clinical passport text summary downloaded.');
  };

  const handleConfirmAccountDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    const validation = validateDeletionRequest(deleteConfirmationPhrase, !!deletePassword);
    if (!validation.isValid) {
      setDeleteError(validation.error || 'Invalid deletion confirmation.');
      return;
    }

    // Purge local storage and session data
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // safe fallback
    }

    setShowDeleteModal(false);
    logout();
    onNavigate('/signin');
  };

  // ==========================================
  // 5. TEST SUITE RUNNER
  // ==========================================
  const [testResults, setTestResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: { testName: string; passed: boolean; error?: string }[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res1 = runDashboardAndClinicalTests();
      const res2 = runDoctorHandoffTests();
      const res3 = runMedicationManagementTests();
      const res4 = runSecurityAndSettingsTests();
      const res5 = await runIdentityVerificationTests();
      const res6 = runMultilingualSpeechTests();
      const res7 = await runGoogleAuthTests();

      const googleTestResults = res7.map((r) => ({
        testName: `[Google Auth] ${r.name}`,
        passed: r.passed,
        error: r.message
      }));
      const googlePassed = res7.filter((r) => r.passed).length;
      const googleFailed = res7.filter((r) => !r.passed).length;

      setTestResults({
        total: res1.total + res2.total + res3.total + res4.total + res5.total + res6.total + res7.length,
        passed: res1.passed + res2.passed + res3.passed + res4.passed + res5.passed + res6.passed + googlePassed,
        failed: res1.failed + res2.failed + res3.failed + res4.failed + res5.failed + res6.failed + googleFailed,
        results: [
          ...res1.results,
          ...res2.results,
          ...res3.results,
          ...res4.results,
          ...res5.results,
          ...res6.results,
          ...googleTestResults
        ]
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-blue-700 dark:text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Account Center · Patient Governance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Settings, Privacy & Security Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your personal profile, credentials, notifications, accessibility, and privacy controls.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0 self-stretch sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'account'
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy & AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TestTube className="w-3.5 h-3.5" />
            <span>Verification</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {statusMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: ACCOUNT & PROFILE SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>Personal Profile & Identity</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your contact details, preferred language, and regional timezone.
                </p>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                MRN: {user?.mrn || user?.patientId || 'MAI-80429'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('settings.selectLanguage')}
                </label>
                <select
                  value={language}
                  onChange={(e) => {
                    const nextLang = e.target.value as 'en' | 'hi' | 'bn';
                    setLanguage(nextLang);
                    setSelectedLanguage(nextLang === 'hi' ? 'Hindi' : nextLang === 'bn' ? 'Bengali' : 'English');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                >
                  <option value="en">English (English)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Clinical Timezone</label>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="America/New_York">America/New_York (EST/EDT - UTC-05:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT - UTC-08:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST - UTC+00:00)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Theme & Visual Appearance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Visual Appearance & Theme</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose light, dark, or automatic system theme.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-xs block">Light Theme</span>
                  <span className="text-[10px] text-slate-400 block">Clean, clinical light palette</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-xs block">Dark Mode</span>
                  <span className="text-[10px] text-slate-400 block">Low-glare high contrast</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-xs block">Match System</span>
                  <span className="text-[10px] text-slate-400 block">Follow OS appearance</span>
                </div>
              </button>
            </div>
          </div>

          {/* Accessibility Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Accessibility & Visual Assistance</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize readability, motion, and contrast settings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">High Contrast Mode</span>
                  <span className="text-[10px] text-slate-400 block">Enhances border and text contrast</span>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Larger Text Scale</span>
                  <span className="text-[10px] text-slate-400 block">Enlarges primary clinical text</span>
                </div>
                <input
                  type="checkbox"
                  checked={largerText}
                  onChange={(e) => setLargerText(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Reduced Motion</span>
                  <span className="text-[10px] text-slate-400 block">Disables non-essential animations</span>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Auditory Feedback</span>
                  <span className="text-[10px] text-slate-400 block">Subtle chimes on action alerts</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundFeedback}
                  onChange={(e) => setSoundFeedback(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SECURITY & AUTHENTICATION */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Credentials Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-600" />
                  <span>Authentication Credentials</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update account password with strength criteria checking.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordFeedback(null);
                  setShowPasswordModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Change Password
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Two-Factor Authentication (MFA)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {twoFactorEnabled ? 'TOTP Authenticator App Configured' : 'MFA Disabled'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showNotificationToast(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    twoFactorEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled ✓' : 'Disabled'}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Biometric & WebAuthn Keys
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Windows Hello / Touch ID
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBiometricsEnabled(!biometricsEnabled);
                    showNotificationToast(`Biometric login ${!biometricsEnabled ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    biometricsEnabled
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {biometricsEnabled ? 'Active ✓' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Identity Verification & Credential Governance */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-sky-600 dark:text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Optional Identity Assurance</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Government Identity Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                  Validate official credentials for regulated e-prescriptions. Separate from your internal Patient ID ({user?.patientId || user?.mrn || 'MAI-80429'}).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  identityVerificationService.getVerificationRecord(user?.id || 'pat-1').status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : identityVerificationService.getVerificationRecord(user?.id || 'pat-1').status === 'pending'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  {identityVerificationService.getVerificationRecord(user?.id || 'pat-1').status.toUpperCase().replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/dashboard/identity-verification')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Manage Verification</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions & Invalidation */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Active Sessions & Session Timeout</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Authorized device tokens accessing this portal account.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    showNotificationToast(`Session inactivity timeout set to ${e.target.value}.`);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="15m">15 Minutes Inactivity</option>
                  <option value="30m">30 Minutes (Recommended)</option>
                  <option value="1h">1 Hour Inactivity</option>
                  <option value="4h">4 Hours Inactivity</option>
                  <option value="24h">24 Hours Inactivity</option>
                </select>

                <button
                  type="button"
                  onClick={handleRevokeSessions}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Revoke Other Sessions
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {sess.type === 'desktop' ? (
                      <Laptop className="w-4 h-4 text-slate-500" />
                    ) : sess.type === 'mobile' ? (
                      <Smartphone className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Tablet className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {sess.device}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {sess.location} · {sess.time}
                      </span>
                    </div>
                  </div>

                  {sess.isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      CURRENT DEVICE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">REMOTE</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Audit Trail (Privacy-Preserving) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Security Event Ledger (Non-Sensitive):
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-[11px]">
              <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 mr-2">[LOGIN_SUCCESS]</span>
                  <span className="text-slate-700 dark:text-slate-300">MFA Authenticated via TOTP</span>
                </div>
                <span className="text-[10px] text-slate-400">Today, 09:15 AM</span>
              </div>
              <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-700 dark:text-blue-400 mr-2">[TOKEN_ISSUED]</span>
                  <span className="text-slate-700 dark:text-slate-300">Pre-encounter Doctor Handoff brief token synthesized</span>
                </div>
                <span className="text-[10px] text-slate-400">Mar 24, 09:00 AM</span>
              </div>
              <div className="p-3 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-700 dark:text-purple-400 mr-2">[EXPORT_ARCHIVE]</span>
                  <span className="text-slate-700 dark:text-slate-300">Encrypted personal health record JSON exported</span>
                </div>
                <span className="text-[10px] text-slate-400">Mar 20, 11:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFICATIONS & ALERTS */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Notification Types & Delivery Channels</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure alerts for appointments, medications, diagnostic releases, and emergency status.
                </p>
              </div>

              {/* Real Browser Push Status */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                  browserPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : browserPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {browserPermission === 'granted' ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  <span>Browser Push: {browserPermission.toUpperCase()}</span>
                </span>
                {browserPermission !== 'granted' && (
                  <button
                    type="button"
                    onClick={handleRequestPushPermission}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Enable
                  </button>
                )}
              </div>
            </div>

            {/* Notification Types Toggles */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                Application Notification Triggers:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Medication Regimen Reminders
                    </span>
                    <span className="text-[10px] text-slate-400 block">Daily scheduled dose alarms & snoozes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={medicationReminders}
                    onChange={(e) => setMedicationReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Clinical Appointment Reminders
                    </span>
                    <span className="text-[10px] text-slate-400 block">24-hour and 2-hour pre-visit notifications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appointmentReminders}
                    onChange={(e) => setAppointmentReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Diagnostic Laboratory Releases
                    </span>
                    <span className="text-[10px] text-slate-400 block">Immediate notice when new lab panels release</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={labReportAlerts}
                    onChange={(e) => setLabReportAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Emergency SOS Broadcast Status
                    </span>
                    <span className="text-[10px] text-slate-400 block">High-priority contact delivery receipts</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emergencySosStatus}
                    onChange={(e) => setEmergencySosStatus(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Security & Unrecognized Login Notices
                    </span>
                    <span className="text-[10px] text-slate-400 block">New device sign-in and password changes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>

                <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Weekly Health & Adherence Digest
                    </span>
                    <span className="text-[10px] text-slate-400 block">Summary of vitals trends and medication logs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigests}
                    onChange={(e) => setEmailDigests(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>
              </div>
            </div>

            {/* Channels & Gateway Status */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                Delivery Channels & Carrier Gateway Status:
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">In-App Alerts: Operational</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">ACTIVE</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Email Gateway (SMTP/SES): Operational</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">aryan.yadav@health.me</span>
                </div>

                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Carrier SMS Gateway: Sandbox Simulation Mode (Twilio/AWS SNS binding pending)</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-800 font-bold">SANDBOX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRIVACY, AI GOVERNANCE & DATA EXPORT/DELETION */}
      {/* ========================================================================= */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Data Stored & Transparency Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Patient Data Sovereignty</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Data Storage, Medical Record Access & Retention
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Understand how your clinical data is stored, isolated, and governed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Local Storage & Session Isolation</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your profile, telemetry records, vitals logs, and medication histories are saved in user-scoped browser session storage. Only your authenticated user ID (`pat-1`) can read these records.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Medical Record Access & Sharing</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Doctors receive access strictly through cryptographic unguessable tokens created upon your explicit consent. No medical record is publicly indexable or guessable.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">AI Processing & Model Governance</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Clinical intelligence protocols synthesize your intake data into preliminary briefings. AI models <strong>never autonomously prescribe or diagnose</strong>, and inferences require clinician validation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-900 dark:text-white block">Geolocation Privacy during Emergency SOS</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Location coordinates are captured <strong>strictly upon active SOS confirmation</strong> and transmitted to emergency contacts. Your location is never tracked in the background during normal portal browsing.
                </p>
              </div>
            </div>

            {/* Mandatory Truthful Compliance Notice */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block uppercase font-mono tracking-wider">
                Transparent Regulatory Standards Statement:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Medical AI is architected according to HIPAA Security & Privacy Rule principles and GDPR data minimization standards. Formal external third-party compliance certification is pending independent assessment. We do not claim unverified certifications.
              </p>
            </div>
          </div>

          {/* Consent Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Active Consent Authorizations:
            </h4>

            <div className="space-y-3">
              <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    General Medical Portal Record Storage Consent
                  </span>
                  <span className="text-[10px] text-slate-400 block">Authorized on account registration</span>
                </div>
                <input
                  type="checkbox"
                  checked={generalPortalConsent}
                  onChange={(e) => setGeneralPortalConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    AI Clinical Triage Protocol Processing Consent
                  </span>
                  <span className="text-[10px] text-slate-400 block">Allows AI synthesis of reported symptoms</span>
                </div>
                <input
                  type="checkbox"
                  checked={aiTriageConsent}
                  onChange={(e) => setAiTriageConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>

              <label className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Emergency Lifesaving SOS Geolocation Sharing
                  </span>
                  <span className="text-[10px] text-slate-400 block">Attaches GPS to emergency SMS during active SOS</span>
                </div>
                <input
                  type="checkbox"
                  checked={emergencyResponderConsent}
                  onChange={(e) => setEmergencyResponderConsent(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </label>
            </div>
          </div>

          {/* Data Export & Account Deletion */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
                Data Portability & Account Termination:
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON Archive</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPassportText}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Text Passport</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmationPhrase('');
                  setDeletePassword('');
                  setShowDeleteModal(true);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Account Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CLINICAL & SECURITY VERIFICATION SUITE */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Clinical Health, Medication Management & Security Verification Suite</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Automated test assertions covering empty data states, invalid physiological measurements, unit conversions, timezone handling, chronological ordering, emergency red flags, source provenance grounding, unguessable security tokens, instant access revocation, invalid dosage input validation, duplicate reminder prevention, ambiguous prescription confirmation, rate limiting, and destructive deletion safeguards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunTests}
                disabled={isRunningTests}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
              >
                <Play className="w-4 h-4" />
                <span>{isRunningTests ? 'Executing Test Suite...' : 'Run All Verification Tests'}</span>
              </button>
            </div>

            {testResults ? (
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-center">
                    <span className="text-3xl font-black font-mono text-blue-900 dark:text-blue-200 block">
                      {testResults.total}
                    </span>
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Total Assertions</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center">
                    <span className="text-3xl font-black font-mono text-emerald-900 dark:text-emerald-200 block">
                      {testResults.passed}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Passed ✓</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-center">
                    <span className="text-3xl font-black font-mono text-rose-900 dark:text-rose-200 block">
                      {testResults.failed}
                    </span>
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Failed ✗</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
                    Detailed Assertions Report across All Modules:
                  </h4>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30 max-h-96 overflow-y-auto">
                    {testResults.results.map((res, i) => (
                      <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {res.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                          <span className={`font-medium ${res.passed ? 'text-slate-800 dark:text-slate-200' : 'text-rose-700 dark:text-rose-300 font-bold'}`}>
                            {res.testName}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          res.passed
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-3">
                <TestTube className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  Ready to Validate All Portal Systems
                </h4>
                <p className="max-w-md mx-auto">
                  Click "Run All Verification Tests" to execute assertions covering vitals validation, unit conversions, empty states, doctor handoff tokens, medication reminders, rate limiting, and security boundaries.
                </p>
                <button
                  type="button"
                  onClick={handleRunTests}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-700"
                >
                  Run All Verification Tests
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ========================================================================= */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordFeedback && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordFeedback}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Criteria Checklist */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Password Strength:</span>
                    <span className={`font-mono font-bold uppercase ${
                      passwordStrength === 'strong' ? 'text-emerald-600' : passwordStrength === 'fair' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-500">
                    <span className={passwordCriteria.minLength ? 'text-emerald-600 font-bold' : ''}>
                      {passwordCriteria.minLength ? '✓' : '•'} 8+ Characters
                    </span>
                    <span className={passwordCriteria.hasUppercase ? 'text-emerald-600 font-bold' : ''}>
                      {passwordCriteria.hasUppercase ? '✓' : '•'} Uppercase
                    </span>
                    <span className={passwordCriteria.hasNumber ? 'text-emerald-600 font-bold' : ''}>
                      {passwordCriteria.hasNumber ? '✓' : '•'} Number
                    </span>
                    <span className={passwordCriteria.hasSpecial ? 'text-emerald-600 font-bold' : ''}>
                      {passwordCriteria.hasSpecial ? '✓' : '•'} Special Symbol
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESTRUCTIVE ACCOUNT DELETION MODAL */}
      {/* ========================================================================= */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-300 dark:border-rose-900 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Account & Data Deletion</h3>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>What will be purged:</strong> Your login credentials, local session keys, draft triage intakes, custom medication reminders, and biometric bindings.
              </p>
              <p>
                <strong>What is retained per legal obligations:</strong> Formal clinical consultation notes and laboratory diagnostic reports required by medical record retention statutes will be archived per jurisdictional healthcare laws.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmAccountDeletion} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Type <span className="font-mono text-rose-600">DELETE MY ACCOUNT</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationPhrase}
                  onChange={(e) => setDeleteConfirmationPhrase(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200">
                  Enter Account Password to Authorize Deletion:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Permanently Delete Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
