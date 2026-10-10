import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  X,
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Info,
  Radio,
  FileCheck2
} from 'lucide-react';
import { useLanguage } from '../../i18n';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APK_DOWNLOAD_URL = '/downloads/MedicalAI-v1.0.0.apk';
export const EXPO_GO_URL = 'exp://10.149.6.231:8081';
export const EXPO_BUILD_PAGE_URL =
  'https://expo.dev/accounts/aryan_yadav-dev/projects/medical-ai';

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [mode, setMode] = useState<'expogo' | 'apk'>('expogo');
  const [apkDownloadUrl, setApkDownloadUrl] = useState(APK_DOWNLOAD_URL);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const host = isLocalhost ? '10.149.6.231:3000' : window.location.host;
      const protocol = window.location.protocol;
      setApkDownloadUrl(`${protocol}//${host}/downloads/MedicalAI-v1.0.0.apk`);
    }
  }, []);

  const currentQrValue = mode === 'expogo' ? EXPO_GO_URL : apkDownloadUrl;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentQrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 transition-all my-8">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
              <Smartphone className="w-6 h-6" />
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Android APK v1.0.0 Ready
            </div>
          </div>

          <h2 id="download-modal-title" className="text-2xl font-black tracking-tight text-white">
            Download Medical AI for Android
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Access 1-tap Emergency SOS, GPS hospital locator, and clinical triage directly from your pocket.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('expogo')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'expogo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              🚀 Instant Run (Expo Go)
            </button>
            <button
              onClick={() => setMode('apk')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'apk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              📦 Standalone APK
            </button>
          </div>

          {/* Main QR Code & Quick Scan */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            {/* High Contrast QR Code Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/80 shrink-0">
              <QRCode
                value={currentQrValue}
                size={144}
                level="M"
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                {mode === 'expogo' ? 'Scan with Expo Go' : 'Scan to Install'}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {mode === 'expogo' ? 'Open Directly in Expo Go' : 'Scan with your Phone Camera'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {mode === 'expogo' ? (
                  <>
                    Open the free <span className="font-semibold text-slate-800 dark:text-slate-100">Expo Go</span> app on your Android phone and scan this code to run Medical AI instantly over Wi-Fi.
                  </>
                ) : (
                  <>
                    Point your camera at this QR code to download the standalone <span className="font-semibold text-slate-800 dark:text-slate-100">.apk</span> package.
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[11px] font-medium">
                  {mode === 'expogo' ? 'Instant Launch' : 'Direct Download'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                  Wi-Fi Connected
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-[11px] font-medium">
                  Android 8.0+
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mode === 'expogo' ? (
              <a
                href={EXPO_GO_URL}
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <Smartphone className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Launch in Expo Go</span>
              </a>
            ) : (
              <a
                href={APK_DOWNLOAD_URL}
                download="MedicalAI-v1.0.0.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Download Android APK</span>
              </a>
            )}

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Download Link</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary link to Expo build dashboard */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Hosted on Expo Application Services (EAS Cloud)</span>
            </div>
            <a
              href={EXPO_BUILD_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              <span>Build Info</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Collapsible Installation Guide */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                How to install an APK on Android (3 simple steps)
              </span>
              <span className="text-slate-400 font-normal">
                {showInstructions ? 'Hide' : 'Show'}
              </span>
            </button>

            {showInstructions && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Tap Download:</strong> The <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">.apk</code> file will download directly to your Android device.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Confirm Prompt:</strong> If your browser shows <em>"File might be harmful"</em>, tap <strong>"Download anyway"</strong> (standard Android notice for apps outside Google Play).
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Tap Install:</strong> Open the downloaded file from your Notifications or Downloads folder and tap <strong>Install</strong>. If prompted, toggle on <em>"Allow from this source"</em>.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Standalone APK • 100% Free & Ad-Free</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
