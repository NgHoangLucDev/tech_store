'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Zap, ShieldCheck, ArrowRight, Star, 
  ChevronRight, Laptop, Monitor, Keyboard, Cpu, Clock 
} from 'lucide-react';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/features/product/ProductCard';
import { SidebarCategories } from '@/components/features/category/SidebarCategories';
import { CyberCanvas3D } from '@/components/features/home/CyberCanvas3D';
import { HeroSlider } from '@/components/features/home/HeroSlider';
import { HeroRightBanners } from '@/components/features/home/HeroRightBanners';
import { CountdownTimer } from '@/components/features/home/CountdownTimer';

interface HomeV2Props {
  data: Array<{ category: any; products: any[] }>;
  categories: any[];
  flashSaleProducts: any[];
  loading: boolean;
  onSelectProduct: (product: any) => void;
}

export const HomeV2 = ({ data, categories, flashSaleProducts, loading, onSelectProduct }: HomeV2Props) => {
  const { language, theme } = useSettingsStore();
  const t = translations[language];
  const router = useRouter();

  // State cho Active Tab của các danh mục ở phần dưới
  const [activeTabs, setActiveTabs] = useState<{ [key: number]: string }>({});

  // Cấu hình màu sắc, icon và tab cho các danh mục chính
  const getCategoryDetails = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('laptop')) {
      return {
        color: '#3B82F6',
        icon: <Laptop className="w-5 h-5" />,
        gradient: 'from-blue-500/10 to-indigo-500/10',
        border: 'border-blue-500/15',
        banner: '/banner-laptop.jpg',
        tabs: ['Gaming', 'Office', 'Pro', 'Ultrabook']
      };
    }
    if (s.includes('display') || s.includes('monitor') || s.includes('man-hinh') || s.includes('manhinh')) {
      return {
        color: '#8B5CF6',
        icon: <Monitor className="w-5 h-5" />,
        gradient: 'from-purple-500/10 to-pink-500/10',
        border: 'border-purple-500/15',
        banner: '/banner-monitor.jpg',
        tabs: ['OLED', 'Gaming', '4K', 'Ultrawide']
      };
    }
    if (s.includes('peripheral') || s.includes('phukien') || s.includes('phu-kien') || s.includes('ban-phim')) {
      return {
        color: '#10B981',
        icon: <Keyboard className="w-5 h-5" />,
        gradient: 'from-emerald-500/10 to-teal-500/10',
        border: 'border-emerald-500/15',
        banner: '/banner-accessory.jpg',
        tabs: ['Mechanical', 'Wireless', 'Audio', 'Mice']
      };
    }
    return {
      color: '#F59E0B',
      icon: <Cpu className="w-5 h-5" />,
      gradient: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/15',
      banner: '/banner-component.jpg',
      tabs: ['GPU', 'CPU', 'RAM', 'Storage']
    };
  };

  return (
    <div className="relative w-full overflow-hidden pb-24">
      {/* 1. HERO AREA - Asymmetrical Bento Grid */}
      <section className="container mx-auto px-4 pt-28 pb-12 relative">
        <CyberCanvas3D />
        
        {/* Lưới Bento Grid 12 cột cho Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[620px] relative z-10">
          
          {/* Cột 1: Sidebar categories (span-3) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="hidden lg:block lg:col-span-3 h-full"
          >
            {/* Lớp viền Double-Bezel cao cấp */}
            <div className={cn(
              "p-2 rounded-[2.5rem] border h-full transition-all duration-500",
              theme === 'dark' ? "bg-slate-950/40 border-white/5 shadow-2xl" : "bg-slate-100 border-slate-200"
            )}>
              <div className={cn(
                "h-full rounded-[2.2rem] p-4",
                theme === 'dark' ? "bg-slate-900/30" : "bg-white"
              )}>
                <SidebarCategories categories={categories} />
              </div>
            </div>
          </motion.div>

          {/* Cột 2: Main Slider (span-6) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="col-span-1 lg:col-span-6 h-full min-h-[400px]"
          >
            {/* Lớp viền Double-Bezel lồng nhau */}
            <div className={cn(
              "p-2 rounded-[2.5rem] border h-full transition-all duration-500 shadow-2xl",
              theme === 'dark' ? "bg-slate-950/40 border-white/5" : "bg-slate-100 border-slate-200"
            )}>
              <div className={cn(
                "h-full rounded-[2.2rem] overflow-hidden relative group",
                theme === 'dark' ? "bg-slate-900/30" : "bg-white"
              )}>
                <HeroSlider />
                
                {/* HUD Operational Indicator */}
                <div className="absolute top-6 right-6 z-20 pointer-events-none">
                  <span className="px-4 py-1.5 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-[9px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t.systemOperational}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cột 3: Right banners & Promotions (span-3) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="col-span-1 lg:col-span-3 h-full flex flex-col gap-6"
          >
            {/* Promotion card 1: Try Before You Buy */}
            <div className={cn(
              "p-2 rounded-[2rem] border transition-all duration-500 flex-1",
              theme === 'dark' ? "bg-slate-950/40 border-white/5 shadow-xl" : "bg-slate-100 border-slate-200"
            )}>
              <div className={cn(
                "h-full rounded-[1.75rem] p-6 flex flex-col justify-between relative overflow-hidden group",
                theme === 'dark' ? "bg-slate-900/30" : "bg-white"
              )}>
                {/* Ambient glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className={cn("text-lg font-black uppercase tracking-tight leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    Dùng thử 3 ngày miễn phí
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">
                    Trải nghiệm phần cứng tối tân ngay tại nhà trước khi quyết định mua. Hoàn toàn miễn phí.
                  </p>
                </div>

                <button 
                  onClick={() => router.push('/trial')}
                  className="mt-6 w-max rounded-full bg-slate-900 dark:bg-white/10 hover:bg-primary dark:hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 transition-all flex items-center gap-2 group/btn cursor-pointer"
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                  Tìm hiểu ngay
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              </div>
            </div>

            {/* Promotion card 2: Premium Warranty */}
            <div className={cn(
              "p-2 rounded-[2rem] border transition-all duration-500 flex-1",
              theme === 'dark' ? "bg-slate-950/40 border-white/5 shadow-xl" : "bg-slate-100 border-slate-200"
            )}>
              <div className={cn(
                "h-full rounded-[1.75rem] p-6 flex flex-col justify-between relative overflow-hidden group",
                theme === 'dark' ? "bg-slate-900/30" : "bg-white"
              )}>
                {/* Ambient glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className={cn("text-lg font-black uppercase tracking-tight leading-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
                    Bảo hành 24 tháng chính hãng
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-2 leading-relaxed">
                    Kích hoạt bảo hành điện tử một chạm. Tra cứu tình trạng xử lý thời gian thực.
                  </p>
                </div>

                <button 
                  onClick={() => router.push('/warranty')}
                  className="mt-6 w-max rounded-full bg-slate-900 dark:bg-white/10 hover:bg-emerald-500 dark:hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 transition-all flex items-center gap-2 group/btn cursor-pointer"
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                  Kích hoạt ngay
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* 2. FLASH SALE BLOCK - Cyber Punk CountDown (Double-Bezel Enclosure) */}
      {flashSaleProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="p-2 rounded-[2.5rem] border bg-gradient-to-br from-red-500/5 to-transparent border-red-500/10 shadow-2xl relative overflow-hidden">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(244,63,94,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            <div className="bg-slate-950/60 backdrop-blur-md rounded-[2.2rem] p-8 md:p-12 border border-white/5 relative z-10">
              
              {/* Header Flash Sale */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                    <Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.25em] block mb-1">
                      Giới hạn thời gian
                    </span>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">
                      Cyber Flash Sale
                    </h2>
                  </div>
                </div>

                {/* Countdown clock */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Kết thúc sau:</span>
                  <CountdownTimer />
                </div>
              </div>

              {/* Flash Sale Carousel/Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {flashSaleProducts.slice(0, 4).map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative group cursor-pointer"
                    onClick={() => onSelectProduct(product)}
                  >
                    {/* Inner Core Container */}
                    <div className="p-1.5 rounded-[2rem] border border-white/5 bg-slate-900/30 hover:border-red-500/20 transition-colors duration-500">
                      <div className="rounded-[1.75rem] overflow-hidden bg-slate-950/40 p-4 relative">
                        {/* Discount badge */}
                        {product.discount && (
                          <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-500 text-white text-[9px] font-black rounded-lg uppercase tracking-wider shadow-lg">
                            -{product.discount}%
                          </span>
                        )}

                        {/* Image */}
                        <div className="h-44 w-full relative mb-4 overflow-hidden rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-4">
                          <Image 
                            src={product.image} 
                            alt={product.name} 
                            fill 
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>

                        {/* Content */}
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block mb-1">
                          {product.category_name}
                        </span>
                        <h4 className="text-sm font-bold text-white uppercase truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </h4>
                        
                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-base font-black text-white font-mono tracking-tight">
                            {product.price.toLocaleString()}₫
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-slate-500 line-through font-mono">
                              {product.originalPrice.toLocaleString()}₫
                            </span>
                          )}
                        </div>

                        {/* Cyber Custom Progress Bar for stock */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                            <span>Đã bán: 18</span>
                            <span>Còn lại: {product.stock || 5}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full" 
                              style={{ width: '75%' }} 
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 3. EXCLUSIVE CATEGORIES SHOWCASE - Bento Layout with harmonize gradients */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block mb-2">
            Danh mục sản phẩm
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">
            Trải nghiệm phân khúc
          </h2>
        </div>

        {/* Bento grid bất đối xứng hiển thị danh mục */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {categories.map((cat, idx) => {
            const details = getCategoryDetails(cat.slug);
            const isLarge = idx === 0 || idx === 3; // Tạo bento không đều
            
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                onClick={() => router.push(`/products?category=${cat.slug}`)}
                className={cn(
                  "p-1.5 rounded-[2.5rem] border bg-slate-900/10 hover:shadow-2xl transition-all duration-500 cursor-pointer group",
                  details.border,
                  isLarge ? "md:col-span-8" : "md:col-span-4"
                )}
              >
                <div className={cn(
                  "rounded-[2.2rem] p-8 md:p-10 relative overflow-hidden min-h-[260px] flex flex-col justify-between bg-gradient-to-br",
                  details.gradient
                )}>
                  {/* Decorative icon overlay */}
                  <div className="absolute right-8 top-8 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:scale-110 group-hover:text-primary transition-all duration-500">
                    {details.icon}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium max-w-sm">
                      Khám phá chuỗi thiết bị cao cấp, phụ kiện chuyên nghiệp dành riêng cho giới mộ điệu.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">
                    Xem sản phẩm
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 4. PREMIUM PRODUCT FEED (Dynamic Tabs) */}
      <section className="container mx-auto px-4 py-16">
        {data.map(({ category, products }) => {
          const details = getCategoryDetails(category.slug);
          const activeTab = activeTabs[category.id] || details.tabs[0];
          
          return (
            <div key={category.id} className="mb-24 last:mb-0">
              
              {/* Category Sub Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5 mb-10">
                <div className="flex items-center gap-4">
                  <div 
                    style={{ backgroundColor: `${details.color}15`, borderColor: `${details.color}30` }} 
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center text-primary"
                  >
                    {details.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] block mb-0.5">
                      Phân khúc chuyên nghiệp
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">
                      {category.name}
                    </h3>
                  </div>
                </div>

                {/* Sub category Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {details.tabs.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTabs(prev => ({ ...prev, [category.id]: tab }))}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border",
                        activeTab === tab
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "bg-white/5 border-transparent text-slate-500 hover:text-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Feed Grid */}
              {loading ? (
                <div className="py-20 flex justify-center">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="py-12 text-center text-slate-600">Chưa có sản phẩm.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.slice(0, 4).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          );
        })}
      </section>

      {/* 5. BRAND TRUST BADGES GRID */}
      <section className="container mx-auto px-4 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Ủy quyền chính hãng",
              desc: "Toàn bộ dải sản phẩm laptop, màn hình và linh kiện cam kết chính hãng 100%, bảo hành chuẩn hãng.",
              badge: "Premium Auth"
            },
            {
              title: "Dùng thử linh hoạt",
              desc: "Chương trình 'Try Before You Buy' độc quyền giúp bạn test hiệu năng thực tế tại nhà trong 3 ngày.",
              badge: "Try & Buy"
            },
            {
              title: "Giao vận siêu tốc",
              desc: "Đóng gói kỹ lưỡng chống va đập, bảo hiểm hàng hóa toàn diện, giao hàng hỏa tốc toàn quốc.",
              badge: "Cyber Ship"
            }
          ].map((item, idx) => (
            <div key={idx} className="p-1 rounded-2xl border border-white/5 bg-slate-900/10">
              <div className="p-6 rounded-[calc(1rem+0.25rem)] bg-slate-950/40 relative overflow-hidden group">
                <span className="absolute top-6 right-6 text-[8px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400">
                  {item.badge}
                </span>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">{item.title}</h4>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
