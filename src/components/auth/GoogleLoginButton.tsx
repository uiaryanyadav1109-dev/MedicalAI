/**
 * Medical AI — Official Google Sign-In Button Component
 *
 * Adheres strictly to Google Identity branding guidelines:
 * - White background (#FFFFFF)
 * - Subtle light-gray border (#DADCE0 / slate-300) with rounded corners
 * - Official Google multicolor 'G' vector logo
 * - Text: 'Continue with Google' in Roboto / system font
 * - Full accessibility: screen-reader labeling, keyboard navigation, focus rings
 * - Comprehensive state handling: default, hover, active, loading, and disabled
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface GoogleLoginButtonProps {
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
  roleContext?: 'patient' | 'doctor';
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  text = 'Continue with Google',
  className = '',
  roleContext = 'patient'
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`${text} for ${roleContext === 'doctor' ? 'Clinician Portal' : 'Patient Portal'}`}
      aria-busy={isLoading}
      className={`w-full py-2.5 sm:py-3 px-4 bg-white hover:bg-slate-50/90 active:bg-slate-100 disabled:bg-slate-50 disabled:opacity-70 border border-slate-300 hover:border-slate-400 focus:border-blue-500 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-150 flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed select-none ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-800">Connecting to Google...</span>
        </>
      ) : (
        <>
          {/* Official Google Multicolor 'G' Logo SVG */}
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-semibold text-slate-800 tracking-tight">{text}</span>
        </>
      )}
    </button>
  );
};
