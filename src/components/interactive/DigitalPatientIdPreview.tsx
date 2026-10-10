import React from 'react';
import { RoutePath } from '../../types';
import { PatientCard } from '../dashboard/patient/PatientCard';
import { CreditCard, Sparkles } from 'lucide-react';

interface DigitalPatientIdPreviewProps {
  onNavigate?: (route: RoutePath) => void;
}

export const DigitalPatientIdPreview: React.FC<DigitalPatientIdPreviewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-3 font-sans w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
            Interactive 16:9 Healthcare ID Badge
          </span>
        </div>
        <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Interactive 3D Flip</span>
        </span>
      </div>

      <PatientCard onNavigate={onNavigate} />
    </div>
  );
};

