import React, { useState } from 'react';
import { QrCode, ShieldCheck, Clock, Key, Ban, Check, ArrowRight } from 'lucide-react';

export const QrSharePreview: React.FC = () => {
  const [expiry, setExpiry] = useState<'15m' | '1h' | '24h' | '7d'>('1h');
  const [revoked, setRevoked] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const mockToken = "tok_sec_993bf204e17a4128";

  const handleRevoke = () => {
    setRevoked(!revoked);
  };

  const handleCopyToken = () => {
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">Ephemeral Token Sharing</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-slate-500">Zero-Payload Architecture</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Security Architecture Preview</span>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: QR Display */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="relative p-3 bg-white rounded-lg shadow-xs border border-slate-200">
            {/* SVG Stylized QR with center shield */}
            <svg
              className={`w-36 h-36 ${revoked ? 'opacity-25 grayscale' : ''}`}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="#0F172A" rx="2" />
              <rect x="9" y="9" width="17" height="17" fill="white" rx="1" />
              <rect x="13" y="13" width="9" height="9" fill="#2563EB" rx="1" />

              <rect x="70" y="5" width="25" height="25" fill="#0F172A" rx="2" />
              <rect x="74" y="9" width="17" height="17" fill="white" rx="1" />
              <rect x="78" y="13" width="9" height="9" fill="#2563EB" rx="1" />

              <rect x="5" y="70" width="25" height="25" fill="#0F172A" rx="2" />
              <rect x="9" y="74" width="17" height="17" fill="white" rx="1" />
              <rect x="13" y="78" width="9" height="9" fill="#2563EB" rx="1" />

              {/* Data modules */}
              <rect x="35" y="10" width="6" height="6" fill="#334155" />
              <rect x="45" y="10" width="6" height="6" fill="#334155" />
              <rect x="55" y="10" width="6" height="6" fill="#334155" />

              <rect x="35" y="22" width="6" height="6" fill="#334155" />
              <rect x="55" y="22" width="6" height="6" fill="#334155" />

              <rect x="10" y="35" width="6" height="6" fill="#334155" />
              <rect x="22" y="35" width="6" height="6" fill="#334155" />
              <rect x="35" y="35" width="6" height="6" fill="#334155" />
              <rect x="75" y="35" width="6" height="6" fill="#334155" />

              <rect x="10" y="50" width="6" height="6" fill="#334155" />
              <rect x="45" y="45" width="10" height="10" fill="#2563EB" rx="2" />
              <rect x="85" y="50" width="6" height="6" fill="#334155" />

              <rect x="35" y="65" width="6" height="6" fill="#334155" />
              <rect x="50" y="65" width="6" height="6" fill="#334155" />
              <rect x="65" y="65" width="6" height="6" fill="#334155" />

              <rect x="35" y="80" width="6" height="6" fill="#334155" />
              <rect x="50" y="80" width="6" height="6" fill="#334155" />
              <rect x="70" y="80" width="6" height="6" fill="#334155" />
              <rect x="85" y="80" width="6" height="6" fill="#334155" />
            </svg>

            {revoked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-lg text-rose-400 text-xs font-bold">
                <Ban className="w-6 h-6 mb-1 text-rose-400" />
                REVOKED
              </div>
            )}
          </div>

          <div className="mt-3 text-xs">
            <span className="font-mono text-[10px] text-slate-500 block">Cryptographic Hash</span>
            <span className="font-mono text-slate-700 text-[11px] font-semibold">{mockToken}</span>
          </div>

          <div className="mt-2 text-[10px] text-slate-500">
            {revoked ? 'Token is disabled' : `Expires in ${expiry === '15m' ? '15 minutes' : expiry === '1h' ? '1 hour' : expiry === '24h' ? '24 hours' : '7 days'}`}
          </div>
        </div>

        {/* Right: Security Settings & Architecture */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Token Expiration Window
            </div>
            <div className="flex gap-2 mt-2">
              {(['15m', '1h', '24h', '7d'] as const).map((t) => (
                <button
                  key={t}
                  disabled={revoked}
                  onClick={() => setExpiry(t)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${
                    expiry === t && !revoked
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Medical Payload Rule</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              The QR code never stores medical data or patient identifiers. It solely holds a short-lived bearer token that points to a specific authorized record bundle.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleRevoke}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                revoked
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              {revoked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
              <span>{revoked ? 'Reactivate Token' : 'Revoke Access Immediately'}</span>
            </button>
            <button
              onClick={handleCopyToken}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition-colors flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>{tokenCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
