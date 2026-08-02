'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/features/home/Hero';
import { FlashSaleSection } from '@/components/features/home/FlashSaleSection';
import { CategorySection } from '@/components/features/product/CategorySection';
import { Footer } from '@/components/layout/Footer';
import { Monitor, Laptop, Keyboard, Cpu, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProductQuickView } from '@/components/features/product/ProductQuickView';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

import { LAPTOP_GAMING as MOCK_LAPTOPS, MONITORS as MOCK_MONITORS, PERIPHERALS as MOCK_PERIPHERALS, COMPONENTS as MOCK_COMPONENTS } from '@/lib/data';

export default function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const { theme, language } = useSettingsStore();
  const t = translations[language];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const fetchDbProducts = async () => {
    try {
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
    }
  };

  const [categories, setCategories] = useState<any[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
    fetchDbProducts();
    fetchCategories();
  }, []);

  // Hàm chuẩn hóa tiếng Việt để so sánh
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]/g, '');
  };

  // Phân loại sản phẩm từ DB
  const filterByCategory = (slugPart: string) => {
    const normalizedPart = normalizeText(slugPart);
    return dbProducts.filter(p => {
      const catName = normalizeText(p.category_name || '');
      const pSlug = normalizeText(p.slug || '');
      return catName.includes(normalizedPart) || pSlug.includes(normalizedPart);
    });
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'laptops':
      case 'laptop':
        return <Laptop size={24} />;
      case 'displays':
      case 'display':
      case 'manhinh':
      case 'man-hinh':
        return <Monitor size={24} />;
      case 'peripherals':
      case 'phukien':
      case 'phu-kien':
        return <Keyboard size={24} />;
      case 'components':
      case 'linhkien':
      case 'linh-kien-pc':
        return <Cpu size={24} />;
      default:
        return <Cpu size={24} />;
    }
  };

  const getCategoryColor = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'laptops':
      case 'laptop':
        return "#3B82F6";
      case 'displays':
      case 'display':
      case 'manhinh':
      case 'man-hinh':
        return "#8B5CF6";
      case 'peripherals':
      case 'phukien':
      case 'phu-kien':
        return "#10B981";
      case 'components':
      case 'linhkien':
      case 'linh-kien-pc':
        return "#F59E0B";
      default:
        return "#3B82F6";
    }
  };

  const getCategoryTabs = (slug: string) => {
    switch (slug.toLowerCase()) {
      case 'laptops':
      case 'laptop':
        return ['Pro', 'Gaming', 'Creative', 'Ultra'];
      case 'displays':
      case 'display':
      case 'manhinh':
      case 'man-hinh':
        return ['OLED', 'Ultrawide', '4K', 'High-Refresh'];
      case 'peripherals':
      case 'phukien':
      case 'phu-kien':
        return ['Mechanical', 'Wireless', 'Precision', 'Audio'];
      case 'components':
      case 'linhkien':
      case 'linh-kien-pc':
        return ['GPU', 'CPU', 'Storage', 'Power'];
      default:
        return ['Bán chạy', 'Mới về', 'Khuyến mãi'];
    }
  };

  const getProductsForCategory = (cat: any) => {
    const dbFiltered = dbProducts.filter(p => p.category_id === cat.id);
    
    let mockList: any[] = [];
    const normalizedSlug = cat.slug.toLowerCase();
    if (normalizedSlug === 'laptops' || normalizedSlug === 'laptop') {
      mockList = MOCK_LAPTOPS;
    } else if (normalizedSlug === 'displays' || normalizedSlug === 'display' || normalizedSlug === 'manhinh' || normalizedSlug === 'man-hinh') {
      mockList = MOCK_MONITORS;
    } else if (normalizedSlug === 'peripherals' || normalizedSlug === 'phukien' || normalizedSlug === 'phu-kien') {
      mockList = MOCK_PERIPHERALS;
    } else if (normalizedSlug === 'components' || normalizedSlug === 'linhkien' || normalizedSlug === 'linh-kien-pc') {
      mockList = MOCK_COMPONENTS;
    }
    
    const merged = [...dbFiltered, ...mockList];
    return merged.filter((p, index, self) => self.findIndex(t => t.id === p.id) === index);
  };

  const flashSale = dbProducts.filter((p: any) => p.is_flash_sale === 1);


  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 selection:bg-primary selection:text-white scroll-smooth",
      theme === 'dark' ? "bg-slate-950 text-slate-200" : "bg-white text-slate-900"
    )}>
      {/* Background Decor */}
      <div className={cn(
        "fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none",
        theme === 'dark' ? "opacity-20" : "opacity-5"
      )}>
        <Image 
          src="/tech-bg.png" 
          alt="Background" 
          fill 
          className="object-cover" 
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b transition-colors duration-500",
          theme === 'dark' ? "from-slate-950 via-transparent to-slate-950" : "from-white via-transparent to-white"
        )} />
      </div>

      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[1001] origin-left" style={{ scaleX }} />

      <Header />
      
      <main className="relative z-10 pb-24">
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <Hero categories={categories.filter(cat => getProductsForCategory(cat).length > 0)} />
              
              {/* Quick Warranty Access Banner */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="container mx-auto px-4 mb-12"
              >
                <Link href="/warranty/register">
                  <div className={cn(
                    "relative overflow-hidden rounded-[3rem] p-10 md:p-16 border-2 group cursor-pointer transition-all duration-500",
                    theme === 'dark' ? "bg-[#0a0a0a] border-white/5 hover:border-primary/50" : "bg-slate-50 border-slate-200 hover:border-primary/50"
                  )}>
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="space-y-4 text-center md:text-left">
                        <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                          Dịch vụ hậu mãi 5 sao
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                          TRA CỨU & ĐĂNG KÝ <br /> <span className="text-primary">BẢO HÀNH ONLINE</span>
                        </h2>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest max-w-md">
                          Nghiệp vụ chuyên nghiệp, lấy hàng tận nơi, tra cứu tiến độ 24/7 chỉ với số điện thoại.
                        </p>
                      </div>
                      <div className="px-12 py-6 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl group-hover:scale-110 transition-all flex items-center gap-4">
                        BẮT ĐẦU NGAY <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {flashSale.length > 0 && (
                <motion.div
                  id="flash-sale"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="scroll-mt-32"
                >
                  <FlashSaleSection products={flashSale} />
                </motion.div>
              )}

              {categories
                .filter((cat) => getProductsForCategory(cat).length > 0)
                .map((cat, index, array) => {
                  const categoryProducts = getProductsForCategory(cat);
                  const normalizedSlug = cat.slug.toLowerCase();
                  const bannerSrc = normalizedSlug === 'laptops' || normalizedSlug === 'laptop'
                    ? '/banners/laptop-vivid.png'
                    : (normalizedSlug === 'components' || normalizedSlug === 'linh-kien-pc'
                        ? '/banners/component-vivid.png'
                        : undefined);

                  // Assign horizontal promo banners periodically (every 3 categories)
                  const midBanners = [
                    '/banners/mid_laptops.png',
                    '/banners/mid_components.png',
                    '/banners/mid_displays.png',
                    '/banners/mid_peripherals.png'
                  ];

                  let midBannerSrc = undefined;
                  if ((index + 1) % 3 === 0 && index < array.length - 1) {
                    const bannerIndex = Math.floor(index / 3) % midBanners.length;
                    midBannerSrc = midBanners[bannerIndex];
                  }

                  return (
                    <React.Fragment key={cat.id}>
                      <CategorySection 
                        id={cat.slug}
                        title={cat.name} 
                        icon={getCategoryIcon(cat.slug)}
                        tabs={getCategoryTabs(cat.slug)}
                        products={categoryProducts}
                        color={getCategoryColor(cat.slug)}
                        bannerSrc={bannerSrc}
                      />
                      
                      {midBannerSrc && (
                        <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6 }}
                          className="container mx-auto px-4 my-16"
                        >
                          <div className={cn(
                            "relative w-full aspect-[4/1] md:aspect-[5/1] rounded-[2rem] overflow-hidden border group cursor-pointer shadow-2xl transition-all duration-500",
                            theme === 'dark' ? "border-white/5 hover:border-primary/20" : "border-slate-200 hover:border-primary/25"
                          )}>
                            <Image 
                              src={midBannerSrc} 
                              alt="Promo Banner" 
                              fill
                              sizes="(max-width: 768px) 100vw, 90vw"
                              className="object-cover group-hover:scale-[1.01] transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  );
                })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
