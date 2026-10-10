/**
 * Clinical Speech Text Preprocessor
 * Prepares raw medical assistant responses into clear, fluent, spoken text
 * - Cleans markdown, headers, tables, links, code, and source citations
 * - Expands unambiguous clinical measurements and units
 * - Preserves ALL vital medical warnings, negations ("not", "never", "do not"), dosages, and numbers
 * - Splits long text into natural sentence-based chunks (< 180 chars) to prevent Chrome SpeechSynthesis timeouts
 */

import { SpeechLanguage } from './languageDetector';

export interface PreprocessedSpeech {
  cleanText: string;
  chunks: string[];
  detectedLanguage: SpeechLanguage;
}

export class TextPreprocessor {
  /**
   * Cleans and formats markdown medical text into speech-ready text
   */
  public static cleanForSpeech(rawText: string, language: SpeechLanguage = 'en'): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Remove source citation blocks at the bottom (e.g. Sources:\n- File.pdf)
    text = text.replace(/Sources:[\s\S]*$/gi, '');
    text = text.replace(/\[Source\s+\d+:[^\]]+\]/gi, '');
    text = text.replace(/\[\d+\]/g, ''); // inline citations [1], [2]

    // 2. Remove code blocks
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/`([^`]+)`/g, '$1');

    // 3. Remove markdown headers (#, ##, ###) but keep text
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1. ');

    // 4. Convert markdown tables into spoken sentences
    text = text.replace(/\|[^\n]+\|\n\|[\:\-\s\|]+\|\n(\|?[^\n]+\|\n?)+/g, (match) => {
      const rows = match.split('\n').filter((r) => r.includes('|') && !r.includes('---'));
      if (rows.length <= 1) return '';
      // First row header
      const headers = rows[0].split('|').map((c) => c.trim()).filter(Boolean);
      return rows
        .slice(1)
        .map((row) => {
          const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
          if (cells.length >= 2) {
            const label = cells[0];
            const val = cells[1];
            const extra = cells.slice(2).join(', ');
            return `${label}: ${val}${extra ? ` (${extra})` : ''}. `;
          }
          return cells.join(', ') + '. ';
        })
        .join(' ');
    });

    // 5. Convert bullet points and numbered lists into readable clauses
    text = text.replace(/^[\s]*[-•*]\s+/gm, '');
    text = text.replace(/^[\s]*(\d+)\.\s+/gm, '$1. ');

    // 6. Remove bold/italics markers
    text = text.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1');

    // 7. Markdown links [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // 8. Convert critical emojis to speech cues
    text = text.replace(/⚠️|🚨|🔴/g, 'Important: ');
    text = text.replace(/✅|🟢/g, 'Normal: ');
    text = text.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Remove other purely decorative emojis

    // 9. Standard clinical unit expansions (language-aware)
    if (language === 'en' || language === 'hinglish') {
      text = text.replace(/\bmg\/dL\b/gi, 'milligrams per deciliter');
      text = text.replace(/\bg\/dL\b/gi, 'grams per deciliter');
      text = text.replace(/\bmmol\/L\b/gi, 'millimoles per liter');
      text = text.replace(/\bmEq\/L\b/gi, 'milliequivalents per liter');
      text = text.replace(/\bmmHg\b/gi, 'millimeters of mercury');
      text = text.replace(/\bbpm\b/gi, 'beats per minute');
      text = text.replace(/\bSpO2\b/gi, 'oxygen saturation');
      text = text.replace(/\bBP\b/g, 'blood pressure');
      text = text.replace(/\bHb\b/g, 'Hemoglobin');
      text = text.replace(/\bWBC\b/g, 'white blood cell count');
      text = text.replace(/\bRBC\b/g, 'red blood cell count');
      text = text.replace(/\b(\d+)\s*mg\b/gi, '$1 milligrams');
      text = text.replace(/\b(\d+)\s*ml\b/gi, '$1 milliliters');
      text = text.replace(/\b(\d+)\s*mcg\b/gi, '$1 micrograms');
      text = text.replace(/\b°C\b/g, 'degrees Celsius');
      text = text.replace(/\b°F\b/g, 'degrees Fahrenheit');
    }

    // 10. Normalize punctuation, breaks, and spaces
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\n{2,}/g, '. ');
    text = text.replace(/\n/g, '. ');
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\.{2,}/g, '.');
    text = text.replace(/\s*([.,;!?।])\s*/g, '$1 ');

    return text.trim();
  }

  /**
   * Splits a long text into coherent, sentence-based audio chunks (< 160 chars)
   * Prevents Chrome / Edge Web Speech API 15-second cutoff and dropped utterances
   */
  public static splitIntoChunks(cleanText: string, maxChunkLength: number = 160): string[] {
    if (!cleanText || cleanText.length <= maxChunkLength) {
      return cleanText ? [cleanText] : [];
    }

    const chunks: string[] = [];
    
    // Split on sentence boundaries: periods, question marks, exclamation marks, Hindi danda (।), or semicolons
    const sentences = cleanText.split(/(?<=[.?!;।])\s+/);

    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // If a single sentence exceeds maxChunkLength, split by commas or phrases
      if (trimmedSentence.length > maxChunkLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        const phrases = trimmedSentence.split(/(?<=[,:\-\–])\s+/);
        let subChunk = '';
        for (const phrase of phrases) {
          if (subChunk.length + phrase.length + 1 <= maxChunkLength) {
            subChunk += (subChunk ? ' ' : '') + phrase;
          } else {
            if (subChunk) chunks.push(subChunk.trim());
            // If even a single phrase exceeds, split by word
            if (phrase.length > maxChunkLength) {
              const words = phrase.split(/\s+/);
              let wordChunk = '';
              for (const word of words) {
                if (wordChunk.length + word.length + 1 <= maxChunkLength) {
                  wordChunk += (wordChunk ? ' ' : '') + word;
                } else {
                  if (wordChunk) chunks.push(wordChunk.trim());
                  wordChunk = word;
                }
              }
              if (wordChunk) subChunk = wordChunk;
              else subChunk = '';
            } else {
              subChunk = phrase;
            }
          }
        }
        if (subChunk) chunks.push(subChunk.trim());
      } else {
        if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkLength) {
          currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
        } else {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter((c) => c.length > 0);
  }

  /**
   * Prepares and chunks the full text
   */
  public static process(rawText: string, language: SpeechLanguage): PreprocessedSpeech {
    const cleanText = this.cleanForSpeech(rawText, language);
    const chunks = this.splitIntoChunks(cleanText);

    return {
      cleanText,
      chunks,
      detectedLanguage: language
    };
  }
}
