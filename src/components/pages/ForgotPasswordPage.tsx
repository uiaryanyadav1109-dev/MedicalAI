import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import { authService, isValidEmail } from '../../services/authService';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      setIsSubmitted(true);
    } catch {
      setError("We couldn't connect to Medical AI. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] dark:bg-[#0B1320] text-[#243447] dark:text-slate-100 font-sans transition-colors">
      <AuthHeader currentMode="forgot" onNavigate={onNavigate} />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white dark:bg-[#111D30] p-6 sm:p-8 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xl space-y-6">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] dark:text-white">
                  Check your email
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed text-pretty">
                  We've sent password reset instructions if an account exists for{' '}
                  <span className="font-semibold font-mono text-[#102A43] dark:text-white">{email}</span>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-[#0B1320] rounded-xl border border-[#DCE6EF] dark:border-[#1E2E47] text-xs text-[#64748B] dark:text-slate-400 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Notice:</strong> To prevent account enumeration, we do not reveal whether an email address is registered in our records.
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('/reset-password')}
                  className="w-full py-2.5 px-4 bg-[#1769AA] hover:bg-[#102A43] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Proceed to Reset Screen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#243447] dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  Enter the email associated with your Medical AI account and we'll help you reset your password.
                </p>
              </div>

              {error && (
                <div
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="forgot-email"
                    className="block text-xs font-bold text-[#243447] dark:text-slate-200"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      disabled={isLoading}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-3.5 py-3 bg-white dark:bg-[#0B1320] border border-[#DCE6EF] dark:border-[#1E2E47] rounded-xl text-xs sm:text-sm text-[#243447] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1769AA] focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] disabled:bg-blue-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending reset instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('/signin')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1769AA] dark:text-[#38BDF8] hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <AuthFooter onNavigate={onNavigate} />
    </div>
  );
};

export default ForgotPasswordPage;
