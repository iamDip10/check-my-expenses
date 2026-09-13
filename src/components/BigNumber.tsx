'use client';

import { useEffect, useState } from 'react';
import { formatTaka } from '@/lib/utils';

export function BigNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    const duration = 700;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={className} aria-label={formatTaka(value)}>
      {formatTaka(display)}
    </span>
  );
}
