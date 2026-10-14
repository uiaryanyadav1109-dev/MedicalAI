import React from 'react';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LogoVariant = 'default' | 'doctor' | 'patient';
export type LogoLayout = 'full' | 'compact' | 'icon-only';

export interface MedicalLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  layout?: LogoLayout;
  subtitle?: string;
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

const sizeConfig = {
  xs: {
    iconSize: 'w-6 h-6',
    svgSize: 24,
    titleText: 'text-sm',
    badgeText: 'text-[9px]',
    subText: 'text-[8px]',
    gap: 'gap-1.5'
  },
  sm: {
    iconSize: 'w-8 h-8',
    svgSize: 32,
    titleText: 'text-base',
    badgeText: 'text-[10px]',
    subText: 'text-[9px]',
    gap: 'gap-2'
  },
  md: {
    iconSize: 'w-10 h-10',
    svgSize: 40,
    titleText: 'text-lg',
    badgeText: 'text-[11px]',
    subText: 'text-[10px]',
    gap: 'gap-2.5'
  },
  lg: {
    iconSize: 'w-12 h-12',
    svgSize: 48,
    titleText: 'text-xl',
    badgeText: 'text-xs',
    subText: 'text-[11px]',
    gap: 'gap-3'
  },
  xl: {
    iconSize: 'w-16 h-16',
    svgSize: 64,
    titleText: 'text-2xl',
    badgeText: 'text-xs',
    subText: 'text-xs',
    gap: 'gap-3.5'
  }
};

export const MedicalLogo: React.FC<MedicalLogoProps> = ({
  size = 'md',
  variant = 'default',
  layout = 'full',
  subtitle,
  showSubtitle = true,
  className = '',
  animate = true
}) => {
  const cfg = sizeConfig[size];

  // Distinct color palettes per role/variant
  const gradientClass =
    variant === 'doctor'
      ? 'from-[#064E3B] via-[#047857] to-[#10B981]'
      : variant === 'patient'
      ? 'from-[#1E3A8A] via-[#2563EB] to-[#38BDF8]'
      : 'from-[#0E1A2D] via-[#123E67] to-[#0891B2]';

  const glowShadow =
    variant === 'doctor'
      ? 'shadow-emerald-500/20 group-hover:shadow-emerald-500/35'
      : 'shadow-sky-500/20 group-hover:shadow-sky-500/35';

  const defaultSubtitle =
    variant === 'doctor'
      ? 'Clinician EMR'
      : variant === 'patient'
      ? 'Patient Health Record'
      : 'Clinical Intelligence';

  const displaySubtitle = subtitle !== undefined ? subtitle : defaultSubtitle;

  return (
    <div className={`inline-flex items-center ${cfg.gap} select-none group ${className}`}>
      {/* Dynamic Vector Icon */}
      <div
        className={`relative ${cfg.iconSize} rounded-xl bg-gradient-to-tr ${gradientClass} p-[1.5px] shadow-md ${glowShadow} transition-all duration-300 group-hover:scale-105 shrink-0 flex items-center justify-center overflow-hidden`}
      >
        {/* Subtle internal border */}
        <div className="absolute inset-0 rounded-[10px] border border-white/20 pointer-events-none" />

        {/* Embedded SVG Icon */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            <linearGradient id={`pulseGrad-${size}-${variant}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id={`logoGlow-${size}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background cross silhouette */}
          <g opacity="0.22" fill="#FFFFFF">
            <rect x="17" y="7" width="6" height="26" rx="3" />
            <rect x="7" y="17" width="26" height="6" rx="3" />
          </g>

          {/* Dynamic AI Pulse Line */}
          <path
            d="M 5 20 L 12 20 L 15 13 L 19 27 L 23 9 L 27 31 L 30 18 L 33 22 L 35 20"
            fill="none"
            stroke={`url(#pulseGrad-${size}-${variant})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#logoGlow-${size})`}
            className={animate ? 'transition-transform duration-300 group-hover:scale-105' : ''}
          />

          {/* Signal Apex Neural Node */}
          <circle cx="23" cy="9" r="2" fill="#FFFFFF" />
          <circle cx="23" cy="9" r="1" fill="#0284C7" />
          <circle cx="27" cy="31" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Typography Brand Block */}
      {layout !== 'icon-only' && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${cfg.titleText} font-extrabold tracking-tight text-[#0F172A] dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-sky-400`}
            >
              Medical<span className="text-[#0284C7] dark:text-[#38BDF8]">AI</span>
            </span>

            {/* AI Clinical Badge */}
            {variant === 'doctor' && (
              <span className={`px-1.5 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-semibold ${cfg.badgeText} border border-emerald-500/30 uppercase tracking-wider`}>
                EMR
              </span>
            )}
            {variant === 'patient' && (
              <span className={`px-1.5 py-0.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-semibold ${cfg.badgeText} border border-blue-500/30 uppercase tracking-wider`}>
                PORTAL
              </span>
            )}
          </div>

          {showSubtitle && displaySubtitle && layout === 'full' && (
            <span
              className={`mt-1 ${cfg.subText} font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400`}
            >
              {displaySubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
