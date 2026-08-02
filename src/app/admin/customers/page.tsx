'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, UserCog, User, Search, RefreshCw,
  Phone, Mail, Hash, ChevronDown, Crown, Briefcase
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }

const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    dot: 'bg-violet-400',
    select: 'border-violet-500/40 text-violet-300 focus:border-violet-400',
    icon: Crown,
    glow: 'shadow-violet-500/5',
  },
  STAFF: {
    label: 'Staff',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400',
    select: 'border-amber-500/40 text-amber-300 focus:border-amber-400',
    icon: Briefcase,
    glow: 'shadow-amber-500/5',
  },
  USER: {
    label: 'User',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-400',
    select: 'border-sky-500/30 text-sky-400 focus:border-sky-400',
    icon: User,
    glow: '',
  },
};

const FILTER_TABS: { key: 'ALL' | 'ADMIN' | 'STAFF' | 'USER'; label: string; color: string }[] = [
  { key: 'ALL',   label: 'Tất cả',  color: 'bg-white/10 text-white' },
  { key: 'ADMIN', label: 'Admin',   color: 'bg-violet-500/20 text-violet-300' },
  { key: 'STAFF', label: 'Staff',   color: 'bg-amber-500/20 text-amber-300' },
  { key: 'USER',  label: 'User',    color: 'bg-sky-500/15 text-sky-400' },
];

export default function AdminCustomers() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | 'ADMIN' | 'STAFF' | 'USER'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    if (user && user.role === 'STAFF') router.push('/admin/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (mounted && user?.role === 'ADMIN') fetchCustomers();
  }, [mounted, user]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/customers');
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } catch {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success('Đã cập nhật vai trò');
      setCustomers(prev => prev.map(c => c.id === id ? { ...c, role: newRole as any } : c));
    } catch {
      toast.error('Lỗi khi cập nhật vai trò');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted || !user || user.role !== 'ADMIN') return null;

  // ── Derived data ──────────────────────────────────────────────────────
  const filtered = customers.filter(c => {
    const matchRole = filterRole === 'ALL' || c.role === filterRole;
    const q = searchQ.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const counts = {
    ALL:   customers.length,
    ADMIN: customers.filter(c => c.role === 'ADMIN').length,
    STAFF: customers.filter(c => c.role === 'STAFF').length,
    USER:  customers.filter(c => c.role === 'USER').length,
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-400 to-sky-500 flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Quản lý người dùng</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">KHÁCH HÀNG</h1>
        </div>

        {/* Search + Refresh */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email..."
              className="w-full h-10 bg-[#111]/80 border border-white/[0.08] rounded-xl pl-9 pr-4 text-white text-xs font-medium outline-none focus:border-violet-500/40 transition-all placeholder:text-slate-600"
            />
          </div>
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="h-10 px-4 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-slate-300 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </header>

      {/* ── Stats Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {([
          { key: 'ALL',   label: 'Tổng người dùng', icon: Users,     from: 'from-slate-500/20',   border: 'border-slate-500/20',   text: 'text-slate-300' },
          { key: 'ADMIN', label: 'Quản trị viên',   icon: Crown,     from: 'from-violet-500/20',  border: 'border-violet-500/20',  text: 'text-violet-300' },
          { key: 'STAFF', label: 'Nhân viên',        icon: Briefcase, from: 'from-amber-500/20',   border: 'border-amber-500/20',   text: 'text-amber-300' },
          { key: 'USER',  label: 'Khách hàng',       icon: User,      from: 'from-sky-500/20',     border: 'border-sky-500/20',     text: 'text-sky-300' },
        ] as const).map(s => {
          const Icon = s.icon;
          const isActive = filterRole === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilterRole(s.key)}
              className={cn(
                'bg-gradient-to-br to-transparent rounded-2xl border p-3.5 sm:p-4 flex items-center gap-3 transition-all text-left cursor-pointer min-w-0',
                s.from, s.border,
                isActive ? 'ring-1 ring-white/20 scale-[1.02]' : 'hover:scale-[1.01] opacity-80 hover:opacity-100'
              )}
            >
              <div className={cn('p-2 rounded-xl bg-black/20 shrink-0', s.text)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5 truncate">{s.label}</p>
                <p className={cn('text-xl sm:text-2xl font-black truncate', s.text)}>{counts[s.key]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full pb-1 sm:pb-0">
        {FILTER_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setFilterRole(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap shrink-0',
              filterRole === t.key
                ? cn(t.color, 'border-white/10 shadow-md')
                : 'bg-white/[0.03] text-slate-500 border-white/[0.04] hover:text-slate-300 hover:bg-white/[0.06]'
            )}
          >
            {t.label}
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md', filterRole === t.key ? 'bg-white/20' : 'bg-white/5')}>
              {counts[t.key]}
            </span>
          </button>
        ))}
        <span className="ml-auto text-[9px] font-bold text-slate-600 uppercase tracking-widest hidden sm:inline">
          {filtered.length} / {customers.length} kết quả
        </span>
      </div>

      {/* ── Customer List ─────────────────────────────────────────────── */}
      <section className="bg-[#0e0e0e] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        {/* Table Head */}
        <div className="hidden md:grid md:grid-cols-[3fr_3fr_1fr] gap-4 px-6 py-3 border-b border-white/[0.05] bg-white/[0.02]">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Khách hàng</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Thông tin liên hệ</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Vai trò</span>
        </div>

        {loading ? (
          <div className="py-20 flex items-center justify-center gap-3 text-slate-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Đang tải...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-600">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Không tìm thấy khách hàng</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            <AnimatePresence>
              {filtered.map((customer, idx) => {
                const cfg = ROLE_CONFIG[customer.role];
                const RoleIcon = cfg.icon;
                const isUpdating = updatingId === customer.id;
                return (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className={cn(
                      'flex flex-col sm:grid sm:grid-cols-[3fr_3fr_1fr] gap-3 sm:gap-4 items-start sm:items-center p-4 sm:px-6 sm:py-4 hover:bg-white/[0.03] transition-all group',
                      cfg.glow, 'shadow-lg'
                    )}
                  >
                    {/* Name + Avatar */}
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {/* Avatar initial */}
                      <div className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 border',
                        cfg.badge
                      )}>
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white group-hover:text-white/90 transition-colors truncate">{customer.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Hash className="w-2.5 h-2.5 text-slate-600" />
                          <span className="text-[9px] font-mono text-slate-500">ID: #{customer.id}</span>
                        </div>
                      </div>

                      {/* Mobile Role Badge selector */}
                      <div className="sm:hidden shrink-0">
                        <div className="relative">
                          <RoleIcon className={cn('absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none', cfg.badge.split(' ').find(c => c.startsWith('text-')))} />
                          <select
                            value={customer.role}
                            onChange={e => handleRoleChange(customer.id, e.target.value)}
                            disabled={isUpdating}
                            className={cn(
                              'appearance-none h-8 pl-7 pr-6 rounded-xl text-[9px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer border bg-black/40',
                              cfg.select,
                              isUpdating && 'opacity-50'
                            )}
                          >
                            <option value="USER"  className="bg-black">User</option>
                            <option value="STAFF" className="bg-black">Staff</option>
                            <option value="ADMIN" className="bg-black">Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1 w-full sm:w-auto text-xs">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-200 tracking-wide">{customer.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-slate-400 truncate max-w-[240px] sm:max-w-[220px]">{customer.email}</span>
                      </div>
                    </div>

                    {/* Desktop Role selector */}
                    <div className="hidden sm:flex justify-end">
                      <div className="relative">
                        <RoleIcon className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none', cfg.badge.split(' ').find(c => c.startsWith('text-')))} />
                        <select
                          value={customer.role}
                          onChange={e => handleRoleChange(customer.id, e.target.value)}
                          disabled={isUpdating}
                          className={cn(
                            'appearance-none h-9 pl-8 pr-7 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none transition-all cursor-pointer border bg-black/40',
                            cfg.select,
                            isUpdating && 'opacity-50'
                          )}
                        >
                          <option value="USER"  className="bg-black">User</option>
                          <option value="STAFF" className="bg-black">Staff</option>
                          <option value="ADMIN" className="bg-black">Admin</option>
                        </select>
                        <ChevronDown className={cn('absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none', cfg.select.split(' ').find(c => c.startsWith('text-')))} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.04] bg-white/[0.01]">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              Hiển thị {filtered.length} / {customers.length} người dùng
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
