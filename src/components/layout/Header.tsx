'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Package, Cpu, Sun, Moon, Languages, HelpCircle, Activity } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { ALL_PRODUCTS } from '@/lib/data';

export const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCartStore();
  const { user } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage } = useSettingsStore();
  const t = translations[language];

  const { scrollY } = useScroll();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [productsList, setProductsList] = useState<any[]>(ALL_PRODUCTS);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 1) {
      const filtered = productsList.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchFocused(false);
      setSuggestions([]);
    }
  };

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    [theme === 'dark' ? 'rgba(15, 23, 42, 0)' : 'rgba(255, 255, 255, 0)', theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)']
  );
  
  const headerBlur = useTransform(
    scrollY,
    [0, 50],
    ['blur(0px)', 'blur(12px)']
  );

  useEffect(() => {
    setMounted(true);
    const fetchDbProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
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
          setProductsList([...formatted, ...ALL_PRODUCTS]);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu từ MySQL:", err);
      }
    };
    fetchDbProducts();
  }, []);

  return (
    <header className="w-full fixed top-0 z-[1000] transition-all duration-500">
      {/* Main Header */}
      <motion.div 
        style={{ backgroundColor: headerBg, backdropFilter: headerBlur }}
          className={cn("border-b transition-colors duration-500", theme === 'dark' ? "border-white/5" : "border-slate-200")}
        >
          <div className="container mx-auto px-4 flex items-center justify-between gap-8 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300" style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
                  <Cpu size={24} className="text-white" />
                </div>
                <div className="absolute -inset-1.5 bg-primary/15 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-xl font-black tracking-[-0.05em] uppercase italic leading-none transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  {t.brand}
                </span>
                <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase -mt-1 opacity-80">
                  {t.tagline}
                </span>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-xl relative group hidden md:block">
              <div className={cn(
                "relative flex items-center border rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all z-20",
                theme === 'dark' ? "bg-white/5 border-white/10 focus-within:bg-white/10" : "bg-slate-100 border-slate-200 focus-within:bg-white focus-within:shadow-lg"
              )}>
                <Search className="absolute left-4 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder={t.searchPlaceholder}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-transparent outline-none text-sm font-medium transition-colors",
                    theme === 'dark' ? "text-white" : "text-slate-900"
                  )}
                />
              </div>

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "absolute top-full left-0 right-0 mt-3 p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl z-10",
                      theme === 'dark' ? "bg-slate-900/90 border-white/10" : "bg-white/90 border-slate-200"
                    )}
                  >
                    <div className="flex flex-col gap-2">
                       <div className="flex items-center justify-between px-3 mb-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recommended Sequence</span>
                          <span className="text-[10px] font-bold text-primary">{suggestions.length} Results</span>
                       </div>
                       {suggestions.map((p) => (
                         <Link 
                           key={p.id}
                           href={`/product/${p.id}`}
                           onClick={() => {
                             setSearchQuery('');
                             setSuggestions([]);
                           }}
                           className={cn(
                             "flex items-center gap-4 p-3 rounded-2xl transition-all group/item border border-transparent",
                             theme === 'dark' ? "hover:bg-white/5 hover:border-white/5" : "hover:bg-slate-50 hover:border-slate-100"
                           )}
                         >
                            <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white/5 p-2 border border-white/5 group-hover/item:border-primary/50 transition-colors">
                               <Image src={p.image} alt={p.name} fill className="object-contain" />
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                               <span className={cn("text-xs font-black uppercase truncate leading-tight group-hover/item:text-primary transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
                                 {p.name}
                               </span>
                               <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                                 {p.price.toLocaleString('vi-VN')}₫
                               </span>
                            </div>
                            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                               <Activity size={14} className="text-primary" />
                            </div>
                         </Link>
                       ))}
                       <Link 
                         href={`/products?search=${encodeURIComponent(searchQuery)}`}
                         className="mt-2 p-3 text-center border-t border-white/5 text-[10px] font-black uppercase text-primary tracking-[0.2em] hover:bg-primary/5 rounded-b-2xl transition-all"
                       >
                         View All Results
                       </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Nav Icons */}
            <nav className="flex items-center gap-1">
              <div className="hidden xl:flex items-center gap-1 mr-2 border-r border-white/5 pr-2">
                <button 
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
                  className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="hidden 2xl:block">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>

                <button 
                  onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                  aria-label={`Đổi ngôn ngữ sang ${language === 'en' ? 'Tiếng Việt' : 'English'}`}
                  className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                  <Languages size={18} />
                  <span className="hidden 2xl:block">{language === 'en' ? 'Tiếng Việt' : 'English'}</span>
                </button>

                <Link 
                  href="/warranty"
                  className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] flex items-center gap-2 text-[9px] font-black uppercase tracking-widest", theme === 'dark' ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}
                  style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
                >
                  <HelpCircle size={18} />
                  <span className="hidden 2xl:block">Bảo hành</span>
                </Link>

              </div>

              <NavIcon icon={<Package size={20} />} href="/orders" theme={theme} label="Đơn hàng" />
              
              <Link href="/cart" aria-label="Giỏ hàng" className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] relative group", theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100")} style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}>
                <ShoppingCart size={20} className={cn("transition-colors", theme === 'dark' ? "text-slate-400 group-hover:text-primary" : "text-slate-600 group-hover:text-primary")} />
                {mounted && totalItems() > 0 && (
                  <span className="absolute top-2 right-2 bg-primary text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </Link>

              <Link href={user ? "/profile" : "/login"} aria-label={user ? 'Tài khoản' : 'Đăng nhập'} className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] relative group", theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100")} style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}>
                <User size={20} className={cn("transition-colors", theme === 'dark' ? "text-slate-400 group-hover:text-primary" : "text-slate-600 group-hover:text-primary")} />
                {mounted && user && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-950" style={{ animation: 'pulse-dot 2s ease infinite' }} />
                )}
              </Link>

              {/* Admin/Staff Quick Access */}
              {mounted && user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link 
                  href="/admin/dashboard" 
                  className={cn(
                    "ml-2 px-6 py-2.5 rounded-xl transition-all flex items-center gap-3 group relative overflow-hidden border-2",
                    theme === 'dark' 
                      ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white" 
                      : "bg-primary/5 border-primary/10 text-primary hover:bg-primary hover:text-white"
                  )}
                >
                  <Activity size={16} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Admin Center</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                </Link>
              )}
            </nav>

          {/* Mobile Menu Toggle */}
          <button
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn("md:hidden p-2 rounded-xl transition-all active:scale-[0.93]", theme === 'dark' ? "text-white hover:bg-white/5" : "text-slate-900 hover:bg-slate-100")}
            style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen
                ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><X size={24} /></motion.span>
                : <motion.span key="open"  initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Menu size={24} /></motion.span>
              }
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              "md:hidden border-b shadow-2xl",
              theme === 'dark' ? "bg-slate-950/95 border-white/5 backdrop-blur-2xl" : "bg-white/95 border-slate-200 backdrop-blur-2xl"
            )}
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-1">
              {([
                { href: '/', label: 'Trang chủ' },
                { href: '/products', label: 'Sản phẩm' },
                { href: '/orders', label: 'Đơn hàng' },
                { href: '/warranty', label: 'Bảo hành' },
                { href: user ? '/profile' : '/login', label: user ? 'Tài khoản' : 'Đăng nhập' },
              ] as { href: string; label: string }[]).map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                      theme === 'dark' ? "text-slate-300 hover:text-white hover:bg-white/5" : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const NavIcon = ({ icon, href, theme, label }: { icon: React.ReactNode, href: string, theme: string, label?: string }) => (
  <Link
    href={href}
    aria-label={label}
    className={cn("p-3 rounded-2xl transition-all active:scale-[0.96] group hidden lg:block", theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-100")}
    style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
  >
    <div className={cn("transition-colors", theme === 'dark' ? "text-slate-400 group-hover:text-primary" : "text-slate-600 group-hover:text-primary")}>
      {icon}
    </div>
  </Link>
);
