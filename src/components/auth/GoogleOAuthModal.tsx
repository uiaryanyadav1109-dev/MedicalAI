import React from 'react';
import { X, ShieldCheck, ExternalLink, Key } from 'lucide-react';

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="oauth-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h3 id="oauth-modal-title" className="text-base font-bold text-slate-900">
              Google OAuth Architecture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            In production deployments, the <strong>"Continue with Google"</strong> action initiates a federated client-side OAuth 2.0 handshake using Google Identity Services.
          </p>
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-blue-950">
            <span className="font-semibold block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Integration Specification
            </span>
            <p className="text-[11px] text-blue-900">
              To activate Google OAuth in your cloud instance, configure your OAuth Client ID in your Google Cloud Console and register authorized JavaScript origins.
            </p>
          </div>
          <p>
            For this interactive public preview, please utilize the direct email and password form.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
