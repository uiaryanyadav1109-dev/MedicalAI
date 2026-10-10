import React from 'react';
import { RoutePath } from '../../types';
import { Activity, ShieldCheck, HeartHandshake, Smartphone } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface FooterProps {
  onNavigate: (route: RoutePath) => void;
  onOpenDownloadApp?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenDownloadApp }) => {
  const { t } = useLanguage();

  const handleNav = (route: RoutePath) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4 text-white" />
              </span>
              <span className="text-base font-bold text-white tracking-tight">MEDICAL AI</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('footer.compliance')}</span>
            </div>

            {onOpenDownloadApp && (
              <div>
                <button
                  onClick={onOpenDownloadApp}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Download Android App (APK)</span>
                </button>
              </div>
            )}
          </div>

          {/* Product Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">{t('nav.platform')}</h3>
            <ul className="space-y-2.5">
              {onOpenDownloadApp && (
                <li>
                  <button
                    onClick={onOpenDownloadApp}
                    className="hover:text-blue-300 text-blue-400 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Download Mobile App</span>
                  </button>
                </li>
              )}
              <li>
                <button onClick={() => handleNav('/platform')} className="hover:text-white transition-colors">
                  {t('dashboard.aiAssistant')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/features')} className="hover:text-white transition-colors">
                  {t('reports.title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/features')} className="hover:text-white transition-colors">
                  {t('dashboard.healthTimeline')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/for-doctors')} className="hover:text-white transition-colors">
                  {t('handoff.title')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/security')} className="hover:text-white transition-colors">
                  {t('dashboard.shareQr')}
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Company Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">{t('nav.resources')}</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNav('/how-it-works')} className="hover:text-white transition-colors">
                  {t('nav.howItWorks')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/safety')} className="hover:text-white transition-colors">
                  {t('nav.safety')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/faq')} className="hover:text-white transition-colors">
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/about')} className="hover:text-white transition-colors">
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/contact')} className="hover:text-white transition-colors">
                  {t('nav.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">{t('footer.securityGovernance')}</h3>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNav('/privacy')} className="hover:text-white transition-colors">
                  {t('nav.privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/terms')} className="hover:text-white transition-colors">
                  {t('nav.terms')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/medical-disclaimer')} className="hover:text-amber-300 text-amber-400 font-medium transition-colors">
                  {t('nav.medicalDisclaimer')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/security')} className="hover:text-white transition-colors">
                  {t('nav.security')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Notice Strip */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 text-xs text-rose-300/80 bg-rose-950/20 p-3 rounded-xl border border-rose-900/30">
          {t('footer.emergencyNotice')}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Medical AI Technologies. {t('footer.allRightsReserved')}
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-center md:text-right">
            <HeartHandshake className="w-3.5 h-3.5 text-blue-400 shrink-0 inline" />
            <span>{t('disclaimerBanner.text')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

