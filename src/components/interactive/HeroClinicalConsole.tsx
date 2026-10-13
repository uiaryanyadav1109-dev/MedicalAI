import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface HeroClinicalConsoleProps {
  onOpenAssessment?: () => void;
  onNavigate?: (route: string) => void;
}

type ConsoleTab = 'telemetry' | 'triage' | 'handoff';
type PresetState = 'stable' | 'exertion' | 'elevated';

export const HeroClinicalConsole: React.FC<HeroClinicalConsoleProps> = ({
  onOpenAssessment,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('telemetry');
  const [preset, setPreset] = useState<PresetState>('stable');
  const [copiedHandoff, setCopiedHandoff] = useState(false);
  const [ecgOffset, setEcgOffset] = useState(0);

  // Subtle ECG animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setEcgOffset((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Presets mapping
  const currentData = {
    stable: {
      hr: 74,
      bp: '118/76',
      spo2: 99,
      resp: 16,
      temp: '98.4°F',
      rhythm: 'Normal Sinus Rhythm',
      tier: 'Tier 4 · Routine Care',
      tierColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-500/30',
      concern: 'Mild bilateral tension headache',
      chronology: '48h duration · Gradual onset',
      redFlags: '0 Detected (Negative for FAST signs)',
      recommendation: 'Non-urgent outpatient evaluation; rest and hydration.'
    },
    exertion: {
      hr: 92,
      bp: '128/82',
      spo2: 98,
      resp: 19,
      temp: '98.8°F',
      rhythm: 'Sinus Tachycardia (Mild)',
      tier: 'Tier 3 · Prompt Evaluation',
      tierColor: 'text-cyan-400 bg-cyan-950/50 border-cyan-500/30',
      concern: 'Screen fatigue with cervical neck stiffness',
      chronology: '3 days duration · Intermittent',
      redFlags: '0 Detected (Afebrile, no neurological signs)',
      recommendation: 'Schedule primary care evaluation within 48-72h.'
    },
    elevated: {
      hr: 106,
      bp: '138/88',
      spo2: 97,
      resp: 22,
      temp: '99.2°F',
      rhythm: 'Sinus Tachycardia',
      tier: 'Tier 2 · Urgent Evaluation',
      tierColor: 'text-amber-400 bg-amber-950/50 border-amber-500/30',
      concern: 'Throbbing hemicranial migraine with photophobia',
      chronology: '12h duration · Moderate severity (7/10)',
      redFlags: '1 Alert (Persistent nausea; acute pain)',
      recommendation: 'Prompt urgent care consultation recommended.'
    }
  }[preset];

  const handleCopySbar = () => {
    const sbarText = `[SBAR PRE-ENCOUNTER BRIEF]
S (Situation): 28yo male presenting with ${currentData.concern}.
B (Background): Normal baseline history; known Penicillin allergy.
A (Assessment): Preliminary ${currentData.tier}. Vitals: HR ${currentData.hr} bpm, BP ${currentData.bp}, SpO2 ${currentData.spo2}%.
R (Recommendation): ${currentData.recommendation}`;
    navigator.clipboard.writeText(sbarText);
    setCopiedHandoff(true);
    setTimeout(() => setCopiedHandoff(false), 2500);
  };

  return (
    <div className="relative mx-auto max-w-md lg:max-w-none w-full">
      {/* Outer Glow Halo */}
      <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-blue-600/30 via-teal-500/20 to-blue-700/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Main Clinical Console Container */}
      <div className="rounded-3xl bg-[#09111E] border border-[#1E2E47] shadow-2xl overflow-hidden font-sans text-slate-200">
        {/* Top Hardware Telemetry Status Strip */}
        <div className="px-4 sm:px-5 py-3 bg-[#0D1829] border-b border-[#1E2E47] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 tracking-wider uppercase font-semibold">
              <span>LIVE AMBULATORY STREAM</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">LEAD II</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/70 text-blue-300 border border-blue-800/60 font-semibold">
              PATIENT: MAI-80429
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500">
              TLS 1.3
            </span>
          </div>
        </div>

        {/* Tab Switcher: Telemetry vs Triage vs SBAR */}
        <div className="px-4 sm:px-5 pt-3 pb-2 bg-[#09111E] flex items-center justify-between gap-2 border-b border-[#16233B]">
          <div className="flex items-center gap-1.5 p-1 bg-[#0E1B2E] rounded-xl border border-[#1E2E47] text-xs">
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('triage')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'triage'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('handoff')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'handoff'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SBAR Handoff</span>
            </button>
          </div>

          {/* Interactive Simulation Preset Trigger */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span className="hidden sm:inline text-slate-500">Preset:</span>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as PresetState)}
              className="bg-[#0E1B2E] text-slate-200 border border-[#1E2E47] rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="stable">Stable (74 bpm)</option>
              <option value="exertion">Exertion (92 bpm)</option>
              <option value="elevated">Acute (106 bpm)</option>
            </select>
          </div>
        </div>

        {/* Console Body Depending on Active Tab */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* TAB 1: LIVE TELEMETRY & ECG MONITOR */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              {/* Animated ECG Grid Canvas / SVG */}
              <div className="relative rounded-2xl bg-[#060D17] border border-[#1A2C47] p-3 overflow-hidden shadow-inner">
                {/* Millimeter Telemetry Grid Overlay */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #00FF88 1px, transparent 1px), linear-gradient(to bottom, #00FF88 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1 z-10 relative">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">LEAD II · 25 mm/s · 10 mm/mV</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-300 font-semibold">{currentData.rhythm}</span>
                  </div>
                  <span className="text-slate-400">Gain: 1.0x</span>
                </div>

                {/* Animated ECG Waveform Vector */}
                <div className="h-20 w-full relative overflow-hidden flex items-center">
                  <svg
                    viewBox="0 0 600 80"
                    className="w-full h-full text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0 40 L 40 40 L 48 38 L 52 42 L 56 40 L 70 40 L 74 34 L 80 58 L 86 10 L 92 68 L 98 38 L 104 40 L 130 40 L 140 32 L 150 40 L 180 40 L 220 40 L 228 38 L 232 42 L 236 40 L 250 40 L 254 34 L 260 58 L 266 10 L 272 68 L 278 38 L 284 40 L 310 40 L 320 32 L 330 40 L 360 40 L 400 40 L 408 38 L 412 42 L 416 40 L 430 40 L 434 34 L 440 58 L 446 10 L 452 68 L 458 38 L 464 40 L 490 40 L 500 32 L 510 40 L 540 40 L 580 40 L 588 38 L 600 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* Glowing Sweep Bar */}
                  <div
                    className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent to-[#060D17] pointer-events-none transition-all duration-75"
                    style={{ left: `${(ecgOffset * 6) % 520}px` }}
                  />
                </div>
              </div>

              {/* Digital Telemetry Vitals Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-[#0D1829] border border-[#1E2E47] text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>HEART RATE</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                    {currentData.hr} <span className="text-xs font-normal text-slate-400">bpm</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">NORMAL SINUS</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0D1829] border border-[#1E2E47] text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>OXYGEN (SpO2)</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                    {currentData.spo2}<span className="text-xs font-normal text-slate-400">%</span>
                  </div>
                  <div className="text-[10px] text-cyan-300 font-mono">PLETH STABLE</div>
                </div>

                <div className="p-3 rounded-2xl bg-[#0D1829] border border-[#1E2E47] text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                    <span>NIBP (mmHg)</span>
                  </div>
                  <div className="text-lg sm:text-xl font-black text-blue-300 font-mono">
                    {currentData.bp}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">MAP: 90 mmHg</div>
                </div>
              </div>

              {/* Lower Secondary Telemetry Row */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#0B1526] border border-[#1A2C47] flex items-center justify-between">
                  <span className="text-slate-400">RESPIRATORY RATE:</span>
                  <span className="font-bold text-slate-200">{currentData.resp} /min</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0B1526] border border-[#1A2C47] flex items-center justify-between">
                  <span className="text-slate-400">CORE TEMP:</span>
                  <span className="font-bold text-slate-200">{currentData.temp}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI CLINICAL INTELLIGENCE & TRIAGE MATRIX */}
          {activeTab === 'triage' && (
            <div className="space-y-3.5">
              {/* Triage Tier Badge Banner */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${currentData.tierColor}`}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                    Clinical Stratification Matrix
                  </div>
                  <div className="text-base font-bold font-mono mt-0.5">{currentData.tier}</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-semibold">
                  Risk Level: Low-Moderate
                </div>
              </div>

              {/* Chief Concern & Extracted HPI */}
              <div className="p-3.5 rounded-xl bg-[#0D1829] border border-[#1E2E47] space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-[#1E2E47] pb-2">
                  <span className="text-slate-400 font-mono">CHIEF COMPLAINT:</span>
                  <span className="font-bold text-white">{currentData.concern}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#1E2E47] pb-2">
                  <span className="text-slate-400 font-mono">CHRONOLOGY:</span>
                  <span className="font-medium text-slate-200">{currentData.chronology}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono">RED-FLAG SCREENING:</span>
                  <span className="font-semibold text-emerald-400">{currentData.redFlags}</span>
                </div>
              </div>

              {/* Adaptive Clinical Inquiry Engine Preview */}
              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Adaptive Question Reasoning Engine</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  "Patient reports relief with dark room and rest. Tension headache pattern correlated. Zero acute intracranial red-flags present."
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: 1-PAGE SBAR PRE-ENCOUNTER BRIEF */}
          {activeTab === 'handoff' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  Standardized SBAR Synopsis
                </span>
                <button
                  onClick={handleCopySbar}
                  className="px-2.5 py-1 bg-[#14233D] hover:bg-[#1E3357] text-blue-300 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedHandoff ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHandoff ? 'Copied' : 'Copy Brief'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#060D17] border border-[#1A2C47] space-y-2 text-[11px] font-mono">
                <div>
                  <strong className="text-blue-400">S (Situation):</strong> 28yo male presenting with {currentData.concern}.
                </div>
                <div>
                  <strong className="text-teal-400">B (Background):</strong> Penicillin allergy documented. Ambulatory vitals baseline verified.
                </div>
                <div>
                  <strong className="text-purple-400">A (Assessment):</strong> Preliminary {currentData.tier}. Stable resting hemodynamics.
                </div>
                <div>
                  <strong className="text-emerald-400">R (Recommendation):</strong> {currentData.recommendation}
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg text-[10px] text-slate-400 font-mono text-center">
                Pre-encounter structured brief ready for physician EMR review
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Launch Bar */}
        <div className="px-4 sm:px-5 py-3 bg-[#0B1526] border-t border-[#1E2E47] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium text-[11px] hidden sm:inline">
              Deterministic clinical safety active
            </span>
            <span className="text-slate-300 font-medium text-[11px] sm:hidden">
              Safety active
            </span>
          </div>

          <button
            onClick={onOpenAssessment}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Triage Sandbox</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
