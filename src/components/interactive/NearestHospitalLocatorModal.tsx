import React, { useState, useEffect } from 'react';
import {
  hospitalLocatorService,
  EmergencyHospital
} from '../../services/hospitalLocatorService';
import { toDialablePhone } from '../../utils/phoneUtils';
import {
  Building2,
  Navigation,
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Baby,
  RefreshCw,
  ExternalLink,
  X,
  Compass,
  Activity
} from 'lucide-react';

interface NearestHospitalLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat?: number;
  userLng?: number;
  patientLat?: number;
  patientLng?: number;
}

export const NearestHospitalLocatorModal: React.FC<NearestHospitalLocatorModalProps> = ({
  isOpen,
  onClose,
  userLat,
  userLng,
  patientLat,
  patientLng
}) => {
  const propLat = userLat ?? patientLat;
  const propLng = userLng ?? patientLng;
  const [currentLat, setCurrentLat] = useState<number | undefined>(propLat);
  const [currentLng, setCurrentLng] = useState<number | undefined>(propLng);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<'all' | 'trauma' | 'cardiac' | 'pediatric'>('all');
  const [hospitals, setHospitals] = useState<EmergencyHospital[]>([]);

  // Geolocation detection
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLat(pos.coords.latitude);
        setCurrentLng(pos.coords.longitude);
        setIsDetectingGps(false);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('Unable to retrieve exact GPS location. Showing nearest regional trauma hospitals.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (isOpen) {
      if (typeof propLat === 'number' && typeof propLng === 'number') {
        setCurrentLat(propLat);
        setCurrentLng(propLng);
      } else if (!currentLat || !currentLng) {
        refreshLocation();
      }
    }
  }, [isOpen, propLat, propLng]);

  // Update hospital list whenever coordinates or filter change
  useEffect(() => {
    const list = hospitalLocatorService.getNearbyHospitals(currentLat, currentLng, filterTag);
    setHospitals(list);
  }, [currentLat, currentLng, filterTag]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 rounded-2xl shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Nearest Emergency Hospitals & Trauma Centers
                </h2>
                <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold uppercase rounded-md tracking-wider">
                  24/7 Casualty
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time proximity sorted hospitals equipped with emergency ICU, trauma surgery, and cardiac resuscitation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Hospital Locator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Status & Control Strip */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              GPS Location:{' '}
              {currentLat && currentLng ? (
                <strong className="font-mono text-slate-900 dark:text-white">
                  {currentLat.toFixed(4)}°N, {currentLng.toFixed(4)}°E
                </strong>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Detecting...</span>
              )}
            </span>

            <button
              onClick={refreshLocation}
              disabled={isDetectingGps}
              className="ml-2 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
              <span>{isDetectingGps ? 'Scanning GPS...' : 'Refresh GPS'}</span>
            </button>
          </div>

          <a
            href={hospitalLocatorService.getGoogleMapsSearchUrl(currentLat, currentLng)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Search All on Google Maps</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        {gpsError && (
          <div className="px-5 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">Filter Facility:</span>

          <button
            onClick={() => setFilterTag('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTag === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Emergency Centers ({hospitalLocatorService.getNearbyHospitals(currentLat, currentLng, 'all').length})
          </button>

          <button
            onClick={() => setFilterTag('trauma')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTag === 'trauma'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Level 1 & 2 Trauma Centers
          </button>

          <button
            onClick={() => setFilterTag('cardiac')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterTag === 'cardiac'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Heart className="w-3 h-3 text-red-400" />
            <span>Cath Lab / Cardiac Ready</span>
          </button>

          <button
            onClick={() => setFilterTag('pediatric')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterTag === 'pediatric'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Baby className="w-3 h-3 text-indigo-300" />
            <span>Pediatric Emergency</span>
          </button>
        </div>

        {/* Scrollable Hospitals List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {hospitals.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No emergency facilities match the active filter. Please select "All Emergency Centers".
            </div>
          ) : (
            hospitals.map((hosp, idx) => (
              <div
                key={hosp.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-3xl shadow-xs transition-all space-y-3"
              >
                {/* Header Line */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] rounded-md">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {hosp.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-[10px] rounded-md">
                        {hosp.traumaLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{hosp.address}, {hosp.city}, {hosp.state}</span>
                    </p>
                  </div>

                  {/* Distance & Time Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                      <div className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-300">
                        {hosp.distanceKm} km
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 justify-center">
                        <Clock className="w-2.5 h-2.5" />
                        <span>~{hosp.estimatedTransitMinutes}m drive</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capability Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {hosp.open24_7 && (
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-md font-semibold">
                      24/7 Trauma Bay
                    </span>
                  )}
                  {hosp.hasIcu && (
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md font-semibold">
                      ICU Ready
                    </span>
                  )}
                  {hosp.hasCathLab && (
                    <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-md font-semibold flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5" />
                      Cath Lab
                    </span>
                  )}
                  {hosp.hasPediatricEmergency && (
                    <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-md font-semibold">
                      Pediatric ER
                    </span>
                  )}
                  {hosp.hasBloodBank && (
                    <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-md font-semibold">
                      Blood Bank
                    </span>
                  )}
                  <span className="text-slate-400 ml-auto font-mono text-[10px]">
                    ⭐ {hosp.rating} / 5.0
                  </span>
                </div>

                {/* Direct Action Buttons: DIRECT CALL & NAVIGATION */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* DIRECT CALL EMERGENCY CASUALTY */}
                  <a
                    href={`tel:${toDialablePhone(hosp.emergencyPhone)}`}
                    className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
                  >
                    <PhoneCall className="w-4 h-4 animate-bounce" />
                    <span>Direct Call Casualty ({hosp.emergencyPhone})</span>
                  </a>

                  {/* DIRECT CALL HOSPITAL AMBULANCE */}
                  <a
                    href={`tel:${toDialablePhone(hosp.ambulancePhone)}`}
                    className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Call Ambulance ({hosp.ambulancePhone})</span>
                  </a>

                  {/* TURN-BY-TURN GOOGLE MAPS NAVIGATION */}
                  <a
                    href={hospitalLocatorService.getDirectionsUrl(hosp, currentLat, currentLng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Turn-by-Turn Directions</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified 24/7 Clinical Emergency Infrastructure · Direct Cellular Telephony Link</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
