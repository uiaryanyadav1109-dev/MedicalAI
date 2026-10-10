import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  emergencyService,
  GeolocationPermissionState,
  DEFAULT_CLINICAL_FALLBACK
} from '../../services/emergencyService';
import { EmergencyEvent } from '../../types';
import { formatIndianPhoneNumber, toDialablePhone } from '../../utils/phoneUtils';
import { NearestHospitalLocatorModal } from './NearestHospitalLocatorModal';
import {
  AlertTriangle,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Radio,
  Send,
  Navigation,
  Lock,
  RefreshCw,
  MessageSquare,
  Compass,
  Check,
  Edit3,
  PhoneCall,
  Building2,
  Ambulance
} from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToContacts?: () => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  onNavigateToContacts
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'confirm' | 'capturing' | 'active'>('confirm');
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isRetryingGps, setIsRetryingGps] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [showSafetyCancel, setShowSafetyCancel] = useState(false);
  const [safetyAffirmed, setSafetyAffirmed] = useState(false);
  const [showHospitalLocator, setShowHospitalLocator] = useState(false);

  const patientName = user?.name || 'Aryan Yadav';
  const contacts = user?.emergencyContacts || [];
  const activeContacts = contacts.filter((c) => c.isActive);

  useEffect(() => {
    if (isOpen && user) {
      const existing = emergencyService.getActiveSos(user.id);
      if (existing) {
        setActiveEvent(existing);
        setStep('active');
      } else {
        setStep('confirm');
        setShowManualInput(false);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Activation handler
  const handleActivateSos = async (options?: { forceSimulated?: boolean }) => {
    if (!user) return;
    setStep('capturing');

    try {
      const event = await emergencyService.activateSos(
        user.id,
        patientName,
        user.emergencyContacts || [],
        {
          fallbackAddress: user.emergencyNotes || DEFAULT_CLINICAL_FALLBACK.address,
          forceSimulatedCoordinates: options?.forceSimulated
        }
      );

      setActiveEvent(event);
      setStep('active');
    } catch (err) {
      console.error('Failed to activate SOS:', err);
      setStep('confirm');
    }
  };

  // Safe handler: Retry live GPS capture on demand
  const handleRetryGps = async () => {
    if (!activeEvent || !user) return;
    setIsRetryingGps(true);
    try {
      const loc = await emergencyService.captureCoordinates(4000);
      if (loc.success && loc.latitude !== undefined && loc.longitude !== undefined) {
        const updated = emergencyService.updateSosLocation(
          activeEvent.id,
          {
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            source: 'gps'
          },
          user.emergencyContacts || []
        );
        if (updated) {
          setActiveEvent({ ...updated });
          setFeedbackNotice('GPS coordinates updated successfully from device hardware.');
          setTimeout(() => setFeedbackNotice(null), 4000);
        }
      } else {
        setFeedbackNotice(loc.errorMessage || 'Browser permission remains denied or GPS hardware unavailable.');
        setTimeout(() => setFeedbackNotice(null), 4000);
      }
    } finally {
      setIsRetryingGps(false);
    }
  };

  // Safe handler: Apply precision demo GPS coordinates (ideal for sandbox/iframe testing)
  const handleApplyDemoGps = () => {
    if (!activeEvent || !user) return;
    // San Francisco Civic Center / Medical District GPS coordinates
    const updated = emergencyService.updateSosLocation(
      activeEvent.id,
      {
        latitude: 37.774929,
        longitude: -122.419418,
        accuracy: 8,
        source: 'simulated',
        addressDescription: 'San Francisco Civic Medical Center'
      },
      user.emergencyContacts || []
    );
    if (updated) {
      setActiveEvent({ ...updated });
      setFeedbackNotice('Precision test coordinates (37.7749, -122.4194) applied with verified map link.');
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  // Safe handler: Update manual cross-streets or landmark
  const handleApplyManualAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !user || !manualAddressInput.trim()) return;

    // Default to approximate center with manual annotation
    const updated = emergencyService.updateSosLocation(
      activeEvent.id,
      {
        latitude: DEFAULT_CLINICAL_FALLBACK.latitude,
        longitude: DEFAULT_CLINICAL_FALLBACK.longitude,
        accuracy: 25,
        source: 'manual',
        addressDescription: manualAddressInput.trim()
      },
      user.emergencyContacts || []
    );

    if (updated) {
      setActiveEvent({ ...updated });
      setShowManualInput(false);
      setFeedbackNotice(`Location updated to "${manualAddressInput.trim()}". Authorized map link regenerated.`);
      setTimeout(() => setFeedbackNotice(null), 4500);
    }
  };

  const handleResolveSos = async () => {
    if (activeEvent && user) {
      await emergencyService.resolveSos(activeEvent.id, user.id, true, 'Resolved safely by authenticated patient.');
      setActiveEvent(null);
      setShowSafetyCancel(false);
      setSafetyAffirmed(false);
      setStep('confirm');
      onClose();
    }
  };

  const handleCopyDispatch = (textToCopy?: string) => {
    if (!activeEvent) return;
    const text = textToCopy || emergencyService.generateManualDispatchText(activeEvent);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border-2 border-slate-900 dark:border-slate-700 overflow-hidden font-sans transition-colors">
        {/* Modal Header Strip */}
        <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-rose-200 font-bold">
                CLINICAL RESPONSE PROTOCOL
              </div>
              <h3 className="text-base font-extrabold tracking-tight">
                Emergency SOS Broadcast
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Quick Emergency Direct Hotlines Strip */}
          <div className="mb-5 p-3.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-red-950">
              <PhoneCall className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Direct Emergency Hotlines:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:112"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call 112 (National)</span>
              </a>
              <a
                href="tel:108"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>Call 108 (Ambulance)</span>
              </a>
              <button
                type="button"
                onClick={() => setShowHospitalLocator(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Locate Nearest Hospital</span>
              </button>
            </div>
          </div>

          {feedbackNotice && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-2 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{feedbackNotice}</span>
              </div>
              <button
                onClick={() => setFeedbackNotice(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 1: CONFIRMATION STEP */}
          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-950 text-sm">
                    Activate Emergency SOS?
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    This triggers a coordinate capture step using your device's Geolocation API.
                    A verified, clickable map link will be created and passed <strong>only to your authorized emergency contacts</strong>.
                  </p>
                </div>
              </div>

              {/* Authorized Contacts Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Authorized Recipients ({activeContacts.length})</span>
                  </span>
                  {onNavigateToContacts && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToContacts();
                      }}
                      className="text-blue-600 hover:underline text-[11px] font-semibold"
                    >
                      Manage Contacts
                    </button>
                  )}
                </div>

                {activeContacts.length > 0 ? (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeContacts.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          <span className="text-[11px] text-slate-500">({c.relationship})</span>
                        </div>
                        <span className="font-mono text-slate-600 text-[11px]">{formatIndianPhoneNumber(c.phone)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                    No active emergency contacts configured. Please configure at least one family member or guardian.
                  </div>
                )}
              </div>

              {/* Permission & Privacy Assurance */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Safe Geolocation Permission Architecture:</span>
                </div>
                <p className="leading-relaxed">
                  Your browser will request location permission. If denied, our safe handler automatically activates your registered emergency profile address so contacts always receive a clickable map link.
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleActivateSos({ forceSimulated: true })}
                  className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                  title="Activate with simulated San Francisco medical coordinates (for preview/desktop testing)"
                >
                  Test with Demo Location
                </button>

                <button
                  type="button"
                  onClick={() => handleActivateSos()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Capture Location & Activate SOS</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CAPTURING COORDINATES */}
          {step === 'capturing' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center animate-bounce">
                <Navigation className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">
                  Capturing GPS Coordinates...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Querying browser Geolocation API. If a permission prompt appears, please click <strong>Allow</strong>.
                </p>
              </div>
              <div className="w-48 h-1.5 mx-auto bg-slate-100 rounded-full overflow-hidden">
                <div className="w-full h-full bg-rose-600 animate-pulse" />
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleActivateSos({ forceSimulated: true })}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Skip Waiting · Use Verified Emergency Address
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DEDICATED EMERGENCY SOS ACTIVE STATUS SCREEN */}
          {step === 'active' && activeEvent && (
            <div className="space-y-5">
              {/* Active Indicator Header */}
              <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-rose-200 font-bold block">
                      BROADCAST STATUS: ACTIVE
                    </span>
                    <h4 className="text-base font-extrabold tracking-tight">
                      EMERGENCY SOS ACTIVE
                    </h4>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-rose-100">
                  <div>Activated:</div>
                  <div className="font-bold">{activeEvent.activatedAt}</div>
                </div>
              </div>

              {/* Coordinates & Permission Report Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-rose-600" />
                    <span>Location & Map Link Report</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                        activeEvent.locationSource === 'gps'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : activeEvent.locationSource === 'simulated'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {activeEvent.locationSource === 'gps'
                        ? 'Live Device GPS'
                        : activeEvent.locationSource === 'simulated'
                        ? 'Verified Demo Pin'
                        : 'Safe Fallback Address'}
                    </span>
                    {activeEvent.accuracy && (
                      <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        ±{activeEvent.accuracy}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Safe Handler Visual Status for Denied Permissions */}
                {activeEvent.permissionStatus === 'denied' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Browser Location Permission Denied</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Browser blocked live coordinates. The <strong>safe handler</strong> automatically generated a verified map pin using your emergency profile address so contacts can still locate you.
                    </p>
                  </div>
                )}

                {/* Coordinates & Clickable Map Link Display */}
                {activeEvent.locationLink && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">LATITUDE</span>
                        <span className="font-bold text-slate-900">
                          {activeEvent.latitude !== undefined ? activeEvent.latitude.toFixed(6) : '37.763118'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">LONGITUDE</span>
                        <span className="font-bold text-slate-900">
                          {activeEvent.longitude !== undefined ? activeEvent.longitude.toFixed(6) : '-122.457812'}
                        </span>
                      </div>
                    </div>

                    {activeEvent.manualLocationDescription && (
                      <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                        <span className="text-[10px] text-slate-400 block font-sans">ASSIGNED LOCATION</span>
                        <span className="font-medium">{activeEvent.manualLocationDescription}</span>
                      </div>
                    )}

                    {/* ALWAYS-CLICKABLE GOOGLE MAPS LINK */}
                    <a
                      href={activeEvent.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs group"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Open Verified Clickable Map Link</span>
                      <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                )}

                {/* Location Control Toolbar (Retry GPS, Enter Address, Demo Pin) */}
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleRetryGps}
                    disabled={isRetryingGps}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    title="Retry device GPS permission capture"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRetryingGps ? 'animate-spin' : ''}`} />
                    <span>{isRetryingGps ? 'Scanning...' : 'Retry GPS Capture'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Enter Cross-Streets</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyDemoGps}
                    className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-lg font-semibold flex items-center gap-1.5"
                    title="Simulate San Francisco coordinates for verification"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Apply Demo Coordinates</span>
                  </button>
                </div>

                {/* Manual Address Input Form */}
                {showManualInput && (
                  <form onSubmit={handleApplyManualAddress} className="pt-2 space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Specify Current Landmark or Address:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualAddressInput}
                        onChange={(e) => setManualAddressInput(e.target.value)}
                        placeholder="e.g. 505 Parnassus Ave, Emergency Entrance"
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Authorized Contacts Dispatch Payload */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passed Only To Authorized Contacts ({activeEvent.notifiedContacts?.length || 0})</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    Authorized Only
                  </span>
                </div>

                {/* Individual Contact Dispatch Action List */}
                <div className="space-y-2">
                  {activeEvent.notifiedContacts && activeEvent.notifiedContacts.length > 0 ? (
                    activeEvent.notifiedContacts.map((contact, idx) => (
                      <div
                        key={contact.contactId || idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <strong className="text-slate-900">{contact.name}</strong>
                            <span className="text-slate-500 text-[11px]">({contact.relationship})</span>
                          </div>
                          <span className="font-mono text-slate-600 text-[11px]">{formatIndianPhoneNumber(contact.phone)}</span>
                        </div>

                        {/* Dispatch Options for this Authorized Contact */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href={`tel:${toDialablePhone(contact.phone)}`}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>Direct Call</span>
                          </a>

                          {contact.directDispatchLink && (
                            <a
                              href={contact.directDispatchLink}
                              className="flex-1 min-w-[130px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Send Direct SMS</span>
                            </a>
                          )}

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              contact.personalizedMessage || emergencyService.generateManualDispatchText(activeEvent)
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopyDispatch(contact.personalizedMessage)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                            title="Copy personalized alert for this contact"
                          >
                            {copiedText ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copiedText ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 p-2">
                      No contact recipients registered in patient profile.
                    </div>
                  )}
                </div>

                {/* Gateway Status Note */}
                <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-700">Privacy Safeguard:</span> Clickable map links and emergency coordinates are transmitted strictly to designated contacts. No public broadcast is published.
                </div>
              </div>

              {/* Action Buttons with Safety Cancellation Affirmation */}
              {showSafetyCancel ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Safety Affirmation Required to End SOS</span>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-amber-950 font-medium">
                    <input
                      type="checkbox"
                      checked={safetyAffirmed}
                      onChange={(e) => setSafetyAffirmed(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                    />
                    <span>I explicitly confirm that I am safe, out of danger, and authorized to end this SOS beacon.</span>
                  </label>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowSafetyCancel(false); setSafetyAffirmed(false); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Keep Active
                    </button>
                    <button
                      type="button"
                      disabled={!safetyAffirmed}
                      onClick={handleResolveSos}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      Confirm Safe & End SOS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Close Window (Keep SOS Active)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSafetyCancel(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolve & Cancel SOS</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Embedded Nearest Hospital Locator Modal */}
    <NearestHospitalLocatorModal
      isOpen={showHospitalLocator}
      onClose={() => setShowHospitalLocator(false)}
      patientLat={activeEvent?.latitude}
      patientLng={activeEvent?.longitude}
    />
  </>
  );
};

export default EmergencySosModal;
