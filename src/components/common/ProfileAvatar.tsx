import React, { useState } from 'react';

interface ProfileAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showOnlineStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-28 h-28 text-3xl'
};

/**
 * Returns initials from a given name (e.g. "Aryan Yadav" -> "AY").
 */
export function getInitials(name: string): string {
  if (!name) return 'PT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Professional clinical profile avatar.
 * Adheres strictly to zero-AI synthetic imagery policy:
 * Renders user's authentic uploaded photo if provided,
 * otherwise renders high-contrast clinical initials typography.
 */
export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  imageUrl,
  size = 'md',
  className = '',
  showOnlineStatus = false
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const hasValidImage = imageUrl && !imageError;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {hasValidImage ? (
        <img
          src={imageUrl}
          alt={`${name}'s profile`}
          onError={() => setImageError(true)}
          className={`${sizeClass} rounded-2xl object-cover border-2 border-white shadow-xs bg-slate-100`}
        />
      ) : (
        <div
          className={`${sizeClass} rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white font-bold flex items-center justify-center tracking-wider shadow-xs border-2 border-white select-none`}
        >
          {initials}
        </div>
      )}

      {showOnlineStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-600/20"
          title="Verified Patient ID Active"
        />
      )}
    </div>
  );
};
