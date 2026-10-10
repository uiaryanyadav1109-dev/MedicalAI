import React, { useState, useEffect, useRef } from 'react';
import { voiceService } from '../../services/voiceService';
import { PlaybackState } from '../../services/speech/speechQueue';
import { SpeechLanguage } from '../../services/speech/languageDetector';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  RotateCcw,
  Gauge,
  Globe,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

interface MessageAudioPlayerProps {
  messageId: string;
  content: string;
  initialLanguage?: string;
  className?: string;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

const LANGUAGE_LABELS: Record<SpeechLanguage, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English (Indian)' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  hinglish: { name: 'Hinglish', nativeName: 'Hinglish (हिंदी + Eng)' }
};

export const MessageAudioPlayer: React.FC<MessageAudioPlayerProps> = ({
  messageId,
  content,
  initialLanguage,
  className = ''
}) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() => voiceService.getPlaybackState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [selectedLanguageOverride, setSelectedLanguageOverride] = useState<SpeechLanguage | undefined>(undefined);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const isCurrentMessage = playbackState.messageId === messageId;
  const isPlaying = isCurrentMessage && playbackState.status === 'playing';
  const isPaused = isCurrentMessage && playbackState.status === 'paused';
  const isError = isCurrentMessage && playbackState.status === 'error';

  useEffect(() => {
    const unsub = voiceService.subscribePlaybackState((state) => {
      setPlaybackState(state);
      if (state.messageId === messageId && (state.status === 'playing' || state.status === 'paused')) {
        setIsExpanded(true);
      }
    });
    return unsub;
  }, [messageId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePlay = () => {
    setIsExpanded(true);
    voiceService.speakMessage(messageId, content, selectedLanguageOverride);
  };

  const handlePause = () => {
    voiceService.pauseSpeaking();
  };

  const handleResume = () => {
    voiceService.resumeSpeaking();
  };

  const handleStop = () => {
    voiceService.stopSpeaking();
    setIsExpanded(false);
  };

  const handleReplay = () => {
    voiceService.speakMessage(messageId, content, selectedLanguageOverride);
  };

  const handleSpeedSelect = (speed: number) => {
    voiceService.setSpeed(speed);
    setShowSpeedDropdown(false);
  };

  const handleLanguageSelect = (lang: SpeechLanguage) => {
    setSelectedLanguageOverride(lang);
    setShowLanguageDropdown(false);
    // Restart with new language if currently playing
    if (isPlaying || isPaused) {
      voiceService.speakMessage(messageId, content, lang);
    }
  };

  const activeLangKey: SpeechLanguage = isCurrentMessage
    ? playbackState.language
    : selectedLanguageOverride || 'en';
  const activeLangMeta = LANGUAGE_LABELS[activeLangKey] || LANGUAGE_LABELS.en;

  // Compact trigger icon button when not expanded
  if (!isExpanded && !isPlaying && !isPaused) {
    return (
      <button
        type="button"
        onClick={handlePlay}
        title="Read response aloud (Multilingual speech)"
        aria-label="Read response aloud"
        className={`p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
      >
        <Volume2 className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all text-xs ${className}`}
      role="region"
      aria-label="Read Aloud audio controls"
    >
      {/* Play / Pause Toggle Button */}
      {isPlaying ? (
        <button
          type="button"
          onClick={handlePause}
          title="Pause playback"
          aria-label="Pause playback"
          className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
        >
          <Pause className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : isPaused ? (
        <button
          type="button"
          onClick={handleResume}
          title="Resume playback"
          aria-label="Resume playback"
          className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handlePlay}
          title="Play from start"
          aria-label="Play from start"
          className="p-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>
      )}

      {/* Stop Button */}
      <button
        type="button"
        onClick={handleStop}
        title="Stop and close audio controls"
        aria-label="Stop audio"
        className="p-1 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
      >
        <Square className="w-3 h-3 fill-current" />
      </button>

      {/* Replay Button */}
      <button
        type="button"
        onClick={handleReplay}
        title="Replay from start"
        aria-label="Replay audio"
        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      {/* Sound wave equalizer animation when playing */}
      {isPlaying && (
        <div className="flex items-center gap-0.5 px-1" title="Reading aloud">
          <span className="w-0.5 h-3 bg-blue-600 dark:bg-blue-400 animate-pulse" />
          <span className="w-0.5 h-4 bg-blue-500 dark:bg-blue-300 animate-pulse delay-75" />
          <span className="w-0.5 h-2.5 bg-blue-600 dark:bg-blue-400 animate-pulse delay-150" />
        </div>
      )}

      {/* Progress Indicator */}
      {isCurrentMessage && playbackState.totalChunks > 1 && (
        <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {playbackState.currentChunkIndex + 1}/{playbackState.totalChunks}
        </span>
      )}

      {/* Speed Rate Dropdown */}
      <div className="relative" ref={speedMenuRef}>
        <button
          type="button"
          onClick={() => setShowSpeedDropdown(!showSpeedDropdown)}
          title="Adjust speech speed"
          className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors flex items-center gap-0.5"
        >
          <span>{playbackState.speed}x</span>
          <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
        </button>

        {showSpeedDropdown && (
          <div className="absolute left-0 bottom-full mb-1 w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1 z-50 text-xs">
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedSelect(rate)}
                className={`w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-mono transition-colors ${
                  playbackState.speed === rate
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{rate}x</span>
                {playbackState.speed === rate && <Check className="w-2.5 h-2.5 text-blue-600" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Language Selector Dropdown with Override */}
      <div className="relative" ref={langMenuRef}>
        <button
          type="button"
          onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          title={`Detected language: ${activeLangMeta.name}. Click to change voice language.`}
          className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Globe className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate max-w-[70px]">{activeLangMeta.nativeName}</span>
          <ChevronDown className="w-2.5 h-2.5 text-blue-400" />
        </button>

        {showLanguageDropdown && (
          <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1 z-50 text-xs">
            <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/80">
              Speech Voice
            </div>
            {(['en', 'hi', 'bn', 'hinglish'] as SpeechLanguage[]).map((code) => {
              const meta = LANGUAGE_LABELS[code];
              const isSelected = activeLangKey === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLanguageSelect(code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-[11px]">{meta.nativeName}</span>
                    <span className="text-[9px] text-slate-400">{meta.name}</span>
                  </div>
                  {isSelected && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Indicator if playback failed */}
      {isError && (
        <div
          className="text-rose-600 dark:text-rose-400 p-0.5"
          title={playbackState.errorMessage || 'Playback error occurred'}
        >
          <AlertCircle className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
