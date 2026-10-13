import React, { useState, useMemo } from 'react';
import { RoutePath } from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import {
  authService,
  evaluatePasswordCriteria,
  calculatePasswordStrength
} from '../../services/authService';
import { Eye, EyeOff, Lock, Check, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

interface ResetPasswordPageProps {
  onNavigate: (route: RoutePath) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const criteria = useMemo(() => evaluatePasswordCriteria(newPassword), [newPassword]);
  const strength = useMemo(() => calculatePasswordStrength(newPassword), [newPassword]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.password = 'Please enter a new password.';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    }

    if (!confirmNewPassword) {
      newErrors.confirmPassword = 'Confirm your new password.';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      await authService.resetPassword(newPassword);
      setIsSuccess(true);
    } catch {
      setErrors({ password: 'Failed to update password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] dark:bg-[#0B1320] text-[#243447] dark:text-slate-100 font-sans transition-colors">
      <AuthHeader currentMode="reset" onNavigate={onNavigate} />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white dark:bg-[#111D30] p-6 sm:p-8 rounded-2xl border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xl space-y-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-[#102A43] dark:text-white">
                  Password Updated
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
                  Your password has been updated successfully. You can now use your new password to access Medical AI.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/signin')}
                  className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#102A43] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-2xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                  Update your password
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                  Please choose a strong password for your Medical AI account.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* New Password */}
                <div className="space-y-1 text-left">
                  <label
                    htmlFor="reset-password"
                    className="block text-xs font-bold text-[#243447] dark:text-slate-200"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      disabled={isLoading}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-[#0B1320] border rounded-xl text-xs sm:text-sm text-[#243447] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.password
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-[#DCE6EF] dark:border-[#1E2E47] focus:border-[#1769AA] focus:ring-2 focus:ring-blue-600/20'
                      }`}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5 rounded cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      {errors.password}
                    </p>
                  )}

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength</span>
                        <span
                          className={`font-semibold capitalize font-mono text-[10px] ${
                            strength === 'strong'
                              ? 'text-emerald-600'
                              : strength === 'fair'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {strength}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                        <div
                          className={`h-full flex-1 transition-all rounded-full ${
                            strength === 'weak'
                              ? 'bg-rose-500'
                              : strength === 'fair'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 transition-all rounded-full ${
                            strength === 'fair'
                              ? 'bg-amber-500'
                              : strength === 'strong'
                              ? 'bg-emerald-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 transition-all rounded-full ${
                            strength === 'strong' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist */}
                  <div className="pt-2 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-600 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.minLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasUpper ? 'text-emerald-600 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasUpper ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasLower ? 'text-emerald-600 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasLower ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-600 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Number</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1 text-left">
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold text-[#243447] dark:text-slate-200"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      disabled={isLoading}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-[#0B1320] border rounded-xl text-xs sm:text-sm text-[#243447] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.confirmPassword
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-[#DCE6EF] dark:border-[#1E2E47] focus:border-[#1769AA] focus:ring-2 focus:ring-blue-600/20'
                      }`}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5 rounded cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] disabled:bg-blue-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <AuthFooter onNavigate={onNavigate} />
    </div>
  );
};

export default ResetPasswordPage;
