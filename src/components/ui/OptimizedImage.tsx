import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
  fallbackText?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  loading = 'lazy',
  decoding = 'async',
  fallbackIcon,
  fallbackText = 'Sin Imagen',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Verificar si la imagen ya está en caché/completa
    if (imgRef.current?.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsLoaded(true);
      } else {
        setHasError(true);
        setIsLoaded(true);
      }
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-slate-50 ${containerClassName || ''}`}>
      {/* Skeleton / Loading State */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />
      )}

      {/* Error State */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300 bg-slate-50 z-20">
          {fallbackIcon || <ImageOff className="w-8 h-8 opacity-50" />}
          {fallbackText && (
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
              {fallbackText}
            </span>
          )}
        </div>
      ) : (
        /* Actual Image */
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className || 'object-cover'}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          {...props}
        />
      )}
    </div>
  );
};
