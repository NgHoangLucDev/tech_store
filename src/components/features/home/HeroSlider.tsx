'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

const SLIDES = [
  '/banners/promo_laptop.png',
  '/banners/promo_pc.png',
  '/banners/promo_monitor.png',
];

export const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const { theme } = useSettingsStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000); // 6s auto-slide
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prev = () => setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 border border-white/5 rounded-[2rem] min-h-[300px] lg:min-h-0" style={{ transformStyle: 'preserve-3d' }}>
      {/* Slides images with fade transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image 
            src={SLIDES[current]} 
            alt="Tech Store Promotion Banner" 
            fill 
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover" 
            priority
          />
          {/* Subtle gradient overlay to match our shop aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-radial-gradient-vignette pointer-events-none z-0 opacity-20" />

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none z-20">
        <button 
          onClick={prev}
          className="p-3 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all pointer-events-auto shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none z-20">
        <button 
          onClick={next}
          className="p-3 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all pointer-events-auto shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2.5 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative"
          >
             <div className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                current === i ? "w-10 bg-primary" : "w-5 bg-white/20 group-hover:bg-white/40"
             )} />
             <span className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/60 transition-opacity",
                current === i ? "opacity-100" : "opacity-0"
             )}>
               0{i + 1}
             </span>
          </button>
        ))}
      </div>
    </div>
  );
};

