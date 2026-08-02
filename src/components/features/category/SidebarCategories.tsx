'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

// Lucide icon helper
const getIcon = (slug: string, dbIconName?: string | null) => {
  if (dbIconName && (Icons as any)[dbIconName]) {
    return (Icons as any)[dbIconName];
  }

  const normalized = slug.toLowerCase();
  if (normalized.includes('laptop')) return Icons.Laptop;
  if (normalized.includes('monitor') || normalized.includes('display') || normalized.includes('man-hinh') || normalized.includes('manhinh')) return Icons.Monitor;
  if (normalized.includes('peripheral') || normalized.includes('keyboard') || normalized.includes('phu-kien') || normalized.includes('phukien') || normalized.includes('ban-phim') || normalized.includes('chuot')) return Icons.Keyboard;
  if (normalized.includes('headphone') || normalized.includes('tai-nghe') || normalized.includes('audio') || normalized.includes('am-thanh')) return Icons.Headphones;
  if (normalized.includes('component') || normalized.includes('cpu') || normalized.includes('hardware') || normalized.includes('linh-kien') || normalized.includes('linhkien')) return Icons.Cpu;
  if (normalized.includes('sale') || normalized.includes('promo') || normalized.includes('discount') || normalized.includes('giam-gia')) return Icons.Zap;
  if (normalized.includes('camera') || normalized.includes('stream')) return Icons.Camera;
  if (normalized.includes('game') || normalized.includes('console')) return Icons.Gamepad2;

  return Icons.Layers;
};

// Custom gradient schemes for different category types
const getCategoryGradients = (slug: string) => {
  const normalized = slug.toLowerCase();
  if (normalized.includes('laptop')) {
    return {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]',
      border: 'border-blue-500/20 group-hover:border-blue-500/50'
    };
  }
  if (normalized.includes('monitor') || normalized.includes('display') || normalized.includes('man-hinh') || normalized.includes('manhinh')) {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.35)]',
      border: 'border-purple-500/20 group-hover:border-purple-500/50'
    };
  }
  if (normalized.includes('peripheral') || normalized.includes('keyboard') || normalized.includes('phu-kien') || normalized.includes('phukien') || normalized.includes('ban-phim') || normalized.includes('headphone') || normalized.includes('tai-nghe') || normalized.includes('audio') || normalized.includes('am-thanh')) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
      border: 'border-emerald-500/20 group-hover:border-emerald-500/50'
    };
  }
  if (normalized.includes('component') || normalized.includes('cpu') || normalized.includes('hardware') || normalized.includes('linh-kien') || normalized.includes('linhkien')) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
      border: 'border-amber-500/20 group-hover:border-amber-500/50'
    };
  }
  if (normalized.includes('sale') || normalized.includes('promo') || normalized.includes('discount') || normalized.includes('giam-gia')) {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
      border: 'border-rose-500/20 group-hover:border-rose-500/50'
    };
  }
  return {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)]',
    border: 'border-indigo-500/20 group-hover:border-indigo-500/50'
  };
};

interface SidebarCategoriesProps {
  categories?: any[];
}

export const SidebarCategories: React.FC<SidebarCategoriesProps> = ({ categories: propCategories }) => {
  const { language, theme } = useSettingsStore();
  const t = translations[language];
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>(propCategories || []);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(!propCategories);

  useEffect(() => {
    if (propCategories) {
      setCategories(propCategories);
    }
  }, [propCategories]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/admin/categories'),
          fetch('/api/products')
        ]);
        if (catRes.ok && !propCategories) {
          const cats = await catRes.json();
          if (Array.isArray(cats)) setCategories(cats);
        }
        if (prodRes.ok) {
          const prods = await prodRes.json();
          if (Array.isArray(prods)) setProducts(prods);
        }
      } catch (err) {
        console.error("Error loading sidebar data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [propCategories]);

  const getProductCount = (categoryId: number) => {
    return products.filter(p => Number(p.category_id) === Number(categoryId)).length;
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/products?category=${slug}`);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full rounded-[1.8rem] overflow-hidden transition-colors duration-500 relative min-w-[260px] lg:min-w-0",
      theme === 'dark' ? "bg-slate-950/80 backdrop-blur-xl" : "bg-white"
    )}>
      {/* Header HUD */}
      <div className={cn(
        "px-6 py-5 border-b flex items-center gap-3 transition-colors duration-500",
        theme === 'dark' ? "border-white/5" : "border-slate-100"
      )}>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
        <span className={cn("font-black text-[10px] uppercase tracking-[0.3em] transition-colors whitespace-nowrap", theme === 'dark' ? "text-white" : "text-slate-800")}>
          {t.systemIndex}
        </span>
      </div>

      {/* Main categories scroll area */}
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar space-y-1">
        {loading ? (
          // Skeleton UI
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-4 w-full">
                <div className="w-9 h-9 bg-slate-800/10 dark:bg-white/5 animate-pulse rounded-xl" />
                <div className="h-4 bg-slate-800/10 dark:bg-white/5 animate-pulse rounded-lg w-1/2" />
              </div>
              <div className="w-8 h-4 bg-slate-800/10 dark:bg-white/5 animate-pulse rounded-full" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <Icons.AlertTriangle size={24} className="text-slate-500 mx-auto mb-2" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No categories found</p>
          </div>
        ) : (
          categories.map((cat) => {
            const IconComponent = getIcon(cat.slug, cat.icon);
            const count = getProductCount(cat.id);
            const style = getCategoryGradients(cat.slug);

            return (
              <motion.div
                key={cat.id}
                whileHover={{ x: 4 }}
                className="group"
              >
                <a
                  href={`#${cat.slug}`}
                  onClick={(e) => handleScroll(e, cat.slug)}
                  className="flex items-center justify-between gap-3 px-4 lg:px-6 py-3 transition-all cursor-pointer min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "w-9 h-9 flex items-center justify-center rounded-xl border transition-all duration-300 shrink-0",
                      style.bg,
                      style.border,
                      style.glow
                    )}>
                      <IconComponent size={16} />
                    </div>
                    <span className={cn(
                      "text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:translate-x-0.5 truncate flex-1 block leading-none",
                      theme === 'dark' ? "text-slate-400 group-hover:text-white" : "text-slate-500 group-hover:text-slate-900"
                    )}>
                      {cat.name}
                    </span>
                  </div>

                  {/* Dynamic Product Count Badge */}
                  <div className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider transition-colors duration-300 shrink-0",
                    count > 0
                      ? (theme === 'dark' ? "bg-primary/10 text-primary border border-primary/20" : "bg-primary/5 text-primary border border-primary/10")
                      : (theme === 'dark' ? "bg-white/5 text-slate-600 border border-white/5" : "bg-slate-50 text-slate-400 border border-slate-100")
                  )}>

                  </div>
                </a>
              </motion.div>
            );
          })
        )}
      </div>


    </div>
  );
};
