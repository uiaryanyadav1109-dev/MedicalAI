/**
 * Types and interfaces for the Multilingual & Multi-Document Medical AI Chatbot
 */

export type LanguageCode =
  | 'en'        // English
  | 'hi'        // Hindi
  | 'bn'        // Bengali
  | 'hinglish'  // Hinglish
  | 'ta'        // Tamil
  | 'te'        // Telugu
  | 'mr'        // Marathi
  | 'gu'        // Gujarati
  | 'kn'        // Kannada
  | 'ml'        // Malayalam
  | 'pa'        // Punjabi
  | 'ur';       // Urdu

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', direction: 'rtl' }
];

export type ChatRole = 'user' | 'assistant' | 'system';

export type SearchMode = 'document' | 'knowledge';

export type AIProviderId = 'google' | 'openai' | 'anthropic' | 'groq' | 'clinical-engine';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProviderId;
  providerLabel: string;
  description: string;
  badge?: string;
  contextWindow: string;
  isAvailable: boolean;
  isDefault?: boolean;
  supportsVision: boolean;
  supportsStreaming: boolean;
  unavailableReason?: string;
}

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber?: number;
  section?: string;
  snippet: string;
  relevanceScore?: number;
}

export interface ChatAttachment {
  id: string;
  documentId: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: ChatRole;
  content: string;
  language: LanguageCode;
  timestamp: string;
  citations?: Citation[];
  attachments?: ChatAttachment[];
  isStreaming?: boolean;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  searchMode?: SearchMode;
  metadata?: {
    triageCategory?: string;
    hasEmergencyNotice?: boolean;
    comparisonMode?: boolean;
    referencedDocs?: string[];
    feedback?: 'like' | 'dislike';
    tokenCount?: number;
    latencyMs?: number;
  };
}

export type DocumentProcessingStatus = 'pending' | 'processing' | 'processed' | 'error';

export interface ExtractedTable {
  headers: string[];
  rows: string[][];
  title?: string;
}

export interface ChatDocument {
  id: string;
  conversationId: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  processingStatus: DocumentProcessingStatus;
  errorMessage?: string;
  uploadedAt: string;
  extractedText: string;
  metadata: {
    patientName?: string;
    reportDate?: string;
    laboratory?: string;
    documentCategory?: 'blood_report' | 'prescription' | 'imaging' | 'discharge' | 'general';
    analyteCount?: number;
    extractedTables?: ExtractedTable[];
    summary?: string;
  };
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  content: string;
  embedding?: number[];
  tokens?: number;
  isTable?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  language: LanguageCode;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  isArchived: boolean;
  searchMode: SearchMode;
  documentIds: string[];
  summary?: string;
  selectedModelId?: string;
  autoFallbackEnabled?: boolean;
}

export interface DocumentComparisonResult {
  doc1Name: string;
  doc2Name: string;
  metrics: {
    analyte: string;
    doc1Value: string;
    doc2Value: string;
    unit: string;
    referenceRange: string;
    delta?: string;
    trend: 'improved' | 'worsened' | 'stable' | 'new' | 'unspecified';
    clinicalNote?: string;
  }[];
  newFindings: string[];
  missingFindings: string[];
  clinicalSummary: string;
}
