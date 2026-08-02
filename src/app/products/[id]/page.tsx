'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ShoppingCart, Star, ShieldCheck, Truck, RefreshCcw, Heart, Share2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock Data
const PRODUCT = {
  id: '1',
  name: 'Laptop ASUS ROG Strix G16 G614JV-N3038W (Intel Core i7-13650HX | RTX 4060 | 16GB DDR5 | 512GB SSD | 16 inch WUXGA 165Hz)',
  price: 34990000,
  originalPrice: 38990000,
  discount: 10,
  rating: 4.8,
  reviewsCount: 124,
  specs: [
    { label: 'CPU', value: 'Intel Core i7-13650HX (2.6GHz up to 4.9GHz, 24MB cache)' },
    { label: 'RAM', value: '16GB DDR5 4800MHz (2x8GB, tối đa 32GB)' },
    { label: 'Ổ cứng', value: '512GB SSD M.2 NVMe PCIe 4.0' },
    { label: 'VGA', value: 'NVIDIA GeForce RTX 4060 8GB GDDR6' },
    { label: 'Màn hình', value: '16 inch WUXGA (1920 x 1200) 165Hz, IPS' },
    { label: 'Trọng lượng', value: '2.5 kg' },
    { label: 'Pin', value: '90WHrs' },
  ]
};

export default function ProductDetailPage() {
  const [selectedImg, setSelectedImg] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-muted/30 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hover:text-primary cursor-pointer">Trang chủ</span>
            <ChevronRight size={12} />
            <span className="hover:text-primary cursor-pointer">Laptop</span>
            <ChevronRight size={12} />
            <span className="text-slate-900 font-medium truncate">{PRODUCT.name}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Gallery */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-3xl border bg-muted/20 overflow-hidden">
               {/* Placeholder for Main Image */}
               <div className="w-full h-full bg-slate-200 animate-pulse flex items-center justify-center text-slate-400 font-bold">
                 [HÌNH ẢNH SẢN PHẨM]
               </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all",
                    selectedImg === i ? "border-primary shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="w-full h-full bg-slate-100" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-7">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-snug mb-4">
                {PRODUCT.name}
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < 4 ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-900">{PRODUCT.rating}</span>
                  <span className="text-sm text-slate-400">({PRODUCT.reviewsCount} đánh giá)</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="text-sm text-slate-500">Mã: SKU-92384723</div>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-2xl p-6 mb-8 flex flex-wrap items-end gap-6">
              <div>
                <div className="text-slate-500 text-sm mb-1 line-through">{mounted ? PRODUCT.originalPrice.toLocaleString('vi-VN') : PRODUCT.originalPrice}₫</div>
                <div className="text-4xl font-black text-primary">{mounted ? PRODUCT.price.toLocaleString('vi-VN') : PRODUCT.price}₫</div>
              </div>
              <div className="bg-accent text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                Tiết kiệm { mounted ? (PRODUCT.originalPrice - PRODUCT.price).toLocaleString('vi-VN') : (PRODUCT.originalPrice - PRODUCT.price) }₫
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                <ShoppingCart size={22} />
                MUA NGAY
              </button>
              <button className="h-14 px-8 border-2 border-primary text-primary rounded-2xl font-bold hover:bg-primary/5 transition-all active:scale-95">
                THÊM VÀO GIỎ
              </button>
              <button className="h-14 w-14 border rounded-2xl flex items-center justify-center text-slate-400 hover:text-accent hover:border-accent transition-all">
                <Heart size={22} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-xs">
                  <div className="font-bold">Bảo hành 24 tháng</div>
                  <div className="text-slate-500">Chính hãng ASUS</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Truck size={20} />
                </div>
                <div className="text-xs">
                  <div className="font-bold">Giao hàng miễn phí</div>
                  <div className="text-slate-500">Trong 2 giờ nội thành</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <RefreshCcw size={20} />
                </div>
                <div className="text-xs">
                  <div className="font-bold">Đổi trả dễ dàng</div>
                  <div className="text-slate-500">Trong 30 ngày lỗi SX</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">Đặc điểm nổi bật</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
              <p className="mb-4">
                <strong>Laptop Gaming ASUS ROG Strix G16 G614JV-N3038W</strong> là biểu tượng mới của sức mạnh và phong cách. 
                Được trang bị bộ vi xử lý Intel Core i7 thế hệ 13 và card đồ họa NVIDIA RTX 40-Series mới nhất, 
                đây là cỗ máy sẵn sàng cân mọi tựa game AAA đỉnh cao nhất hiện nay.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Hiệu năng đỉnh cao với CPU i7-13650HX.</li>
                <li>Công nghệ DLSS 3 và Ray Tracing thế hệ mới.</li>
                <li>Hệ thống tản nhiệt ROG Intelligent Cooling tiên tiến.</li>
                <li>Màn hình ROG Nebula 16 inch 165Hz siêu mượt.</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/20 rounded-3xl p-6 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
              Thông số kỹ thuật
              <button className="text-primary text-xs font-medium hover:underline">Xem chi tiết</button>
            </h2>
            <div className="space-y-4">
              {PRODUCT.specs.map((spec, i) => (
                <div key={i} className="flex flex-col gap-1 border-b border-white pb-3 last:border-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{spec.label}</span>
                  <span className="text-sm text-slate-800 font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
