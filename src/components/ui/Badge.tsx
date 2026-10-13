import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emergency' | 'urgent' | 'routine' | 'success' | 'warning' | 'neutral' | 'teal';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    emergency:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    urgent:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    routine:
      'bg-blue-50 text-[#1769AA] dark:bg-blue-950/60 dark:text-[#38BDF8] border-blue-200 dark:border-blue-800',
    success:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning:
      'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    teal:
      'bg-teal-50 text-[#16A6A1] dark:bg-teal-950/60 dark:text-[#2DD4BF] border-teal-200 dark:border-teal-800',
    neutral:
      'bg-slate-100 text-[#64748B] dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };

  const dotColors = {
    emergency: 'bg-rose-500',
    urgent: 'bg-amber-500',
    routine: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-orange-500',
    teal: 'bg-[#16A6A1]',
    neutral: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
