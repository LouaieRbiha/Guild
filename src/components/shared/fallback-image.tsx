'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface FallbackImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: FallbackImageProps): React.ReactElement {
  const [err, setErr] = useState(false);

  if (err) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-guild-elevated text-guild-muted font-bold',
          className,
        )}
        style={{ width, height }}
      >
        {alt[0]}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn('object-cover', className)}
      sizes={sizes ?? `${width}px`}
      onError={() => setErr(true)}
    />
  );
}
