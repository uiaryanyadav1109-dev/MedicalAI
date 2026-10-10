/**
 * Multilingual Speech Language Detector
 * Accurately detects:
 * - English (Latin script)
 * - Hindi (Devanagari script: U+0900 - U+097F)
 * - Bengali (Bengali script: U+0980 - U+09FF)
 * - Hinglish (Hindi conversational expressions written in Latin script with English medical terminology)
 */

export type SpeechLanguage = 'en' | 'hi' | 'bn' | 'hinglish';

export interface LanguageDetectionResult {
  language: SpeechLanguage;
  confidence: number;
  script: 'latin' | 'devanagari' | 'bengali' | 'mixed';
  details: {
    devanagariChars: number;
    bengaliChars: number;
    latinChars: number;
    hinglishMatchCount: number;
    totalWords: number;
  };
}

// Common conversational Hindi / Hinglish vocabulary written in Latin alphabet
const HINGLISH_PATTERNS = new Set([
  'namaste', 'namashkar', 'aap', 'aapko', 'aapka', 'aapke', 'aapki', 'apna', 'apne', 'apni',
  'karein', 'kare', 'karo', 'karna', 'kijiye', 'karega', 'karegi',
  'hai', 'hain', 'ho', 'hoga', 'hogi', 'hoge', 'hote', 'hoti', 'hota',
  'tha', 'thi', 'the',
  'nahi', 'nahin', 'na', 'mat',
  'aur', 'ya', 'lekin', 'magar', 'par', 'pe', 'mein', 'me', 'se', 'ko', 'ka', 'ke', 'ki',
  'kya', 'kyun', 'kaise', 'kab', 'kaha', 'kahan', 'kitna', 'kitni',
  'agar', 'toh', 'bhi', 'bohot', 'bahut', 'zyada', 'jyada', 'kam', 'thoda', 'thodi',
  'dard', 'bukhar', 'dawa', 'dawai', 'dawaiyaan', 'goli', 'khayein', 'khana', 'peena', 'pani', 'piyein',
  'aspatal', 'ilaaj', 'aaram', 'kripya', 'dhanyawad', 'shukriya',
  'jaldi', 'theek', 'thik', 'samasya', 'takleef', 'pareshani', 'dekhein', 'batayein', 'suniye',
  'chahiye', 'sakta', 'sakti', 'sakte', 'raha', 'rahi', 'rahe',
  'subah', 'dopahar', 'shaam', 'raat', 'din', 'ghante', 'pehle', 'baad',
  'sir', 'sar', 'pet', 'gala', 'seena', 'khaanasi', 'khasi', 'saans', 'chhati'
]);

export class LanguageDetector {
  /**
   * Detects the predominant language and script of the speech text
   */
  public static detect(text: string, preferredHint?: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        language: 'en',
        confidence: 1.0,
        script: 'latin',
        details: { devanagariChars: 0, bengaliChars: 0, latinChars: 0, hinglishMatchCount: 0, totalWords: 0 }
      };
    }

    const cleaned = text.trim();

    // 1. Unicode Script Character Counts
    let devanagariCount = 0;
    let bengaliCount = 0;
    let latinCount = 0;
    let otherCount = 0;

    for (let i = 0; i < cleaned.length; i++) {
      const code = cleaned.charCodeAt(i);
      if (code >= 0x0900 && code <= 0x097f) {
        devanagariCount++;
      } else if (code >= 0x0980 && code <= 0x09ff) {
        bengaliCount++;
      } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        latinCount++;
      } else if (!/\s|[0-9.,;:!?(){}\[\]"'\-_/\\|<>]/.test(cleaned[i])) {
        otherCount++;
      }
    }

    const totalScriptChars = devanagariCount + bengaliCount + latinCount;

    // 2. Clear Bengali Script Detection (Must never be read using Hindi voice)
    if (bengaliCount > 0 && (bengaliCount >= devanagariCount * 2 || bengaliCount / (totalScriptChars || 1) > 0.15)) {
      const confidence = Math.min(1.0, bengaliCount / Math.max(1, totalScriptChars));
      return {
        language: 'bn',
        confidence,
        script: 'bengali',
        details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount: 0, totalWords: 0 }
      };
    }

    // 3. Clear Hindi Devanagari Script Detection (Must never be read using Bengali or English voice)
    if (devanagariCount > 0 && (devanagariCount >= bengaliCount * 2 || devanagariCount / (totalScriptChars || 1) > 0.15)) {
      const confidence = Math.min(1.0, devanagariCount / Math.max(1, totalScriptChars));
      return {
        language: 'hi',
        confidence,
        script: 'devanagari',
        details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount: 0, totalWords: 0 }
      };
    }

    // 4. Latin Script: Differentiate pure English vs Hinglish
    const words = cleaned
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !/^\d+$/.test(w));

    let hinglishMatchCount = 0;
    for (const word of words) {
      if (HINGLISH_PATTERNS.has(word)) {
        hinglishMatchCount++;
      }
    }

    const totalWords = Math.max(1, words.length);
    const hinglishRatio = hinglishMatchCount / totalWords;

    // If explicit user preferred hint is 'hinglish' and we see any Hinglish word
    if (preferredHint === 'hinglish' && hinglishMatchCount >= 1) {
      return {
        language: 'hinglish',
        confidence: 0.9,
        script: 'latin',
        details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount, totalWords }
      };
    }

    // High confidence Hinglish: 2 or more distinct Hinglish markers and ratio >= 8%, or >= 3 matches
    if (hinglishMatchCount >= 2 && (hinglishRatio >= 0.08 || hinglishMatchCount >= 3)) {
      const confidence = Math.min(0.98, 0.5 + hinglishRatio);
      return {
        language: 'hinglish',
        confidence,
        script: 'latin',
        details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount, totalWords }
      };
    }

    // Single Hinglish greeting/prompt with short query
    if (hinglishMatchCount >= 1 && totalWords <= 6) {
      return {
        language: 'hinglish',
        confidence: 0.8,
        script: 'latin',
        details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount, totalWords }
      };
    }

    // Default: English in Latin script
    return {
      language: 'en',
      confidence: Math.max(0.7, 1.0 - hinglishRatio),
      script: 'latin',
      details: { devanagariChars: devanagariCount, bengaliChars: bengaliCount, latinChars: latinCount, hinglishMatchCount, totalWords }
    };
  }
}
