import React, { useState, useEffect } from 'react';
import { Mic, Volume2, Shield, Radio, CheckCircle, RefreshCw } from 'lucide-react';

export const VoiceWaveformPreview: React.FC = () => {
  const [voiceState, setVoiceState] = useState<'listening' | 'processing' | 'responding'>('listening');
  const [consentGranted, setConsentGranted] = useState(true);

  // Cycle states if demo is active
  useEffect(() => {
    const timer = setInterval(() => {
      setVoiceState((prev) => {
        if (prev === 'listening') return 'processing';
        if (prev === 'processing') return 'responding';
        return 'listening';
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const transcriptions = {
    listening: {
      patient: '"I started having this tightness in my upper back after carrying heavy boxes yesterday..."',
      system: 'Acoustic stream active · Clarifying mechanical vs visceral characteristics'
    },
    processing: {
      patient: '"...it hurts mostly when I twist, not when I take a deep breath."',
      system: 'Parsing anatomical location: Musculoskeletal thoracic vs pleuritic markers'
    },
    responding: {
      patient: '[Synthesized audio playback active]',
      system: '"Understood. Since the discomfort is reproduced by twisting rather than breathing, this often points toward thoracic muscular strain. Has there been any numbness?"'
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">Multimodal Acoustic Engine</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] font-mono text-slate-400">Consent-Gated Interface</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Live Voice Protocol Demo</span>
        </div>
      </div>

      <div className="p-6">
        {/* Status Indicator Bar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                voiceState === 'listening'
                  ? 'bg-rose-500 animate-pulse'
                  : voiceState === 'processing'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">
              State: {voiceState}
            </span>
          </div>

          {/* Interactive State Override Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg text-xs">
            {(['listening', 'processing', 'responding'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setVoiceState(s)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  voiceState === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Waveform Display */}
        <div className="bg-slate-950/70 rounded-lg p-6 border border-slate-800 flex flex-col items-center justify-center my-4">
          <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md">
            {[24, 45, 78, 30, 95, 60, 40, 85, 32, 110, 70, 50, 90, 42, 68, 88, 35, 72, 54, 98, 40, 60, 30, 45].map(
              (height, i) => {
                const isAnimated = voiceState !== 'processing';
                const computedHeight =
                  voiceState === 'listening'
                    ? (height * 0.75 + (i % 3) * 8)
                    : voiceState === 'responding'
                    ? (height * 0.9)
                    : 12; // minimal line during processing
                return (
                  <div
                    key={i}
                    style={{ height: `${computedHeight}%` }}
                    className={`w-1 rounded-full transition-all duration-300 ${
                      voiceState === 'listening'
                        ? 'bg-gradient-to-t from-blue-600 to-sky-400'
                        : voiceState === 'processing'
                        ? 'bg-slate-700'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                    }`}
                  />
                );
              }
            )}
          </div>

          <div className="mt-4 text-xs font-mono text-slate-400 flex items-center gap-2">
            {voiceState === 'listening' && <Mic className="w-3.5 h-3.5 text-sky-400 animate-pulse" />}
            {voiceState === 'processing' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
            {voiceState === 'responding' && <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{transcriptions[voiceState].system}</span>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/80 space-y-2 text-xs">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            Acoustic Clinical Intake Stream
          </div>
          <p className="text-slate-200 leading-relaxed font-sans">
            {transcriptions[voiceState].patient}
          </p>
        </div>

        {/* Legal Consent Notice */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2 text-slate-400 text-xs">
          <Shield className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Voice features require explicit microphone permissions and informed user consent. Audio processing operates solely on validated session audio and is never retained for commercial resale.
          </span>
        </div>
      </div>
    </div>
  );
};
