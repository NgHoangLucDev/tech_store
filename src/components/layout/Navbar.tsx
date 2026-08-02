'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, ShoppingCart, User, Menu, ChevronDown, 
  Laptop, Smartphone, Cpu, Headphones, ShieldCheck, 
  LayoutDashboard, ClipboardList, Sun, Moon, Languages, HelpCircle,
  Monitor, MousePointer, Volume2, Armchair, Network, Gamepad, Usb, Smartphone as SmartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CartDrawer } from '../features/cart/CartDrawer';
import { useRouter } from 'next/navigation';

// Ánh xạ icon từ text string trong DB sang Component Lucide React
const iconMap: { [key: string]: any } = {
  Laptop: Laptop,
  Smartphone: Smartphone,
  Cpu: Cpu,
  Headphones: Headphones,
  Keyboard: Keyboard,
  Monitor: Monitor,
  MousePointer: MousePointer,
  Volume2: Volume2,
  Armchair: Armchair,
  Network: Network,
  Gamepad: Gamepad,
  Usb: Usb,
  HelpCircle: HelpCircle,
  SmartIcon: SmartIcon
};

// Fallback nếu chưa tải được danh mục từ DB
const FALLBACK_CATEGORIES = [
  {
    name: 'Laptop & MacBook',
    icon: 'Laptop',
    children: [
      { name: 'Laptop Gaming', slug: 'laptop-gaming' },
      { name: 'Laptop Văn Phòng', slug: 'laptop' }
    ],
  },
  {
    name: 'PC & Màn hình',
    icon: 'Monitor',
    children: [
      { name: 'PC nguyên chiếc', slug: 'pc-gvn' },
      { name: 'Màn hình', slug: 'man-hinh' }
    ],
  },
  {
    name: 'Linh kiện PC',
    icon: 'Cpu',
    children: [
      { name: 'Main, CPU, VGA', slug: 'main-cpu-vga' },
      { name: 'Case, Nguồn, Tản', slug: 'case-nguon-tan' }
    ],
  }
];

import { Keyboard } from 'lucide-react';

export const Navbar = () => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  const { theme, toggleTheme, language, setLanguage } = useSettingsStore();
  const { totalItems } = useCartStore();
  const { user, logout } = useAuthStore();

  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbCategories(data);
        }
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  const categoriesList = dbCategories.length > 0 ? dbCategories : FALLBACK_CATEGORIES;
  
  return (
    <>
      <header className={cn(
        "sticky top-0 z-[1000] w-full border-b transition-all duration-500",
        theme === 'dark' ? "bg-slate-950/80 border-white/5 backdrop-blur-md" : "bg-white/80 border-slate-200 backdrop-blur-md"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-xl italic">T</span>
              </div>
              <span className={cn(
                "text-xl font-black tracking-tighter hidden md:block uppercase italic",
                theme === 'dark' ? "text-white" : "text-primary"
              )}>
                TechStore
              </span>
            </Link>

            <button
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black transition-all duration-300 border-2",
                theme === 'dark' ? "bg-white/5 border-white/5 text-white hover:border-primary" : "bg-slate-100 border-slate-100 text-slate-900 hover:border-primary"
              )}
            >
              <Menu size={18} />
              <span className="hidden lg:block text-[10px] tracking-widest uppercase">Danh mục</span>
            </button>

            <div className="flex-1 max-w-xl relative group">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Hôm nay bạn cần tìm gì?"
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                    theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white placeholder:text-slate-600" : "bg-slate-50 border-slate-200 focus:border-primary placeholder:text-slate-400"
                  )}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <div className="hidden lg:flex items-center gap-2 mr-2">
                <button 
                  onClick={toggleTheme}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    theme === 'dark' ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
                  )}
                >
                    {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                    {theme === 'dark' ? 'Light System' : 'Dark System'}
                </button>
                <button 
                  onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                  className={cn(
                    "flex items-center gap-2 px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    theme === 'dark' ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
                  )}
                >
                    <Languages size={14} />
                    {language === 'en' ? 'English' : 'Tiếng Việt'}
                </button>
                <button className={cn(
                  "flex items-center gap-2 px-4 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  theme === 'dark' ? "bg-white/5 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-500 hover:text-slate-900"
                )}>
                    <HelpCircle size={14} />
                    Support
                </button>
              </div>

              {mounted && user ? (
                <div className="flex items-center gap-2">
                  <div className="relative group/profile">
                    <button className={cn(
                       "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                       theme === 'dark' ? "bg-white/5 text-white border border-white/10 hover:border-primary" : "bg-slate-100 text-slate-900 border border-slate-200 hover:border-primary"
                    )}>
                      <User size={20} />
                    </button>
                    
                    <div className={cn(
                      "absolute top-full right-0 mt-2 w-56 rounded-2xl border p-4 opacity-0 scale-95 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:scale-100 group-hover/profile:pointer-events-auto transition-all shadow-2xl z-50",
                      theme === 'dark' ? "bg-slate-950 border-white/10" : "bg-white border-slate-200"
                    )}>
                       <div className="mb-4 pb-4 border-b border-white/5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tài khoản của bạn</p>
                          <p className={cn("text-xs font-black truncate uppercase", theme === 'dark' ? "text-white" : "text-slate-900")}>{user.name}</p>
                       </div>
                       <div className="space-y-1">
                          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                             <User size={14} /> Thông tin cá nhân
                          </Link>
                          <Link href="/profile?tab=orders" className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-[10px] font-black uppercase tracking-widest">
                             <ClipboardList size={14} /> Đơn hàng
                          </Link>
                          <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-all text-[10px] font-black uppercase tracking-widest"
                          >
                             Đăng xuất
                          </button>
                       </div>
                    </div>
                  </div>

                  {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                    <Link href="/admin/dashboard" className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      theme === 'dark' ? "bg-primary/20 text-primary border border-primary/20" : "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      <LayoutDashboard size={20} />
                    </Link>
                  )}
                </div>
              ) : mounted ? (
                <Link href="/login" className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  theme === 'dark' ? "bg-white/5 text-white border border-white/10 hover:border-primary" : "bg-slate-100 text-slate-900 border border-slate-200 hover:border-primary"
                )}>
                  <User size={20} />
                </Link>
              ) : null}

              <button 
                onClick={() => setIsCartOpen(true)}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center relative transition-all",
                  theme === 'dark' ? "bg-white/5 text-white border border-white/10 hover:border-primary" : "bg-slate-100 text-slate-900 border border-slate-200 hover:border-primary"
                )}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg">
                  {mounted ? totalItems() : 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Mega Menu Overlay */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
            className="absolute top-full left-0 w-full bg-white border-b shadow-2xl overflow-hidden z-[40]"
          >
            <div className="container mx-auto flex h-[450px]">
              {/* Left Sidebar */}
              <div className="w-1/4 border-r bg-muted/30 py-4 overflow-y-auto no-scrollbar">
                {categoriesList.map((cat, idx) => {
                  const Icon = iconMap[cat.icon] || HelpCircle;
                  return (
                    <button
                      key={idx}
                      onMouseEnter={() => setActiveCategory(idx)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 text-left transition-colors",
                        activeCategory === idx ? "bg-white text-primary font-bold border-l-4 border-primary" : "text-slate-600 hover:bg-white/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <ChevronDown size={16} className="-rotate-90 opacity-50" />
                    </button>
                  );
                })}
              </div>

              {/* Right Content: Subcategories */}
              <div className="flex-1 p-10 grid grid-cols-3 gap-6 overflow-y-auto">
                {categoriesList[activeCategory]?.children && categoriesList[activeCategory].children.length > 0 ? (
                  categoriesList[activeCategory].children.map((sub: any, idx: number) => (
                    <Link 
                      key={idx}
                      href={`/products?category=${sub.slug}`}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-primary/5 hover:border-primary/20 transition-all flex flex-col justify-between min-h-[120px]"
                    >
                      <span className="text-slate-400 group-hover:text-primary transition-colors">
                        {React.createElement(iconMap[sub.icon] || Cpu, { size: 24 })}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-slate-800 group-hover:text-primary transition-colors">{sub.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Khám phá ngay →</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 flex flex-col items-center justify-center text-slate-400 py-20 italic text-sm">
                    Không có danh mục con nào trong nhóm này.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
