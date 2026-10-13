import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'subtle' | 'elevated';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] shadow-xs',
    glass:
      'clinical-glass shadow-sm',
    subtle:
      'bg-[#F5F9FC] dark:bg-[#0F172A] border border-[#DCE6EF] dark:border-[#1E2E47]',
    elevated:
      'bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] shadow-lg'
  };

  const hoverStyle = hoverEffect
    ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200'
    : '';

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`border-b border-[#DCE6EF] dark:border-[#1E2E47] pb-3 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base sm:text-lg font-bold text-[#102A43] dark:text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
