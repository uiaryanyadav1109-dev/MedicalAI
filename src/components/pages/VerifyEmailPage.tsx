import React, { useState, useEffect } from 'react';
import { RoutePath } from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import { authService } from '../../services/authService';
import { MailCheck, ArrowLeft, RotateCw, CheckCircle2 } from 'lucide-react';

interface VerifyEmailPageProps {
  email?: string;
  onNavigate: (route: RoutePath) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  email = 'alex@example.com',
  onNavigate
}) => {
  const [cooldown, setCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const response = await authService.resendVerification(email);
      setResendMessage(response.message || 'A fresh verification link has been sent to your inbox.');
      setCooldown(60);
    } catch {
      setResendMessage('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] dark:bg-[#0B1320] text-[#243447] dark:text-slate-100 font-sans transition-colors">
      <AuthHeader currentMode="verify" onNavigate={onNavigate} />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white dark:bg-[#111D30] p-6 sm:p-8 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center mx-auto shadow-inner">
            <MailCheck className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
              Verify your email
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed text-pretty">
              Check your inbox for a verification link sent to{' '}
              <span className="font-semibold font-mono text-[#102A43] dark:text-white">{email}</span>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#0B1320] rounded-xl border border-[#DCE6EF] dark:border-[#1E2E47] text-xs text-[#64748B] dark:text-slate-400 text-left space-y-1">
            <span className="font-bold text-[#102A43] dark:text-slate-200 block">Next Steps:</span>
            <p className="leading-relaxed">
              1. Open the verification link in your inbox to confirm your account.<br />
              2. If you don't see the email within 2 minutes, check your spam or promotional folders.
            </p>
          </div>

          {resendMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={cooldown > 0 || isResending}
              onClick={handleResend}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-[#243447] dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>
                {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend email'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/signin')}
              className="w-full py-2.5 px-4 bg-[#1769AA] hover:bg-[#102A43] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </button>
          </div>
        </div>
      </main>

      <AuthFooter onNavigate={onNavigate} />
    </div>
  );
};

export default VerifyEmailPage;
