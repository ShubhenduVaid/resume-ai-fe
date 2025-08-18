import React, { useState } from 'react';
import Image from 'next/image';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

type ImgProps = {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
};

export function ImageWithFallback(props: ImgProps) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, width, height, priority } = props;
  const w = typeof width === 'string' ? parseInt(width, 10) : width || 200;
  const h = typeof height === 'string' ? parseInt(height, 10) : height || 200;

  return didError ? (
    <div className={`inline-block ${className ?? ''}`} style={style}>
      <Image
        src={ERROR_IMG_SRC}
        alt="Error loading image"
        width={Number(w)}
        height={Number(h)}
        priority={priority}
        unoptimized
      />
    </div>
  ) : (
    <Image
      src={src || ERROR_IMG_SRC}
      alt={alt || ''}
      className={className}
      style={style}
      width={Number(w)}
      height={Number(h)}
      onError={handleError}
      priority={priority}
      unoptimized
    />
  );
}
