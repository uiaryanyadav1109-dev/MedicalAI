import React, { useState, useEffect } from 'react';
import { sosManager, SOSState, SOSCountdownState } from '../../services/sosManager';
import { EmergencyEvent } from '../../types';
import { NearestHospitalLocatorModal } from './NearestHospitalLocatorModal';
import {
  AlertTriangle,
  Radio,
  MapPin,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Volume2,
  Navigation,
  PhoneCall,
  Building2,
  Ambulance
} from 'lucide-react';

interface EmergencySosCountdownModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const EmergencySosCountdownModal: React.FC<EmergencySosCountdownModalProps> = ({
  isOpen: propIsOpen,
  onClose
}) => {
  const [sosState, setSosState] = useState<SOSState>(sosManager.getState());
  const [countdown, setCountdown] = useState<SOSCountdownState>({
    secondsRemaining: sosManager.getSecondsRemaining(),
    totalSeconds: 5,
    isCancelled: false
  });
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | null>(sosManager.getActiveEvent());
  const [showHospitalLocator, setShowHospitalLocator] = useState(false);

  useEffect(() => {
    const unsubscribe = sosManager.subscribe((state, cd, event) => {
      setSosState(state);
      if (cd) setCountdown(cd);
      if (event) setActiveEvent(event);
    });

    return unsubscribe;
  }, []);

  const isVisible = propIsOpen || sosState === 'countdown' || sosState === 'dispatching' || sosState === 'active';

  if (!isVisible && sosState === 'idle') return null;

  const handleCancel = () => {
    sosManager.cancelCountdown();
    if (onClose) onClose();
  };

  const handleResolve = () => {
    sosManager.resolveSOS();
    if (onClose) onClose();
  };

  const progressPercent = ((5 - countdown.secondsRemaining) / 5) * 100;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-lg bg-neutral-950 border-2 border-red-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-red-950/80 relative overflow-hidden max-h-[92vh] overflow-y-auto">
          
          {/* Pulsing ambient emergency background ring */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-700/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* 1. COUNTDOWN STATE */}
          {sosState === 'countdown' && (
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950 border border-red-500/50 text-red-300 text-xs font-mono font-bold tracking-wider mb-6">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span>LOCK-SCREEN DISTRESS SIGNAL INITIATED</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Emergency SOS Triggered
              </h2>
              <p className="text-neutral-300 text-sm max-w-sm mb-6">
                Transmitting live GPS coordinates and alerting emergency dispatch and primary contacts in:
              </p>

              {/* Huge 5-Second Pulsing Radial Countdown */}
              <div className="relative w-44 h-44 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="78"
                    className="stroke-neutral-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="78"
                    className="stroke-red-600 transition-all duration-1000 ease-linear"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 78}
                    strokeDashoffset={(2 * Math.PI * 78) * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-6xl font-black font-mono text-red-500 tracking-tighter animate-ping-once">
                    {countdown.secondsRemaining}
                  </span>
                  <span className="text-[11px] font-mono text-red-300 uppercase tracking-widest mt-1">
                    Seconds
                  </span>
                </div>
              </div>

              {/* Audio & Haptic Sensory Indicator */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-4 mb-6">
                <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Escalating siren beeps & haptic pulses active</span>
              </div>

              {/* Direct Instant Action Strip during countdown */}
              <div className="w-full grid grid-cols-2 gap-2 mb-4">
                <a
                  href="tel:112"
                  className="py-3 px-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/60 text-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-red-400" />
                  <span>Call 112 Now</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowHospitalLocator(true)}
                  className="py-3 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>Locate Hospital</span>
                </button>
              </div>

              {/* Large, High-Contrast CANCEL Button */}
              <button
                onClick={handleCancel}
                className="w-full py-4 px-6 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-600 hover:border-neutral-400 text-white font-bold text-base tracking-wide transition-all duration-150 flex items-center justify-center gap-3 shadow-lg active:scale-98"
              >
                <XCircle className="w-5 h-5 text-neutral-300" />
                <span>CANCEL SOS (ACCIDENTAL TRIGGER)</span>
              </button>
            </div>
          )}

          {/* 2. DISPATCHING STATE */}
          {sosState === 'dispatching' && (
            <div className="flex flex-col items-center text-center py-8 relative z-10">
              <div className="w-20 h-20 rounded-full bg-red-900/40 border-2 border-red-500 flex items-center justify-center mb-6 animate-pulse">
                <Navigation className="w-10 h-10 text-red-400 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Acquiring High-Precision GPS...</h3>
              <p className="text-neutral-400 text-sm max-w-xs mb-6">
                Locking satellite coordinates and packaging secure dispatch payload for emergency responders.
              </p>
              <div className="flex gap-3 w-full">
                <a
                  href="tel:112"
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 112 Direct</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowHospitalLocator(true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Find ER Hospitals</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. ACTIVE SOS TRANSMISSION STATE */}
          {sosState === 'active' && (
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-red-600/20 border-2 border-red-500 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-red-500" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 font-mono text-xs font-bold mb-3">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>SOS TRANSMISSION ACTIVE</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
                Help is on the way
              </h2>
              <p className="text-neutral-400 text-xs mb-5 max-w-sm">
                Distress beacon broadcasted. Location telemetry transmitted strictly to authorized emergency responders.
              </p>

              {/* Quick Direct Calling Hotline Grid */}
              <div className="w-full grid grid-cols-2 gap-2 mb-4">
                <a
                  href="tel:112"
                  className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call 112 (National)</span>
                </a>
                <a
                  href="tel:108"
                  className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Call 108 (Ambulance)</span>
                </a>
              </div>

              {/* Locate Nearest Hospital Highlight Button */}
              <button
                type="button"
                onClick={() => setShowHospitalLocator(true)}
                className="w-full py-3 px-4 mb-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Locate Nearest Hospitals & Trauma Centers</span>
              </button>

              {/* Coordinates / Map Preview */}
              <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 mb-5 text-left space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Activated Timestamp</span>
                  <span className="font-mono text-neutral-200">{activeEvent?.activatedAt || 'Now'}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">GPS Coordinates</span>
                  <span className="font-mono text-red-400 font-semibold">
                    {activeEvent?.latitude && activeEvent?.longitude
                      ? `${activeEvent.latitude.toFixed(5)}, ${activeEvent.longitude.toFixed(5)}`
                      : 'Emergency Clinical Fallback'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Contacts Alerted</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeEvent?.contactsAlertedCount || 1} Notified</span>
                  </span>
                </div>

                {activeEvent?.locationLink && (
                  <div className="pt-2">
                    <a
                      href={activeEvent.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open Live Satellite Coordinates Map</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>

              {/* Resolve Button */}
              <button
                onClick={handleResolve}
                className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mark SOS as Resolved / Safe</span>
              </button>
            </div>
          )}

          {/* 4. CANCELLED ACKNOWLEDGEMENT STATE */}
          {sosState === 'cancelled' && (
            <div className="flex flex-col items-center text-center py-6 relative z-10">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">SOS Trigger Aborted</h3>
              <p className="text-neutral-400 text-xs">
                No distress signals were transmitted. The emergency beacon has been securely reset.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Embedded Hospital Locator Modal */}
      <NearestHospitalLocatorModal
        isOpen={showHospitalLocator}
        onClose={() => setShowHospitalLocator(false)}
        patientLat={activeEvent?.latitude}
        patientLng={activeEvent?.longitude}
      />
    </>
  );
};

export default EmergencySosCountdownModal;

