import {
  Conversation,
  ChatMessage,
  ChatDocument,
  DocumentChunk,
  LanguageCode,
  SearchMode
} from '../types/chat';

const STORAGE_KEYS = {
  CONVERSATIONS: 'medical_ai_chat_conversations_v1',
  MESSAGES: 'medical_ai_chat_messages_v1',
  DOCUMENTS: 'medical_ai_chat_documents_v1',
  CHUNKS: 'medical_ai_chat_chunks_v1'
};

// Event-based subscription for reactivity across components
type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in chat store listener:', e);
    }
  });
}

export function subscribeToChatStore(listener: StoreListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Helper safely accessing localStorage
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (err) {
    console.error(`Failed reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Failed writing ${key} to storage:`, err);
  }
}

// Initial Seed with realistic clinical data
function seedInitialDataIfEmpty() {
  const existingConvs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  if (existingConvs.length > 0) return;

  const demoDocId = 'doc-seed-cbc-001';
  const demoConvId = 'conv-seed-001';
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  const demoDoc: ChatDocument = {
    id: demoDocId,
    conversationId: demoConvId,
    userId: 'demo-user-default',
    filename: 'Complete_Blood_Count_Report_Oct2026.pdf',
    fileType: 'application/pdf',
    fileSize: 184520,
    pageCount: 2,
    processingStatus: 'processed',
    uploadedAt: yesterday,
    extractedText: `APOLLO CLINICAL DIAGNOSTICS LABORATORY
Patient: Demo Patient | Age/Gender: 38Y / F | Date: 07-Oct-2026
Test: Complete Blood Count (CBC) with Differential

HEMATOLOGY PROFILE:
Hemoglobin (Hb): 10.8 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]
RBC Count: 3.85 mil/uL (Reference: 3.90 - 5.20 mil/uL) [LOW]
Hematocrit (PCV): 33.2 % (Reference: 36.0 - 46.0 %) [LOW]
MCV (Mean Corpuscular Volume): 74.5 fL (Reference: 80.0 - 99.0 fL) [LOW - Microcytic]
MCH: 24.2 pg (Reference: 27.0 - 33.0 pg) [LOW - Hypochromic]
MCHC: 31.8 g/dL (Reference: 32.0 - 36.0 g/dL) [LOW]
RDW-CV: 16.8 % (Reference: 11.5 - 14.5 %) [ELEVATED - Anisocytosis]

WHITE BLOOD CELLS:
Total Leukocyte Count (TLC / WBC): 6,800 /uL (Reference: 4,000 - 11,000 /uL) [NORMAL]
Neutrophils: 64 % (Reference: 40 - 75 %)
Lymphocytes: 28 % (Reference: 20 - 45 %)
Monocytes: 5 % (Reference: 2 - 10 %)
Eosinophils: 2 % (Reference: 1 - 6 %)
Basophils: 1 % (Reference: 0 - 2 %)

PLATELET INDICES:
Platelet Count: 285,000 /uL (Reference: 150,000 - 450,000 /uL) [NORMAL]

BIOCHEMISTRY / IRON STUDIES:
Serum Ferritin: 14 ng/mL (Reference: 15 - 150 ng/mL) [LOW]
Serum Iron: 42 mcg/dL (Reference: 50 - 170 mcg/dL) [LOW]

IMPRESSION: Microcytic hypochromic picture with elevated RDW and depleted ferritin, consistent with mild-to-moderate Iron Deficiency Anemia.`,
    metadata: {
      patientName: 'Demo Patient',
      reportDate: '07-Oct-2026',
      laboratory: 'Apollo Clinical Diagnostics',
      documentCategory: 'blood_report',
      analyteCount: 14,
      extractedTables: [
        {
          title: 'Complete Blood Count (CBC)',
          headers: ['Parameter', 'Result', 'Unit', 'Reference Range', 'Flag'],
          rows: [
            ['Hemoglobin (Hb)', '10.8', 'g/dL', '12.0 - 15.5', 'LOW'],
            ['RBC Count', '3.85', 'mil/uL', '3.90 - 5.20', 'LOW'],
            ['Hematocrit (PCV)', '33.2', '%', '36.0 - 46.0', 'LOW'],
            ['MCV', '74.5', 'fL', '80.0 - 99.0', 'LOW'],
            ['MCH', '24.2', 'pg', '27.0 - 33.0', 'LOW'],
            ['RDW-CV', '16.8', '%', '11.5 - 14.5', 'HIGH'],
            ['Total WBC Count', '6,800', '/uL', '4,000 - 11,000', 'NORMAL'],
            ['Platelet Count', '285,000', '/uL', '150,000 - 450,000', 'NORMAL'],
            ['Serum Ferritin', '14', 'ng/mL', '15 - 150', 'LOW']
          ]
        }
      ],
      summary: 'CBC indicates microcytic hypochromic anemia (Hb 10.8 g/dL, MCV 74.5 fL, Ferritin 14 ng/mL).'
    }
  };

  const demoChunks: DocumentChunk[] = [
    {
      id: `${demoDocId}-chk-1`,
      documentId: demoDocId,
      documentName: demoDoc.filename,
      pageNumber: 1,
      content: `Test: Complete Blood Count (CBC). Hemoglobin: 10.8 g/dL (Reference: 12.0 - 15.5) [LOW]. MCV: 74.5 fL [LOW]. MCH: 24.2 pg [LOW]. RDW-CV: 16.8% [ELEVATED]. Total WBC: 6,800 /uL [NORMAL]. Platelet: 285,000 /uL [NORMAL].`,
      tokens: 65,
      isTable: true
    },
    {
      id: `${demoDocId}-chk-2`,
      documentId: demoDocId,
      documentName: demoDoc.filename,
      pageNumber: 2,
      content: `Biochemistry & Iron Studies: Serum Ferritin: 14 ng/mL (Reference: 15 - 150 ng/mL) [LOW]. Serum Iron: 42 mcg/dL [LOW]. Impression: Microcytic hypochromic picture with elevated RDW and depleted ferritin, consistent with Iron Deficiency Anemia.`,
      tokens: 58,
      isTable: false
    }
  ];

  const demoConv: Conversation = {
    id: demoConvId,
    userId: 'demo-user-default',
    title: 'Complete Blood Count (CBC) & Ferritin Analysis',
    language: 'en',
    createdAt: yesterday,
    updatedAt: now,
    isPinned: true,
    isArchived: false,
    searchMode: 'document',
    documentIds: [demoDocId],
    summary: 'Clinical discussion analyzing mild microcytic anemia from uploaded CBC report.'
  };

  const demoMessages: ChatMessage[] = [
    {
      id: 'msg-seed-1',
      conversationId: demoConvId,
      role: 'user',
      content: 'Can you review my uploaded CBC report? Is my Hemoglobin dangerously low, and what does it mean?',
      language: 'en',
      timestamp: yesterday,
      attachments: [
        {
          id: 'att-1',
          documentId: demoDocId,
          name: demoDoc.filename,
          size: demoDoc.fileSize,
          type: demoDoc.fileType
        }
      ]
    },
    {
      id: 'msg-seed-2',
      conversationId: demoConvId,
      role: 'assistant',
      content: `### Summary
Based on your uploaded **${demoDoc.filename}**, your results indicate mild microcytic hypochromic anemia, most commonly attributed to early iron deficiency.

### Key Laboratory Findings
| Analyte / Test | Observed Result | Reference Range | Clinical Classification |
| :--- | :--- | :--- | :--- |
| **Hemoglobin (Hb)** | **10.8 g/dL** | 12.0 – 15.5 g/dL | **Mildly Low** |
| **MCV** | **74.5 fL** | 80.0 – 99.0 fL | **Low (Microcytic)** |
| **MCH** | **24.2 pg** | 27.0 – 33.0 pg | **Low (Hypochromic)** |
| **RDW-CV** | **16.8 %** | 11.5 – 14.5 % | **Elevated (Anisocytosis)** |
| **Serum Ferritin** | **14 ng/mL** | 15 – 150 ng/mL | **Depleted Iron Stores** |
| **WBC (Leukocytes)** | 6,800 /uL | 4,000 – 11,000 /uL | Normal |
| **Platelets** | 285,000 /uL | 150,000 – 450,000 /uL | Normal |

### Clinical Context & Next Steps
- **Is 10.8 g/dL dangerous?** A level of 10.8 g/dL represents *mild* anemia rather than an immediate critical emergency (levels under 7.0–8.0 g/dL typically constitute severe concern).
- **Underlying Cause:** Low MCV alongside low Serum Ferritin (14 ng/mL) points towards iron depletion prior to severe systemic symptoms.
- **Recommendations for Discussion:**
  1. Schedule a routine review with your primary care physician or hematologist.
  2. Inquire whether dietary modifications or oral iron supplementation (e.g., ferrous sulfate/ascorbate) are indicated.
  3. Explore any underlying causes of blood loss (e.g., heavy menses or GI bleeding).`,
      language: 'en',
      timestamp: yesterday,
      citations: [
        {
          id: 'cit-1',
          documentId: demoDocId,
          documentName: demoDoc.filename,
          pageNumber: 1,
          snippet: 'Hemoglobin (Hb): 10.8 g/dL (Reference: 12.0 - 15.5 g/dL) [LOW]',
          relevanceScore: 0.94
        },
        {
          id: 'cit-2',
          documentId: demoDocId,
          documentName: demoDoc.filename,
          pageNumber: 2,
          snippet: 'Serum Ferritin: 14 ng/mL (Reference: 15 - 150 ng/mL) [LOW]',
          relevanceScore: 0.89
        }
      ],
      modelUsed: 'Gemini 2.5 Flash / Clinical Engine',
      searchMode: 'document'
    }
  ];

  writeStorage(STORAGE_KEYS.CONVERSATIONS, [demoConv]);
  writeStorage(STORAGE_KEYS.DOCUMENTS, [demoDoc]);
  writeStorage(STORAGE_KEYS.CHUNKS, demoChunks);
  writeStorage(STORAGE_KEYS.MESSAGES, demoMessages);
}

// Auto-seed on module import
seedInitialDataIfEmpty();

// ==================== CONVERSATIONS ====================

export function getConversations(userId?: string): Conversation[] {
  seedInitialDataIfEmpty();
  const convs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  if (!userId) return convs;
  return convs.filter((c) => !c.userId || c.userId === userId || c.userId === 'demo-user-default');
}

export function getConversation(id: string): Conversation | undefined {
  const convs = getConversations();
  return convs.find((c) => c.id === id);
}

export function createConversation(
  userId: string,
  title?: string,
  language: LanguageCode = 'en',
  searchMode: SearchMode = 'document'
): Conversation {
  const newConv: Conversation = {
    id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'demo-user-default',
    title: title || 'New Medical Consultation',
    language,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    isArchived: false,
    searchMode,
    documentIds: []
  };

  const convs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  convs.unshift(newConv);
  writeStorage(STORAGE_KEYS.CONVERSATIONS, convs);
  return newConv;
}

export function updateConversation(
  id: string,
  updates: Partial<Conversation>
): Conversation | undefined {
  const convs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const index = convs.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  convs[index] = {
    ...convs[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  writeStorage(STORAGE_KEYS.CONVERSATIONS, convs);
  return convs[index];
}

export function deleteConversation(id: string): void {
  const convs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []).filter(
    (c) => c.id !== id
  );
  writeStorage(STORAGE_KEYS.CONVERSATIONS, convs);

  // Also clean up messages and documents attached to this conversation
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []).filter(
    (m) => m.conversationId !== id
  );
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);

  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  const removedDocIds = docs.filter((d) => d.conversationId === id).map((d) => d.id);
  const remainingDocs = docs.filter((d) => d.conversationId !== id);
  writeStorage(STORAGE_KEYS.DOCUMENTS, remainingDocs);

  if (removedDocIds.length > 0) {
    const chunks = readStorage<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []).filter(
      (chk) => !removedDocIds.includes(chk.documentId)
    );
    writeStorage(STORAGE_KEYS.CHUNKS, chunks);
  }
}

export function deleteAllConversations(userId?: string): void {
  if (!userId) {
    writeStorage(STORAGE_KEYS.CONVERSATIONS, []);
    writeStorage(STORAGE_KEYS.MESSAGES, []);
    writeStorage(STORAGE_KEYS.DOCUMENTS, []);
    writeStorage(STORAGE_KEYS.CHUNKS, []);
    return;
  }

  const convs = readStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const convIdsToDelete = new Set(
    convs.filter((c) => c.userId === userId).map((c) => c.id)
  );

  const remainingConvs = convs.filter((c) => !convIdsToDelete.has(c.id));
  writeStorage(STORAGE_KEYS.CONVERSATIONS, remainingConvs);

  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []).filter(
    (m) => !convIdsToDelete.has(m.conversationId)
  );
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);

  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  const removedDocIds = docs
    .filter((d) => convIdsToDelete.has(d.conversationId) || d.userId === userId)
    .map((d) => d.id);
  const remainingDocs = docs.filter((d) => !removedDocIds.includes(d.id));
  writeStorage(STORAGE_KEYS.DOCUMENTS, remainingDocs);

  const chunks = readStorage<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []).filter(
    (chk) => !removedDocIds.includes(chk.documentId)
  );
  writeStorage(STORAGE_KEYS.CHUNKS, chunks);
}

// ==================== MESSAGES ====================

export function getMessages(conversationId?: string): ChatMessage[] {
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  if (!conversationId) return msgs;
  return msgs
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function clearMessages(conversationId: string): void {
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []).filter(
    (m) => m.conversationId !== conversationId
  );
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);
}

export function saveMessage(message: ChatMessage): void {
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  const existingIdx = msgs.findIndex((m) => m.id === message.id);
  if (existingIdx !== -1) {
    msgs[existingIdx] = message;
  } else {
    msgs.push(message);
  }
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);

  // Update parent conversation timestamp
  updateConversation(message.conversationId, {
    updatedAt: new Date().toISOString()
  });
}

export function updateMessage(
  id: string,
  updates: Partial<ChatMessage>
): ChatMessage | undefined {
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []);
  const idx = msgs.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;

  msgs[idx] = { ...msgs[idx], ...updates };
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);
  return msgs[idx];
}

export function deleteMessage(id: string): void {
  const msgs = readStorage<ChatMessage[]>(STORAGE_KEYS.MESSAGES, []).filter(
    (m) => m.id !== id
  );
  writeStorage(STORAGE_KEYS.MESSAGES, msgs);
}

// ==================== DOCUMENTS & CHUNKS ====================

export function getDocuments(conversationId?: string, userId?: string): ChatDocument[] {
  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  return docs.filter((d) => {
    if (conversationId && d.conversationId !== conversationId) return false;
    if (userId && d.userId !== userId && d.userId !== 'demo-user-default') return false;
    return true;
  });
}

export function getDocument(id: string): ChatDocument | undefined {
  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  return docs.find((d) => d.id === id);
}

export function saveDocument(doc: ChatDocument): void {
  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  const idx = docs.findIndex((d) => d.id === doc.id);
  if (idx !== -1) {
    docs[idx] = doc;
  } else {
    docs.push(doc);
  }
  writeStorage(STORAGE_KEYS.DOCUMENTS, docs);

  // Link to conversation
  const conv = getConversation(doc.conversationId);
  if (conv && !conv.documentIds.includes(doc.id)) {
    updateConversation(doc.conversationId, {
      documentIds: [...conv.documentIds, doc.id]
    });
  }
}

export function updateDocument(id: string, updates: Partial<ChatDocument>): ChatDocument | undefined {
  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;

  docs[idx] = {
    ...docs[idx],
    ...updates,
    metadata: {
      ...docs[idx].metadata,
      ...(updates.metadata || {})
    }
  };
  writeStorage(STORAGE_KEYS.DOCUMENTS, docs);
  return docs[idx];
}

export function deleteDocument(id: string): void {
  const doc = getDocument(id);
  const docs = readStorage<ChatDocument[]>(STORAGE_KEYS.DOCUMENTS, []).filter(
    (d) => d.id !== id
  );
  writeStorage(STORAGE_KEYS.DOCUMENTS, docs);

  // Delete chunks
  const chunks = readStorage<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []).filter(
    (chk) => chk.documentId !== id
  );
  writeStorage(STORAGE_KEYS.CHUNKS, chunks);

  // Unlink from conversation
  if (doc?.conversationId) {
    const conv = getConversation(doc.conversationId);
    if (conv) {
      updateConversation(doc.conversationId, {
        documentIds: conv.documentIds.filter((dId) => dId !== id)
      });
    }
  }
}

export function getChunks(documentId?: string): DocumentChunk[] {
  const chunks = readStorage<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []);
  if (!documentId) return chunks;
  return chunks.filter((c) => c.documentId === documentId);
}

export function saveChunks(newChunks: DocumentChunk[]): void {
  const chunks = readStorage<DocumentChunk[]>(STORAGE_KEYS.CHUNKS, []);
  const map = new Map<string, DocumentChunk>();
  chunks.forEach((c) => map.set(c.id, c));
  newChunks.forEach((c) => map.set(c.id, c));
  writeStorage(STORAGE_KEYS.CHUNKS, Array.from(map.values()));
}

export function searchConversations(query: string, userId?: string): Conversation[] {
  const convs = getConversations(userId);
  if (!query.trim()) return convs;
  const q = query.toLowerCase();
  return convs.filter((c) => c.title.toLowerCase().includes(q));
}
