import React from 'react';
import { RoutePath } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { MedicalLogo } from '../common/MedicalLogo';

interface AuthHeaderProps {
  currentMode: 'login' | 'signup' | 'forgot' | 'reset' | 'verify';
  onNavigate: (route: RoutePath) => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ currentMode, onNavigate }) => {
  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
      {/* Brand Zone */}
      <button
        onClick={() => onNavigate('/')}
        className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded cursor-pointer"
        aria-label="Medical AI home"
      >
        <MedicalLogo size="sm" layout="compact" />
      </button>

      {/* Contextual Action Link */}
      <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        {currentMode === 'login' && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Don't have an account?</span>
            <button
              onClick={() => onNavigate('/signup')}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
            >
              Sign up
            </button>
          </div>
        )}

        {currentMode === 'signup' && (
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Already have an account?</span>
            <button
              onClick={() => onNavigate('/signin')}
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
            >
              Sign in
            </button>
          </div>
        )}

        {(currentMode === 'forgot' || currentMode === 'reset' || currentMode === 'verify') && (
          <button
            onClick={() => onNavigate('/signin')}
            className="flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </button>
        )}
      </div>
    </header>
  );
};
