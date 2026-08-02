'use client';

import React from 'react';
import Image from 'next/image';
import { CountdownTimer } from './CountdownTimer';
import { ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  { id: 'fs1', name: 'NeuroMonitor 24" Ultra-Low Latency', price: 8490000, originalPrice: 10290000, image: '/products/monitor.png', sold: 15, total: 20 },
  { id: 'fs2', name: 'HapticMouse Pro - Carbon Fiber', price: 4290000, originalPrice: 5890000, image: '/products/mouse.png', sold: 45, total: 50 },
  { id: 'fs3', name: 'QuantumKey Mechanical Board', price: 6990000, originalPrice: 8890000, image: '/products/keyboard.png', sold: 8, total: 10 },
  { id: 'fs4', name: 'SonicLink Wireless Headset', price: 9490000, originalPrice: 11990000, image: '/products/headset.png', sold: 12, total: 15 },
  { id: 'fs5', name: 'CoreX GPU Module RTX 4090', price: 45990000, originalPrice: 48290000, image: '/products/gpu.png', sold: 5, total: 10 },
  { id: 'fs6', name: 'EliteBook G9 - Pro Edition', price: 32490000, originalPrice: 35190000, image: '/products/laptop.png', sold: 18, total: 20 },
];

export const FlashSaleSection = ({ products: dbProducts }: { products?: any[] | null }) => {
  const { language, theme } = useSettingsStore();
  const t = translations[language];
  const [startIndex, setStartIndex] = React.useState(0);
  const displayCount = 5;

  const currentProducts = dbProducts && dbProducts.length > 0 ? dbProducts.map(p => ({
    ...p,
    originalPrice: p.original_price || p.price * 1.2,
    sold: Math.floor(Math.random() * 20), // Giả lập số lượng bán cho DB products
    total: 30
  })) : MOCK_PRODUCTS;

  const nextSlide = () => {
    if (startIndex + displayCount < currentProducts.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 relative">
      {/* Intense Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className={cn(
        "rounded-[3rem] overflow-hidden border-2 relative transition-all duration-500",
        theme === 'dark' ? "bg-slate-950/80 border-primary/20" : "bg-white border-primary/20 shadow-2xl"
      )}>
        {/* Animated Border Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />

        {/* Header Section */}
        <div className={cn(
          "flex flex-col lg:flex-row items-center justify-between px-12 py-12 border-b gap-10",
          theme === 'dark' ? "border-white/5" : "border-slate-100"
        )}>
          <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
              <div className="relative flex items-center gap-6">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] rotate-3">
                   <Activity size={40} className="text-white animate-bounce" />
                </div>
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Live Sequence Active</span>
                   </div>
                   <h2 className={cn("text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl", theme === 'dark' ? "text-white" : "text-slate-900")}>
                     FLASH <span className="text-primary text-glow">SALE</span>
                   </h2>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] ml-2">Sequence Ends In</span>
               <div className={cn(
                 "flex items-center gap-6 px-10 py-5 rounded-[2rem] border-2 transition-all shadow-inner",
                 theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
               )}>
                  <CountdownTimer />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex gap-2 mr-4 hidden md:block">
                 {/* Arrows removed from header */}
             </div>
             <Link href="/flash-sale">
                <button className="group relative px-12 py-5 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] overflow-hidden shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95 transition-all">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   {t.accessFullDatabase}
                </button>
             </Link>
          </div>
        </div>

        {/* Product Carousel Area */}
        <div className="p-10 bg-gradient-to-b from-primary/5 to-transparent relative group/carousel">
           {/* Floating Navigation Arrows */}
           <button 
              onClick={prevSlide}
              disabled={startIndex === 0}
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100",
                startIndex === 0 ? "hidden" : "bg-white/10 border-white/20 text-white hover:bg-primary hover:border-primary shadow-2xl"
              )}
           >
              <ChevronRight size={24} className="rotate-180" />
           </button>
           
           <button 
              onClick={nextSlide}
              disabled={startIndex + displayCount >= currentProducts.length}
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100",
                startIndex + displayCount >= currentProducts.length ? "hidden" : "bg-white/10 border-white/20 text-white hover:bg-primary hover:border-primary shadow-2xl"
              )}
           >
              <ChevronRight size={24} />
           </button>

           <motion.div 
             initial={false}
             animate={{ x: 0 }}
             className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
           >
              {currentProducts.slice(startIndex, startIndex + displayCount).map((p: any) => (
                <FlashSaleCard key={p.id} {...p} theme={theme} t={t} />
              ))}
           </motion.div>
        </div>
      </div>
    </section>
  );
};

const FlashSaleCard = ({ id, name, price, originalPrice, image, sold, total, theme, t }: any) => {
  const percentSold = (sold / total) * 100;
  const { addItem } = useCartStore();
  const router = useRouter();
  
  return (
    <motion.div 
      whileHover={{ y: -12, scale: 1.05 }}
      onClick={() => router.push(`/product/${id}`)}
      className={cn(
        "backdrop-blur-xl rounded-[2.5rem] p-6 flex flex-col cursor-pointer border-2 transition-all group relative overflow-hidden",
        theme === 'dark' 
          ? "bg-slate-900/40 border-white/5 hover:border-primary hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]" 
          : "bg-white border-slate-100 hover:border-primary hover:shadow-2xl shadow-xl"
      )}
    >
      {/* Intense Animated Border for Flash Sale */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <div className="absolute inset-[-2px] bg-gradient-to-r from-primary via-red-500 to-primary animate-spin-slow blur-sm opacity-30" />
      </div>

      {/* Discount Badge - Floating & Glowing */}
      <div className="absolute top-4 left-4 z-30 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
      </div>

      {/* Scanning HUD Effect over Image */}
      <div className={cn(
        "relative aspect-square mb-6 group/img rounded-[2rem] overflow-hidden p-6 border transition-all duration-500",
        theme === 'dark' ? "bg-black/40 border-white/5 shadow-inner" : "bg-slate-50 border-slate-100"
      )}>
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all" />
        
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 blur-sm animate-scan z-20 pointer-events-none opacity-0 group-hover:opacity-100" />
        
        <Image 
          src={image} 
          alt={name} 
          fill 
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-700 relative z-10 rounded-2xl drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
        />
        
        {/* Quick Spec Button */}
        <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover/img:opacity-100 transition-all scale-90 group-hover/img:scale-100">
           <div className="px-6 py-2.5 bg-primary/90 backdrop-blur-xl border border-white/20 rounded-xl text-[10px] font-black uppercase text-white tracking-[0.2em] shadow-2xl">
              XEM CHI TIẾT
           </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <h3 className={cn("text-sm font-black uppercase tracking-tight line-clamp-2 mb-4 h-10 leading-tight group-hover:text-primary transition-colors", theme === 'dark' ? "text-white" : "text-slate-800")}>
          {name}
        </h3>
        
        <div className="mb-6 flex flex-col">
          <div className="flex items-center gap-3">
             <div className="text-3xl font-black tracking-tighter text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
               {price.toLocaleString('vi-VN')}₫
             </div>
             <div className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded border border-red-500/20">HOT</div>
          </div>
          <div className="text-[10px] text-slate-500 line-through font-bold uppercase tracking-[0.2em] mt-1">{originalPrice.toLocaleString('vi-VN')}₫</div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-6 opacity-100 transition-all duration-500">
           <button 
             onClick={(e) => { e.stopPropagation(); addItem({ id, name, price, image }); toast.success('Đã thêm vào giỏ!'); }}
             className={cn(
               "w-full h-11 border rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
               theme === 'dark' ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
             )}
           >
              Thêm vào giỏ
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); addItem({ id, name, price, image }); router.push('/checkout'); }}
             className="w-full h-11 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/30"
           >
              Mua ngay
           </button>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2 px-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đã bán {sold}</span>
             </div>
             <span className="text-[9px] font-black text-primary uppercase tracking-widest">{Math.round(percentSold)}%</span>
          </div>
          <div className={cn(
            "relative h-2 rounded-full overflow-hidden transition-all duration-500 border border-white/5",
            theme === 'dark' ? "bg-white/5" : "bg-slate-100"
          )}>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: `${percentSold}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-blue-400 to-primary animate-shimmer-slow" 
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
