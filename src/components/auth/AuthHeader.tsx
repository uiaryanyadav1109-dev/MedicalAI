import React from 'react';
import { RoutePath } from '../../types';
import { Activity, ArrowLeft } from 'lucide-react';

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
        className="flex items-center gap-2 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded cursor-pointer"
        aria-label="Medical AI home"
      >
        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs group-hover:bg-blue-700 transition-colors">
          <Activity className="w-4 h-4 text-white" />
        </span>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          MEDICAL AI
        </span>
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
