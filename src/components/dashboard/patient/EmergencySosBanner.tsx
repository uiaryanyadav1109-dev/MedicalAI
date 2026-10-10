import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { emergencyService } from '../../../services/emergencyService';
import { EmergencyEvent } from '../../../types';
import { MapPin, Radio, ExternalLink, CheckCircle2 } from 'lucide-react';

interface EmergencySosBannerProps {
  onOpenSosModal: () => void;
}

export const EmergencySosBanner: React.FC<EmergencySosBannerProps> = ({
  onOpenSosModal
}) => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<EmergencyEvent | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    const update = () => {
      setActiveEvent(emergencyService.getActiveSos(user.id));
    };
    update();
    const unsubscribe = emergencyService.subscribe(update);
    return unsubscribe;
  }, [user]);

  if (!activeEvent) return null;

  return (
    <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 text-white px-4 py-3.5 rounded-2xl shadow-lg border border-rose-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Radio className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-rose-950/80 text-rose-200 border border-rose-400/40 px-2 py-0.5 rounded-full font-bold">
              ACTIVE SOS ALERT
            </span>
            <span className="text-xs text-rose-100 font-mono">
              Activated at {activeEvent.activatedAt}
            </span>
          </div>
          <div className="text-xs font-semibold mt-0.5 flex flex-wrap items-center gap-2">
            <span>Location transmitted strictly to authorized emergency contacts.</span>
            {activeEvent.latitude && activeEvent.longitude && (
              <span className="font-mono text-rose-200 bg-white/10 px-1.5 py-0.5 rounded text-[11px]">
                ({activeEvent.latitude.toFixed(4)}, {activeEvent.longitude.toFixed(4)})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {activeEvent.locationLink && (
          <a
            href={activeEvent.locationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-1 shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map Link</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        )}

        <button
          onClick={onOpenSosModal}
          className="px-3.5 py-1.5 bg-white text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
        >
          View SOS Details
        </button>

        <button
          onClick={() => emergencyService.resolveSos(activeEvent.id, user?.id, true)}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 shadow-xs"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Resolve</span>
        </button>
      </div>
    </div>
  );
};

export default EmergencySosBanner;
