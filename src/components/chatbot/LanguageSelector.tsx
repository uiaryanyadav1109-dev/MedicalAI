import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../../types/chat';
import { Globe, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  compact?: boolean;
  dropUp?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  compact = false,
  dropUp = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors text-slate-700 dark:text-slate-200 shadow-2xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
          compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Select Medical Chat Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="truncate">
          {selected.flag} {selected.nativeName}
        </span>
        {dropUp ? (
          <ChevronUp className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        ) : (
          <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 z-50 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl py-2 focus:outline-none max-h-80 overflow-y-auto animate-in fade-in-50 zoom-in-95 ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-1.5'
          }`}
        >
          <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/80 mb-1 flex items-center justify-between">
            <span>Select Consultation Language</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold">
              12 Available
            </span>
          </div>
          <div className="space-y-0.5 px-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isCurrent = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {lang.name}
                      </span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="p-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
