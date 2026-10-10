import React, { useState } from 'react';
import { Globe, Check, MessageSquare } from 'lucide-react';

interface LanguageSample {
  code: string;
  name: string;
  nativeName: string;
  patientPrompt: string;
  aiResponse: string;
  triageSummary: string;
}

const LANGUAGES: LanguageSample[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    patientPrompt: "I've had a persistent dry cough for the last 5 days, mostly worse at night.",
    aiResponse: "Understood. Has this cough been accompanied by fever, chest tightness, or shortness of breath when walking?",
    triageSummary: "Chief concern: Nocturnal dry cough (5 days). Systemic red flags: Absent."
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    patientPrompt: "मुझे पिछले ५ दिनों से लगातार सूखी खांसी आ रही है, जो रात में ज्यादा बढ़ जाती है।",
    aiResponse: "समझ गया। क्या इस खांसी के साथ आपको बुखार, सीने में भारीपन या चलने पर सांस फूलने की समस्या भी हो रही है?",
    triageSummary: "मुख्य समस्या: रात की सूखी खांसी (५ दिन)। आपातकालीन लक्षण: अनुपस्थित।"
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    patientPrompt: "গত ৫ দিন ধরে আমার একটানা শুকনো কাশি হচ্ছে, বিশেষ করে রাতের বেলায় বেশি বাড়ে।",
    aiResponse: "বুঝেছি। এই কাশির সাথে কি জ্বর, বুকে চাপ বা হাঁটার সময় শ্বাসকষ্টের সমস্যা হচ্ছে?",
    triageSummary: "প্রধান উপসর্গ: নিশাচর শুকনো কাশি (৫ দিন)। জরুরি সতর্কবার্তা: অনুপস্থিত।"
  },
  {
    code: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish',
    patientPrompt: "Mujhe last 5 days se continuous dry cough ho rahi hai, specially raat ko badh jati hai.",
    aiResponse: "Got it. Kya is cough ke saath aapko fever, chest tightness ya walk karte waqt shortness of breath mehsoos ho rahi hai?",
    triageSummary: "Chief concern: Nocturnal dry cough (5 days). High-risk red flags: Absent."
  }
];

export const MultilingualSelector: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageSample>(LANGUAGES[0]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-xs text-slate-800">Multilingual Clinical Understanding</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-slate-500">Cross-Linguistic Intake</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Natural Language Simulation</span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Language switcher tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{lang.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  ({lang.nativeName})
                </span>
              </button>
            );
          })}
        </div>

        {/* Conversation comparison */}
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-mono text-[10px] text-slate-400 uppercase">
              Patient Expression ({selectedLang.name})
            </div>
            <p className="text-slate-900 font-medium text-sm leading-relaxed">
              "{selectedLang.patientPrompt}"
            </p>
          </div>

          <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1">
            <div className="font-mono text-[10px] text-blue-700 uppercase font-semibold">
              Context-Aware Clinical Clarification ({selectedLang.name})
            </div>
            <p className="text-slate-800 leading-relaxed text-sm">
              {selectedLang.aiResponse}
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="font-mono text-[10px] text-slate-400 uppercase mb-0.5">
              Standardized Clinical Extraction (Universal Schema)
            </div>
            <p className="font-mono text-slate-700 text-xs">{selectedLang.triageSummary}</p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
          Multilingual processing aims to reduce cultural and linguistic barriers in healthcare intake. Translation algorithms assist articulation but do not guarantee clinical infallibility.
        </div>
      </div>
    </div>
  );
};
