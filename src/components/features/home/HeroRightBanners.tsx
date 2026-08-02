'use client';

import React from 'react';
import Image from 'next/image';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export const HeroRightBanners = () => {
  const { theme } = useSettingsStore();

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-rows-2 gap-6 h-full min-h-[500px] lg:min-h-0">
      {/* Upper Banner: Build PC */}
      <div 
        onClick={() => handleScroll('components')}
        className={cn(
          "relative w-full h-full rounded-[2rem] overflow-hidden group cursor-pointer border shadow-xl transition-all duration-500 hover:shadow-primary/10",
          theme === 'dark' ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-100"
        )}
      >
        <Image 
          src="/banners/side_build_pc.png" 
          alt="Build PC Promo" 
          fill 
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        
        {/* Subtle overlay corner glow */}
        <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-[2rem] transition-colors pointer-events-none duration-500" />
      </div>

      {/* Lower Banner: Custom Keyboards */}
      <div 
        onClick={() => handleScroll('peripherals')}
        className={cn(
          "relative w-full h-full rounded-[2rem] overflow-hidden group cursor-pointer border shadow-xl transition-all duration-500 hover:shadow-primary/10",
          theme === 'dark' ? "border-white/10 bg-slate-950" : "border-slate-200 bg-slate-100"
        )}
      >
        <Image 
          src="/banners/side_keyboards.png" 
          alt="Mechanical Keyboards Promo" 
          fill 
          sizes="(max-width: 1024px) 100vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
        
        {/* Subtle overlay corner glow */}
        <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-[2rem] transition-colors pointer-events-none duration-500" />
      </div>
    </div>
  );
};
