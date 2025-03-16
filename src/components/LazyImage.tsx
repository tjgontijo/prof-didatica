'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

type LazyImageProps = ImageProps & {
  placeholderColor?: string;
};

export default function LazyImage({
  placeholderColor = '#f3f4f6',
  alt,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Se não estiver no cliente, retorna um placeholder
  if (!isClient) {
    return (
      <div
        className="animate-pulse"
        style={{
          backgroundColor: placeholderColor,
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '8px',
        }}
        aria-label={alt}
      />
    );
  }

  return (
    <>
      {!isLoaded && (
        <div
          className="animate-pulse"
          style={{
            backgroundColor: placeholderColor,
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: '8px',
            zIndex: 1,
          }}
        />
      )}
      <Image
        alt={alt}
        {...props}
        onLoad={() => setIsLoaded(true)}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          zIndex: 2,
          position: 'relative',
        }}
      />
    </>
  );
}
