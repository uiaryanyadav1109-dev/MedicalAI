import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../../types/chat';
import { voiceService } from '../../services/voiceService';
import { MessageAudioPlayer } from './MessageAudioPlayer';
import {
  Copy,
  Check,
  RefreshCw,
  Edit2,
  AlertTriangle,
  Sparkles,
  User,
  ShieldAlert,
  Volume2,
  Square,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Info,
  FileText
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onViewDocument?: (documentId: string, pageNumber?: number) => void;
  onRetry?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  isLastAssistant?: boolean;
}

/**
 * Robust markdown renderer specifically tuned for medical lab tables,
 * lists, headers, code blocks, and clinical callouts.
 */
function renderMarkdownContent(rawText: string) {
  if (!rawText) return null;

  // Clean out repetitive source dumps and disclaimer blocks
  let cleanedText = rawText.split(/\n+---\s*\n+###\s*Verified Document Sources/i)[0];
  cleanedText = cleanedText.split(/###\s*Verified Document Sources/i)[0];
  cleanedText = cleanedText.split(/\n*>\s*⚠️\s*\*\*Medical Information Notice\*\*/i)[0];
  cleanedText = cleanedText.trimEnd();

  const lines = cleanedText.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;
  let codeBuffer: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';

  const flushTable = (keyPrefix: string) => {
    if (tableBuffer.length === 0) return;
    const headerLine = tableBuffer[0];
    const dataLines = tableBuffer.slice(2); // Skip separator row (|---|---|)

    const parseRow = (line: string) =>
      line
        .split('|')
        .map((c) => c.trim())
        .filter((_c, i, arr) => i > 0 && i < arr.length - 1);

    const headers = parseRow(headerLine);
    const rows = dataLines.map((l) => parseRow(l)).filter((r) => r.length > 0);

    elements.push(
      <div
        key={`${keyPrefix}-table`}
        className="my-3.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-2xs bg-white dark:bg-slate-900"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
              {headers.map((h, i) => (
                <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                  {formatInlineText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? 'bg-white dark:bg-slate-900 hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
                    : 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50/90 dark:hover:bg-slate-800/60'
                }
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {formatInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  const flushCodeBlock = (keyPrefix: string) => {
    if (codeBuffer.length === 0) return;
    const codeString = codeBuffer.join('\n');
    elements.push(
      <div
        key={`${keyPrefix}-code`}
        className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 text-xs font-mono shadow-xs"
      >
        {codeLanguage && (
          <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {codeLanguage}
          </div>
        )}
        <pre className="p-3 overflow-x-auto leading-relaxed select-text">
          <code>{codeString}</code>
        </pre>
      </div>
    );
    codeBuffer = [];
    inCodeBlock = false;
    codeLanguage = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Code Block
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(`cb-${i}`);
      } else {
        if (inTable) flushTable(`tbl-before-code-${i}`);
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Detect markdown table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable(`tbl-${i}`);
    }

    // Headers
    if (line.startsWith('#### ')) {
      elements.push(
        <h5 key={`h4-${i}`} className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-3 mb-1">
          {formatInlineText(line.replace('#### ', ''))}
        </h5>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm font-bold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block" />
          {formatInlineText(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${i}`} className="text-base font-bold text-slate-900 dark:text-white mt-5 mb-2.5">
          {formatInlineText(line.replace('## ', ''))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${i}`} className="text-lg font-extrabold text-slate-900 dark:text-white mt-6 mb-3">
          {formatInlineText(line.replace('# ', ''))}
        </h2>
      );
      continue;
    }

    // Bullet lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const itemContent = line.trim().replace(/^[-*]\s+/, '');
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed my-1">
          {formatInlineText(itemContent)}
        </li>
      );
      continue;
    }

    // Numbered lists
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <li key={`ol-${i}`} className="ml-5 list-decimal text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed my-1">
          {formatInlineText(numMatch[2])}
        </li>
      );
      continue;
    }

    // Blockquote or medical note
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-3.5 py-1.5 border-l-4 border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 rounded-r-lg text-amber-900 dark:text-amber-200 text-xs leading-relaxed"
        >
          {formatInlineText(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Blank line
    if (!line.trim()) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {formatInlineText(line)}
      </p>
    );
  }

  if (inTable) flushTable('tbl-end');
  if (inCodeBlock) flushCodeBlock('cb-end');

  return <div className="space-y-0.5">{elements}</div>;
}

// Inline formatting (bold, italics, code, links)
function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200/60 dark:border-slate-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  onEdit,
  onViewDocument,
  onRetry,
  onFeedback,
  isLastAssistant = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(
    message.metadata?.feedback || null
  );

  const isUser = message.role === 'user';

  // Synchronize local speaking state with voice service
  useEffect(() => {
    const unsub = voiceService.subscribeState((state) => {
      if (!state.isSpeaking && isSpeaking) {
        setIsSpeaking(false);
      }
    });
    return unsub;
  }, [isSpeaking]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      voiceService.speak(message.content, (message.language as any) || 'en', {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed copying message:', e);
    }
  };

  const handleSaveEdit = () => {
    if (editedText.trim() && onEdit) {
      onEdit(message.id, editedText.trim());
      setIsEditing(false);
    }
  };

  const handleGiveFeedback = (type: 'like' | 'dislike') => {
    const next = feedback === type ? null : type;
    setFeedback(next);
    if (onFeedback && next) {
      onFeedback(message.id, next);
    }
  };

  return (
    <div
      className={`group relative py-4 px-3 sm:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-100/80 dark:border-slate-800/80'
      }`}
    >
      <div className={`max-w-4xl mx-auto flex gap-3.5 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-medium shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Container */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
          {/* Header Row */}
          <div className={`flex items-center gap-2 mb-1.5 ${isUser ? 'justify-end' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {isUser ? 'You' : 'Medical AI Assistant'}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {message.modelUsed && !isUser && (
                <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono border border-blue-200/50 dark:border-blue-800/50">
                  {message.modelUsed}
                </span>
              )}
              {message.fallbackUsed && !isUser && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-medium"
                  title={message.fallbackReason || 'Auto-fallback activated due to provider outage or quota'}
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Fallback Used
                </span>
              )}
            </div>

            {/* Actions Toolbar for Assistant Messages */}
            {!isUser && (
              <div
                className={`flex items-center gap-1 transition-opacity ${
                  isSpeaking
                    ? 'opacity-100'
                    : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                }`}
              >
                <button
                  onClick={handleCopy}
                  title="Copy message"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Multilingual Text-to-Speech Player */}
                {!message.isStreaming && message.content && (
                  <MessageAudioPlayer
                    messageId={message.id}
                    content={message.content}
                    initialLanguage={message.language}
                  />
                )}

                {/* Regenerate Button */}
                {isLastAssistant && onRegenerate && (
                  <button
                    onClick={() => onRegenerate(message.id)}
                    title="Regenerate response"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Thumbs Up / Down */}
                {!message.isStreaming && (
                  <>
                    <button
                      onClick={() => handleGiveFeedback('like')}
                      title="Helpful"
                      className={`p-1 rounded-md transition-colors ${
                        feedback === 'like'
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleGiveFeedback('dislike')}
                      title="Not helpful"
                      className={`p-1 rounded-md transition-colors ${
                        feedback === 'dislike'
                          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Edit button for User Message */}
            {isUser && onEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                title="Edit inquiry"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Attachments chips */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-2.5 ${isUser ? 'justify-end' : ''}`}>
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium truncate max-w-[200px]">{att.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    ({Math.round(att.size / 1024)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Emergency Alert Banner */}
          {message.metadata?.hasEmergencyNotice && (
            <div className="mb-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-red-900 dark:text-red-200 text-left shadow-xs">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold block text-red-950 dark:text-red-100">
                  Potential Emergency Alert Detected
                </span>
                Symptoms matching red-flag clinical criteria were detected. Do not wait for AI software triage.
                Contact emergency medical services or visit the nearest emergency facility immediately.
              </div>
            </div>
          )}

          {/* Automatic Model Fallback Notice */}
          {message.fallbackUsed && !isUser && message.fallbackReason && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-850 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2 shadow-2xs">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{message.fallbackReason}</span>
            </div>
          )}

          {/* Content Body */}
          {isEditing ? (
            <div className="space-y-2 text-left">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-blue-400 dark:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-2xs"
                >
                  Save & Resubmit
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`text-left ${
                isUser
                  ? 'inline-block bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-2xs max-w-2xl text-xs sm:text-sm leading-relaxed'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {renderMarkdownContent(message.content)}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-600 dark:bg-blue-400 animate-pulse ml-1 align-middle rounded-2xs" />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Banner with Retry */}
          {(message.status === 'error' || message.error) && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-red-900 dark:text-red-200 text-left shadow-2xs">
              <div className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <span>
                  {message.error || 'Failed to process medical query. Please check server configuration and try again.'}
                </span>
              </div>
              {onRetry && (
                <button
                  onClick={() => onRetry(message.id)}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs flex-shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
