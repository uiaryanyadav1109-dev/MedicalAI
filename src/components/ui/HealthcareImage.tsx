import React, { useState } from 'react';
import { RealHealthcareImage } from '../../data/healthcareImages';
import { Activity, ShieldCheck } from 'lucide-react';

interface HealthcareImageProps {
  image: RealHealthcareImage;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  showCredit?: boolean;
}

export const HealthcareImage: React.FC<HealthcareImageProps> = ({
  image,
  className = '',
  aspectRatio = 'auto',
  showCredit = false
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const aspectClass =
    aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-3/4'
      : '';

  if (hasError) {
    return (
      <div
        className={`bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-slate-500 text-center ${aspectClass} ${className}`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
          <Activity className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold text-slate-700">{image.alt}</span>
        <span className="text-[10px] text-slate-400 mt-1 font-mono">Verified Clinical Asset</span>
      </div>
    );
  }

  return (
    <figure className="relative overflow-hidden rounded-xl group m-0">
      <img
        src={image.url}
        alt={image.alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${aspectClass} ${className}`}
      />
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 bg-slate-100 animate-pulse ${aspectClass}`} />
      )}
      {showCredit && (
        <figcaption className="text-[10px] text-slate-400 font-mono mt-1 text-right">
          {image.credit}
        </figcaption>
      )}
    </figure>
  );
};
