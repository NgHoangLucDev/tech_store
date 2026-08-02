'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface QuickViewProps {
  product: any | null;
  onClose: () => void;
}

export const ProductQuickView = ({ product, onClose }: QuickViewProps) => {
  const { addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              layoutId={`card-${product.id}`}
              className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row relative"
            >
              <button
                onClick={onClose}
                className="absolute top-8 right-8 z-10 p-3 bg-muted hover:bg-slate-200 rounded-full transition-all active:scale-95"
              >
                <X size={20} />
              </button>

              {/* Left: Image Section */}
              <div className="w-full md:w-1/2 bg-muted/30 p-12 flex items-center justify-center relative">
                <motion.div
                  layoutId={`image-${product.id}`}
                  className="relative aspect-square w-full max-w-[400px]"
                >
                  <Image
                    src={typeof product.image === 'string' && product.image ? product.image : '/laptop.png'}
                    alt={product.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Right: Info Section */}
              <div className="w-full md:w-1/2 p-12 flex flex-col">
                <div className="mb-8">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    Sản phẩm cao cấp
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-6 leading-tight tracking-tighter">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">({product.reviewsCount} Đánh giá)</span>
                  </div>
                </div>

                <div className="mb-10">
                    <div className="text-4xl font-black text-primary tracking-tighter">
                      {mounted ? product.price.toLocaleString('vi-VN') : product.price}₫
                    </div>
                   {product.originalPrice && (
                      <div className="text-sm text-slate-400 line-through mt-1 font-medium">
                        {mounted ? product.originalPrice.toLocaleString('vi-VN') : product.originalPrice}₫
                      </div>
                   )}
                </div>

                <div className="space-y-5 mb-12">
                   <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                     <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                       <ShieldCheck size={20} />
                     </div>
                     Bảo hành chính hãng 24 tháng toàn quốc
                   </div>
                   <div className="flex items-center gap-4 text-sm text-slate-600 font-medium">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                       <Truck size={20} />
                     </div>
                     Miễn phí giao hàng & Lắp đặt tận nơi
                   </div>
                </div>

                <div className="mt-auto flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-16 bg-primary text-white rounded-[1.25rem] font-black flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95 uppercase text-sm tracking-widest"
                  >
                    <ShoppingCart size={20} />
                    THÊM VÀO GIỎ
                  </button>
                  <button 
                    onClick={onClose}
                    className="h-16 px-8 border-2 border-slate-100 rounded-[1.25rem] font-black text-slate-400 hover:bg-muted hover:text-slate-600 transition-all active:scale-95 uppercase text-sm tracking-widest"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
