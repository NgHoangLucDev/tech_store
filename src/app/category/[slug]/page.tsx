'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/features/product/ProductCard';
import { ALL_PRODUCTS } from '@/lib/data';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Filter, SlidersHorizontal, ChevronDown, LayoutGrid, List, ChevronRight } from 'lucide-react';
import Image from 'next/image';

export default function CategoryPage() {
  const { slug } = useParams();
  const { theme } = useSettingsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS);

  const PRICE_RANGES = {
     'Dưới 10 triệu': { min: 0, max: 10000000 },
     '10 - 20 triệu': { min: 10000000, max: 20000000 },
     '20 - 50 triệu': { min: 20000000, max: 50000000 },
     'Trên 50 triệu': { min: 50000000, max: Infinity },
  };

  const toggleFilter = (filter: string) => {
     setActiveFilters(prev => 
        prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
     );
  };

  useEffect(() => {
    setMounted(true);
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const dbData = await res.json();
        if (Array.isArray(dbData)) {
          const formatted = dbData.map((p: any) => {
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
              category: p.category_slug || p.slug || p.category_name?.toLowerCase() || '',
              specs: p.specs
            };
          });
          setProducts([...formatted, ...ALL_PRODUCTS]);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu từ MySQL:", err);
      }
    };
    loadProducts();
  }, []);

  const categoryProducts = useMemo(() => {
    let filtered = products.filter(p => p.category === slug || slug === 'all' || (p.category && p.category.includes(String(slug))));
    
    const priceFilters = activeFilters.filter(f => Object.keys(PRICE_RANGES).includes(f));
    if (priceFilters.length > 0) {
      filtered = filtered.filter(product => {
        return priceFilters.some(rangeLabel => {
          const range = PRICE_RANGES[rangeLabel as keyof typeof PRICE_RANGES];
          return product.price >= range.min && product.price < range.max;
        });
      });
    }

    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    
    return filtered;
  }, [slug, sortBy, activeFilters, products]);

  const categoryName = useMemo(() => {
    switch (slug) {
      case 'laptops': return 'Máy tính xách tay';
      case 'displays': return 'Màn hình đồ họa';
      case 'peripherals': return 'Phụ kiện cao cấp';
      case 'components': return 'Linh kiện phần cứng';
      default: return 'Tất cả sản phẩm';
    }
  }, [slug]);

  if (!mounted) return null;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <Image src="/tech-bg.png" alt="BG" fill className="object-cover opacity-10" />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b",
          theme === 'dark' ? "from-slate-950 via-slate-950/80 to-slate-950" : "from-white via-slate-50/80 to-white"
        )} />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumbs HUD */}
        <nav className="flex items-center gap-3 mb-10 overflow-x-auto no-scrollbar">
           <Link href="/" className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary cursor-pointer transition-colors">Trang chủ</Link>
           <ChevronRight size={12} className="text-slate-700" />
           <span className="text-[9px] font-black uppercase tracking-widest text-primary truncate max-w-[200px]">{categoryName}</span>
        </nav>

        {/* Category Header HUD */}
        <header className="mb-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
                    {categoryName}
                 </h1>
                 <p className="mt-4 text-slate-500 font-medium max-w-xl">
                    Hệ thống đang truy xuất dữ liệu từ các module phần cứng cao cấp nhất. Mọi linh kiện đều được kiểm định chất lượng nghiêm ngặt.
                 </p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/5">
                 <button className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <LayoutGrid size={20} />
                 </button>
                 <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                    <List size={20} />
                 </button>
              </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Sidebar Filter */}
           <aside className="lg:col-span-3 space-y-8">
              <div className={cn(
                "backdrop-blur-xl rounded-[2.5rem] border p-8 transition-all duration-500",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl shadow-slate-200/20"
              )}>
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                     <div className="flex items-center gap-3">
                        <SlidersHorizontal size={18} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest">Bộ lọc tối ưu</h3>
                     </div>
                     {activeFilters.length > 0 && (
                        <button 
                          onClick={() => setActiveFilters([])}
                          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          Xóa tất cả
                        </button>
                     )}
                  </div>

                 <div className="space-y-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sắp xếp theo</h4>
                       <select 
                         value={sortBy}
                         onChange={(e) => setSortBy(e.target.value)}
                         className={cn(
                           "w-full h-12 rounded-xl px-4 outline-none border transition-all font-bold text-xs uppercase tracking-widest cursor-pointer",
                           theme === 'dark' ? "bg-slate-900 border-white/5 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                         )}
                       >
                          <option value="newest">Mới nhất</option>
                          <option value="price-low">Giá: Thấp đến Cao</option>
                          <option value="price-high">Giá: Cao đến Thấp</option>
                       </select>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phân khúc giá</h4>
                       <div className="space-y-2">
                           {Object.keys(PRICE_RANGES).map(price => (
                             <label 
                               key={price} 
                               className="flex items-center gap-3 group cursor-pointer"
                               onClick={() => toggleFilter(price)}
                             >
                                <div className={cn(
                                  "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                                  activeFilters.includes(price) ? "border-primary bg-primary" : "border-white/10 group-hover:border-primary"
                                )}>
                                   <div className={cn(
                                     "w-2 h-2 bg-white rounded-sm transition-opacity",
                                     activeFilters.includes(price) ? "opacity-100" : "opacity-0"
                                   )} />
                                </div>
                                <span className={cn(
                                  "text-[11px] font-bold transition-colors",
                                  activeFilters.includes(price) ? "text-white" : "text-slate-400 group-hover:text-white"
                                )}>
                                  {price}
                                </span>
                             </label>
                           ))}
                       </div>
                    </div>
                 </div>
              </div>

              {/* Status HUD */}
              <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 text-center">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Đã tìm thấy {categoryProducts.length} sản phẩm.
                 </p>
              </div>
           </aside>

           {/* Product Grid */}
           <div className="lg:col-span-9">
              {categoryProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                      <Filter size={40} />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-widest mb-2">Không tìm thấy sản phẩm</h3>
                   <p className="text-slate-500 text-sm">Thử thay đổi bộ lọc hoặc quay lại sau nhé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   <AnimatePresence mode="popLayout">
                      {categoryProducts.map((product, idx) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                           <ProductCard {...product} />
                        </motion.div>
                      ))}
                   </AnimatePresence>
                </div>
              )}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
