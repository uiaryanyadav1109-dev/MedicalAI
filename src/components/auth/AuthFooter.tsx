import React from 'react';
import { RoutePath } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface AuthFooterProps {
  onNavigate: (route: RoutePath) => void;
}

export const AuthFooter: React.FC<AuthFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200/80 px-4 sm:px-8 py-5 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Reassurance text */}
        <div className="flex items-center gap-1.5 text-slate-500 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your health information is protected by secure access controls.</span>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <button
            onClick={() => onNavigate('/privacy')}
            className="hover:text-slate-900 transition-colors focus:outline-none focus-visible:underline"
          >
            Privacy Policy
          </button>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <button
            onClick={() => onNavigate('/terms')}
            className="hover:text-slate-900 transition-colors focus:outline-none focus-visible:underline"
          >
            Terms of Service
          </button>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <button
            onClick={() => onNavigate('/medical-disclaimer')}
            className="hover:text-slate-900 text-amber-700 font-medium transition-colors focus:outline-none focus-visible:underline"
          >
            Medical Disclaimer
          </button>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()} Medical AI</span>
        </div>
      </div>
    </footer>
  );
};
