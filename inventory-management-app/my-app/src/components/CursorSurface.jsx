import React, { useRef } from 'react';
import useScrollSlideIn from '../hooks/useScrollSlideIn';

export default function CursorSurface({ className, variant = 'workspace', children }) {
  const surfaceRef = useRef(null);
  useScrollSlideIn(surfaceRef);

  return (
    <div className={className} data-cursor-surface={variant} ref={surfaceRef}>
      <div className="cursor-ambient" aria-hidden="true">
        <div className="cursor-ambient__glow" data-cursor-glow />
      </div>
      {children}
    </div>
  );
}
