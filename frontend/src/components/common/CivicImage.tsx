import React, { useState } from 'react';

interface CivicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
}

export default function CivicImage({
  src,
  alt,
  fallbackSrc = '/assets/civic/pothole-road.jpg',
  aspectRatio = '16/9',
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  ...props
}: CivicImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const finalSrc = error ? fallbackSrc : src;

  return (
    <div
      className={`relative overflow-hidden bg-slate-900 ${className}`}
      style={{ aspectRatio }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs">
          Loading civic photograph...
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setError(true);
            setLoaded(true);
          }
        }}
        className={`w-full h-full transition-opacity duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectFit,
          objectPosition,
        }}
        {...props}
      />
    </div>
  );
}
