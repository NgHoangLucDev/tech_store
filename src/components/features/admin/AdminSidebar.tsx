'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Layers, 
  Package, 
  ShoppingCart, 
  ShieldCheck, 
  Users, 
  Menu, 
  X, 
  LogOut,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'TỔNG QUAN', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'DANH MỤC', href: '/admin/categories', icon: Layers },
  { label: 'KHO HÀNG', href: '/admin/products', icon: Package },
  { label: 'ĐƠN HÀNG', href: '/admin/orders', icon: ShoppingCart },
  { label: 'BẢO HÀNH', href: '/admin/warranty', icon: ShieldCheck },
  { label: 'KHÁCH HÀNG', href: '/admin/customers', icon: Users },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (user?.role === 'STAFF') {
      return item.href !== '/admin/customers';
    }
    return true;
  });

  const currentPage = filteredNavItems.find(item => item.href === pathname);

  return (
    <>
      {/* Desktop Sidebar (lg:flex, fixed w-72) */}
      <aside className="hidden lg:flex w-72 bg-black text-white flex-col fixed h-full z-50 border-r border-primary/20">
        {/* Brand */}
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3.5 mb-12 group" aria-label="TechStore Home">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center font-black text-2xl text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase text-white">Admin</span>
              <span className="text-[9px] font-black text-primary tracking-[0.4em] mt-0.5">CENTER</span>
            </div>
          </Link>

          <nav className="space-y-6">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className="block relative group"
                >
                  <div className={`flex items-center gap-3 text-xs font-black tracking-[0.2em] transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-100/60 group-hover:text-white'}`}>
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary shadow-[0_0_25px_rgba(var(--primary-rgb),1)] rounded-r-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Footer */}
        <div className="mt-auto p-8 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-black text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{user?.role || 'ROOT'}</p>
          </div>
          <button 
            onClick={() => { logout(); router.push('/login'); }}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors uppercase cursor-pointer shrink-0"
            title="Đăng xuất"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (lg:hidden) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-black/90 backdrop-blur-xl border-b border-white/10 z-40 px-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center font-black text-sm text-black">
            P
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-white tracking-tight">Admin</span>
            <span className="text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
              {currentPage?.label || 'DASHBOARD'}
            </span>
          </div>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/5 text-white active:scale-95 transition-all"
          aria-label="Toggle Mobile Menu"
        >
          {mobileMenuOpen ? <X size={18} className="text-primary" /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Slide-Over Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="absolute top-0 bottom-0 left-0 w-[80vw] max-w-xs bg-[#0a0a0a] border-r border-white/10 flex flex-col p-5 text-white shadow-2xl z-10"
            >
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-base text-black">
                    P
                  </div>
                  <div>
                    <span className="text-sm font-black tracking-tight uppercase text-white block">TechStore</span>
                    <span className="text-[8px] font-black text-primary tracking-widest uppercase">Admin Menu</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        isActive 
                          ? 'bg-primary text-black font-bold' 
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-primary'}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-slate-600'}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-black text-white truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'ROOT'}</p>
                  </div>
                </div>

                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-black text-rose-400 uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut size={14} />
                  <span>ĐĂNG XUẤT</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (lg:hidden) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 z-50 px-1 flex items-center justify-around">
        {filteredNavItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full py-0.5 transition-all cursor-pointer"
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-primary/15' : ''}`}>
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[8px] font-bold tracking-tight uppercase mt-0.5 truncate max-w-[62px] ${
                isActive ? 'text-primary font-black' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

