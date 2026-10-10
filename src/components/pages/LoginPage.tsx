import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import { AuthVisualPanel } from '../auth/AuthVisualPanel';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../services/authService';
import { GoogleLoginButton } from '../auth/GoogleLoginButton';
import { GoogleAccountChooserModal, GoogleAccountOption } from '../auth/GoogleAccountChooserModal';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, User, Stethoscope, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const { login, loginAsDemo, loginWithGoogle, loginWithGoogleAccount } = useAuth();
  const [portalType, setPortalType] = useState<'patient' | 'clinician'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);

  // Validation & Form States
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await login(
        email,
        password,
        portalType === 'patient' ? 'patient' : 'doctor'
      );

      if (response.success) {
        if (portalType === 'patient') {
          onNavigate('/dashboard');
        } else {
          onNavigate('/doctor');
        }
      } else {
        setServerError(response.error || 'Email or password is incorrect. Please try again.');
      }
    } catch {
      setServerError("We couldn't connect to Medical AI. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'patient' | 'doctor') => {
    loginAsDemo(role);
    if (role === 'patient') {
      onNavigate('/dashboard');
    } else {
      onNavigate('/doctor');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      const targetRole = portalType === 'patient' ? 'patient' : 'doctor';
      const response = await loginWithGoogle(targetRole);
      if (response.success) {
        if (targetRole === 'patient') {
          onNavigate('/dashboard');
        } else {
          onNavigate('/doctor');
        }
      } else if (response.error === 'NEEDS_CHOOSER') {
        setIsChooserOpen(true);
      } else {
        setServerError(response.error || 'Google sign-in could not be completed.');
      }
    } catch {
      setServerError('Could not complete Google authentication. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSelectGoogleAccount = async (account: GoogleAccountOption) => {
    const targetRole = portalType === 'patient' ? 'patient' : 'doctor';
    const response = await loginWithGoogleAccount(account, targetRole);
    if (response.success) {
      if (targetRole === 'patient') {
        onNavigate('/dashboard');
      } else {
        onNavigate('/doctor');
      }
    } else {
      setServerError(response.error || 'Google account sign-in failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* 1. Simplified Auth Header */}
      <AuthHeader currentMode="login" onNavigate={onNavigate} />

      {/* 2. Main Two-Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left: Healthcare Visual Panel */}
        <AuthVisualPanel />

        {/* Right: Clean Authentication Card */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md space-y-6">
            {/* Header copy */}
            <div className="space-y-1.5 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Sign in to continue to Medical AI.
              </p>
            </div>

            {/* Portal Switcher (Patient vs Clinician) */}
            <div className="p-1 bg-slate-200/70 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPortalType('patient');
                  setServerError(null);
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  portalType === 'patient'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Patient Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalType('clinician');
                  setServerError(null);
                }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  portalType === 'clinician'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinician / EMR Link</span>
              </button>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-blue-900 uppercase">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Explore Demo Accounts</span>
                </span>
                <span className="text-[10px] text-blue-600 font-normal">Instant Access</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('patient')}
                  className="p-2 bg-white hover:bg-blue-100/60 border border-blue-200 rounded-lg text-left transition-colors flex items-center gap-2 group"
                >
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-900 text-xs truncate">Patient View</span>
                    <span className="block text-[10px] text-slate-500 font-mono truncate">Aryan Yadav</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('doctor')}
                  className="p-2 bg-white hover:bg-emerald-100/60 border border-emerald-200 rounded-lg text-left transition-colors flex items-center gap-2 group"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-900 text-xs truncate">Doctor View</span>
                    <span className="block text-[10px] text-slate-500 font-mono truncate">Dr. Sarah Chen</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Server Error Banner */}
            {serverError && (
              <div
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700"
                >
                  {portalType === 'patient' ? 'Email address' : 'Institutional / Practice Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled={isLoading}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder={portalType === 'patient' ? 'name@example.com' : 'physician@hospital.org'}
                    className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    disabled={isLoading}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
                      errors.password
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                    }`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 sm:py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-mono">
                <span className="bg-slate-50 px-3 text-slate-400">or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isLoading}
              roleContext={portalType === 'clinician' ? 'doctor' : 'patient'}
            />

            {/* Bottom Navigation */}
            <div className="text-center pt-2 text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 rounded"
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Minimal Auth Footer */}
      <AuthFooter onNavigate={onNavigate} />

      {/* 4. Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={isChooserOpen}
        onClose={() => setIsChooserOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        requestedRole={portalType === 'clinician' ? 'doctor' : 'patient'}
      />
    </div>
  );
};
