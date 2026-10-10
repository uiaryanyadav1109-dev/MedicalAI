import React, { useState, useEffect } from 'react';
import { generateQrDataUrl } from '../../utils/qrCodeGenerator';
import { Download, Copy, Check, ShieldCheck, RefreshCw } from 'lucide-react';

interface RealQrCodeProps {
  value: string;
  size?: number;
  label?: string;
  sublabel?: string;
  showActions?: boolean;
  downloadFilename?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  isRevoked?: boolean;
}

export const RealQrCode: React.FC<RealQrCodeProps> = ({
  value,
  size = 220,
  label,
  sublabel,
  showActions = true,
  downloadFilename = 'medical-ai-patient-qr.png',
  onRegenerate,
  isRegenerating = false,
  isRevoked = false
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isRevoked) {
      setQrDataUrl(null);
      return;
    }

    generateQrDataUrl(value, {
      width: size * 2, // 2x density for crisp scanning
      margin: 2,
      darkColor: '#0f172a',
      lightColor: '#ffffff'
    })
      .then((dataUrl) => {
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to generate machine-readable QR code.');
          console.error(err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, isRevoked]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block">
        {isRevoked ? (
          <div
            style={{ width: size, height: size }}
            className="flex flex-col items-center justify-center bg-rose-50 rounded-xl text-rose-700 p-4 border border-rose-200"
          >
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-rose-800">
              Access Revoked
            </span>
            <span className="text-[11px] text-rose-600 mt-1">
              This QR code token has been invalidated.
            </span>
          </div>
        ) : error ? (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-100 text-rose-600 text-xs p-4 rounded-xl"
          >
            {error}
          </div>
        ) : qrDataUrl ? (
          <div className="relative group">
            <img
              src={qrDataUrl}
              alt="Machine-Readable Medical AI Patient QR Code"
              style={{ width: size, height: size }}
              className="rounded-xl block"
            />
            {/* Subtle center security badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-white/95 border border-slate-200 shadow-xs flex items-center justify-center text-blue-700">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-50 text-slate-400 text-xs rounded-xl"
          >
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {(label || sublabel) && (
        <div className="mt-3 space-y-0.5">
          {label && <p className="text-xs font-semibold text-slate-800">{label}</p>}
          {sublabel && <p className="text-[11px] text-slate-500 max-w-xs">{sublabel}</p>}
        </div>
      )}

      {showActions && !isRevoked && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Download high-resolution QR image for printing or saving"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download QR</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            title="Copy authorized access URL to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Revoke existing token and generate a fresh secure link"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
