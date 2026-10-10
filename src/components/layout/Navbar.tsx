import React, { useState, useEffect } from 'react';
import { RoutePath } from '../../types';
import { Menu, X, Activity, Stethoscope, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileAvatar } from '../common/ProfileAvatar';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
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
  const { user, isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { labelKey: string; route: RoutePath }[] = [
    { labelKey: 'nav.platform', route: '/platform' },
    { labelKey: 'nav.howItWorks', route: '/how-it-works' },
    { labelKey: 'nav.features', route: '/features' },
    { labelKey: 'nav.safety', route: '/safety' },
    { labelKey: 'nav.forDoctors', route: '/for-doctors' },
    { labelKey: 'nav.resources', route: '/resources' }
  ];

  const handleNavClick = (route: RoutePath) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs'
          : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border-b border-slate-100 dark:border-slate-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand wordmark */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm cursor-pointer"
            aria-label={t('nav.home')}
          >
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold tracking-tight shadow-xs group-hover:bg-blue-700 transition-colors">
              <Activity className="w-5 h-5 text-white" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              MEDICAL AI
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`text-sm font-medium transition-colors whitespace-nowrap pb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm cursor-pointer ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-b-2 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Language Selector + Theme Toggle + Auth/Portal Action */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <LanguageSelector variant="compact" />

            {/* Theme Toggle */}
            <ThemeToggle variant="icon" />

            {/* Download App CTA */}
            {onOpenDownloadApp && (
              <button
                onClick={onOpenDownloadApp}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800 transition-colors shadow-2xs cursor-pointer"
                title="Download Android APK"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t('nav.downloadApp')}</span>
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => handleNavClick(role === 'doctor' ? '/doctor' : '/dashboard')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                  role === 'doctor'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800'
                }`}
              >
                {role === 'doctor' ? (
                  <Stethoscope className="w-3.5 h-3.5" />
                ) : (
                  <ProfileAvatar
                    name={user?.name || 'Aryan Yadav'}
                    imageUrl={user?.profileImageUrl}
                    size="xs"
                  />
                )}
                <span>
                  {role === 'doctor'
                    ? t('doctor.doctorPortal')
                    : user?.name
                    ? `${user.name.split(' ')[0]}`
                    : t('dashboard.patientPortal')}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/signin')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector variant="compact" />
            <ThemeToggle variant="icon" />

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none transition-colors"
              aria-label={mobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1 pt-2" aria-label="Mobile Navigation">
            {navLinks.map((item) => (
              <button
                key={item.route}
                onClick={() => handleNavClick(item.route)}
                className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  currentRoute === item.route
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t(item.labelKey)}
              </button>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {onOpenDownloadApp && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDownloadApp();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-800"
              >
                <Smartphone className="w-4 h-4" />
                <span>{t('nav.downloadApp')}</span>
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={() => handleNavClick(role === 'doctor' ? '/doctor' : '/dashboard')}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition-colors cursor-pointer"
              >
                {role === 'doctor' ? t('doctor.doctorPortal') : t('dashboard.patientPortal')}
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('/signin')}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

