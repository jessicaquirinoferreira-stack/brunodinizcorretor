import React, { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { resolveLocalAssetUrl } from '../../lib/seedData';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  priority?: boolean;
}

export function SafeImage({
  src,
  alt,
  className,
  fallbackTitle,
  priority = false,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const resolvedSrc = resolveLocalAssetUrl(src);

  useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  if (!resolvedSrc || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-[#16161C] via-[#121216] to-[#0B0B0D] text-[#A19E95] p-6 text-center',
          className
        )}
      >
        <Building2 className="h-8 w-8 text-[#C6A15B]/70 mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium text-[#F5F2EB]/70 max-w-[200px] truncate">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
