import React from 'react';

export interface SkeletonProps {
  variant?: 'line' | 'avatar' | 'card' | 'telemetry';
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  variant = 'line',
  className = '',
  count = 1
}) => {
  const base =
    'animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl transition-colors';

  const renderSingle = (key: number) => {
    switch (variant) {
      case 'avatar':
        return <div key={key} className={`w-12 h-12 rounded-full ${base} ${className}`} />;
      case 'card':
        return (
          <div
            key={key}
            className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111D30] space-y-3 ${className}`}
          >
            <div className={`w-1/3 h-4 ${base}`} />
            <div className={`w-3/4 h-6 ${base}`} />
            <div className={`w-full h-12 ${base}`} />
          </div>
        );
      case 'telemetry':
        return (
          <div
            key={key}
            className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between ${className}`}
          >
            <div className="space-y-1.5 w-1/2">
              <div className={`w-2/3 h-3 ${base}`} />
              <div className={`w-1/2 h-5 ${base}`} />
            </div>
            <div className={`w-16 h-8 ${base}`} />
          </div>
        );
      case 'line':
      default:
        return <div key={key} className={`h-4 w-full ${base} ${className}`} />;
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, i) => renderSingle(i))}
    </div>
  );
};

export default SkeletonLoader;
