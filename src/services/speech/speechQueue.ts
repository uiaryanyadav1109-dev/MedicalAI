/**
 * Robust Speech Playback Queue Runner
 * Handles:
 * - Chunk-by-chunk sequential playback
 * - Chrome 15s freeze & GC avoidance
 * - Play, Pause, Resume, Stop, and Replay
 * - Speed adjustments (0.75x, 1.0x, 1.25x, 1.5x)
 * - Fine-grained progress tracking (current chunk / total chunks, percentage)
 * - State broadcast to UI components
 */

import { SpeechLanguage } from './languageDetector';
import { VoiceManager } from './voiceManager';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlaybackState {
  status: PlaybackStatus;
  messageId: string | null;
  language: SpeechLanguage;
  currentChunkIndex: number;
  totalChunks: number;
  progressPercent: number;
  speed: number;
  errorMessage?: string;
}

export type PlaybackListener = (state: PlaybackState) => void;

export class SpeechQueue {
  private chunks: string[] = [];
  private currentChunkIndex: number = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private messageId: string | null = null;
  private targetLanguage: SpeechLanguage = 'en';
  private status: PlaybackStatus = 'idle';
  private speed: number = 1.0;
  private errorMessage?: string;
  private preferredVoiceURI?: string;
  private listeners: Set<PlaybackListener> = new Set();
  private keepAliveTimer: any = null;

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((l) => {
      try {
        l(state);
      } catch (err) {
        console.error('Playback listener error:', err);
      }
    });
  }

  public getState(): PlaybackState {
    const total = this.chunks.length;
    const progressPercent = total > 0 ? Math.round(((this.currentChunkIndex + 1) / total) * 100) : 0;
    return {
      status: this.status,
      messageId: this.messageId,
      language: this.targetLanguage,
      currentChunkIndex: this.currentChunkIndex,
      totalChunks: total,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
      speed: this.speed,
      errorMessage: this.errorMessage
    };
  }

  public setSpeed(newSpeed: number): void {
    this.speed = Math.max(0.5, Math.min(2.0, newSpeed));
    if (this.currentUtterance) {
      this.currentUtterance.rate = this.speed;
    }
    this.notify();
  }

  public setPreferredVoiceURI(uri: string): void {
    this.preferredVoiceURI = uri;
  }

  /**
   * Starts playing chunks for a message
   */
  public play(
    messageId: string,
    chunks: string[],
    language: SpeechLanguage,
    preferredVoiceURI?: string
  ): void {
    this.stop(); // Stop any existing playback first

    if (!chunks || chunks.length === 0) {
      this.status = 'idle';
      this.notify();
      return;
    }

    if (preferredVoiceURI) {
      this.preferredVoiceURI = preferredVoiceURI;
    }

    this.messageId = messageId;
    this.chunks = chunks;
    this.currentChunkIndex = 0;
    this.targetLanguage = language;
    this.errorMessage = undefined;
    this.status = 'playing';
    this.notify();

    this.startKeepAlive();
    this.playCurrentChunk();
  }

  /**
   * Plays the current chunk in sequence
   */
  private playCurrentChunk(): void {
    if (this.status !== 'playing') return;

    if (this.currentChunkIndex >= this.chunks.length) {
      this.finishPlayback();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    if (!chunkText || !chunkText.trim()) {
      this.currentChunkIndex++;
      this.playCurrentChunk();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      this.currentUtterance = utterance;

      const { voice, locale } = VoiceManager.selectBestVoice(
        this.targetLanguage,
        this.preferredVoiceURI
      );

      utterance.lang = locale;
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = this.speed;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        if (this.status === 'playing') {
          this.notify();
        }
      };

      utterance.onend = () => {
        this.currentUtterance = null;
        if (this.status === 'playing') {
          this.currentChunkIndex++;
          this.playCurrentChunk();
        }
      };

      utterance.onerror = (e) => {
        // 'canceled' and 'interrupted' occur naturally when stop() or pause() is called
        if (e.error === 'canceled' || e.error === 'interrupted') {
          return;
        }

        console.warn(`Speech chunk playback error (${e.error}):`, chunkText);
        // Attempt moving to next chunk instead of dying completely
        if (this.currentChunkIndex < this.chunks.length - 1) {
          this.currentChunkIndex++;
          this.playCurrentChunk();
        } else {
          this.status = 'error';
          this.errorMessage = `Audio playback error: ${e.error || 'Failed to synthesize speech'}`;
          this.currentUtterance = null;
          this.stopKeepAlive();
          this.notify();
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      console.error('Speech queue execution error:', err);
      this.status = 'error';
      this.errorMessage = err?.message || 'Failed to start speech';
      this.stopKeepAlive();
      this.notify();
    }
  }

  public pause(): void {
    if (this.status === 'playing') {
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.warn('Speech pause error:', e);
      }
      this.status = 'paused';
      this.stopKeepAlive();
      this.notify();
    }
  }

  public resume(): void {
    if (this.status === 'paused') {
      this.status = 'playing';
      this.notify();
      this.startKeepAlive();
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          this.playCurrentChunk();
        }
      } catch (e) {
        console.warn('Speech resume error:', e);
        this.playCurrentChunk();
      }
    }
  }

  public stop(): void {
    this.stopKeepAlive();
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    this.status = 'idle';
    this.currentUtterance = null;
    this.messageId = null;
    this.chunks = [];
    this.currentChunkIndex = 0;
    this.notify();
  }

  public replay(): void {
    if (this.chunks.length > 0 && this.messageId) {
      const mid = this.messageId;
      const chunks = [...this.chunks];
      const lang = this.targetLanguage;
      this.play(mid, chunks, lang, this.preferredVoiceURI);
    }
  }

  private finishPlayback(): void {
    this.stopKeepAlive();
    this.status = 'idle';
    this.currentUtterance = null;
    this.currentChunkIndex = 0;
    this.notify();
  }

  /**
   * Chromium Chrome/Edge has an infamous bug where speech pauses after 15 seconds.
   * Periodically calling pause() & resume() keeps the engine alive during longer playback.
   */
  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(() => {
      if (this.status === 'playing' && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } catch {
          // ignore
        }
      }
    }, 10000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}

export const speechQueue = new SpeechQueue();
