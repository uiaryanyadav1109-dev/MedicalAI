import React, { useState, useRef, useEffect } from 'react';
import { LanguageCode, SearchMode } from '../../types/chat';
import { LanguageSelector } from './LanguageSelector';
import { voiceService, VoiceState } from '../../services/voiceService';
import { CameraCaptureModal } from './CameraCaptureModal';
import { useLanguage } from '../../i18n';
import {
  Paperclip,
  Camera,
  ArrowUp,
  Square,
  X,
  FileText,
  Mic,
  MicOff,
  Layers,
  Sparkles,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (
    content: string,
    files: File[],
    language: LanguageCode,
    searchMode: SearchMode
  ) => void;
  onStopGeneration?: () => void;
  isGenerating: boolean;
  selectedLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  selectedLanguage,
  onLanguageChange,
  searchMode,
  onSearchModeChange,
  disabled = false
}) => {
  const { language: globalLang, t } = useLanguage();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Synchronize global language selection with chat language when global language changes
  useEffect(() => {
    if ((globalLang === 'en' || globalLang === 'hi' || globalLang === 'bn') && selectedLanguage !== globalLang) {
      onLanguageChange(globalLang as LanguageCode);
    }
  }, [globalLang]);

  // Voice Speech-to-Text States
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [content]);

  // Focus textarea on mount
  useEffect(() => {
    if (!disabled && !isGenerating && voiceState === 'idle') {
      textareaRef.current?.focus();
    }
  }, [disabled, isGenerating, voiceState]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => {
      voiceService.stopSpeechRecognition();
    };
  }, []);

  // Handle keyboard event with IME composition protection (critical for Hindi / Bengali typing)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (e.nativeEvent.isComposing || (e as any).isComposing) {
        // Do not submit while composing characters in IME (Hindi, Bengali, Urdu, etc.)
        return;
      }
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setValidationError(null);

    const validFiles: File[] = [];
    const maxFiles = 8;
    const maxSizeBytes = 20 * 1024 * 1024; // 20 MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeBytes) {
        setValidationError(`"${file.name}" exceeds the 20MB file limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (attachments.length + validFiles.length > maxFiles) {
      setValidationError(`Maximum ${maxFiles} documents allowed per inquiry.`);
      return;
    }

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if ((!content.trim() && attachments.length === 0) || isGenerating || disabled) {
      return;
    }

    // Stop voice recognition if running
    if (voiceService.isListening()) {
      voiceService.stopSpeechRecognition();
      setVoiceState('idle');
      setVoiceTranscript('');
    }

    onSendMessage(content.trim(), attachments, selectedLanguage, searchMode);
    setContent('');
    setAttachments([]);
    setValidationError(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Voice Interaction Handlers
  const handleToggleVoiceInput = async () => {
    if (voiceService.isListening() || voiceState === 'listening') {
      voiceService.stopSpeechRecognition();
      setVoiceState('idle');
      if (voiceTranscript.trim()) {
        setContent((prev) => (prev ? `${prev} ${voiceTranscript}` : voiceTranscript));
        setVoiceTranscript('');
      }
      return;
    }

    setVoiceError(null);
    setVoiceTranscript('');

    try {
      await voiceService.startSpeechRecognition(selectedLanguage, {
        onTranscript: (transcript, isFinal) => {
          setVoiceTranscript(transcript);
          if (isFinal) {
            setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setVoiceTranscript('');
          }
        },
        onStateChange: (state, err) => {
          setVoiceState(state);
          if (err) {
            setVoiceError(err);
          }
        }
      });
    } catch (err: any) {
      setVoiceError(err?.message || 'Microphone access denied');
      setVoiceState('error');
    }
  };

  const canSubmit = (content.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="relative border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 py-3 transition-colors">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Attachment chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="p-0.5 rounded-full hover:bg-blue-200/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Validation or Voice Error banner */}
        {(validationError || voiceError) && (
          <div className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span>{validationError || voiceError}</span>
            </div>
            <button
              onClick={() => {
                setValidationError(null);
                setVoiceError(null);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Live Voice Listening Pulse Banner */}
        {voiceState === 'listening' && (
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
              <span className="font-semibold">Listening in {selectedLanguage.toUpperCase()}...</span>
              {voiceTranscript && (
                <span className="italic truncate max-w-xs text-rose-700 dark:text-rose-300">
                  &ldquo;{voiceTranscript}&rdquo;
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className="px-2 py-0.5 rounded bg-rose-600 text-white font-medium hover:bg-rose-700 text-[11px]"
            >
              Done Speaking
            </button>
          </div>
        )}

        {/* Main Input Box Container */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          className={`relative rounded-2xl border transition-all ${
            isDragging
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-2xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              searchMode === 'document'
                ? t('chat.processingDocs')
                : t('chat.inputPlaceholder')
            }
            rows={1}
            className="w-full resize-none px-4 pt-3 pb-2 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-h-[46px] max-h-[180px] leading-relaxed"
          />

          {/* Action Toolbar underneath textarea */}
          <div className="flex items-center justify-between px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
            {/* Left Tools: Attachment, Camera, Mode pills, Language selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* File Attachment Input (hidden) */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={t('chat.selectFile')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                title={t('chat.cameraCapture')}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors inline-flex"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Search Mode Toggle Pill */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 rounded-lg p-0.5 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => onSearchModeChange('document')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    searchMode === 'document'
                      ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Answer strictly grounded in uploaded medical records"
                >
                  <Layers className="w-3 h-3" />
                  <span>{t('chat.documentRag')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSearchModeChange('knowledge')}
                  className={`px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                    searchMode === 'knowledge'
                      ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                  title="Broad clinical intelligence and symptom evaluation"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>{t('chat.knowledgeMode')}</span>
                </button>
              </div>

              {/* Language Selector */}
              <LanguageSelector
                currentLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                compact
              />
            </div>

            {/* Right Tools: Mic & Send / Stop */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Microphone Speech-to-Text Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                title={voiceState === 'listening' ? t('chat.recordingVoice') : t('chat.voiceInput')}
                className={`p-1.5 rounded-lg transition-colors ${
                  voiceState === 'listening'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                {voiceState === 'listening' ? (
                  <MicOff className="w-4 h-4 text-rose-600" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Send or Stop Generation Button */}
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  title={t('chat.stopGenerating')}
                  className="p-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 transition-colors shadow-2xs flex items-center justify-center cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current animate-pulse text-rose-400" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  title={t('common.submit')}
                  className={`p-1.5 rounded-xl transition-all flex items-center justify-center shadow-2xs ${
                    canSubmit
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-blue-500/20'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Medical Notice */}
        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
          {t('chat.disclaimerFooter')}
        </p>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapturePhoto={(file: File) => setAttachments((prev) => [...prev, file])}
      />
    </div>
  );
};
