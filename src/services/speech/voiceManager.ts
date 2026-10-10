/**
 * Speech Voice Manager
 * Discovers, filters, and selects the most accurate local and neural voices for:
 * - English (en-IN Indian English preferred, with en-US/en-GB fallback)
 * - Hindi (hi-IN native Hindi voice)
 * - Bengali (bn-IN / bn-BD native Bengali voice)
 * - Hinglish (en-IN Indian English / hi-IN bilingual Indian voice)
 */

import { SpeechLanguage } from './languageDetector';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  lang: string;
  isNative: boolean;
  isIndianLocale: boolean;
}

export class VoiceManager {
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static listeners: Set<(voices: SpeechSynthesisVoice[]) => void> = new Set();
  private static initialized = false;

  public static initialize(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.initialized) return;

    this.initialized = true;
    this.refreshVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.refreshVoices();
      };
    }
  }

  public static refreshVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        this.cachedVoices = voices;
        this.listeners.forEach((l) => l(voices));
      }
    } catch (e) {
      console.warn('VoiceManager refresh error:', e);
    }
    return this.cachedVoices;
  }

  public static onVoicesChanged(listener: (voices: SpeechSynthesisVoice[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getAllVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0) {
      this.refreshVoices();
    }
    return this.cachedVoices;
  }

  /**
   * Resolves the best matched voice for the target language
   */
  public static selectBestVoice(
    language: SpeechLanguage,
    preferredVoiceURI?: string
  ): { voice: SpeechSynthesisVoice | null; locale: string } {
    const all = this.getAllVoices();

    // 1. If user explicitly picked a voice URI, check if it exists
    if (preferredVoiceURI) {
      const explicit = all.find((v) => v.voiceURI === preferredVoiceURI);
      if (explicit) {
        return { voice: explicit, locale: explicit.lang };
      }
    }

    switch (language) {
      case 'bn': {
        // Bengali Voice: Look for bn-IN or bn-BD or voices with 'bengali' / 'bangla' in name
        const bnVoice = all.find(
          (v) =>
            v.lang.toLowerCase().startsWith('bn') ||
            v.name.toLowerCase().includes('bengali') ||
            v.name.toLowerCase().includes('bangla')
        );
        return {
          voice: bnVoice || null,
          locale: bnVoice ? bnVoice.lang : 'bn-IN'
        };
      }

      case 'hi': {
        // Hindi Voice: Look for hi-IN or voices with 'hindi' in name
        const hiVoice = all.find(
          (v) =>
            v.lang.toLowerCase().startsWith('hi') ||
            v.name.toLowerCase().includes('hindi')
        );
        return {
          voice: hiVoice || null,
          locale: hiVoice ? hiVoice.lang : 'hi-IN'
        };
      }

      case 'hinglish': {
        // Hinglish: Indian English (en-IN) voice produces the most natural conversational cadence
        // for mixed Hindi-English words
        const indianEngVoice = all.find(
          (v) =>
            v.lang.toLowerCase() === 'en-in' ||
            (v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('india'))
        );

        if (indianEngVoice) {
          return { voice: indianEngVoice, locale: 'en-IN' };
        }

        // Fallback: Check for native Hindi voice that handles Latin phonemes
        const hiVoice = all.find((v) => v.lang.toLowerCase().startsWith('hi'));
        if (hiVoice) {
          return { voice: hiVoice, locale: 'hi-IN' };
        }

        // Standard English fallback
        const standardEng = all.find((v) => v.lang.toLowerCase().startsWith('en'));
        return { voice: standardEng || null, locale: 'en-IN' };
      }

      case 'en':
      default: {
        // English: Prefer Indian English (en-IN) in clinical context, then en-US/en-GB
        const indianEngVoice = all.find(
          (v) =>
            v.lang.toLowerCase() === 'en-in' ||
            (v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('india'))
        );

        if (indianEngVoice) {
          return { voice: indianEngVoice, locale: 'en-IN' };
        }

        const standardEng = all.find((v) => v.lang.toLowerCase().startsWith('en'));
        return { voice: standardEng || null, locale: 'en-US' };
      }
    }
  }

  /**
   * Returns available voice options grouped for the UI selector
   */
  public static getAvailableVoiceOptions(): VoiceOption[] {
    const all = this.getAllVoices();
    return all.map((v) => {
      const isIndian =
        v.lang.toLowerCase().includes('-in') ||
        v.name.toLowerCase().includes('india') ||
        v.lang.toLowerCase().startsWith('hi') ||
        v.lang.toLowerCase().startsWith('bn');

      return {
        voice: v,
        displayName: `${v.name} (${v.lang})`,
        lang: v.lang,
        isNative: v.localService,
        isIndianLocale: isIndian
      };
    });
  }
}

// Auto-initialize on module load
VoiceManager.initialize();
