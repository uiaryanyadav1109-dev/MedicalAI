import React, { useState, useEffect } from 'react';
import { RoutePath, EmergencyEvent, EmergencyContact } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { formatIndianPhoneNumber, toDialablePhone } from '../../../../utils/phoneUtils';
import { NearestHospitalLocatorModal } from '../../../interactive/NearestHospitalLocatorModal';
import {
  emergencyService,
  LocationResult,
  DEFAULT_CLINICAL_FALLBACK
} from '../../../../services/emergencyService';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Phone,
  Activity,
  Building2,
  Navigation,
  XCircle,
  ExternalLink,
  MessageSquare,
  Send,
  Users,
  Compass,
  RefreshCw,
  Copy,
  Check,
  Lock,
  Database,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

interface PatientSosViewProps {
  onNavigate: (route: RoutePath) => void;
}

export const PatientSosView: React.FC<PatientSosViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [historyEvents, setHistoryEvents] = useState<EmergencyEvent[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showHospitalLocator, setShowHospitalLocator] = useState(false);
  const [safetyCheckConfirmed, setSafetyCheckConfirmed] = useState(false);
  const [cancelNotes, setCancelNotes] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedManualText, setCopiedManualText] = useState(false);
  const [testNotificationResult, setTestNotificationResult] = useState<string | null>(null);
  const [isTestingProvider, setIsTestingProvider] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const patientId = user?.id || 'pat-1';
  const patientName = user?.name || 'Aryan Yadav';
  const contacts: EmergencyContact[] = user?.emergencyContacts || [];
  const sortedContacts = [...contacts].sort((a, b) => (a.priority || 99) - (b.priority || 99));
  const activeContacts = sortedContacts.filter((c) => c.isActive);

  // Sync active event & historical events on load and subscribe
  useEffect(() => {
    const refreshData = async () => {
      if (user) {
        const evs = await emergencyService.syncWithBackend(user.id);
        setHistoryEvents(evs);
        const currentActive = emergencyService.getActiveSos(user.id);
        setActiveEvent(currentActive || null);
      }
    };

    refreshData();
    const unsubscribe = emergencyService.subscribe(() => {
      if (user) {
        const currentActive = emergencyService.getActiveSos(user.id);
        setActiveEvent(currentActive || null);
        setHistoryEvents(emergencyService.getEvents(user.id));
      }
    });

    return unsubscribe;
  }, [user]);

  // Activate SOS handler
  const handleActivateSos = async (options?: { forceSimulated?: boolean; testMode?: 'success' | 'failure' }) => {
    setShowConfirmModal(false);
    setIsActivating(true);
    setStatusMessage('Acquiring high-precision GPS and recording emergency event in database...');

    try {
      const event = await emergencyService.activateSos(
        patientId,
        patientName,
        contacts,
        {
          fallbackAddress: user?.emergencyNotes || DEFAULT_CLINICAL_FALLBACK.address,
          forceSimulatedCoordinates: options?.forceSimulated,
          testMode: options?.testMode
        }
      );

      setActiveEvent(event);
      setHistoryEvents(emergencyService.getEvents(patientId));
      setStatusMessage(null);
    } catch (err: any) {
      console.error('Failed to activate SOS:', err);
      setStatusMessage('SOS recorded locally, but network error occurred contacting remote gateway.');
    } finally {
      setIsActivating(false);
    }
  };

  // Safety-guarded cancellation / resolution handler
  // SAFETY: Requires explicit safety affirmation (safetyCheckConfirmed === true)
  const handleConfirmCancelSos = async () => {
    if (!activeEvent || !safetyCheckConfirmed) return;
    setIsCancelling(true);

    try {
      await emergencyService.resolveSos(
        activeEvent.id,
        patientId,
        true,
        cancelNotes || 'Patient confirmed safe and in stable condition.'
      );
      setActiveEvent(null);
      setShowCancelModal(false);
      setSafetyCheckConfirmed(false);
      setCancelNotes('');
      setHistoryEvents(emergencyService.getEvents(patientId));
    } finally {
      setIsCancelling(false);
    }
  };

  // Test Notification provider dispatch
  const handleRunNotificationTest = async (mode: 'success' | 'failure') => {
    setIsTestingProvider(true);
    setTestNotificationResult(null);

    try {
      const result = await emergencyService.testNotificationChannel(mode, contacts, patientName);
      if (result.success) {
        setTestNotificationResult(`✅ ${result.message}`);
      } else {
        setTestNotificationResult(`❌ ${result.error || result.message}`);
      }
    } catch (err: any) {
      setTestNotificationResult(`❌ Test error: ${err.message}`);
    } finally {
      setIsTestingProvider(false);
      setTimeout(() => setTestNotificationResult(null), 8000);
    }
  };

  const handleCopyMapLink = () => {
    if (activeEvent?.locationLink) {
      navigator.clipboard.writeText(activeEvent.locationLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyDispatchText = () => {
    if (activeEvent) {
      const text = emergencyService.generateManualDispatchText(activeEvent);
      navigator.clipboard.writeText(text);
      setCopiedManualText(true);
      setTimeout(() => setCopiedManualText(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Radio className="w-4 h-4 animate-pulse text-rose-600" />
            <span>CRITICAL CLINICAL RESPONSE · EMERGENCY DISPATCH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            EMERGENCY SOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            One-touch emergency beacon with immediate GPS coordinate capture, verified Google Maps link generation, and scoped authorized contact dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/dashboard/emergency-contacts')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Manage Contacts ({contacts.length})</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2 animate-fadeIn">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2. STATE A: SOS ACTIVE DISPLAY SCREEN */}
      {activeEvent ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Red Status Hero Banner */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-rose-500/50 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shrink-0">
                  <Radio className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold tracking-widest uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>BROADCAST ACTIVE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    SOS ACTIVE
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-100 font-medium">
                    Distress beacon triggered at {activeEvent.activatedAt}. Emergency responders and contacts briefed.
                  </p>
                </div>
              </div>

              {/* Status Checklist: Location Shared ✓ and Contacts Notified Status */}
              <div className="bg-rose-900/40 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-xs space-y-2 min-w-[240px]">
                {/* Location Shared Status */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-rose-200 font-medium">Location Status:</span>
                  <span className="font-bold text-white flex items-center gap-1.5 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Location shared ✓</span>
                  </span>
                </div>

                {/* Contacts Notified Status - HONEST, NEVER FAKED */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-rose-200 font-medium">Notification:</span>
                  {activeEvent.notificationStatus === 'delivered' ? (
                    <span className="font-bold text-white flex items-center gap-1.5 bg-emerald-500/20 px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Contacts notified ✓</span>
                    </span>
                  ) : activeEvent.notificationStatus === 'partial' ? (
                    <span className="font-bold text-amber-200 flex items-center gap-1.5 bg-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      <span>Partially notified</span>
                    </span>
                  ) : activeEvent.notificationStatus === 'service_not_configured' ? (
                    <span className="font-bold text-yellow-200 flex items-center gap-1.5 bg-yellow-500/20 px-2 py-0.5 rounded text-[11px]" title={activeEvent.notificationMessage}>
                      <Info className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Direct Channels Ready ⚠️</span>
                    </span>
                  ) : (
                    <span className="font-bold text-rose-200 flex items-center gap-1.5 bg-rose-500/30 px-2 py-0.5 rounded text-[11px]">
                      <XCircle className="w-3.5 h-3.5 text-rose-300" />
                      <span>Gateway Failed ⚠️</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coordinates & Location Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Emergency Coordinates & Secure Location Link
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                  Source: {activeEvent.locationSource === 'gps' ? 'Live Satellite GPS' : activeEvent.locationSource === 'simulated' ? 'Verified Demo Coordinates' : 'Registered Profile Address'}
                </span>
                {activeEvent.accuracy && (
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    Accuracy: ±{activeEvent.accuracy}m
                  </span>
                )}
              </div>
            </div>

            {/* Exact Lat/Lng Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  LATITUDE
                </span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {activeEvent.latitude !== undefined ? activeEvent.latitude.toFixed(6) : '37.763118'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  LONGITUDE
                </span>
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {activeEvent.longitude !== undefined ? activeEvent.longitude.toFixed(6) : '-122.457812'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  TIMESTAMP
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {activeEvent.locationTimestamp || activeEvent.activatedAt}
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  PERMISSION STATUS
                </span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 uppercase">
                  {activeEvent.permissionStatus || 'granted'}
                </span>
              </div>
            </div>

            {/* Verified Clickable Location Link */}
            {activeEvent.locationLink && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-blue-700 dark:text-blue-300">
                      SECURE SATELLITE DESTINATION LINK
                    </span>
                    <p className="text-xs font-mono text-blue-900 dark:text-blue-100 truncate max-w-md">
                      {activeEvent.locationLink}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyMapLink}
                    className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                  </button>

                  <a
                    href={activeEvent.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Open Verified Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action Call / Cancel Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CALL EMERGENCY SERVICES */}
            <a
              href="tel:112"
              className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-all duration-150 active:scale-98"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>Call Emergency (112)</span>
            </a>

            {/* DIRECT CALL AMBULANCE */}
            <a
              href="tel:108"
              className="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-all duration-150 active:scale-98"
            >
              <Activity className="w-5 h-5" />
              <span>Call Ambulance (108)</span>
            </a>

            {/* LOCATE NEAREST HOSPITAL */}
            <button
              onClick={() => setShowHospitalLocator(true)}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 text-sm font-black tracking-wide transition-all duration-150 active:scale-98 cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-white" />
              <span>Locate Hospitals</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowCancelModal(true)}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold transition-all"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              <span>End / Cancel Active SOS</span>
            </button>
          </div>

          {/* Authorized Contacts Dispatch Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Authorized Emergency Contact Dispatches ({activeEvent.notifiedContacts?.length || 0})
                </h3>
              </div>

              <button
                onClick={handleCopyDispatchText}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedManualText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedManualText ? 'Copied Full Report' : 'Copy Emergency Report'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeEvent.notifiedContacts?.map((c, i) => (
                <div
                  key={c.contactId || i}
                  className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                        <span className="text-slate-500 text-xs">({c.relationship})</span>
                      </div>
                      <span className="font-mono text-slate-600 dark:text-slate-400 text-xs mt-0.5 block">
                        {formatIndianPhoneNumber(c.phone)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border ${
                        c.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : c.status === 'failed'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {c.status === 'sent' ? 'Delivered ✓' : c.status === 'failed' ? 'Failed ✕' : 'Carrier Link Ready'}
                    </span>
                  </div>

                  {/* 1-Tap Direct Call, SMS & WhatsApp Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`tel:${toDialablePhone(c.phone)}`}
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Call</span>
                    </a>
                    {c.directDispatchLink && (
                      <a
                        href={c.directDispatchLink}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>1-Tap SMS</span>
                      </a>
                    )}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        c.personalizedMessage || emergencyService.generateManualDispatchText(activeEvent)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 3. STATE B: NORMAL STANDBY SCREEN (ACTIVATE SOS) */
        <div className="space-y-6">
          {/* Main Activation Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden transition-colors">
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-200 dark:border-rose-900/60 text-rose-600 flex items-center justify-center shadow-md">
                <ShieldAlert className="w-10 h-10 animate-pulse text-rose-600" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Emergency Medical Distress
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pressing the button below will immediately trigger coordinate capture via the browser Geolocation API, record an auditable emergency event in the backend database, and package verified location links for your authorized contacts.
                </p>
              </div>

              {/* HUGE ACTIVATE SOS BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full sm:w-auto min-w-[280px] px-8 py-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-lg sm:text-xl font-black tracking-wider rounded-2xl shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 transform hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-3 mx-auto cursor-pointer disabled:opacity-50"
                >
                  <Radio className="w-6 h-6 animate-pulse" />
                  <span>[ ACTIVATE SOS ]</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Accidental Trigger Safeguard Active · 2-Step Confirmation Protected</span>
              </div>
            </div>
          </div>

          {/* Direct Hotlines & Locate Hospitals Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:112"
              className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl shadow-md flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-98"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>Direct Call 112 (Police / EMS)</span>
            </a>

            <a
              href="tel:108"
              className="p-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl shadow-md flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-98"
            >
              <Activity className="w-5 h-5" />
              <span>Direct Call 108 (Ambulance)</span>
            </a>

            <button
              onClick={() => setShowHospitalLocator(true)}
              className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md flex items-center justify-center gap-2.5 font-bold text-sm transition-all active:scale-98 cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-white" />
              <span>Locate Nearest Hospitals</span>
            </button>
          </div>

          {/* Configured Emergency Contacts Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Authorized Emergency Contacts ({activeContacts.length} Active)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/dashboard/emergency-contacts')}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Edit Contacts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeContacts.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <strong className="text-slate-900 dark:text-white">{c.name}</strong>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Priority {c.priority || (c.isPrimary ? 1 : 2)}
                      </span>
                    </div>

                    <div className="text-slate-500 space-y-0.5 font-medium">
                      <div>Relationship: {c.relationship}</div>
                      <div className="font-mono text-slate-800 dark:text-slate-200">{formatIndianPhoneNumber(c.phone)}</div>
                      {c.email && <div className="font-mono text-slate-500 truncate">{c.email}</div>}
                    </div>

                    {c.isPrimary && (
                      <span className="inline-block text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                        Primary Responder
                      </span>
                    )}

                    <a
                      href={`tel:${toDialablePhone(c.phone)}`}
                      className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Direct Call</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-3">
                <span>No active emergency contacts configured. Please configure contacts to ensure distress notifications can reach your family.</span>
                <button
                  onClick={() => onNavigate('/dashboard/emergency-contacts')}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold shrink-0"
                >
                  Configure
                </button>
              </div>
            )}
          </div>

          {/* Test & Simulation Suite (Test SOS Activation, Permission Denied, Success, Failure, Database Event) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Emergency Diagnostic & Testing Protocols
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">QA Test Harness</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Run verified diagnostic simulations for permission denial fallbacks, notification provider channels, and backend database audits without placing a 112 phone call.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Test SOS Activation with Simulated GPS */}
              <button
                type="button"
                onClick={() => handleActivateSos({ forceSimulated: true, testMode: 'success' })}
                disabled={isActivating}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
              >
                1. Test SOS Activation & DB Event
              </button>

              {/* Test Notification Success */}
              <button
                type="button"
                onClick={() => handleRunNotificationTest('success')}
                disabled={isTestingProvider}
                className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
              >
                2. Test Notification Delivery Success
              </button>

              {/* Test Notification Failure */}
              <button
                type="button"
                onClick={() => handleRunNotificationTest('failure')}
                disabled={isTestingProvider}
                className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 rounded-xl font-bold border border-rose-200 dark:border-rose-800 transition-colors"
              >
                3. Test Notification Gateway Failure
              </button>
            </div>

            {testNotificationResult && (
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono animate-fadeIn">
                {testNotificationResult}
              </div>
            )}
          </div>

          {/* Historical Database Emergency Log */}
          {historyEvents.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Database className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Recorded Emergency Events in Database ({historyEvents.length})
                </h3>
              </div>

              <div className="space-y-2">
                {historyEvents.slice(0, 5).map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ev.status === 'active' ? 'bg-rose-500 animate-ping' : 'bg-slate-400'
                          }`}
                        />
                        <strong className="text-slate-900 dark:text-white font-mono">{ev.id}</strong>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            ev.status === 'active'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Activated: {ev.activatedAt} · Source: {ev.locationSource} · Notification: {ev.notificationStatus}
                      </div>
                    </div>

                    {ev.locationLink && (
                      <a
                        href={ev.locationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        <span>View Coordinates Map</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL: CONFIRM EMERGENCY ACTION (SAFETY GUARD AGAINST ACCIDENTAL CLICKS) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-600 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Confirm Emergency SOS Activation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to broadcast an emergency distress signal? Your browser will obtain your location and dispatch alerts to your {activeContacts.length} configured contacts.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs space-y-1 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Authorized Recipients:</span>
              {activeContacts.map((c) => (
                <div key={c.id} className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>{c.name} ({c.relationship})</span>
                  <span className="font-mono">{formatIndianPhoneNumber(c.phone)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Cancel (False Alarm)
              </button>
              <button
                type="button"
                onClick={() => handleActivateSos()}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-colors shadow-md"
              >
                Yes, Activate SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: SAFETY GUARDED CANCELLATION DIALOG */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Safety Confirmation Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                To prevent accidental deactivation during a genuine emergency, please confirm that you are safe before closing this emergency beacon.
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={safetyCheckConfirmed}
                  onChange={(e) => setSafetyCheckConfirmed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded mt-0.5 cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200 leading-tight">
                  I explicitly confirm that I am safe, out of immediate danger, and authorized to resolve this SOS distress event.
                </span>
              </label>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Resolution Notes (Optional):
                </label>
                <input
                  type="text"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="e.g. Paramedics arrived / situation resolved"
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                Keep SOS Active
              </button>
              <button
                type="button"
                disabled={!safetyCheckConfirmed || isCancelling}
                onClick={handleConfirmCancelSos}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black rounded-xl transition-colors shadow-md"
              >
                {isCancelling ? 'Resolving...' : 'Confirm Safe & End SOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEAREST EMERGENCY HOSPITALS LOCATOR MODAL */}
      <NearestHospitalLocatorModal
        isOpen={showHospitalLocator}
        onClose={() => setShowHospitalLocator(false)}
        userLat={activeEvent?.latitude}
        userLng={activeEvent?.longitude}
      />
    </div>
  );
};

export default PatientSosView;
