import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variantStyles = {
    primary:
      'bg-[#1769AA] hover:bg-[#102A43] text-white shadow-sm hover:shadow focus-visible:ring-[#1769AA]',
    secondary:
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#243447] dark:text-slate-100 focus-visible:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-[#243447] dark:text-slate-200 border border-[#DCE6EF] dark:border-[#1E2E47] focus-visible:ring-[#1769AA]',
    danger:
      'bg-[#DC2626] hover:bg-rose-700 text-white shadow-sm focus-visible:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-[#64748B] dark:text-slate-300 hover:text-[#102A43] dark:hover:text-white focus-visible:ring-slate-400',
    teal:
      'bg-[#16A6A1] hover:bg-[#138A86] text-white shadow-sm focus-visible:ring-[#16A6A1]'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
    md: 'text-xs sm:text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5 min-h-[48px]'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
