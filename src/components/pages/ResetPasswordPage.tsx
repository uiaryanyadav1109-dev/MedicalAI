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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <AuthHeader currentMode="reset" onNavigate={onNavigate} />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {isSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Password Updated
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your password has been updated successfully. You can now use your new password to access Medical AI.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/signin')}
                  className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center sm:text-left">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Update your password
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Please choose a strong password for your Medical AI account.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* New Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="reset-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
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
                      className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors.password
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                      }`}
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 rounded"
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
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength</span>
                        <span
                          className={`font-semibold capitalize font-mono text-[10px] ${
                            strength === 'strong'
                              ? 'text-emerald-700'
                              : strength === 'fair'
                              ? 'text-amber-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {strength}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden flex gap-0.5">
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
                              : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 transition-all rounded-full ${
                            strength === 'strong' ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist */}
                  <div className="pt-2 grid grid-cols-2 gap-1.5 text-[11px] text-slate-500">
                    <div className={`flex items-center gap-1.5 ${criteria.minLength ? 'text-emerald-700 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.minLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasUppercase ? 'text-emerald-700 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasUppercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasLowercase ? 'text-emerald-700 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasLowercase ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${criteria.hasNumber ? 'text-emerald-700 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasNumber ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${criteria.hasSpecial ? 'text-emerald-700 font-medium' : ''}`}>
                      <Check className={`w-3.5 h-3.5 ${criteria.hasSpecial ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span>Special character</span>
                    </div>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmNewPassword}
                      disabled={isLoading}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors.confirmPassword
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                      }`}
                      aria-invalid={!!errors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 rounded"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
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
