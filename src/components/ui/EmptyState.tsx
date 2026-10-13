import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-2xl sm:rounded-3xl border border-dashed border-[#DCE6EF] dark:border-[#1E2E47] bg-[#F5F9FC]/60 dark:bg-[#0B1320]/60 space-y-4 max-w-lg mx-auto ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#111D30] border border-[#DCE6EF] dark:border-[#1E2E47] text-[#1769AA] dark:text-[#38BDF8] flex items-center justify-center mx-auto shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-base font-bold text-[#102A43] dark:text-white">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
