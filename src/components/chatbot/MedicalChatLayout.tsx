import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Conversation,
  ChatMessage,
  ChatDocument,
  LanguageCode,
  SearchMode
} from '../../types/chat';
import * as chatStore from '../../services/chatStore';
import { clinicalStore } from '../../services/clinicalStore';
import { processDocument, retrieveRelevantChunks } from '../../services/documentProcessor';
import { aiService } from '../../services/aiService';
import { voiceService } from '../../services/voiceService';
import { useAuth } from '../../context/AuthContext';

import { ChatSidebar } from './ChatSidebar';
import { ChatHeader } from './ChatHeader';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { DocumentPanel } from './DocumentPanel';
import { CompareDocumentsModal } from './CompareDocumentsModal';

import {
  Sparkles,
  ArrowDown,
  FileText,
  AlertTriangle,
  Layers,
  HeartPulse,
  Pill,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface MedicalChatLayoutProps {
  onBack?: () => void;
}

export const MedicalChatLayout: React.FC<MedicalChatLayoutProps> = ({ onBack }) => {
  const { user } = useAuth();
  const userId = user?.id || 'demo-user-default';

  // Conversations & Messages State
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    chatStore.getConversations(userId)
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    try {
      const saved = sessionStorage.getItem('medical_ai_active_chat_id');
      if (saved && chatStore.getConversation(saved)) {
        sessionStorage.removeItem('medical_ai_active_chat_id');
        return saved;
      }
    } catch {
      // ignore storage error
    }
    const list = chatStore.getConversations(userId);
    return list.length > 0 ? list[0].id : null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<ChatDocument[]>([]);

  // UI Drawer & Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDocPanelOpen, setIsDocPanelOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isProcessingDocs, setIsProcessingDocs] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Active Chat Settings
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [searchMode, setSearchMode] = useState<SearchMode>('document');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatusText, setCurrentStatusText] = useState<string>('');

  // Streaming Abort Controller Reference & Generation Ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Refresh active conversation's messages and documents
  const refreshCurrentChat = useCallback(() => {
    if (!activeConversationId) {
      setMessages([]);
      setDocuments([]);
      return;
    }

    const currentConv = chatStore.getConversation(activeConversationId);
    if (currentConv) {
      setSelectedLanguage(currentConv.language);
      setSearchMode(currentConv.searchMode);
    }

    const msgs = chatStore.getMessages(activeConversationId);
    setMessages(msgs);

    const docs = chatStore.getDocuments(activeConversationId, userId);
    setDocuments(docs);
  }, [activeConversationId, userId]);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = chatStore.subscribeToChatStore(() => {
      setConversations(chatStore.getConversations(userId));
      if (!isGeneratingRef.current) {
        refreshCurrentChat();
      }
    });
    return unsubscribe;
  }, [userId, refreshCurrentChat]);

  // Reload chat whenever active conversation changes
  useEffect(() => {
    refreshCurrentChat();
  }, [activeConversationId, refreshCurrentChat]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isGenerating]);

  // Detect scroll position for "Scroll to bottom" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollBottom(!isNearBottom);
  };

  // Create New Chat
  const handleNewChat = () => {
    const newConv = chatStore.createConversation(
      userId,
      'New Medical Consultation',
      selectedLanguage,
      searchMode
    );
    setActiveConversationId(newConv.id);
    setIsSidebarOpen(false);
  };

  // Rename Title
  const handleRenameTitle = (id: string, newTitle: string) => {
    chatStore.updateConversation(id, { title: newTitle });
    setConversations(chatStore.getConversations(userId));
  };

  // Delete Conversation
  const handleDeleteConversation = (id: string) => {
    chatStore.deleteConversation(id);
    const updated = chatStore.getConversations(userId);
    setConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Toggle Pin
  const handleTogglePin = (id: string) => {
    const conv = chatStore.getConversation(id);
    if (conv) {
      chatStore.updateConversation(id, { isPinned: !conv.isPinned });
      setConversations(chatStore.getConversations(userId));
    }
  };

  // Clear Messages in current chat
  const handleClearCurrentMessages = () => {
    if (!activeConversationId) return;
    chatStore.clearMessages(activeConversationId);
    setMessages([]);
  };

  // Clear All Conversations
  const handleClearAll = () => {
    chatStore.deleteAllConversations(userId);
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    setDocuments([]);
  };

  // Document Upload Handler
  const handleUploadDocuments = async (files: File[]) => {
    if (!activeConversationId || files.length === 0) return;
    setIsProcessingDocs(true);

    try {
      for (const file of files) {
        const { document, chunks, reportRecord } = await processDocument(
          file,
          activeConversationId,
          userId
        );
        chatStore.saveDocument(document);
        chatStore.saveChunks(chunks);

        if (reportRecord) {
          clinicalStore.addReport({
            id: document.id,
            title: reportRecord.title || file.name.replace(/\.[^/.]+$/, ''),
            date: reportRecord.date || new Date().toISOString().split('T')[0],
            laboratory: reportRecord.laboratory || 'Clinical Reference Diagnostics',
            specimenType: reportRecord.specimenType || 'Serum / Venous Blood',
            status: reportRecord.status || 'normal',
            fileSize: reportRecord.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            fileType: reportRecord.fileType || file.name.split('.').pop()?.toUpperCase() || 'PDF',
            results: reportRecord.results || [],
            clinicalImpression:
              reportRecord.clinicalImpression || 'Diagnostic report processed.',
            questionsForDoctor: reportRecord.questionsForDoctor || []
          });
        }
      }
      refreshCurrentChat();
    } catch (err) {
      console.error('Failed uploading documents:', err);
    } finally {
      setIsProcessingDocs(false);
    }
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    chatStore.deleteDocument(docId);
    clinicalStore.deleteReport(docId);
    refreshCurrentChat();
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isGeneratingRef.current = false;
    setIsGenerating(false);
    setCurrentStatusText('');
  };

  // Core Send Message Workflow
  const handleSendMessage = async (
    content: string,
    files: File[],
    language: LanguageCode,
    mode: SearchMode
  ) => {
    // Ensure active conversation exists
    let targetConvId = activeConversationId;
    if (!targetConvId) {
      const newConv = chatStore.createConversation(
        userId,
        content.slice(0, 36) || 'New Consultation',
        language,
        mode
      );
      targetConvId = newConv.id;
      setActiveConversationId(newConv.id);
    }

    // Process new attachments if any
    const attachmentsList = [];
    const base64Attachments: { name: string; mimeType: string; data: string }[] = [];
    if (files.length > 0) {
      setIsProcessingDocs(true);
      setCurrentStatusText('Processing attached medical records...');
      for (const file of files) {
        // Read file as base64 for multimodal vision analysis
        try {
          const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (base64Data) {
            base64Attachments.push({
              name: file.name,
              mimeType: file.type || (file.name.endsWith('.png') ? 'image/png' : 'image/jpeg'),
              data: base64Data
            });
          }
        } catch (e) {
          console.warn('Could not read base64 for file', file.name, e);
        }

        const { document, chunks } = await processDocument(
          file,
          targetConvId,
          userId
        );
        chatStore.saveDocument(document);
        chatStore.saveChunks(chunks);
        attachmentsList.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          documentId: document.id,
          name: document.filename,
          size: document.fileSize,
          type: document.fileType
        });
      }
      setIsProcessingDocs(false);
    }

    const currentDocs = chatStore.getDocuments(targetConvId, userId);
    setDocuments(currentDocs);

    // Auto-update conversation title if it's default
    const currentConv = chatStore.getConversation(targetConvId);
    if (
      currentConv &&
      (currentConv.title === 'New Medical Consultation' ||
        currentConv.title === 'New Consultation') &&
      content.trim()
    ) {
      const autoTitle =
        content.length > 40 ? `${content.slice(0, 40).trim()}...` : content.trim();
      chatStore.updateConversation(targetConvId, {
        title: autoTitle,
        language,
        searchMode: mode
      });
    }

    // 1. Create and save User Message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      conversationId: targetConvId,
      role: 'user',
      content: content.trim() || 'Uploaded medical reports for clinical review.',
      language,
      timestamp: new Date().toISOString(),
      attachments: attachmentsList.length > 0 ? attachmentsList : undefined,
      searchMode: mode,
      status: 'complete'
    };
    chatStore.saveMessage(userMessage);

    // 2. Retrieve Document Chunks for RAG
    setCurrentStatusText('Searching relevant clinical document findings...');
    const allChunks = chatStore.getChunks();
    const activeDocIds = new Set(
      currentDocs.map((d) => d.id)
    );
    const relevantDocChunks = allChunks.filter((chk) =>
      activeDocIds.has(chk.documentId)
    );

    let ragCitations = retrieveRelevantChunks(
      userMessage.content,
      relevantDocChunks,
      4
    );

    // Fallback citations if query had low keyword overlap (e.g. general summary or review queries)
    if (ragCitations.length === 0 && relevantDocChunks.length > 0) {
      ragCitations = relevantDocChunks.slice(0, 4).map((chk) => ({
        id: `cit_${chk.id}`,
        documentId: chk.documentId,
        documentName: chk.documentName,
        pageNumber: chk.pageNumber,
        snippet: chk.content.slice(0, 160).replace(/\n+/g, ' ').trim(),
        relevanceScore: 0.95
      }));
    }

    // 3. Prepare Assistant Stream Placeholder
    const assistantMessageId = `msg-ai-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      conversationId: targetConvId,
      role: 'assistant',
      content: '',
      language,
      timestamp: new Date().toISOString(),
      isStreaming: true,
      status: 'streaming',
      searchMode: mode,
      citations: ragCitations.length > 0 ? ragCitations : undefined
    };

    // Optimistically update UI immediately
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setCurrentStatusText('Medical AI is analyzing clinical context...');
    setMessages((prev) => {
      const withoutUser = prev.filter((m) => m.id !== userMessage.id);
      return [...withoutUser, userMessage, assistantPlaceholder];
    });

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const history = chatStore.getMessages(targetConvId);
      const streamGenerator = aiService.streamChatResponse({
        message: userMessage.content,
        language,
        searchMode: mode,
        conversationHistory: history,
        citations: ragCitations,
        activeDocuments: currentDocs,
        activeChunks: relevantDocChunks,
        attachments: base64Attachments,
        abortSignal: abortController.signal
      });

      let accumulatedText = '';
      for await (const chunk of streamGenerator) {
        accumulatedText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }

      // Finalize message in store
      const finalAssistantMsg: ChatMessage = {
        ...assistantPlaceholder,
        content: accumulatedText,
        isStreaming: false,
        status: 'complete',
        modelUsed: 'Gemini 2.5 Flash / Clinical Engine'
      };
      chatStore.saveMessage(finalAssistantMsg);

      // Auto-play voice response if enabled in settings
      if (voiceService.getSettings().autoPlayResponses && accumulatedText) {
        voiceService.speak(accumulatedText, language);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // Stream aborted by user
      } else {
        console.error('Error during AI generation:', err);
        const errorMsg: ChatMessage = {
          ...assistantPlaceholder,
          content: '',
          isStreaming: false,
          status: 'error',
          error: err?.message || 'Unable to connect to Medical AI service. Please try again.'
        };
        chatStore.saveMessage(errorMsg);
      }
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
      setCurrentStatusText('');
      abortControllerRef.current = null;
      if (targetConvId) {
        const msgs = chatStore.getMessages(targetConvId);
        setMessages(msgs);
        setConversations(chatStore.getConversations(userId));
      }
    }
  };

  // Regenerate Response
  const handleRegenerate = async (msgId: string) => {
    if (isGenerating || !activeConversationId) return;

    const currentMsgs = chatStore.getMessages(activeConversationId);
    const targetIdx = currentMsgs.findIndex((m) => m.id === msgId);
    if (targetIdx === -1) return;

    // Find the user message preceding this
    let userMsgToResend: ChatMessage | null = null;
    for (let i = targetIdx - 1; i >= 0; i--) {
      if (currentMsgs[i].role === 'user') {
        userMsgToResend = currentMsgs[i];
        break;
      }
    }

    if (userMsgToResend) {
      // Delete the existing assistant response
      chatStore.deleteMessage(msgId);
      refreshCurrentChat();
      await handleSendMessage(
        userMsgToResend.content,
        [],
        userMsgToResend.language,
        userMsgToResend.searchMode || searchMode
      );
    }
  };

  // Retry on failed message
  const handleRetry = (msgId: string) => {
    handleRegenerate(msgId);
  };

  // Edit User Message
  const handleEditUserMessage = (msgId: string, newContent: string) => {
    chatStore.updateMessage(msgId, { content: newContent });
    refreshCurrentChat();
    // Re-run answer
    handleSendMessage(newContent, [], selectedLanguage, searchMode);
  };

  // Feedback on message
  const handleFeedback = (msgId: string, feedback: 'like' | 'dislike') => {
    const msg = messages.find((m) => m.id === msgId);
    if (msg) {
      chatStore.updateMessage(msgId, {
        metadata: {
          ...msg.metadata,
          feedback
        }
      });
      refreshCurrentChat();
    }
  };

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Suggestion prompt card handler for Empty State
  const handleSelectSuggestion = (promptText: string) => {
    handleSendMessage(promptText, [], selectedLanguage, searchMode);
  };

  return (
    <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors">
      {/* Sidebar (Permanent on Desktop, Collapsible drawer on Mobile) */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onRenameConversation={(id, title) => handleRenameTitle(id, title)}
        onDeleteConversation={handleDeleteConversation}
        onTogglePin={handleTogglePin}
        onClearAllConversations={handleClearAll}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <ChatHeader
          conversation={activeConversation}
          documents={documents}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleDocPanel={() => setIsDocPanelOpen(true)}
          onOpenCompare={() => setIsCompareModalOpen(true)}
          onRenameTitle={(title) => {
            if (activeConversationId) handleRenameTitle(activeConversationId, title);
          }}
          onNewChat={handleNewChat}
          onClearChat={handleClearCurrentMessages}
          onBack={onBack}
          isGenerating={isGenerating}
        />

        {/* Message Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900"
        >
          {messages.length === 0 ? (
            /* Professional Medical Empty Chat State */
            <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center max-w-2xl mx-auto my-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-in zoom-in-90 duration-300">
                <Sparkles className="w-7 h-7" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Medical AI Assistant
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
                Ask questions about your health information, uploaded medical documents, medications, reports, or general clinical parameters.
              </p>

              {/* Suggestion prompt cards */}
              <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {[
                  {
                    title: 'What does this blood report mean?',
                    desc: 'Analyze uploaded CBC, Hb, WBC, and platelet counts',
                    icon: <HeartPulse className="w-4 h-4 text-rose-500" />
                  },
                  {
                    title: 'Summarize my uploaded medical reports.',
                    desc: 'Synthesize key diagnostic findings and abnormal flags',
                    icon: <FileText className="w-4 h-4 text-blue-500" />
                  },
                  {
                    title: 'What should I ask my doctor about this report?',
                    desc: 'Generate targeted consultation questions for your physician',
                    icon: <Stethoscope className="w-4 h-4 text-emerald-500" />
                  },
                  {
                    title: 'Explain normal hemoglobin and platelet reference ranges.',
                    desc: 'Explore physiological parameters and clinical thresholds',
                    icon: <Pill className="w-4 h-4 text-indigo-500" />
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(item.title)}
                    className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 hover:bg-blue-50/60 dark:bg-slate-800/50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left group shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                          <span>{item.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-blue-500" />
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render active conversation messages */
            <>
              {messages.map((msg, idx) => {
                const isLastAssistant =
                  msg.role === 'assistant' &&
                  (idx === messages.length - 1 ||
                    (idx === messages.length - 2 && messages[messages.length - 1].role === 'user'));

                return (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    onRegenerate={handleRegenerate}
                    onEdit={handleEditUserMessage}
                    onRetry={handleRetry}
                    onFeedback={handleFeedback}
                    onViewDocument={() => setIsDocPanelOpen(true)}
                    isLastAssistant={isLastAssistant}
                  />
                );
              })}

              {/* Active Thinking/Loading Indicator */}
              {isGenerating && (!messages[messages.length - 1]?.content || messages[messages.length - 1]?.role === 'user') && (
                <div className="py-4 px-4 sm:px-6 bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-100/80 dark:border-slate-800">
                  <div className="max-w-4xl mx-auto flex gap-3.5 sm:gap-4 items-center">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs flex-shrink-0 animate-pulse">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                      <span>{currentStatusText || 'Medical AI is analyzing clinical information...'}</span>
                      <span className="flex gap-1 items-center ml-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all z-20"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isGenerating={isGenerating}
          selectedLanguage={selectedLanguage}
          onLanguageChange={(lang) => {
            setSelectedLanguage(lang);
            if (activeConversationId) {
              chatStore.updateConversation(activeConversationId, { language: lang });
            }
          }}
          searchMode={searchMode}
          onSearchModeChange={(mode) => {
            setSearchMode(mode);
            if (activeConversationId) {
              chatStore.updateConversation(activeConversationId, { searchMode: mode });
            }
          }}
          disabled={isProcessingDocs}
        />
      </div>

      {/* Document Management Drawer */}
      <DocumentPanel
        documents={documents}
        isOpen={isDocPanelOpen}
        onClose={() => setIsDocPanelOpen(false)}
        onUploadDocuments={handleUploadDocuments}
        onDeleteDocument={handleDeleteDocument}
        onOpenCompare={() => {
          setIsDocPanelOpen(false);
          setIsCompareModalOpen(true);
        }}
        isProcessing={isProcessingDocs}
      />

      {/* Side-by-side Medical Report Comparison Modal */}
      <CompareDocumentsModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        documents={documents}
        onInsertToChat={(text) => handleSendMessage(text, [], selectedLanguage, searchMode)}
      />
    </div>
  );
};
