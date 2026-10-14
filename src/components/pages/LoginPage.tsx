import React, { useState } from 'react';
import { RoutePath } from '../../types';
import { AuthHeader } from '../auth/AuthHeader';
import { AuthFooter } from '../auth/AuthFooter';
import { useAuth } from '../../context/AuthContext';
import {
  isValidEmail,
  calculatePasswordStrength,
  evaluatePasswordCriteria
} from '../../services/authService';
import { GoogleLoginButton } from '../auth/GoogleLoginButton';
import { GoogleAccountChooserModal, GoogleAccountOption } from '../auth/GoogleAccountChooserModal';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  User,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onOpenAssessment }) => {
  const { login, loginWithGoogle, loginWithGoogleAccount } = useAuth();
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

  const passwordStrength = calculatePasswordStrength(password);
  const passwordCriteria = evaluatePasswordCriteria(password);

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

  const resolveTargetRoute = (fallbackRoute: RoutePath): RoutePath => {
    try {
      const intended = sessionStorage.getItem('medical_ai_intended_route') as RoutePath | null;
      if (intended) {
        if (portalType === 'clinician' && intended.startsWith('/doctor')) {
          sessionStorage.removeItem('medical_ai_intended_route');
          return intended;
        }
        if (portalType === 'patient' && intended.startsWith('/dashboard')) {
          sessionStorage.removeItem('medical_ai_intended_route');
          return intended;
        }
        // Clear mismatched intended route from previous session
        sessionStorage.removeItem('medical_ai_intended_route');
      }
    } catch {
      // safe fallback
    }
    return fallbackRoute;
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
        onNavigate(resolveTargetRoute(portalType === 'patient' ? '/dashboard' : '/doctor'));
      } else {
        setServerError(response.error || 'Email or password is incorrect. Please try again.');
      }
    } catch {
      setServerError("We couldn't connect to Medical AI. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerError(null);
    try {
      const targetRole = portalType === 'patient' ? 'patient' : 'doctor';
      const response = await loginWithGoogle(targetRole);
      if (response.success) {
        onNavigate(resolveTargetRoute(targetRole === 'patient' ? '/dashboard' : '/doctor'));
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
      onNavigate(resolveTargetRoute(targetRole === 'patient' ? '/dashboard' : '/doctor'));
    } else {
      setServerError(response.error || 'Google account sign-in failed.');
    }
  };

  const intendedRoute = typeof window !== 'undefined' ? sessionStorage.getItem('medical_ai_intended_route') : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F9FC] dark:bg-[#0B1320] text-[#243447] dark:text-slate-100 font-sans transition-colors">
      {/* 1. Header with back & sign up link */}
      <AuthHeader currentMode="login" onNavigate={onNavigate} />

      {/* 2. Centered Authentication Form Card */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md space-y-6 bg-white dark:bg-[#0E1A2D] p-6 sm:p-10 rounded-3xl border border-slate-200 dark:border-[#1E2E47] shadow-sm">
            {intendedRoute && (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-xs text-[#1769AA] dark:text-[#38BDF8] flex items-center gap-2.5">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Sign in below to access your confidential data access and consent controls.</span>
              </div>
            )}

            {/* Header Copy */}
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                Sign in to continue to your MedicalAI health records.
              </p>
            </div>

            {/* Role Switcher (Patient vs Clinician) */}
            <div className="p-1 bg-slate-200/80 dark:bg-[#111D30] rounded-2xl flex items-center text-xs font-semibold border border-[#DCE6EF] dark:border-[#1E2E47]">
              <button
                type="button"
                onClick={() => {
                  setPortalType('patient');
                  setServerError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  portalType === 'patient'
                    ? 'bg-white dark:bg-[#1769AA] text-[#102A43] dark:text-white shadow-xs font-bold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#102A43] dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-[#1769AA] dark:text-white" />
                <span>Patient Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalType('clinician');
                  setServerError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  portalType === 'clinician'
                    ? 'bg-white dark:bg-[#16865C] text-[#102A43] dark:text-white shadow-xs font-bold'
                    : 'text-[#64748B] dark:text-slate-400 hover:text-[#102A43] dark:hover:text-white'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-[#16865C] dark:text-white" />
                <span>Clinician / EMR Link</span>
              </button>
            </div>



            {/* Server Error Banner */}
            {serverError && (
              <div
                className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-[#243447] dark:text-slate-200"
                >
                  {portalType === 'patient' ? 'Email address' : 'Institutional / Practice Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
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
                    className={`w-full pl-10 pr-3.5 py-3 bg-white dark:bg-[#111D30] border rounded-xl text-xs sm:text-sm text-[#243447] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.email
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-[#DCE6EF] dark:border-[#1E2E47] focus:border-[#1769AA] focus:ring-2 focus:ring-blue-600/20'
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
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold text-[#243447] dark:text-slate-200"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    className="text-[11px] font-semibold text-[#1769AA] dark:text-[#38BDF8] hover:underline focus:outline-none cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
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
                    className={`w-full pl-10 pr-10 py-3 bg-white dark:bg-[#111D30] border rounded-xl text-xs sm:text-sm text-[#243447] dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-[#DCE6EF] dark:border-[#1E2E47] focus:border-[#1769AA] focus:ring-2 focus:ring-blue-600/20'
                    }`}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
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
                  <p id="password-error" className="text-[11px] text-rose-600 font-medium mt-1">
                    {errors.password}
                  </p>
                )}

                {/* Password strength & requirements checklist for Doctor / Clinician Portal */}
                {password && portalType === 'clinician' && (
                  <div className="mt-3 p-3.5 bg-slate-50 dark:bg-[#15233C] rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Password Strength:
                      </span>
                      <span
                        className={`font-bold capitalize ${
                          passwordStrength === 'strong'
                            ? 'text-emerald-600'
                            : passwordStrength === 'fair'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {passwordStrength}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${passwordCriteria.minLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${passwordCriteria.hasUppercase ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${passwordCriteria.hasNumber ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>One number</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${passwordCriteria.hasSpecial ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}
                        />
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] disabled:bg-[#1769AA]/60 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating credentials...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DCE6EF] dark:border-[#1E2E47]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono">
                <span className="bg-[#F5F9FC] dark:bg-[#0B1320] px-3 text-[#64748B] dark:text-slate-400 font-semibold">
                  or continue with
                </span>
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
            <div className="text-center pt-2 text-xs text-[#64748B] dark:text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="font-bold text-[#1769AA] dark:text-[#38BDF8] hover:underline cursor-pointer"
              >
                Create account
              </button>
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

export default LoginPage;
