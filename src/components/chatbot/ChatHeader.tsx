import React, { useState } from 'react';
import { Conversation, ChatDocument } from '../../types/chat';
import { voiceService, VoiceSettings } from '../../services/voiceService';
import {
  Menu,
  FileText,
  GitCompare,
  Edit2,
  Check,
  X,
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  Volume2,
  Download,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface ChatHeaderProps {
  conversation?: Conversation;
  documents: ChatDocument[];
  onToggleSidebar: () => void;
  onToggleDocPanel: () => void;
  onOpenCompare: () => void;
  onRenameTitle: (newTitle: string) => void;
  onNewChat?: () => void;
  onClearChat?: () => void;
  onBack?: () => void;
  isGenerating?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  documents,
  onToggleSidebar,
  onToggleDocPanel,
  onOpenCompare,
  onRenameTitle,
  onNewChat,
  onClearChat,
  onBack,
  isGenerating = false
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(conversation?.title || 'Medical Consultation');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => voiceService.getSettings());

  const handleUpdateVoiceSetting = (partial: Partial<VoiceSettings>) => {
    const updated = voiceService.updateSettings(partial);
    setVoiceSettings(updated);
  };

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      onRenameTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleExportJson = () => {
    if (!conversation) return;
    const exportData = {
      title: conversation.title,
      exportedAt: new Date().toISOString(),
      language: conversation.language,
      documentsAttached: documents.map((d) => d.filename)
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/\s+/g, '_')}_record.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsSettingsOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      {/* Left: Back / Sidebar Toggle + Title & Status Badge */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isEditingTitle ? (
          <div className="flex items-center gap-1 max-w-md flex-1">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="px-2 py-1 text-xs sm:text-sm font-semibold rounded-lg border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 text-emerald-600 hover:text-emerald-700"
              title="Save Title"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="min-w-0 flex-1 group">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {conversation?.title || 'Medical AI Consultation'}
              </h1>
              <button
                onClick={() => {
                  setTempTitle(conversation?.title || '');
                  setIsEditingTitle(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                title="Edit title"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400">Clinical Intelligence Online</span>
              <span className="hidden md:inline">• Grounded RAG</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: New Chat + Documents + Compare + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* New Chat Button */}
        {onNewChat && (
          <button
            onClick={onNewChat}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Start New Medical Consultation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}

        {/* Document Comparison Action (Visible if >= 2 documents) */}
        {documents.length >= 2 && (
          <button
            onClick={onOpenCompare}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs"
            title="Compare two medical reports side-by-side"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Compare</span>
          </button>
        )}

        {/* Document Management Drawer Toggle */}
        <button
          onClick={onToggleDocPanel}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs relative"
          title="View Attached Clinical Documents"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden md:inline">Docs</span>
          {documents.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px]">
              {documents.length}
            </span>
          )}
        </button>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-colors"
            title="Chat Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-2 px-3 z-50 animate-in fade-in-50 zoom-in-95 text-xs text-slate-700 dark:text-slate-200 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center justify-between">
                <span>Chat & Audio Settings</span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-read voice responses toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Auto-read Responses</div>
                  <div className="text-[10px] text-slate-400">Speak AI replies aloud automatically</div>
                </div>
                <input
                  type="checkbox"
                  checked={voiceSettings.autoPlayResponses}
                  onChange={(e) => handleUpdateVoiceSetting({ autoPlayResponses: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              {/* Speech Speed */}
              <div>
                <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  <span>Voice Speed</span>
                  <span className="font-mono">{voiceSettings.speechSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.25"
                  value={voiceSettings.speechSpeed}
                  onChange={(e) => handleUpdateVoiceSetting({ speechSpeed: parseFloat(e.target.value) })}
                  className="w-full cursor-pointer"
                />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
                <button
                  onClick={handleExportJson}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-left font-medium"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Consultation (.JSON)</span>
                </button>

                {onClearChat && (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setShowClearConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-left font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear Messages</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing Chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear Conversation Messages?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will remove the current messages in this conversation. Attached documents will remain saved.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onClearChat) onClearChat();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
