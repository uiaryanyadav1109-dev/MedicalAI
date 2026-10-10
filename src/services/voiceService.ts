/**
 * Medical AI Voice Service
 * Comprehensive Speech-to-Text (STT) and Multilingual Text-to-Speech (TTS) Engine
 * Supports:
 * - Real Web Speech Recognition (SpeechRecognition / webkitSpeechRecognition)
 * - Multilingual TTS for English, Hindi (हिन्दी), Bengali (বাংলা), and Hinglish (Latin conversational Hindi)
 * - Automatic Unicode script & Hinglish language detection
 * - Medical text cleaning & chunk-based queue playback (resolves Chrome 15s freeze & cutoff)
 * - Complete playback controls: Play, Pause, Resume, Stop, Replay, and Speed regulation (0.75x - 1.5x)
 */

import { LanguageCode } from '../types/chat';
import {
  LanguageDetector,
  SpeechLanguage,
  TextPreprocessor,
  VoiceManager,
  speechQueue,
  PlaybackState,
  PlaybackListener
} from './speech';

export type VoiceState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'error';
export type TTSState = 'idle' | 'speaking' | 'paused';

export interface VoiceSettings {
  voiceInputEnabled: boolean;
  voiceOutputEnabled: boolean;
  speechSpeed: number;
  autoPlayResponses: boolean;
  selectedVoiceURI: string;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
  speechSpeed: 1.0,
  autoPlayResponses: false,
  selectedVoiceURI: ''
};

const SETTINGS_KEY = 'medical_ai_voice_settings_v1';

// BCP-47 Language Tags for Clinical Voice
const LANGUAGE_LOCALE_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  hinglish: 'en-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  pa: 'pa-IN',
  ur: 'ur-IN'
};

class VoiceServiceManager {
  private recognition: any = null;
  private isListeningActive = false;
  private currentVoiceState: VoiceState = 'idle';
  private settings: VoiceSettings;
  private legacySpeechListeners: Set<(state: { isSpeaking: boolean }) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();

    // Sync legacy speech listeners with new speechQueue state
    speechQueue.subscribe((state) => {
      const isSpeaking = state.status === 'playing';
      this.legacySpeechListeners.forEach((l) => {
        try {
          l({ isSpeaking });
        } catch (err) {
          console.error('Legacy speech listener error:', err);
        }
      });
    });
  }

  // ==================== SUBSCRIPTION & CONTROLS ====================

  /**
   * Subscribe to full audio playback state (status, messageId, progress, language, speed)
   */
  public subscribePlaybackState(listener: PlaybackListener): () => void {
    return speechQueue.subscribe(listener);
  }

  /**
   * Legacy subscriber for boolean isSpeaking
   */
  public subscribeState(listener: (state: { isSpeaking: boolean }) => void): () => void {
    this.legacySpeechListeners.add(listener);
    listener({ isSpeaking: speechQueue.getState().status === 'playing' });
    return () => {
      this.legacySpeechListeners.delete(listener);
    };
  }

  public getPlaybackState(): PlaybackState {
    return speechQueue.getState();
  }

  // ==================== SETTINGS ====================

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<VoiceSettings>): VoiceSettings {
    this.settings = { ...this.settings, ...updates };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed saving voice settings:', e);
    }
    if (updates.speechSpeed !== undefined) {
      speechQueue.setSpeed(updates.speechSpeed);
    }
    if (updates.selectedVoiceURI !== undefined) {
      speechQueue.setPreferredVoiceURI(updates.selectedVoiceURI);
    }
    return this.getSettings();
  }

  private loadSettings(): VoiceSettings {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed loading voice settings:', e);
    }
    return { ...DEFAULT_VOICE_SETTINGS };
  }

  // ==================== SPEECH-TO-TEXT (STT) ====================

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public async hasMicrophonePermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      if ((navigator as any).permissions?.query) {
        const status = await (navigator as any).permissions.query({ name: 'microphone' });
        return status.state === 'granted';
      }
    } catch {
      // Fallback
    }
    return false;
  }

  public async requestMicrophonePermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }
    try {
      this.currentVoiceState = 'requesting_permission';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      this.currentVoiceState = 'idle';
      return true;
    } catch (err: any) {
      console.warn('Microphone permission denied or unavailable:', err);
      this.currentVoiceState = 'error';
      return false;
    }
  }

  public async startSpeechRecognition(
    language: LanguageCode = 'en',
    callbacks?: {
      onTranscript?: (transcript: string, isFinal: boolean) => void;
      onError?: (error: string) => void;
      onEnd?: () => void;
      onStateChange?: (state: VoiceState, error?: string) => void;
    }
  ): Promise<boolean> {
    if (!this.isSTTSupported()) {
      callbacks?.onError?.('Speech recognition is not supported on this browser.');
      callbacks?.onStateChange?.('error', 'Speech recognition not supported');
      return false;
    }

    if (!this.settings.voiceInputEnabled) {
      callbacks?.onError?.('Voice input is disabled in settings.');
      callbacks?.onStateChange?.('error', 'Voice input is disabled');
      return false;
    }

    this.stopSpeechRecognition();

    try {
      const win = window as any;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      this.recognition = new SpeechRec();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      const targetLocale = LANGUAGE_LOCALE_MAP[language] || 'en-IN';
      this.recognition.lang = targetLocale;

      this.recognition.onstart = () => {
        this.isListeningActive = true;
        this.currentVoiceState = 'listening';
        callbacks?.onStateChange?.('listening');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            finalTranscript += text + ' ';
          } else {
            interimTranscript += text;
          }
        }

        const combined = (finalTranscript + interimTranscript).trim();
        if (combined) {
          callbacks?.onTranscript?.(combined, !!finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'no-speech') {
          return;
        }
        this.currentVoiceState = 'error';
        let msg = 'Could not process microphone audio.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone access blocked. Please enable microphone permissions.';
        } else if (event.error === 'network') {
          msg = 'Network connection required for speech recognition.';
        }
        callbacks?.onError?.(msg);
        callbacks?.onStateChange?.('error', msg);
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
        if (this.currentVoiceState === 'listening') {
          this.currentVoiceState = 'idle';
        }
        callbacks?.onEnd?.();
        callbacks?.onStateChange?.('idle');
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error('Failed starting speech recognition:', err);
      this.currentVoiceState = 'error';
      callbacks?.onError?.(err?.message || 'Failed to initialize microphone.');
      return false;
    }
  }

  public stopSpeechRecognition(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
    this.isListeningActive = false;
    this.currentVoiceState = 'idle';
  }

  public isListening(): boolean {
    return this.isListeningActive;
  }

  public getVoiceState(): VoiceState {
    return this.currentVoiceState;
  }

  // ==================== TEXT-TO-SPEECH (TTS) ====================

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return VoiceManager.getAllVoices();
  }

  /**
   * Prepares clinical assistant text for speech
   */
  public prepareTextForSpeech(text: string, language: SpeechLanguage = 'en'): string {
    return TextPreprocessor.cleanForSpeech(text, language);
  }

  /**
   * Speaks a specific message with dedicated playback controls & automatic language detection
   */
  public speakMessage(
    messageId: string,
    rawText: string,
    languageOverride?: SpeechLanguage
  ): { detectedLanguage: SpeechLanguage; totalChunks: number } {
    if (!this.isTTSSupported() || !this.settings.voiceOutputEnabled) {
      return { detectedLanguage: 'en', totalChunks: 0 };
    }

    // 1. Determine Language
    const detected = languageOverride || LanguageDetector.detect(rawText).language;

    // 2. Preprocess & Chunk
    const { chunks } = TextPreprocessor.process(rawText, detected);

    // 3. Play via SpeechQueue
    speechQueue.setSpeed(this.settings.speechSpeed || 1.0);
    speechQueue.play(messageId, chunks, detected, this.settings.selectedVoiceURI);

    return { detectedLanguage: detected, totalChunks: chunks.length };
  }

  /**
   * Backward-compatible speak method
   */
  public speak(
    rawText: string,
    languageHint?: LanguageCode,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): void {
    if (!this.isTTSSupported() || !this.settings.voiceOutputEnabled) {
      callbacks?.onError?.('Speech playback is not supported or disabled.');
      return;
    }

    const detected = LanguageDetector.detect(rawText, languageHint as any).language;
    const { chunks } = TextPreprocessor.process(rawText, detected);

    if (chunks.length === 0) {
      callbacks?.onEnd?.();
      return;
    }

    const unsub = speechQueue.subscribe((state) => {
      if (state.status === 'playing') {
        callbacks?.onStart?.();
      } else if (state.status === 'idle') {
        unsub();
        callbacks?.onEnd?.();
      } else if (state.status === 'error') {
        unsub();
        callbacks?.onError?.(state.errorMessage || 'Playback error');
      }
    });

    speechQueue.setSpeed(this.settings.speechSpeed || 1.0);
    speechQueue.play('direct-speak-' + Date.now(), chunks, detected, this.settings.selectedVoiceURI);
  }

  public stopSpeaking(): void {
    speechQueue.stop();
  }

  public pauseSpeaking(): void {
    speechQueue.pause();
  }

  public resumeSpeaking(): void {
    speechQueue.resume();
  }

  public replaySpeaking(): void {
    speechQueue.replay();
  }

  public setSpeed(speed: number): void {
    this.updateSettings({ speechSpeed: speed });
    speechQueue.setSpeed(speed);
  }

  public isSpeaking(): boolean {
    return speechQueue.getState().status === 'playing';
  }
}

export const voiceService = new VoiceServiceManager();
