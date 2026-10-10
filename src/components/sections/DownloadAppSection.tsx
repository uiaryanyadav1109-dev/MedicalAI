import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  Smartphone,
  Download,
  QrCode as QrIcon,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  MapPin,
  FileText,
  ExternalLink,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { APK_DOWNLOAD_URL, EXPO_GO_URL, EXPO_BUILD_PAGE_URL } from '../interactive/DownloadAppModal';

interface DownloadAppSectionProps {
  onOpenDownloadModal?: () => void;
}

export const DownloadAppSection: React.FC<DownloadAppSectionProps> = ({
  onOpenDownloadModal
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'expogo' | 'apk'>('expogo');
  const [apkUrl, setApkUrl] = useState(APK_DOWNLOAD_URL);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const host = isLocalhost ? '10.149.6.231:3000' : window.location.host;
      const protocol = window.location.protocol;
      setApkUrl(`${protocol}//${host}/downloads/MedicalAI-v1.0.0.apk`);
    }
  }, []);

  const currentQrValue = mode === 'expogo' ? EXPO_GO_URL : apkUrl;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentQrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // safe fallback
    }
  };

  return (
    <section id="download-app" className="py-20 lg:py-24 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Native Android Application · Available Now</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white text-balance">
              Download Our App for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                Instant Emergency & Clinical Care
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Carry full preliminary triage intelligence, offline medical card credentials, and 1-tap SOS anywhere. Scan the QR code with your phone or download the standalone Android APK directly.
            </p>

            {/* Mobile Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-left">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">1-Tap Emergency SOS</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Instant hardware bypass & direct calling to 112 / 108.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">GPS Hospital Locator</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time distance, casualty calling, and live maps directions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">Offline Digital Patient ID</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Scannable emergency health records without internet connectivity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Preliminary Triage</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Red-flag symptom analysis & structured doctor handoff summaries.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <a
                href={APK_DOWNLOAD_URL}
                download="MedicalAI-v1.0.0.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-white hover:bg-slate-100 active:bg-slate-200 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <Download className="w-5 h-5 text-blue-600 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Android APK</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md ml-1">
                  .apk
                </span>
              </a>

              {onOpenDownloadModal && (
                <button
                  onClick={onOpenDownloadModal}
                  className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrIcon className="w-4 h-4 text-blue-400" />
                  <span>View QR & Instructions</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copy direct download link"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-xs">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span className="text-xs">Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Standalone APK
              </span>
              <span>•</span>
              <span>Android 8.0 or Higher</span>
              <span>•</span>
              <span>Version 1.0.0 (Build 1)</span>
              <span>•</span>
              <span>100% Free & No Ads</span>
            </div>
          </div>

          {/* Right Column: Live Interactive QR Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center space-y-4">
              
              {/* Mode Toggle Tabs */}
              <div className="flex rounded-xl p-1 bg-white/10 border border-white/15">
                <button
                  onClick={() => setMode('expogo')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'expogo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🚀 Instant Run (Expo Go)
                </button>
                <button
                  onClick={() => setMode('apk')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'apk'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  📦 Standalone APK
                </button>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                  <Radio className="w-3 h-3 animate-pulse" />
                  {mode === 'expogo' ? 'Scan with Expo Go App' : 'Scan to Download APK'}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {mode === 'expogo' ? 'Launch on Mobile Instantly' : 'Download Standalone APK'}
                </h3>
                <p className="text-xs text-slate-300">
                  {mode === 'expogo'
                    ? 'Open the free Expo Go app on your phone and scan this QR code to run immediately.'
                    : "Scan with your phone's camera to download the Android APK file."}
                </p>
              </div>

              {/* The QR Code Container */}
              <div className="p-4 bg-white rounded-2xl shadow-xl inline-block mx-auto border-2 border-slate-100">
                <QRCode
                  value={currentQrValue}
                  size={190}
                  level="M"
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>

              {/* Action Buttons under QR */}
              <div className="space-y-2 pt-1">
                {mode === 'expogo' ? (
                  <a
                    href={EXPO_GO_URL}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Launch in Expo Go</span>
                  </a>
                ) : (
                  <a
                    href={APK_DOWNLOAD_URL}
                    download="MedicalAI-v1.0.0.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Direct Download APK</span>
                  </a>
                )}

                <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-300">
                  <button
                    onClick={handleCopyLink}
                    className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Link Copied' : 'Copy APK Link'}</span>
                  </button>

                  <a
                    href={EXPO_BUILD_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>EAS Cloud Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
