import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { RoutePath } from '../../types';
import { useLanguage } from '../../i18n';

interface MedicalDisclaimerBannerProps {
  onNavigate: (route: RoutePath) => void;
}

export const MedicalDisclaimerBanner: React.FC<MedicalDisclaimerBannerProps> = ({ onNavigate }) => {
  const [minimized, setMinimized] = useState(false);
  const { t } = useLanguage();

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg hover:bg-slate-800 transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('disclaimerBanner.badge')}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>{t('disclaimerBanner.badge')}</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Clinical safety disclaimer"
      className="bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/40 px-4 py-2.5 text-xs text-amber-950 dark:text-amber-200 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-start sm:items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="leading-relaxed">
            <span className="font-semibold text-amber-900 dark:text-amber-300">{t('disclaimerBanner.badge')}: </span>
            {t('disclaimerBanner.text')}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onNavigate('/medical-disclaimer')}
            className="font-medium text-amber-900 dark:text-amber-300 underline hover:text-amber-950 dark:hover:text-amber-100 whitespace-nowrap focus:outline-none focus:ring-1 focus:ring-amber-500 rounded cursor-pointer"
          >
            {t('disclaimerBanner.learnMore')}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 p-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            aria-label="Minimize disclaimer banner"
            title="Minimize disclaimer notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

