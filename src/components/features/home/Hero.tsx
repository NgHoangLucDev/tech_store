'use client';

import React from 'react';
import { SidebarCategories } from '../category/SidebarCategories';
import { HeroSlider } from './HeroSlider';
import { CyberCanvas3D } from './CyberCanvas3D';
import { HeroRightBanners } from './HeroRightBanners';
import { motion } from 'framer-motion';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

const CATEGORY_MAP = [
  { name: 'Processors', id: 'components' },
  { name: 'Graphics', id: 'components' },
  { name: 'Storage', id: 'components' },
  { name: 'Peripherals', id: 'peripherals' },
  { name: 'Laptops', id: 'laptops' },
  { name: 'Displays', id: 'displays' },
];

export const Hero = ({ categories = [] }: { categories?: any[] }) => {
  const { language, theme } = useSettingsStore();
  const t = translations[language];

  return (
    <section className="container mx-auto px-4 pt-32 pb-12 relative overflow-visible">
      <CyberCanvas3D />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px] relative z-10">
        {/* Left Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block lg:col-span-3"
        >
          <div className={cn(
            "h-full backdrop-blur-md rounded-[2rem] border p-2 overflow-hidden transition-all duration-500",
            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
          )}>
            <SidebarCategories categories={categories} />
          </div>
        </motion.div>

        {/* Center Main Hero Slider */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="col-span-1 lg:col-span-6"
        >
          <div className={cn(
            "h-full relative rounded-[2rem] overflow-hidden border shadow-2xl group transition-all duration-500",
            theme === 'dark' ? "border-white/10" : "border-slate-200"
          )}>
             <HeroSlider />
             
             {/* Global HUD Status Indicator */}
             <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none z-20">
                <div className="px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                   {t.systemOperational}
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Stacked side Banners */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="col-span-1 lg:col-span-3"
        >
          <HeroRightBanners />
        </motion.div>
      </div>
    </section>
  );
};
