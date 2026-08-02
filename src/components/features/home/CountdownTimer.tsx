'use client';

import React, { useState, useEffect } from 'react';

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div className="flex gap-2"><div className="w-8 h-8 bg-slate-100 rounded-md animate-pulse" /></div>;

  const format = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex gap-2">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-slate-900 text-white w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm">
            {format(val)}
          </div>
          {i < 2 && <span className="font-bold text-slate-900">:</span>}
        </div>
      ))}
    </div>
  );
};
