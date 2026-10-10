import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppLanguage, APP_LANGUAGES, LanguageContextType, TranslationDictionary } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { bn } from './locales/bn';

const STORAGE_KEY = 'medical_ai_language_preference';

const dictionaries: Record<AppLanguage, TranslationDictionary> = {
  en,
  hi,
  bn
};

const localeMap: Record<AppLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-IN'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'bn')) {
      return saved;
    }
    
    // Auto-detect browser language if available
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('bn')) return 'bn';
  } catch {
    // In case localStorage is blocked or in private mode
  }
  return 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(getInitialLanguage);

  const setLanguage = useCallback((newLang: AppLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  }, []);

  useEffect(() => {
    // Keep html lang attribute in sync for accessibility & SEO
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-lang', language);
  }, [language]);

  /**
   * Helper function to retrieve nested translation keys using dot notation (e.g. 'nav.home')
   * Fallback strategy:
   * 1. Check current language dictionary
   * 2. Fallback to English dictionary if key is missing
   * 3. Fallback to the raw key string if neither has it
   * Supports parameter interpolation: 'Welcome {{name}}' -> 'Welcome John'
   */
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const getNested = (dict: TranslationDictionary, path: string): any => {
      const parts = path.split('.');
      let current = dict;
      for (const part of parts) {
        if (current === undefined || current === null || typeof current !== 'object') {
          return undefined;
        }
        current = current[part];
      }
      return current;
    };

    let result = getNested(dictionaries[language], key);
    if (result === undefined || result === null) {
      result = getNested(dictionaries.en, key);
    }

    if (result === undefined || result === null) {
      return key;
    }

    if (typeof result !== 'string') {
      return String(result);
    }

    if (params) {
      let interpolated = result;
      for (const [pKey, pVal] of Object.entries(params)) {
        interpolated = interpolated.replace(new RegExp(`{{\\s*${pKey}\\s*}}`, 'g'), String(pVal));
        interpolated = interpolated.replace(new RegExp(`{\\s*${pKey}\\s*}`, 'g'), String(pVal));
      }
      return interpolated;
    }

    return result;
  }, [language]);

  const formatDate = useCallback((date: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      const locale = localeMap[language] || 'en-US';
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
    } catch {
      return String(date);
    }
  }, [language]);

  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions): string => {
    try {
      const locale = localeMap[language] || 'en-US';
      return new Intl.NumberFormat(locale, options).format(num);
    } catch {
      return String(num);
    }
  }, [language]);

  const formatCurrency = useCallback((amount: number, currency: string = 'INR'): string => {
    try {
      const locale = localeMap[language] || 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${currency} ${amount}`;
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    languages: APP_LANGUAGES
  }), [language, setLanguage, t, formatDate, formatNumber, formatCurrency]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
