'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface FallbackImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export default function FallbackImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  ...props
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  return (
    <>
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }}
      />
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-background-dark animate-pulse" />
      )}
    </>
  );
}
