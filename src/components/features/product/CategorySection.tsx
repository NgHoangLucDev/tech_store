'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

interface CategorySectionProps {
  title: string;
  icon?: React.ReactNode;
  tabs?: string[];
  products: any[];
  color?: string;
  bannerSrc?: string;
  id?: string;
}

export const CategorySection = ({ title, icon, products, color = "#3B82F6", bannerSrc, id }: CategorySectionProps) => {
  const { theme } = useSettingsStore();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section id={id} className="container mx-auto px-4 py-16 md:py-24 scroll-mt-32">
      <div className={cn(
        "rounded-[2.5rem] border overflow-hidden transition-all duration-500",
        theme === 'dark' ? "bg-slate-900/30 border-white/5" : "bg-white border-slate-200 shadow-sm"
      )}>
        {/* Header */}
        <div className={cn(
          "flex flex-col lg:flex-row lg:items-center justify-between border-b px-10 py-8 gap-6 transition-all duration-500",
          theme === 'dark' ? "border-white/5" : "border-slate-100"
        )}>
          <div className="flex items-center gap-4">
            <div style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }} className="p-3 rounded-2xl border text-primary transition-all">
              {icon || <Cpu size={24} />}
            </div>
            <div className="flex flex-col">
              <h2 className={cn("font-black text-2xl uppercase tracking-tighter transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
                {title}
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Module Status: Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.push(`/products?category=${id || 'all'}`)}
            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-primary/30 text-primary hover:bg-primary hover:text-white flex items-center gap-2 group/all"
          >
             Xem tất cả
             <ChevronRight size={14} className="group-hover/all:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Content */}
        <div className="p-10 relative group/products">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Vivid Side Banner */}
              {bannerSrc && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-3 h-full min-h-[400px] relative rounded-3xl overflow-hidden group border border-white/5 hidden lg:block"
                >
                   <Image src={bannerSrc} alt={title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                   <div className="absolute bottom-8 left-8">
                      <span className="text-white font-black text-xl uppercase tracking-tighter italic">{title}</span>
                      <div className="w-8 h-1 bg-primary mt-2" />
                   </div>
                </motion.div>
              )}

              {/* Product Carousel */}
              <div className={cn(
                  "lg:col-span-9 relative",
                  !bannerSrc && "lg:col-span-12"
              )}>
                {/* Navigation Arrows */}
                <button 
                  onClick={() => scroll('left')}
                  aria-label="Xem sản phẩm trước"
                  className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover/products:opacity-100 transition-all hover:bg-primary shadow-2xl active:scale-[0.94]"
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                   <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => scroll('right')}
                  aria-label="Xem sản phẩm tiếp theo"
                  className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover/products:opacity-100 transition-all hover:bg-primary shadow-2xl active:scale-[0.94]"
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                   <ChevronRight size={24} />
                </button>

                <div 
                  ref={scrollRef}
                  className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide no-scrollbar snap-x snap-mandatory"
                  style={{ scrollBehavior: 'smooth' }}
                >
                   <AnimatePresence mode="popLayout">
                     {products.map((product, i) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className={cn(
                            "snap-start shrink-0",
                            bannerSrc 
                              ? "w-[280px] md:w-[320px] lg:w-[calc(33.333%-1.5rem)]" // 3 items if banner exists
                              : "w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]" // 4 items if no banner
                          )}
                        >
                          <ProductCard {...product} />
                        </motion.div>
                     ))}
                   </AnimatePresence>

                   {products.length === 0 && (
                     <div className="w-full py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <span className="text-sm font-semibold">Chưa có sản phẩm trong danh mục này.</span>
                        <span className="text-xs text-slate-400">Vui lòng quay lại sau.</span>
                     </div>
                   )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
