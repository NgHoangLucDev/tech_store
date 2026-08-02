'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/features/product/ProductCard';
import { Filter, ChevronDown, ChevronRight, Grid, List as ListIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductQuickView } from '@/components/features/product/ProductQuickView';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ALL_PRODUCTS } from '@/lib/data';

const getDynamicFilters = (categorySlug: string) => {
  const slug = (categorySlug || '').toLowerCase();

  // 1. Laptop / Máy tính
  if (slug === 'computers' || slug.includes('laptop') || slug === 'pc-gvn') {
    return [
      { name: 'Thương hiệu', options: ['ASUS', 'Apple', 'Dell', 'MSI', 'HP', 'Lenovo', 'Acer'] },
      { name: 'Mức giá', options: ['Dưới 15 triệu', '15 - 25 triệu', '25 - 35 triệu', 'Trên 35 triệu'] },
      { name: 'CPU', options: ['Intel Core i9', 'Intel Core i7', 'Intel Core i5', 'Apple M3', 'AMD Ryzen 7'] },
      { name: 'RAM', options: ['8GB', '16GB', '32GB', '64GB'] },
      { name: 'Card đồ họa (VGA)', options: ['RTX 4090', 'RTX 4080', 'RTX 4070', 'RTX 4060', 'RTX 3050'] }
    ];
  }

  // 2. Màn hình
  if (slug.includes('man-hinh') || slug.includes('display')) {
    return [
      { name: 'Thương hiệu', options: ['ASUS', 'Dell', 'LG', 'Samsung', 'GIGABYTE'] },
      { name: 'Kích thước', options: ['24"', '27"', '32"', 'Cong'] },
      { name: 'Tần số quét', options: ['60Hz', '144Hz', '165Hz', '180Hz', '240Hz'] },
      { name: 'Mức giá', options: ['Dưới 5 triệu', '5 - 10 triệu', '10 - 20 triệu', 'Trên 20 triệu'] }
    ];
  }

  // 3. Bàn phím
  if (slug.includes('ban-phim') || slug.includes('keyboard')) {
    return [
      { name: 'Thương hiệu', options: ['Akko', 'Logitech', 'Keychron', 'Razer', 'Corsair'] },
      { name: 'Loại switch', options: ['Red Switch', 'Blue Switch', 'Brown Switch', 'Green Switch'] },
      { name: 'Mức giá', options: ['Dưới 1 triệu', '1 - 3 triệu', 'Trên 3 triệu'] }
    ];
  }

  // 4. Tai nghe
  if (slug.includes('tai-nghe') || slug.includes('headphone')) {
    return [
      { name: 'Thương hiệu', options: ['Razer', 'Logitech', 'HyperX', 'Sony', 'Asus'] },
      { name: 'Chống ồn (ANC)', options: ['ANC', 'Chống ồn chủ động'] },
      { name: 'Kết nối', options: ['Wireless', 'Bluetooth', 'Có dây'] },
      { name: 'Mức giá', options: ['Dưới 1 triệu', '1 - 3 triệu', '3 - 5 triệu', 'Trên 5 triệu'] }
    ];
  }

  // 5. Linh kiện PC (Main, CPU, VGA, Case, RAM, SSD...)
  if (slug === 'components' || slug.includes('linh-kien') || ['main-cpu-vga', 'case-nguon-tan', 'o-cung-ram-the-nho'].includes(slug)) {
    return [
      { name: 'Thương hiệu', options: ['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'NZXT', 'Corsair', 'Samsung', 'Kingston'] },
      { name: 'Loại linh kiện', options: ['CPU', 'VGA', 'Mainboard', 'RAM', 'SSD', 'Nguồn', 'Case', 'Tản'] },
      { name: 'Mức giá', options: ['Dưới 2 triệu', '2 - 5 triệu', '5 - 15 triệu', 'Trên 15 triệu'] }
    ];
  }

  // 6. Chuột
  if (slug.includes('chuot') || slug.includes('mouse')) {
    return [
      { name: 'Thương hiệu', options: ['Logitech', 'Razer', 'SteelSeries', 'Corsair'] },
      { name: 'Phân loại', options: ['Chuột Gaming', 'Chuột văn phòng', 'Lót chuột'] },
      { name: 'Mức giá', options: ['Dưới 500k', '500k - 1.5 triệu', 'Trên 1.5 triệu'] }
    ];
  }

  // 7. Tổng hợp (khi Tìm kiếm hoặc xem Tất cả danh mục gốc)
  return [
    { name: 'Danh mục', options: ['Laptop', 'Màn hình', 'Phụ kiện', 'Linh kiện', 'Tai nghe', 'Ghế - Bàn'] },
    { name: 'Thương hiệu', options: ['ASUS', 'Apple', 'Dell', 'MSI', 'Logitech', 'Razer', 'Acer', 'Intel', 'AMD'] },
    { name: 'Mức giá', options: ['Dưới 5 triệu', '5 - 15 triệu', '15 - 30 triệu', 'Trên 30 triệu'] },
    { name: 'CPU / Chipset', options: ['Intel Core i9', 'Intel Core i7', 'Apple M3', 'AMD Ryzen 7'] },
    { name: 'Dung lượng RAM', options: ['8GB', '16GB', '32GB'] }
  ];
};

function ProductListingContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { theme } = useSettingsStore();

  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [products, setProducts] = useState<any[]>(ALL_PRODUCTS);
  const [mounted, setMounted] = useState(false);

  const categoryParam = searchParams.get('category') || '';

  useEffect(() => {
    setMounted(true);
    const loadProducts = async () => {
      let merged: any[] = [...ALL_PRODUCTS];
      try {
        const queryParams = new URLSearchParams();
        if (categoryParam) queryParams.append('category', categoryParam);
        
        const res = await fetch(`/api/products?${queryParams.toString()}`);
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
              brand: p.brand || 'Unknown',
              category: p.category_slug || p.slug || p.category_name?.toLowerCase() || '',
              specs: p.specs
            };
          });
          merged = [...formatted, ...ALL_PRODUCTS];
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu từ MySQL:", err);
      }
      
      // Loại bỏ các phần tử trùng lặp id
      const uniqueProducts: any[] = [];
      const seenIds = new Set();
      for (const item of merged) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueProducts.push(item);
        }
      }
      
      // Nếu có categoryParam trên URL và API không lọc hết (do mock data), lọc thêm ở client
      let finalProducts = uniqueProducts;
      if (categoryParam) {
        finalProducts = uniqueProducts.filter(p => 
          p.category && p.category.toLowerCase().includes(categoryParam.toLowerCase())
        );
      }
      
      setProducts(finalProducts);
    };
    loadProducts();
  }, [categoryParam, searchQuery]);

  const toggleFilter = (opt: string) => {
    setActiveFilters(prev => 
      prev.includes(opt) ? prev.filter(f => f !== opt) : [...prev, opt]
    );
  };

  const PRICE_RANGES: { [key: string]: { min: number, max: number } } = {
    'Dưới 500k': { min: 0, max: 500000 },
    '500k - 1.5 triệu': { min: 500000, max: 1500000 },
    'Trên 1.5 triệu': { min: 1500000, max: Infinity },
    'Dưới 1 triệu': { min: 0, max: 1000000 },
    '1 - 3 triệu': { min: 1000000, max: 3000000 },
    'Trên 3 triệu': { min: 3000000, max: Infinity },
    '3 - 5 triệu': { min: 3000000, max: 5000000 },
    'Trên 5 triệu': { min: 5000000, max: Infinity },
    'Dưới 2 triệu': { min: 0, max: 2000000 },
    '2 - 5 triệu': { min: 2000000, max: 5000000 },
    '5 - 15 triệu': { min: 5000000, max: 15000000 },
    'Trên 15 triệu': { min: 15000000, max: Infinity },
    'Dưới 5 triệu': { min: 0, max: 5000000 },
    '5 - 10 triệu': { min: 5000000, max: 10000000 },
    '10 - 20 triệu': { min: 10000000, max: 20000000 },
    'Trên 20 triệu': { min: 20000000, max: Infinity },
    'Dưới 10 triệu': { min: 0, max: 10000000 },
    '20 - 30 triệu': { min: 20000000, max: 30000000 },
    'Dưới 15 triệu': { min: 0, max: 15000000 },
    '15 - 25 triệu': { min: 15000000, max: 25000000 },
    '25 - 35 triệu': { min: 25000000, max: 35000000 },
    'Trên 35 triệu': { min: 35000000, max: Infinity }
  };

  const currentFilters = searchQuery ? getDynamicFilters('') : getDynamicFilters(categoryParam);

  const getFilterGroup = (val: string) => {
    if (val.includes('triệu') || val.includes('k') || val.startsWith('Dưới') || val.startsWith('Trên')) {
      return 'price';
    }
    const parentGroup = currentFilters.find(group => group.options.includes(val));
    if (parentGroup) {
      const n = parentGroup.name;
      if (n === 'Danh mục' || n === 'Loại linh kiện' || n === 'Phân loại') return 'category';
      if (n === 'Thương hiệu') return 'brand';
      if (n === 'CPU' || n === 'CPU / Chipset' || n === 'Loại switch') return 'cpu';
      if (n === 'RAM' || n === 'Dung lượng RAM' || n === 'Tần số quét' || n === 'Kích thước' || n === 'Kết nối' || n === 'Chống ồn (ANC)') return 'ram';
      if (n === 'Card đồ họa (VGA)') return 'vga';
    }
    return 'other';
  };

  // Actual Filtering Logic
  const filteredProducts = products.filter(product => {
    // 1. Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(q) || 
        (product.brand && product.brand.toLowerCase().includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    if (activeFilters.length === 0) return true;
    
    // Group active filters by category
    const groupedSelected: { [key: string]: string[] } = {
      price: [],
      category: [],
      brand: [],
      cpu: [],
      ram: [],
      vga: [],
      other: []
    };

    activeFilters.forEach(f => {
      const g = getFilterGroup(f);
      if (groupedSelected[g]) {
        groupedSelected[g].push(f);
      }
    });

    // 2. Price filter (OR in same group)
    const matchesPrice = groupedSelected.price.length === 0 || groupedSelected.price.some(rangeLabel => {
      const range = PRICE_RANGES[rangeLabel];
      if (!range) return false;
      return product.price >= range.min && product.price < range.max;
    });

    // 3. Category filter (OR in same group)
    const matchesCategory = groupedSelected.category.length === 0 || groupedSelected.category.some(cat => {
      const f = cat.toLowerCase();
      if (f === 'laptop') return product.category && (product.category.includes('laptop') || product.category.includes('laptops'));
      if (f === 'màn hình') return product.category && (product.category.includes('display') || product.category.includes('man-hinh'));
      if (f === 'phụ kiện') return product.category && (product.category.includes('peripheral') || product.category.includes('phu-kien'));
      if (f === 'linh kiện') return product.category && (product.category.includes('component') || product.category.includes('linh-kien'));
      if (f === 'tai nghe') return product.category && product.category.includes('tai-nghe');
      
      // Dynamic component types (CPU, VGA, Mainboard, Case, RAM, SSD...)
      if (['cpu', 'vga', 'mainboard', 'ram', 'ssd', 'nguồn', 'case', 'tản'].includes(f)) {
        if (product.name.toLowerCase().includes(f)) return true;
      }
      return product.category && product.category.toLowerCase().includes(f);
    });

    // 4. Brand filter (OR in same group)
    const matchesBrand = groupedSelected.brand.length === 0 || groupedSelected.brand.some(brand => {
      return product.brand && product.brand.toLowerCase() === brand.toLowerCase();
    });

    // 5. CPU & Switches filter (OR in same group)
    const matchesCpu = groupedSelected.cpu.length === 0 || groupedSelected.cpu.some(cpu => {
      if (!product.specs) return false;
      try {
        const specsStr = typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs);
        return specsStr.toLowerCase().includes(cpu.toLowerCase()) || product.name.toLowerCase().includes(cpu.toLowerCase());
      } catch (e) {
        return false;
      }
    });

    // 6. RAM & Specs filter (OR in same group)
    const matchesRam = groupedSelected.ram.length === 0 || groupedSelected.ram.some(ram => {
      if (!product.specs) return false;
      try {
        const specsStr = typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs);
        return specsStr.toLowerCase().includes(ram.toLowerCase()) || product.name.toLowerCase().includes(ram.toLowerCase());
      } catch (e) {
        return false;
      }
    });

    // 7. VGA filter (OR in same group)
    const matchesVga = groupedSelected.vga.length === 0 || groupedSelected.vga.some(vga => {
      if (!product.specs) return false;
      try {
        const specsStr = typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs);
        return specsStr.toLowerCase().includes(vga.toLowerCase()) || product.name.toLowerCase().includes(vga.toLowerCase());
      } catch (e) {
        return false;
      }
    });

    // Combine all filters using AND relationship across groups
    return matchesPrice && matchesCategory && matchesBrand && matchesCpu && matchesRam && matchesVga;
  }).sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    return 0; // Default newest
  });

  if (!mounted) return null;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 selection:bg-primary selection:text-white relative overflow-hidden",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/tech-bg.png" alt="BG" fill className="object-cover opacity-5" />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b",
          theme === 'dark' ? "from-slate-950 via-slate-950/80 to-slate-950" : "from-white via-slate-50/80 to-white"
        )} />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        {/* Breadcrumbs HUD */}
        <nav className="flex items-center gap-3 mb-8 overflow-x-auto no-scrollbar">
           <Link href="/" className={cn("text-[9px] font-black uppercase tracking-widest transition-colors", theme === 'dark' ? "text-slate-400 hover:text-primary" : "text-slate-500 hover:text-primary")}>Trang chủ</Link>
           <ChevronRight size={12} className={theme === 'dark' ? "text-slate-700" : "text-slate-400"} />
           <span className="text-[9px] font-black uppercase tracking-widest text-primary">Tất cả sản phẩm</span>
        </nav>

        {/* Category Header HUD */}
        <header className="mb-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Tech Discovery</span>
                 </div>
                 <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
                    {searchQuery ? `TÌM KIẾM: "${searchQuery}"` : 'TẤT CẢ SẢN PHẨM'}
                 </h1>
                 <p className="mt-4 text-slate-500 font-medium max-w-xl">
                    Hiển thị {filteredProducts.length} sản phẩm phù hợp được truy xuất từ các module cơ sở dữ liệu.
                 </p>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/5">
                 <button className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    <Grid size={20} />
                 </button>
                 <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
                    <ListIcon size={20} />
                 </button>
              </div>
           </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Enhanced Filter Sidebar */}
          <aside className={cn(
            "w-80 flex-shrink-0 transition-all duration-500",
            isFilterOpen ? "translate-x-0 opacity-100" : "-ml-80 opacity-0 pointer-events-none"
          )}>
            <div className={cn(
              "sticky top-24 backdrop-blur-xl rounded-[2.5rem] p-8 border shadow-xl transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
            )}>
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="font-black text-xs uppercase tracking-widest flex items-center gap-3">
                  <Filter size={18} className="text-primary" />
                  BỘ LỌC TỐI ƯU
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

              <div className="space-y-8">
                {currentFilters.map((filter, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-500">{filter.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {filter.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => toggleFilter(opt)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 border",
                            activeFilters.includes(opt) 
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                              : theme === 'dark'
                                ? "bg-white/5 text-slate-400 border-white/5 hover:border-primary/30 hover:bg-white/10 hover:text-white"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-white hover:text-slate-900"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {/* High-end Toolbar */}
            <div className={cn(
              "backdrop-blur-xl rounded-3xl border p-4 mb-8 flex flex-wrap items-center justify-between gap-4 transition-all duration-500",
              theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 text-xs uppercase tracking-wider"
                >
                  <Filter size={18} />
                  {isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                </button>
                <div className={cn("h-6 w-px hidden md:block", theme === 'dark' ? "bg-white/10" : "bg-slate-200")} />
                <div className="flex gap-2">
                  {activeFilters.slice(0, 2).map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase border border-primary/20">
                      {f}
                    </span>
                  ))}
                  {activeFilters.length > 2 && <span className="text-[10px] font-bold text-slate-400">+ {activeFilters.length - 2}</span>}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className={cn("flex items-center gap-2 p-1 rounded-xl", theme === 'dark' ? "bg-white/5" : "bg-slate-100")}>
                  <button className={cn("p-2 rounded-lg", theme === 'dark' ? "bg-white/10 text-primary shadow-md" : "bg-white shadow-md text-primary")}><Grid size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-600"><ListIcon size={18} /></button>
                </div>
                <div className="relative group">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className={cn(
                      "appearance-none border rounded-xl px-6 py-2.5 pr-12 text-xs font-black uppercase tracking-wider focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer hover:border-primary/30 transition-all",
                      theme === 'dark' ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                  >
                    <option value="newest" className={theme === 'dark' ? "bg-slate-900" : ""}>Mới nhất</option>
                    <option value="price-asc" className={theme === 'dark' ? "bg-slate-900" : ""}>Giá: Thấp đến Cao</option>
                    <option value="price-desc" className={theme === 'dark' ? "bg-slate-900" : ""}>Giá: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" size={16} />
                </div>
              </div>
            </div>

            {/* Grid with animations */}
            <AnimatePresence mode='wait'>
              <motion.div 
                layout
                className={cn(
                  "grid gap-8 transition-all duration-500",
                  isFilterOpen ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}
              >
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    {...product} 
                    image={product.image || (product.id === '1' ? '/laptop.png' : product.id === '3' ? '/phone.png' : product.id === '4' ? '/pc.png' : '/laptop.png')}
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">Không tìm thấy sản phẩm phù hợp</h3>
                <button onClick={() => setActiveFilters([])} className="text-primary font-black text-xs uppercase tracking-widest mt-4 hover:underline">Xóa tất cả bộ lọc</button>
              </div>
            )}

            {/* Premium Pagination */}
            <div className="mt-20 flex justify-center items-center gap-3">
              <button className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all",
                theme === 'dark' ? "bg-slate-900 border-white/5 text-slate-400 hover:border-primary hover:text-primary" : "bg-white border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
              )}>
                <ChevronDown size={20} className="rotate-90" />
              </button>
              {[1, 2, 3].map((page) => (
                <button 
                  key={page}
                  className={cn(
                    "w-12 h-12 rounded-2xl font-black text-sm transition-all",
                    page === 1 
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-110" 
                      : theme === 'dark'
                        ? "bg-slate-900 border border-white/5 text-white hover:border-primary hover:text-primary"
                        : "bg-white border border-slate-200 hover:border-primary hover:text-primary"
                  )}
                >
                  {page}
                </button>
              ))}
              <button className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all",
                theme === 'dark' ? "bg-slate-900 border-white/5 text-slate-400 hover:border-primary hover:text-primary" : "bg-white border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
              )}>
                <ChevronDown size={20} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <ProductQuickView 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <Footer />
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/10 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}
