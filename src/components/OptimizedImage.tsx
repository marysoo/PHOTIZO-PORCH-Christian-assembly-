import React, { useState } from 'react';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: string; // e.g., 'aspect-[16/9]', 'aspect-[4/3]', 'aspect-[4/5]'
  priority?: boolean;
  fallbackIcon?: React.ReactNode;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio,
  priority = false,
  fallbackIcon,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // If no source is provided
  if (!src) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-zinc-950 text-zinc-700 ${aspectRatio || 'w-full h-full'} ${className}`}>
        {fallbackIcon || <ImageIcon className="w-8 h-8 opacity-40 mb-1" />}
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">No Image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatio || 'w-full h-full'} bg-zinc-950`}>
      {/* Skeleton / Shimmer Placeholder while image is loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 bg-[length:200%_100%] animate-[shimmer_2s_infinite] flex items-center justify-center z-0">
          <div className="w-6 h-6 rounded-full border border-gold/20 border-t-gold animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 p-4 text-center z-10">
          <ImageIcon className="w-8 h-8 text-zinc-700 mb-2" />
          <span className="text-xs text-zinc-500 font-mono">Unable to load image</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setHasError(false);
              setIsLoaded(false);
              setRetryKey((prev) => prev + 1);
            }}
            className="mt-2 text-[10px] text-gold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={10} /> Retry
          </button>
        </div>
      ) : (
        <img
          key={retryKey}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
