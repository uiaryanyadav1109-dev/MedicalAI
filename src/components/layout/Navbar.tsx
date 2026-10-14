import React, { useState, useEffect, useRef } from 'react';
import { RoutePath } from '../../types';
import {
  Activity,
  Menu,
  X,
  Stethoscope,
  Smartphone,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Layers,
  ArrowRight,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from '../common/ProfileAvatar';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
import { MedicalLogo } from '../common/MedicalLogo';
import { useLanguage } from '../../i18n';

interface NavbarProps {
  currentRoute: RoutePath;
  onNavigate: (route: RoutePath) => void;
  onOpenAssessment: () => void;
  onOpenDownloadApp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenAssessment,
  onOpenDownloadApp
}) => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: { label: string; route: RoutePath; isAction?: boolean }[] = [
    { label: 'Home', route: '/' },
    { label: 'Features', route: '/features' },
    { label: 'For Patients', route: '/for-patients' },
    { label: 'For Doctors', route: '/for-doctors' },
    { label: 'How It Works', route: '/how-it-works' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ];

  const handleNavClick = (route: RoutePath, isAction = false) => {
    if (isAction && route === '/chat') {
      if (isAuthenticated) {
        onNavigate('/dashboard/chat');
      } else {
        onOpenAssessment();
      }
    } else {
      onNavigate(route);
    }
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    onNavigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-md shadow-xs border-b border-[#DCE6EF] dark:border-[#1E2E47]'
          : 'bg-white/90 dark:bg-[#0B1320]/90 backdrop-blur-sm border-b border-slate-100/80 dark:border-[#1E2E47]/50'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 xl:gap-6">
          {/* Logo & Brand Identity */}
          <button
            onClick={() => handleNavClick('/')}
            className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769AA] rounded-lg cursor-pointer shrink-0"
            aria-label="MedicalAI Home"
          >
            <MedicalLogo size="md" layout="full" />
          </button>

          {/* Desktop Navigation Links - Centered & Balanced */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.route, item.isAction)}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs xl:text-[13px] font-semibold rounded-xl transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769AA] cursor-pointer flex items-center ${
                    isActive
                      ? 'text-[#1769AA] dark:text-[#38BDF8] bg-blue-50/90 dark:bg-blue-950/70 font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#102A43] dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls & Auth Actions - Properly Grouped & Separated */}
          <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Utility Controls Dock */}
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#111D30] p-1 rounded-xl border border-slate-200/80 dark:border-[#1E2E47]">
              <LanguageSelector variant="compact" />
              <ThemeToggle variant="icon" />

              {/* Mobile App Shortcut */}
              {onOpenDownloadApp && (
                <button
                  onClick={onOpenDownloadApp}
                  className="p-1.5 text-[#64748B] dark:text-slate-300 hover:text-[#1769AA] dark:hover:text-[#38BDF8] hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Download Android APK"
                  aria-label="Download App"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

            {/* Auth Actions */}
            {isAuthenticated ? (
              /* Authenticated User Account Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="px-3 py-1.5 rounded-xl border border-[#DCE6EF] dark:border-[#1E2E47] bg-white dark:bg-[#111D30] hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  aria-expanded={userMenuOpen}
                >
                  {role === 'doctor' ? (
                    <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <ProfileAvatar
                      name={user?.name || 'Aryan Yadav'}
                      imageUrl={user?.profileImageUrl}
                      size="xs"
                    />
                  )}
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-[#243447] dark:text-white leading-tight">
                      {user?.name ? user.name.split(' ')[0] : (role === 'doctor' ? 'Dr. Chen' : 'Patient')}
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400 leading-none">
                      {role === 'doctor' ? 'Clinician' : 'Patient'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xl py-2 z-50 transition-all animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-[#DCE6EF] dark:border-[#1E2E47]">
                      <p className="text-xs font-bold text-[#102A43] dark:text-white truncate">
                        {user?.name || (role === 'doctor' ? 'Dr. Sarah Chen, MD' : 'Patient Account')}
                      </p>
                      <p className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                        {user?.email || 'authenticated@medicalai.local'}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => handleNavClick(role === 'doctor' ? '/doctor' : '/dashboard')}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#243447] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        {role === 'doctor' ? <Stethoscope className="w-4 h-4 text-[#16A6A1]" /> : <User className="w-4 h-4 text-[#1769AA]" />}
                        <span>{role === 'doctor' ? 'Clinician Dashboard' : 'Patient Portal'}</span>
                      </button>
                      <button
                        onClick={() => handleNavClick(role === 'doctor' ? '/doctor/settings' : '/dashboard/settings')}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#243447] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-[#64748B]" />
                        <span>Security & Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-[#DCE6EF] dark:border-[#1E2E47] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#DC2626] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public Auth Buttons */
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('/signin')}
                  className="px-3 py-2 text-xs xl:text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1769AA] dark:hover:text-[#38BDF8] hover:bg-slate-100/70 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="px-3.5 xl:px-4 py-2 text-xs xl:text-[13px] font-bold text-white bg-[#1769AA] hover:bg-[#102A43] active:bg-[#0B1320] rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="icon" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#64748B] dark:text-slate-300 hover:text-[#102A43] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#DCE6EF] dark:border-[#1E2E47] bg-white dark:bg-[#0B1320] px-4 pt-2 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 pt-2" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.route, item.isAction)}
                className={`text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                  currentRoute === item.route
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1769AA] dark:text-[#38BDF8] font-bold'
                    : 'text-[#243447] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-[#DCE6EF] dark:border-[#1E2E47] flex flex-col gap-2">
            {onOpenDownloadApp && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDownloadApp();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#1769AA] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200/80 dark:border-blue-800"
              >
                <Smartphone className="w-4 h-4" />
                <span>Download Android APK</span>
              </button>
            )}

            {isAuthenticated ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick(role === 'doctor' ? '/doctor' : '/dashboard')}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-[#1769AA] hover:bg-[#102A43] rounded-xl transition-colors shadow-xs"
                >
                  {role === 'doctor' ? 'Enter Doctor Portal' : 'Open Patient Portal'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2 text-xs font-medium text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('/signin')}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-[#1769AA] dark:text-[#38BDF8] bg-blue-50 dark:bg-blue-950/60 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/signup')}
                  className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-[#1769AA] hover:bg-[#102A43] rounded-xl transition-colors shadow-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
