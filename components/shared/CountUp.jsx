'use client';

import { useEffect, useState } from 'react';

// Animates a number from 0 to `value`.
export default function CountUp({ value, duration = 900, suffix = '' }) {
  const target = Number(value) || 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return (
    <>
      {n}
      {suffix}
    </>
  );
}
