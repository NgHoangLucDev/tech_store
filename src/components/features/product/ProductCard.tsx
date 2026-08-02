'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  discount?: number;
  onClick?: () => void;
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewsCount,
  discount,
  onClick,
}: ProductCardProps) => {
  const { addItem } = useCartStore();
  const { theme } = useSettingsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Motion values for tilt coordinate tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the coordinates with spring physics
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 25 });

  // Transforms to convert coordinates to rotation degrees (tilt)
  const rotateX = useTransform(mouseYSpring, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-100, 100], [-10, 10]);

  // Transforms to shift the image inside (parallax depth)
  const imgX = useTransform(mouseXSpring, [-100, 100], [-12, 12]);
  const imgY = useTransform(mouseYSpring, [-100, 100], [-12, 12]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/product/${id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id, name, price, image });
    toast.success('Đã thêm vào giỏ!');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized value between -100 and 100 representing position relative to center
    const mouseX = ((e.clientX - rect.left) / width - 0.5) * 200;
    const mouseY = ((e.clientY - rect.top) / height - 0.5) * 200;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="perspective-1000 w-full h-full">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        className={cn(
          "backdrop-blur-md rounded-[2rem] border p-6 transition-[background-color,border-color,box-shadow] duration-500 relative overflow-hidden flex flex-col h-full cursor-pointer group",
          theme === 'dark' ? "bg-slate-900/40 border-white/5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5" : "bg-white border-slate-200 shadow-sm hover:shadow-2xl hover:border-primary/30 hover:shadow-primary/5"
        )}
      >
        {/* Background Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Image Container */}
        <div 
          style={{
            transform: 'translateZ(35px)',
            transformStyle: 'preserve-3d',
          }}
          className={cn(
            "relative aspect-square mb-6 overflow-hidden rounded-[2rem] flex items-center justify-center p-4 border transition-[background-color,border-color,box-shadow] duration-500",
            theme === 'dark' ? "bg-white/5 border-white/5 shadow-inner" : "bg-slate-50 border-slate-100 shadow-inner"
          )}
        >
          <motion.div 
            style={{
              x: imgX,
              y: imgY,
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full h-full group-hover:scale-105 transition-transform duration-700"
          >
            {image ? (
              <Image src={image} alt={name} fill className="object-contain rounded-2xl" style={{ transform: 'translateZ(15px)' }} />
            ) : (
              <div className="w-full h-full bg-slate-800 rounded-2xl animate-pulse" />
            )}
          </motion.div>
          
          {/* Quick View Overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ transform: 'translateZ(20px)' }}>
             <div className="px-6 py-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black uppercase text-white tracking-widest shadow-2xl">
                Xem chi tiết
             </div>
          </div>

          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 left-4 z-20 bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest" style={{ transform: 'translateZ(25px)' }}>
              -{discount}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-2 mb-2">
             <div className="flex gap-0.5">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={cn("w-1 h-1 rounded-full transition-colors", i < Math.floor(rating) ? "bg-primary" : (theme === 'dark' ? "bg-slate-700" : "bg-slate-200"))} />
               ))}
             </div>
             <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{reviewsCount} Units</span>
          </div>

          <h3 className={cn("text-sm font-black uppercase tracking-tight line-clamp-2 mb-4 leading-tight group-hover:text-primary transition-colors", theme === 'dark' ? "text-white" : "text-slate-800")}>
            {name}
          </h3>

          {/* Price & Actions Area */}
          <div className="mt-auto space-y-4">
            <div className="flex flex-col">
               {originalPrice && (
                <span className="text-[10px] text-slate-500 line-through font-bold uppercase tracking-widest">
                  {mounted ? originalPrice.toLocaleString('vi-VN') : originalPrice}₫
                </span>
              )}
              <span className={cn("text-2xl font-black tracking-tighter group-hover:text-primary transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
                {mounted ? price.toLocaleString('vi-VN') : price}₫
              </span>
            </div>

            {/* New Hover Actions */}
            <div className="flex flex-col gap-2 opacity-100 transition-all duration-500">
               <button 
                 onClick={handleAddToCart}
                 className={cn(
                   "w-full h-12 border rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2",
                   theme === 'dark' ? "bg-white/5 hover:bg-white/10 border-white/10 text-white" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                 )}
               >
                  Thêm vào giỏ
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); addItem({ id, name, price, image }); router.push('/checkout'); }}
                 className="w-full h-12 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-primary/20"
               >
                  Mua ngay
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
