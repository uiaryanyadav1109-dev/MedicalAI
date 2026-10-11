/**
 * Medical AI Multi-Provider Model Registry & Resilient Dispatcher
 *
 * Implements:
 * - Unified Model Registry across Google Gemini, OpenAI, Anthropic, Groq, and Clinical Engine
 * - Dynamic availability detection based on server environment keys
 * - Provider-specific streaming adapters with token generation & timeout boundaries
 * - Bounded retries and graceful fallback cascading
 * - Streamable client fallback alerts
 */

import dotenv from 'dotenv';
import { AIModelConfig, AIProviderId } from '../types/chat';

dotenv.config();

export interface ModelMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ModelAttachment {
  name: string;
  mimeType: string;
  data: string; // base64 or data URL
}

export interface StreamEvent {
  type: 'chunk' | 'metadata' | 'fallback_notification' | 'done' | 'error';
  text?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
  error?: string;
}

export interface ModelDispatchOptions {
  modelId?: string;
  systemPrompt: string;
  messages: ModelMessage[];
  attachments?: ModelAttachment[];
  language?: string;
  docContext?: string;
  patientProfile?: any;
  autoFallback?: boolean;
  onEvent: (event: StreamEvent) => Promise<void> | void;
  signal?: AbortSignal;
}

// Complete Catalog of Supported Medical AI Models
export const SUPPORTED_MODELS: AIModelConfig[] = [
  // --- Google Gemini ---
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
    providerLabel: 'Google DeepMind',
    description: 'High-speed clinical reasoning, multimodal medical document analysis.',
    badge: 'Recommended',
    contextWindow: '1M tokens',
    isAvailable: false,
    isDefault: true,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    providerLabel: 'Google DeepMind',
    description: 'Balanced throughput and high-reliability clinical triage.',
    badge: 'Fast & Reliable',
    contextWindow: '1M tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    providerLabel: 'Google DeepMind',
    description: 'Deep clinical reasoning for complex medical reports and diagnostic records.',
    badge: 'High Reasoning',
    contextWindow: '2M tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'google',
    providerLabel: 'Google DeepMind',
    description: 'Legacy high throughput flash model.',
    badge: 'Legacy',
    contextWindow: '1M tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },

  // --- OpenAI ---
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'openai',
    providerLabel: 'OpenAI',
    description: 'Flagship multimodal model with comprehensive medical synthesis.',
    badge: 'Flagship',
    contextWindow: '128K tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    providerLabel: 'OpenAI',
    description: 'Cost-efficient, rapid clinical guidance and symptom triage.',
    badge: 'Efficient',
    contextWindow: '128K tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    providerLabel: 'OpenAI',
    description: 'Standard conversational medical assistant.',
    contextWindow: '16K tokens',
    isAvailable: false,
    supportsVision: false,
    supportsStreaming: true
  },

  // --- Anthropic Claude ---
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    description: 'Top-tier diagnostic document interpretation and nuanced clinical reasoning.',
    badge: 'High Precision',
    contextWindow: '200K tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    description: 'Near-instant response generation for primary triage inquiries.',
    badge: 'Ultra Fast',
    contextWindow: '200K tokens',
    isAvailable: false,
    supportsVision: true,
    supportsStreaming: true
  },

  // --- Groq / Open Source ---
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    providerLabel: 'Groq / Meta',
    description: 'Ultra-low-latency open-weight model running on LPUs.',
    badge: 'Ultra Fast LPU',
    contextWindow: '128K tokens',
    isAvailable: false,
    supportsVision: false,
    supportsStreaming: true
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 (Distill 70B)',
    provider: 'groq',
    providerLabel: 'Groq / DeepSeek',
    description: 'Advanced reasoning distillation for complex clinical deductions.',
    badge: 'Deep Reasoning',
    contextWindow: '128K tokens',
    isAvailable: false,
    supportsVision: false,
    supportsStreaming: true
  },

  // --- Clinical Intelligence Knowledge Engine ---
  {
    id: 'clinical-intelligence-engine',
    name: 'Clinical Reference Engine',
    provider: 'clinical-engine',
    providerLabel: 'MedicalAI Internal',
    description: 'Authoritative offline clinical triage and pathophysiology protocols.',
    badge: 'Always Online',
    contextWindow: 'Unlimited',
    isAvailable: true,
    supportsVision: true,
    supportsStreaming: true
  }
];

/**
 * Evaluates provider keys and returns models with real-time availability status
 */
export function getModelRegistry(): AIModelConfig[] {
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const openAIKey = (process.env.OPENAI_API_KEY || '').trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  const groqKey = (process.env.GROQ_API_KEY || '').trim();

  return SUPPORTED_MODELS.map((model) => {
    let isAvailable = false;
    let unavailableReason = undefined;

    switch (model.provider) {
      case 'google':
        if (geminiKey) {
          isAvailable = true;
        } else {
          unavailableReason = 'GEMINI_API_KEY not configured on server.';
        }
        break;
      case 'openai':
        if (openAIKey) {
          isAvailable = true;
        } else {
          unavailableReason = 'OPENAI_API_KEY not configured on server.';
        }
        break;
      case 'anthropic':
        if (anthropicKey) {
          isAvailable = true;
        } else {
          unavailableReason = 'ANTHROPIC_API_KEY not configured on server.';
        }
        break;
      case 'groq':
        if (groqKey) {
          isAvailable = true;
        } else {
          unavailableReason = 'GROQ_API_KEY not configured on server.';
        }
        break;
      case 'clinical-engine':
        isAvailable = true;
        break;
    }

    return {
      ...model,
      isAvailable,
      unavailableReason
    };
  });
}

/**
 * Returns the best default model that is currently configured and available
 */
export function getDefaultModelId(): string {
  const models = getModelRegistry();
  const available = models.filter((m) => m.isAvailable);

  const preferred = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3-5-sonnet-20241022',
    'llama-3.3-70b-versatile',
    'clinical-intelligence-engine'
  ];

  for (const id of preferred) {
    if (available.some((m) => m.id === id)) {
      return id;
    }
  }

  return available[0]?.id || 'clinical-intelligence-engine';
}

/**
 * Helper to split text into chunks for SSE streaming
 */
export function splitTextIntoChunks(text: string, chunkSize = 18): string[] {
  const chunks: string[] = [];
  let index = 0;
  while (index < text.length) {
    chunks.push(text.slice(index, index + chunkSize));
    index += chunkSize;
  }
  return chunks;
}

// ==========================================
// Provider Adapters
// ==========================================

/**
 * Adapter for Google Gemini Models
 */
async function streamGemini(
  modelId: string,
  options: ModelDispatchOptions
): Promise<boolean> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const contents: any[] = [];

  for (const m of options.messages) {
    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    });
  }

  if (options.attachments && options.attachments.length > 0) {
    const lastContent = contents[contents.length - 1];
    if (lastContent && lastContent.role === 'user') {
      const parts = lastContent.parts || [];
      for (const att of options.attachments) {
        if (att.data && att.mimeType) {
          const rawBase64 = att.data.includes('base64,') ? att.data.split('base64,')[1] : att.data;
          parts.unshift({
            inlineData: {
              mimeType: att.mimeType,
              data: rawBase64
            }
          });
        }
      }
    }
  }

  const timeoutMs = 12000;
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Gemini (${modelId}) request timed out after ${timeoutMs}ms`)), timeoutMs)
  );

  const streamPromise = ai.models.generateContentStream({
    model: modelId,
    contents,
    config: {
      systemInstruction: options.systemPrompt
    }
  });

  const responseStream: any = await Promise.race([streamPromise, timeoutPromise]);
  let tokenCount = 0;

  for await (const chunk of responseStream) {
    if (options.signal?.aborted) break;
    const text = chunk.text;
    if (text) {
      tokenCount++;
      await options.onEvent({
        type: 'chunk',
        text
      });
    }
  }

  return tokenCount > 0;
}

/**
 * Adapter for OpenAI Chat Models (GPT-4o, GPT-4o-mini, etc.)
 */
async function streamOpenAI(
  modelId: string,
  options: ModelDispatchOptions
): Promise<boolean> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const formattedMessages: any[] = [
    { role: 'system', content: options.systemPrompt }
  ];

  for (const m of options.messages) {
    formattedMessages.push({
      role: m.role,
      content: m.content
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      temperature: 0.2
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  if (!response.body) throw new Error('No response body from OpenAI stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let tokenCount = 0;

  while (true) {
    if (options.signal?.aborted) break;
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6).trim();
      if (jsonStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) {
          tokenCount++;
          await options.onEvent({ type: 'chunk', text });
        }
      } catch {}
    }
  }

  return tokenCount > 0;
}

/**
 * Adapter for Anthropic Claude Models
 */
async function streamAnthropic(
  modelId: string,
  options: ModelDispatchOptions
): Promise<boolean> {
  const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const messages: any[] = [];
  for (const m of options.messages) {
    if (m.role === 'user' || m.role === 'assistant') {
      messages.push({
        role: m.role,
        content: m.content
      });
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelId,
      system: options.systemPrompt,
      messages,
      max_tokens: 2048,
      stream: true
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  if (!response.body) throw new Error('No response body from Anthropic stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let tokenCount = 0;

  while (true) {
    if (options.signal?.aborted) break;
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6).trim();

      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          tokenCount++;
          await options.onEvent({ type: 'chunk', text: parsed.delta.text });
        }
      } catch {}
    }
  }

  return tokenCount > 0;
}

/**
 * Adapter for Groq (Llama / DeepSeek) Models
 */
async function streamGroq(
  modelId: string,
  options: ModelDispatchOptions
): Promise<boolean> {
  const apiKey = (process.env.GROQ_API_KEY || '').trim();
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');

  const formattedMessages: any[] = [
    { role: 'system', content: options.systemPrompt }
  ];

  for (const m of options.messages) {
    formattedMessages.push({
      role: m.role,
      content: m.content
    });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelId,
      messages: formattedMessages,
      stream: true,
      temperature: 0.2
    }),
    signal: options.signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  if (!response.body) throw new Error('No response body from Groq stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let tokenCount = 0;

  while (true) {
    if (options.signal?.aborted) break;
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;
      const jsonStr = trimmed.slice(6).trim();
      if (jsonStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) {
          tokenCount++;
          await options.onEvent({ type: 'chunk', text });
        }
      } catch {}
    }
  }

  return tokenCount > 0;
}

/**
 * Adapter for the Clinical Reference Knowledge Engine
 */
async function streamClinicalEngine(
  options: ModelDispatchOptions,
  fallbackGenerator: (message: string, lang: string, docCtx: string, profile: any) => string
): Promise<boolean> {
  const userMsg = options.messages[options.messages.length - 1]?.content || '';
  const text = fallbackGenerator(
    userMsg,
    options.language || 'en',
    options.docContext || '',
    options.patientProfile
  );

  const chunks = splitTextIntoChunks(text);
  for (const c of chunks) {
    if (options.signal?.aborted) break;
    await options.onEvent({ type: 'chunk', text: c });
    await new Promise((r) => setTimeout(r, 12));
  }

  return true;
}

// ==========================================
// Multi-Model Dispatcher & Fallback Engine
// ==========================================

export async function dispatchModelStream(
  options: ModelDispatchOptions,
  clinicalFallbackGenerator: (message: string, lang: string, docCtx: string, profile: any) => string
): Promise<void> {
  const registry = getModelRegistry();
  const requestedId = options.modelId || getDefaultModelId();
  let targetModel = registry.find((m) => m.id === requestedId);

  // If requested model is unknown, default to available model
  if (!targetModel) {
    const defaultId = getDefaultModelId();
    targetModel = registry.find((m) => m.id === defaultId);
  }

  // Candidate cascade order for automatic fallback
  const fallbackCandidates: string[] = [];
  if (targetModel) {
    fallbackCandidates.push(targetModel.id);
  }

  // Add all other available configured models in preference sequence
  const remainingAvailable = registry
    .filter((m) => m.isAvailable && m.id !== targetModel?.id && m.id !== 'clinical-intelligence-engine')
    .map((m) => m.id);

  fallbackCandidates.push(...remainingAvailable);
  // The Clinical Reference Engine is always the final resilient safety net
  if (!fallbackCandidates.includes('clinical-intelligence-engine')) {
    fallbackCandidates.push('clinical-intelligence-engine');
  }

  let executedSuccessfully = false;
  let lastError: any = null;
  let currentModelId = fallbackCandidates[0];

  for (let i = 0; i < fallbackCandidates.length; i++) {
    if (options.signal?.aborted) break;

    currentModelId = fallbackCandidates[i];
    const modelConfig = registry.find((m) => m.id === currentModelId);

    const isInitialChoice = i === 0;
    const isFallback = !isInitialChoice;

    if (isFallback) {
      if (options.autoFallback === false) {
        console.log(`[MODEL-ROUTER] User disabled auto-fallback. Halting after primary failure: ${lastError?.message}`);
        break;
      }

      console.warn(`[MODEL-ROUTER] Recovering: falling back to model "${currentModelId}" (Reason: ${lastError?.message || 'upstream failure'})`);

      await options.onEvent({
        type: 'fallback_notification',
        modelUsed: currentModelId,
        fallbackUsed: true,
        fallbackReason: `Primary model (${targetModel?.name || requestedId}) unavailable. Switched to ${modelConfig?.name || currentModelId}.`
      });
    }

    // Send metadata informing client of model being used
    await options.onEvent({
      type: 'metadata',
      modelUsed: modelConfig?.name || currentModelId,
      fallbackUsed: isFallback
    });

    try {
      console.log(`[MODEL-ROUTER] Executing stream on [${modelConfig?.provider}] -> ${currentModelId}`);

      if (modelConfig?.provider === 'google') {
        executedSuccessfully = await streamGemini(currentModelId, options);
      } else if (modelConfig?.provider === 'openai') {
        executedSuccessfully = await streamOpenAI(currentModelId, options);
      } else if (modelConfig?.provider === 'anthropic') {
        executedSuccessfully = await streamAnthropic(currentModelId, options);
      } else if (modelConfig?.provider === 'groq') {
        executedSuccessfully = await streamGroq(currentModelId, options);
      } else if (modelConfig?.provider === 'clinical-engine') {
        executedSuccessfully = await streamClinicalEngine(options, clinicalFallbackGenerator);
      }

      if (executedSuccessfully) {
        console.log(`[MODEL-ROUTER] Stream successfully completed with ${currentModelId}`);
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[MODEL-ROUTER] Provider failed for ${currentModelId}:`, err?.message || err);
    }
  }

  if (!executedSuccessfully && !options.signal?.aborted) {
    console.warn(`[MODEL-ROUTER] All candidate providers exhausted. Invoking internal Clinical Reference Engine.`);
    await options.onEvent({
      type: 'fallback_notification',
      modelUsed: 'Clinical Reference Engine',
      fallbackUsed: true,
      fallbackReason: 'Live cloud models temporarily unavailable. Grounded clinical guidance loaded.'
    });
    await streamClinicalEngine(options, clinicalFallbackGenerator);
  }

  await options.onEvent({ type: 'done' });
}
