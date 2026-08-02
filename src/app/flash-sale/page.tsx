'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/features/product/ProductCard';
import { ALL_PRODUCTS } from '@/lib/data';
import { Filter, ChevronDown, Grid, List as ListIcon, Zap, Activity, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CountdownTimer } from '@/components/features/home/CountdownTimer';
import Link from 'next/link';

export default function FlashSalePage() {
  const { theme } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('discount');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const PRICE_RANGES = {
    'Dưới 10 triệu': { min: 0, max: 10000000 },
    '10 - 20 triệu': { min: 10000000, max: 20000000 },
    '20 - 50 triệu': { min: 20000000, max: 50000000 },
    'Trên 50 triệu': { min: 50000000, max: Infinity },
  };

  useEffect(() => {
    setMounted(true);
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((p: any) => {
            const price = parseFloat(p.price) || 0;
            const originalPrice = p.original_price ? parseFloat(p.original_price) : undefined;
            const discount = (originalPrice && originalPrice > price) 
              ? Math.round(((originalPrice - price) / originalPrice) * 100) 
              : undefined;
            return {
              id: p.id.toString(),
              name: p.name,
              price,
              originalPrice,
              discount,
              image: p.image || '/laptop.png',
              rating: parseFloat(p.rating) || 4.8,
              reviewsCount: parseInt(p.reviewsCount) || 45,
              category: p.category_name || 'Khác',
              category_name: p.category_name,
              category_id: p.category_id,
              slug: p.slug,
              specs: p.specs,
              is_flash_sale: p.is_flash_sale
            };
          });
          setDbProducts(formatted);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu MySQL:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (!mounted) return null;

  // Filter products that are actually on sale
  const flashSaleProducts = dbProducts.filter(p => p.is_flash_sale === 1)
    .map(p => ({
      ...p,
      discount: p.discount || (p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0)
    }));

  const categories = Array.from(new Set(flashSaleProducts.map(p => p.category)));

  const toggleFilter = (opt: string) => {
    setActiveFilters(prev => 
      prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
    );
  };

  const filteredProducts = flashSaleProducts.filter(product => {
    // Category filtering
    const categoryFilters = activeFilters.filter(f => categories.includes(f));
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(product.category);

    // Price filtering
    const priceFilters = activeFilters.filter(f => Object.keys(PRICE_RANGES).includes(f));
    const matchesPrice = priceFilters.length === 0 || priceFilters.some(rangeLabel => {
      const range = PRICE_RANGES[rangeLabel as keyof typeof PRICE_RANGES];
      return product.price >= range.min && product.price < range.max;
    });

    return matchesCategory && matchesPrice;
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'discount') return b.discount - a.discount;
    return 0;
  });

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      <Header />

      {/* Hero Header */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
               <Activity size={14} className="animate-pulse" />
               Live Sequence Active
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none drop-shadow-2xl">
              FLASH <span className="text-primary text-glow">SALE</span>
            </h1>
            <div className="flex flex-col items-center gap-3">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Sequence Ends In</span>
               <div className={cn(
                 "flex items-center gap-8 px-12 py-6 rounded-[2.5rem] border-2 transition-all shadow-inner",
                 theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
               )}>
                  <CountdownTimer />
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-6 pb-32">
        {/* Breadcrumbs HUD */}
        <nav className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar">
           <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary cursor-pointer transition-colors">Trang chủ</Link>
           <ChevronRight size={12} className="text-slate-700" />
           <span className="text-[9px] font-black uppercase tracking-widest text-primary">Flash Sale Database</span>
        </nav>
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Filter Sidebar */}
          <aside className={cn(
            "w-80 flex-shrink-0 transition-all duration-500",
            isFilterOpen ? "translate-x-0 opacity-100" : "-ml-80 opacity-0 pointer-events-none hidden lg:block"
          )}>
            <div className={cn(
              "sticky top-32 rounded-[3rem] p-8 border transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/5 shadow-inner" : "bg-white border-slate-200 shadow-xl"
            )}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-black text-xl flex items-center gap-3 italic">
                  <Zap size={24} className="text-primary" />
                  BỘ LỌC
                </h2>
                {activeFilters.length > 0 && (
                  <button 
                    onClick={() => setActiveFilters([])}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 text-slate-500">Danh mục hệ thống</h3>
                  <div className="flex flex-col gap-3">
                    {categories.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => toggleFilter(cat)}
                        className={cn(
                          "flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                          activeFilters.includes(cat) 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : theme === 'dark' ? "bg-white/5 text-slate-400 border-white/5 hover:border-white/20" : "bg-slate-50 text-slate-600 border-slate-100 hover:border-primary/30"
                        )}
                      >
                        {cat}
                        {activeFilters.includes(cat) && <Zap size={12} fill="currentColor" />}
                      </button>
                    ))}
                  </div>

                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.3em] mb-6 text-slate-500">Phân khúc giá</h3>
                  <div className="flex flex-col gap-3">
                    {Object.keys(PRICE_RANGES).map((price, i) => (
                      <button
                        key={i}
                        onClick={() => toggleFilter(price)}
                        className={cn(
                          "flex items-center justify-between px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border",
                          activeFilters.includes(price) 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                            : theme === 'dark' ? "bg-white/5 text-slate-400 border-white/5 hover:border-white/20" : "bg-slate-50 text-slate-600 border-slate-100 hover:border-primary/30"
                        )}
                      >
                        {price}
                        {activeFilters.includes(price) && <Zap size={12} fill="currentColor" />}
                      </button>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className={cn(
              "rounded-[2.5rem] border p-4 mb-12 flex flex-wrap items-center justify-between gap-6 transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  <Filter size={16} />
                  {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                </button>
                <div className="hidden sm:flex gap-3">
                  {activeFilters.map((f, i) => (
                    <span key={i} className="px-4 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-primary"
                    )}
                  >
                    <Grid size={20} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-500 hover:text-primary"
                    )}
                  >
                    <ListIcon size={20} />
                  </button>
                </div>
                <div className="relative group">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className={cn(
                      "appearance-none border rounded-2xl px-8 py-3 pr-12 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all",
                      theme === 'dark' ? "bg-white/5 border-white/5 text-white hover:border-primary/50" : "bg-slate-50 border-slate-100 text-slate-900 hover:border-primary/50"
                    )}
                  >
                    <option value="discount">Giảm giá nhiều nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" size={16} />
                </div>
              </div>
            </div>

            {/* Grid */}
            {!loading && (
              <AnimatePresence mode='wait'>
                <motion.div 
                  layout
                  className={cn(
                    "grid gap-10 transition-all duration-500",
                    viewMode === 'grid' 
                      ? (isFilterOpen ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4")
                      : "grid-cols-1"
                  )}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      {...product} 
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {loading ? (
              <div className="text-center py-32 font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
                Đang tải dữ liệu Flash Sale...
              </div>
            ) : filteredProducts.length === 0 && (
              <div className="text-center py-32 space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 text-slate-500">
                  <Zap size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic">Không tìm thấy dữ liệu</h3>
                  <p className="text-slate-500 font-medium mt-2">Vui lòng điều chỉnh bộ lọc hoặc quay lại sau.</p>
                </div>
                <button onClick={() => setActiveFilters([])} className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Xóa tất cả bộ lọc</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      <style jsx global>{`
        .text-glow {
          text-shadow: 0 0 30px rgba(59,130,246,0.5);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
