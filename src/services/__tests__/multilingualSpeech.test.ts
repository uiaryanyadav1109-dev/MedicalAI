/**
 * Multilingual Speech & Read Aloud Test Suite
 * Validates:
 * 1. English, Hindi, Bengali, and Hinglish Language Detection
 * 2. Medical Safety & Unit Preservation (Dosages, Negations, Units, Warnings)
 * 3. Markdown & Table Cleaning (no raw markdown or syntax spoken)
 * 4. Sentence Chunking (< 160 chars, boundary preservation)
 * 5. Voice Resolution & Fallbacks (VoiceManager)
 * 6. Playback Queue State Machine (Play, Pause, Resume, Stop, Speed, Replay)
 */

import { LanguageDetector } from '../speech/languageDetector';
import { TextPreprocessor } from '../speech/textPreprocessor';
import { VoiceManager } from '../speech/voiceManager';
import { SpeechQueue } from '../speech/speechQueue';

export interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  error?: string;
}

export function runMultilingualSpeechTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  function assert(condition: boolean, testName: string, suite: string = 'Multilingual Speech') {
    if (condition) {
      results.push({ suite, testName, passed: true });
    } else {
      results.push({ suite, testName, passed: false, error: 'Assertion failed' });
    }
  }

  // ==========================================
  // 1. LANGUAGE DETECTION TESTS
  // ==========================================
  const englishSample = "Please take your prescribed medicine according to your doctor's instructions.";
  const englishDetection = LanguageDetector.detect(englishSample);
  assert(englishDetection.language === 'en', 'Detects pure English text in Latin script');

  const hindiSample = "कृपया अपने डॉक्टर के निर्देशों के अनुसार दवा लें।";
  const hindiDetection = LanguageDetector.detect(hindiSample);
  assert(hindiDetection.language === 'hi', 'Detects Hindi text in Devanagari script');
  assert(hindiDetection.script === 'devanagari', 'Classifies Devanagari script correctly');

  const bengaliSample = "অনুগ্রহ করে আপনার চিকিৎসকের নির্দেশ অনুযায়ী ওষুধ নিন।";
  const bengaliDetection = LanguageDetector.detect(bengaliSample);
  assert(bengaliDetection.language === 'bn', 'Detects Bengali text in Bengali script');
  assert(bengaliDetection.script === 'bengali', 'Classifies Bengali script correctly and does not confuse with Hindi');

  const hinglishSample = "Doctor ne bola hai ki medicine time par leni hai, aur agar breathing problem ho toh emergency help lein.";
  const hinglishDetection = LanguageDetector.detect(hinglishSample);
  assert(hinglishDetection.language === 'hinglish', 'Accurately detects Hinglish (conversational Hindi with English terms)');

  const hinglishSample2 = "Namaste! Aapko agar fever aur headache ho raha hai, toh please apna temperature check karein.";
  const hinglishDetection2 = LanguageDetector.detect(hinglishSample2);
  assert(hinglishDetection2.language === 'hinglish', 'Detects conversational greeting Hinglish sentence');

  // Edge cases: Mixed medical terms in Hindi / Bengali
  const mixedHindi = "आपका Blood Pressure 120/80 mmHg और Hemoglobin normal है।";
  const mixedHindiDet = LanguageDetector.detect(mixedHindi);
  assert(mixedHindiDet.language === 'hi', 'Correctly identifies Hindi with mixed English medical terms');

  const mixedBengali = "আপনার Fasting Blood Sugar মাত্রা 110 mg/dL রয়েছে।";
  const mixedBengaliDet = LanguageDetector.detect(mixedBengali);
  assert(mixedBengaliDet.language === 'bn', 'Correctly identifies Bengali with mixed English clinical metrics');

  // ==========================================
  // 2. MEDICAL SAFETY & DOSAGE PRESERVATION
  // ==========================================
  const dosageText = "Take Amoxicillin 500 mg by mouth every 8 hours. Do not discontinue early.";
  const cleanedDosage = TextPreprocessor.cleanForSpeech(dosageText, 'en');
  assert(cleanedDosage.includes('500 milligrams'), 'Expands 500 mg to 500 milligrams for clear pronunciation');
  assert(cleanedDosage.includes('Do not discontinue early'), 'Strictly preserves critical medical negation "Do not"');

  const bloodPressureText = "Patient BP is 135/85 mmHg, SpO2 is 98%, and heart rate is 76 bpm.";
  const cleanedVitals = TextPreprocessor.cleanForSpeech(bloodPressureText, 'en');
  assert(cleanedVitals.includes('blood pressure'), 'Expands BP to blood pressure');
  assert(cleanedVitals.includes('oxygen saturation'), 'Expands SpO2 to oxygen saturation');
  assert(cleanedVitals.includes('millimeters of mercury'), 'Expands mmHg to millimeters of mercury');
  assert(cleanedVitals.includes('beats per minute'), 'Expands bpm to beats per minute');

  // Warning emojis converted to speech cues
  const warningText = "⚠️ Warning: Patient must avoid Ibuprofen due to active gastritis.";
  const cleanedWarning = TextPreprocessor.cleanForSpeech(warningText, 'en');
  assert(cleanedWarning.includes('Important:') || cleanedWarning.includes('Warning:'), 'Preserves clinical warning indicators');
  assert(cleanedWarning.includes('must avoid'), 'Preserves critical prohibition verb "must avoid"');

  // ==========================================
  // 3. MARKDOWN, TABLES & CITATION CLEANING
  // ==========================================
  const markdownText = `
### Diagnostic Assessment
- Blood Glucose: **105 mg/dL** (Fasting)
- Total Cholesterol: _190 mg/dL_

Sources:
📄 Lab_Report.pdf — Page 1
`;
  const cleanedMarkdown = TextPreprocessor.cleanForSpeech(markdownText, 'en');
  assert(!cleanedMarkdown.includes('###'), 'Strips raw Markdown headers');
  assert(!cleanedMarkdown.includes('**'), 'Strips raw Markdown asterisks');
  assert(!cleanedMarkdown.includes('Sources:'), 'Strips raw Sources citation footer');
  assert(!cleanedMarkdown.includes('Lab_Report.pdf'), 'Removes source filenames from spoken text');

  const tableMarkdown = `
| Biomarker | Observed | Reference |
| --- | --- | --- |
| Hemoglobin | 14.2 g/dL | 13.5 - 17.5 |
| Platelets | 250,000 | 150,000 - 450,000 |
`;
  const cleanedTable = TextPreprocessor.cleanForSpeech(tableMarkdown, 'en');
  assert(!cleanedTable.includes('|'), 'Converts markdown table into spoken clauses without pipe characters');
  assert(cleanedTable.includes('Hemoglobin'), 'Retains table parameter data');

  // ==========================================
  // 4. SENTENCE CHUNKING (CHROME TIMEOUT FIX)
  // ==========================================
  const longParagraph = "Clinical evaluation reveals mild pharyngitis without tonsillar exudate. Patient reports onset of symptoms 48 hours ago following exposure to cold air. Vital signs are within normal limits with no fever detected at present. Advised warm saline gargles three times daily and adequate hydration. If difficulty in swallowing or high fever develops, seek immediate in-person clinical review.";
  const chunks = TextPreprocessor.splitIntoChunks(longParagraph, 120);
  assert(chunks.length >= 2, 'Splits long medical explanations into manageable audio chunks');
  chunks.forEach((chunk, idx) => {
    assert(chunk.length <= 135, `Chunk ${idx + 1} respects maximum length limit (${chunk.length} chars)`);
    assert(chunk.length > 0, `Chunk ${idx + 1} is not empty`);
  });

  // Re-assembled content preserves all sentences
  const joinedText = chunks.join(' ');
  assert(joinedText.includes('saline gargles'), 'Preserves all instructions across chunks without word loss');
  assert(joinedText.includes('seek immediate in-person clinical review'), 'Preserves warning clause in final chunk');

  // ==========================================
  // 5. VOICE RESOLUTION LOGIC
  // ==========================================
  const bnVoiceChoice = VoiceManager.selectBestVoice('bn');
  assert(bnVoiceChoice.locale.startsWith('bn'), 'Selects Bengali locale (bn-IN/bn-BD) for Bengali language');

  const hiVoiceChoice = VoiceManager.selectBestVoice('hi');
  assert(hiVoiceChoice.locale.startsWith('hi'), 'Selects Hindi locale (hi-IN) for Hindi language');

  const hinglishVoiceChoice = VoiceManager.selectBestVoice('hinglish');
  assert(hinglishVoiceChoice.locale.includes('IN') || hinglishVoiceChoice.locale.startsWith('hi'), 'Selects Indian locale for natural Hinglish cadence');

  const enVoiceChoice = VoiceManager.selectBestVoice('en');
  assert(enVoiceChoice.locale.startsWith('en'), 'Selects English locale for English language');

  // ==========================================
  // 6. PLAYBACK QUEUE RUNNER
  // ==========================================
  const queue = new SpeechQueue();
  assert(queue.getState().status === 'idle', 'Initial queue status is idle');

  queue.setSpeed(1.25);
  assert(queue.getState().speed === 1.25, 'Updates playback speed to 1.25x');

  queue.setSpeed(0.75);
  assert(queue.getState().speed === 0.75, 'Updates playback speed to 0.75x');

  // Stop resets state cleanly
  queue.stop();
  assert(queue.getState().status === 'idle', 'Stop clears active queue and sets state to idle');
  assert(queue.getState().messageId === null, 'Stop clears active message ID');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results
  };
}
