'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Search, ShieldCheck, ShieldAlert, X, Plus,
  CheckCircle, Ban, Globe, ChevronRight, Save,
  Truck, ArrowLeft, Package, RefreshCw,
  Clock, Sparkles, User, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

type TicketStatus = 'RECEIVED' | 'SENT_TO_MANUFACTURER' | 'REPAIRED_EXCHANGED' | 'READY_FOR_PICKUP' | 'CLOSED' | 'PENDING_APPROVAL' | 'REJECTED';

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }

const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; text: string; border: string; glow: string }> = {
  PENDING_APPROVAL:     { label: 'Chờ duyệt',       bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/25',   glow: 'shadow-amber-500/10' },
  RECEIVED:             { label: 'Tiếp nhận',        bg: 'bg-sky-500/15',     text: 'text-sky-300',     border: 'border-sky-500/25',     glow: 'shadow-sky-500/10' },
  SENT_TO_MANUFACTURER: { label: 'Gửi hãng',         bg: 'bg-violet-500/15',  text: 'text-violet-300',  border: 'border-violet-500/25',  glow: 'shadow-violet-500/10' },
  REPAIRED_EXCHANGED:   { label: 'Đã sửa/Đổi máy',  bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/25', glow: 'shadow-emerald-500/10' },
  READY_FOR_PICKUP:     { label: 'Chờ lấy hàng',    bg: 'bg-teal-500/15',    text: 'text-teal-300',    border: 'border-teal-500/25',    glow: 'shadow-teal-500/10' },
  CLOSED:               { label: 'Hoàn tất',         bg: 'bg-slate-500/10',   text: 'text-slate-400',   border: 'border-slate-500/20',   glow: '' },
  REJECTED:             { label: 'Từ chối',          bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/25',    glow: 'shadow-rose-500/10' },
};

const STATS_COLORS = [
  { bg: 'from-sky-500/20 to-sky-600/5',     border: 'border-sky-500/20',     text: 'text-sky-400',     label: 'text-sky-300/60' },
  { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', text: 'text-emerald-400', label: 'text-emerald-300/60' },
  { bg: 'from-rose-500/20 to-rose-600/5',   border: 'border-rose-500/20',    text: 'text-rose-400',    label: 'text-rose-300/60' },
  { bg: 'from-violet-500/20 to-violet-600/5', border: 'border-violet-500/20', text: 'text-violet-400', label: 'text-violet-300/60' },
];

export default function AdminWarranty() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'ONLINE_REQUESTS'>('MANAGEMENT');
  const [view, setView] = useState<'LIST' | 'DETAILS' | 'CREATE_TICKET'>('LIST');

  // Data
  const [allWarranties, setAllWarranties] = useState<any[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [selectedWarranty, setSelectedWarranty] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [onlineRequests, setOnlineRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [ticketForm, setTicketForm] = useState({ issue_description: '', receive_condition: '' });
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);
  const [updateForm, setUpdateForm] = useState({ status: '' as TicketStatus, new_serial_number: '', staff_notes: '', shipping_code: '' });

  // ── Fetch all warranties on mount ─────────────────────────────────────
  const fetchAllWarranties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/warranty');
      const data = await res.json();
      if (res.ok) setAllWarranties(data);
    } catch { toast.error('Lỗi tải dữ liệu bảo hành'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchAllWarranties();
  }, [fetchAllWarranties]);

  useEffect(() => {
    if (activeTab === 'ONLINE_REQUESTS') fetchOnlineRequests();
  }, [activeTab]);

  // ── Client-side filter ────────────────────────────────────────────────
  const filteredWarranties = allWarranties.filter(w => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return (
      (w.customer_phone || '').includes(q) ||
      (w.serial_number || '').toLowerCase().includes(q) ||
      (w.product_name || '').toLowerCase().includes(q)
    );
  });

  // ── Stats ─────────────────────────────────────────────────────────────
  const now = new Date();
  const totalActive   = allWarranties.filter(w => new Date(w.end_date) >= now).length;
  const totalExpired  = allWarranties.filter(w => new Date(w.end_date) < now).length;
  const totalAll      = allWarranties.length;

  const stats = [
    { label: 'Tổng sản phẩm', value: totalAll,    icon: Package },
    { label: 'Còn bảo hành',  value: totalActive,  icon: ShieldCheck },
    { label: 'Hết hạn',       value: totalExpired, icon: ShieldAlert },
    { label: 'Chờ online',    value: onlineRequests.length, icon: Globe },
  ];

  // ── API handlers ──────────────────────────────────────────────────────
  const fetchTickets = async (warrantyId: number) => {
    try {
      const res = await fetch(`/api/admin/warranty/tickets?warranty_id=${warrantyId}`);
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch (err) { console.error(err); }
  };

  const fetchOnlineRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/warranty/tickets');
      const data = await res.json();
      if (res.ok) setOnlineRequests(data.filter((t: any) => t.type === 'ONLINE' && t.status === 'PENDING_APPROVAL'));
    } catch { toast.error('Lỗi tải yêu cầu online'); }
    finally { setLoading(false); }
  };

  const selectWarranty = (w: any) => {
    setSelectedWarranty(w);
    fetchTickets(w.id);
    setView('DETAILS');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('Đang tạo phiếu...');
    try {
      const res = await fetch('/api/admin/warranty/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warranty_id: selectedWarranty.id, ...ticketForm })
      });
      if (res.ok) {
        toast.success('Đã tạo phiếu tiếp nhận!', { id: t });
        setView('DETAILS');
        fetchTickets(selectedWarranty.id);
        setTicketForm({ issue_description: '', receive_condition: '' });
      } else toast.error('Lỗi khi tạo phiếu', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  const handleUpdateTicket = async (e?: React.FormEvent, directId?: number, directData?: any) => {
    if (e) e.preventDefault();
    const id = directId || updatingTicketId;
    const body = directData || updateForm;
    const t = toast.loading('Đang cập nhật...');
    try {
      const res = await fetch('/api/admin/warranty/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...body })
      });
      if (res.ok) {
        toast.success('Cập nhật thành công!', { id: t });
        setUpdatingTicketId(null);
        if (selectedWarranty) fetchTickets(selectedWarranty.id);
        if (activeTab === 'ONLINE_REQUESTS') fetchOnlineRequests();
        if (body.new_serial_number && selectedWarranty)
          setSelectedWarranty({ ...selectedWarranty, serial_number: body.new_serial_number });
      } else toast.error('Lỗi cập nhật', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  if (!mounted || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Hệ thống bảo hành</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">BẢO HÀNH ERP</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.04] border border-white/[0.06] rounded-2xl shrink-0">
          <button
            onClick={() => { setActiveTab('MANAGEMENT'); setView('LIST'); }}
            className={cn(
              'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
              activeTab === 'MANAGEMENT'
                ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            )}
          >Showroom</button>
          <button
            onClick={() => setActiveTab('ONLINE_REQUESTS')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
              activeTab === 'ONLINE_REQUESTS'
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Online
            {onlineRequests.length > 0 && (
              <span className="bg-rose-500 text-white w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-black animate-pulse">
                {onlineRequests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── MANAGEMENT ─────────────────────────────────────────────────── */}
      {activeTab === 'MANAGEMENT' ? (
        <AnimatePresence mode="wait">

          {/* LIST VIEW */}
          {view === 'LIST' && (
            <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                {stats.map((s, i) => {
                  const c = STATS_COLORS[i];
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={cn('bg-gradient-to-br rounded-2xl border p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4', c.bg, c.border)}>
                      <div className={cn('p-2 sm:p-2.5 rounded-xl bg-black/20 shrink-0', c.text)}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={cn('text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 truncate', c.label)}>{s.label}</p>
                        <p className={cn('text-xl sm:text-2xl font-black truncate', c.text)}>{s.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Lọc theo SĐT, số sê-ri (S/N) hoặc tên sản phẩm..."
                    className="w-full h-12 bg-[#111]/80 border border-white/[0.08] rounded-2xl pl-11 pr-10 text-white text-sm font-medium outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600"
                  />
                  {searchQ && (
                    <button onClick={() => setSearchQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchAllWarranties}
                  disabled={loading}
                  className="h-12 px-5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-2xl text-slate-300 transition-all cursor-pointer"
                  title="Tải lại"
                >
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </button>
              </div>

              {/* Table */}
              <div className="bg-[#0e0e0e] border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
                {/* Table Head */}
                {/* Mobile View: Cards (<640px) */}
                <div className="block sm:hidden divide-y divide-white/[0.04]">
                  {loading ? (
                    <div className="py-16 flex items-center justify-center gap-3 text-slate-600">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu...</span>
                    </div>
                  ) : filteredWarranties.length === 0 ? (
                    <div className="py-16 text-center text-slate-600">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-25" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        {searchQ ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu bảo hành'}
                      </p>
                    </div>
                  ) : (
                    filteredWarranties.map(item => {
                      const isExpired = new Date(item.end_date) < now;
                      const daysLeft = Math.ceil((new Date(item.end_date).getTime() - now.getTime()) / 86400000);
                      return (
                        <button
                          key={item.id}
                          onClick={() => selectWarranty(item)}
                          className="w-full p-4 space-y-3 hover:bg-white/[0.03] transition-colors text-left block active:scale-98 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-11 h-11 bg-black rounded-xl border border-white/[0.06] flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                                <img src={item.product_image || '/laptop.png'} alt="" className="w-full h-full object-contain opacity-80" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate leading-tight">{item.product_name}</p>
                                <p className="text-[10px] font-mono text-sky-400 font-bold mt-0.5">S/N: {item.serial_number}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0 mt-1" />
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
                            <div className="flex items-center gap-1.5 min-w-0 text-slate-400">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="text-[11px] font-semibold truncate">{item.customer_phone || '—'}</span>
                            </div>

                            <span className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0',
                              isExpired
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : daysLeft <= 30
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            )}>
                              <span className={cn('w-1.5 h-1.5 rounded-full',
                                isExpired ? 'bg-rose-400' : daysLeft <= 30 ? 'bg-amber-400' : 'bg-emerald-400'
                              )} />
                              {isExpired ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Desktop View: Table (hidden sm:block) */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Sản phẩm &amp; S/N</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Khách hàng</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hạn bảo hành</span>
                    <span />
                  </div>

                  {/* Rows */}
                  {loading ? (
                    <div className="py-24 flex items-center justify-center gap-3 text-slate-600">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Đang tải dữ liệu...</span>
                    </div>
                  ) : filteredWarranties.length === 0 ? (
                    <div className="py-24 text-center text-slate-600">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-25" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        {searchQ ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu bảo hành'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {filteredWarranties.map(item => {
                        const isExpired = new Date(item.end_date) < now;
                        const daysLeft = Math.ceil((new Date(item.end_date).getTime() - now.getTime()) / 86400000);
                        return (
                          <button
                            key={item.id}
                            onClick={() => selectWarranty(item)}
                            className="w-full grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-6 py-4 hover:bg-white/[0.03] transition-colors group text-left cursor-pointer"
                          >
                            {/* Product */}
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 bg-black rounded-xl border border-white/[0.06] flex items-center justify-center p-1.5 shrink-0">
                                <img src={item.product_image || '/laptop.png'} alt="" className="w-full h-full object-contain opacity-80" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-white truncate group-hover:text-sky-300 transition-colors">{item.product_name}</p>
                                <p className="text-[10px] font-mono text-sky-400/70 font-bold">S/N: {item.serial_number}</p>
                              </div>
                            </div>

                            {/* Customer */}
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="text-xs text-slate-300 font-semibold truncate">{item.customer_phone || '—'}</span>
                            </div>

                            {/* Expiry */}
                            <div>
                              <span className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border',
                                isExpired
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : daysLeft <= 30
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              )}>
                                <span className={cn('w-1.5 h-1.5 rounded-full',
                                  isExpired ? 'bg-rose-400' : daysLeft <= 30 ? 'bg-amber-400' : 'bg-emerald-400'
                                )} />
                                {isExpired ? 'Hết hạn' : `${daysLeft}d`}
                              </span>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer count */}
                {filteredWarranties.length > 0 && (
                  <div className="px-6 py-3 border-t border-white/[0.04] bg-white/[0.01]">
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      {filteredWarranties.length} / {allWarranties.length} bản ghi
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* DETAILS VIEW */}
          {view === 'DETAILS' && selectedWarranty && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setView('LIST'); setSelectedWarranty(null); setTickets([]); }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
                >
                  <ArrowLeft size={14} /> Quay lại
                </button>
                <button
                  onClick={() => setView('CREATE_TICKET')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-violet-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <Plus size={14} /> Tạo phiếu tiếp nhận
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Info card */}
                <div className="bg-gradient-to-b from-sky-500/10 to-transparent border border-sky-500/15 rounded-3xl p-6 space-y-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-sky-400/60">Thông tin sản phẩm</p>
                  <div className="w-full aspect-square bg-black/40 rounded-2xl flex items-center justify-center p-6 border border-white/[0.06]">
                    <img src={selectedWarranty.product_image || '/laptop.png'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Thiết bị</p>
                      <p className="text-base font-extrabold text-white uppercase leading-tight">{selectedWarranty.product_name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Số Sê-ri (S/N)</p>
                      <p className="text-sm font-mono text-sky-400 font-bold">{selectedWarranty.serial_number}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Khách hàng</p>
                      <p className="text-sm font-bold text-slate-200">{selectedWarranty.customer_phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Hạn bảo hành</p>
                      <p className="text-sm font-bold text-slate-200">{new Date(selectedWarranty.end_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="lg:col-span-2 bg-[#0e0e0e] border border-white/[0.06] rounded-3xl p-6 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Lịch sử phiếu bảo hành</p>
                  {tickets.length === 0 ? (
                    <div className="py-16 text-center text-slate-600">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-25" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Chưa có phiếu bảo hành nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map(ticket => {
                        const cfg = STATUS_CONFIG[ticket.status as TicketStatus] ?? STATUS_CONFIG.RECEIVED;
                        return (
                          <div key={ticket.id} className={cn('rounded-2xl border p-5 transition-all group', cfg.bg, cfg.border, 'shadow-lg', cfg.glow)}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-1.5">
                                <span className={cn('text-[9px] font-black uppercase tracking-widest', cfg.text)}>#TICKET-{ticket.id} · {ticket.type}</span>
                                <span className={cn('flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border w-fit', cfg.bg, cfg.text, cfg.border)}>
                                  {cfg.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] font-bold text-slate-500">{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</span>
                                {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                                  <button
                                    onClick={() => {
                                      setUpdatingTicketId(ticket.id);
                                      setUpdateForm({ status: ticket.status, new_serial_number: ticket.new_serial_number || '', staff_notes: ticket.staff_notes || '', shipping_code: ticket.shipping_code || '' });
                                    }}
                                    className={cn('p-2 rounded-xl transition-all cursor-pointer border', cfg.bg, cfg.text, cfg.border, 'hover:opacity-100 opacity-60')}
                                    title="Cập nhật trạng thái"
                                  >
                                    <Save size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-3">
                              <div>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Mô tả lỗi</p>
                                <p className="text-slate-300 text-xs font-semibold">{ticket.issue_description}</p>
                              </div>
                              {ticket.type === 'ONLINE' && (
                                <div>
                                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Vận chuyển</p>
                                  <p className="text-slate-400 text-xs font-semibold">
                                    {ticket.delivery_method === 'SHIPPER' ? `Shipper · ${ticket.customer_address}` : 'Khách tự mang đến'}
                                  </p>
                                </div>
                              )}
                              {ticket.staff_notes && (
                                <div>
                                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Ghi chú</p>
                                  <p className="text-slate-400 text-xs italic">{ticket.staff_notes}</p>
                                </div>
                              )}
                              {ticket.new_serial_number && (
                                <div>
                                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">S/N mới</p>
                                  <p className="text-emerald-400 font-mono text-xs font-bold">{ticket.new_serial_number}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* CREATE TICKET VIEW */}
          {view === 'CREATE_TICKET' && selectedWarranty && (
            <motion.div key="create" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="max-w-2xl mx-auto">
              <div className="bg-[#0e0e0e] border border-white/[0.07] rounded-3xl p-8 space-y-6">
                <button onClick={() => setView('DETAILS')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <ArrowLeft size={14} /> Quay lại
                </button>
                <h2 className="text-2xl font-black text-white uppercase">Phiếu tiếp nhận bảo hành</h2>

                {/* Product banner */}
                <div className="flex items-center gap-4 p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                  <div className="w-11 h-11 bg-black rounded-xl p-2 border border-white/[0.06] shrink-0">
                    <img src={selectedWarranty.product_image || '/laptop.png'} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm uppercase">{selectedWarranty.product_name}</p>
                    <p className="text-[10px] font-mono text-sky-400">S/N: {selectedWarranty.serial_number}</p>
                  </div>
                </div>

                <form onSubmit={handleCreateTicket} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mô tả lỗi của khách</label>
                    <textarea required rows={3} value={ticketForm.issue_description}
                      onChange={e => setTicketForm({ ...ticketForm, issue_description: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-white text-sm font-semibold outline-none focus:border-sky-500/50 transition-all resize-none placeholder:text-slate-600"
                      placeholder="Khách mô tả sự cố..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ngoại quan &amp; Phụ kiện kèm theo</label>
                    <textarea required rows={3} value={ticketForm.receive_condition}
                      onChange={e => setTicketForm({ ...ticketForm, receive_condition: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-white text-sm font-semibold outline-none focus:border-sky-500/50 transition-all resize-none placeholder:text-slate-600"
                      placeholder="Tình trạng máy, phụ kiện kèm..." />
                  </div>
                  <button type="submit" className="w-full h-12 bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer">
                    Xác nhận tạo phiếu
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      ) : (
        /* ── ONLINE REQUESTS TAB ───────────────────────────────────────── */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {onlineRequests.length > 0 ? `${onlineRequests.length} yêu cầu đang chờ duyệt` : 'Hàng đợi yêu cầu Online'}
            </p>
            <button onClick={fetchOnlineRequests} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 transition-all cursor-pointer">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
          </div>

          {onlineRequests.length === 0 ? (
            <div className="py-24 text-center text-slate-600 bg-[#0e0e0e] rounded-3xl border border-white/[0.05]">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Không có yêu cầu nào đang chờ duyệt</p>
            </div>
          ) : (
            <div className="space-y-3">
              {onlineRequests.map(req => (
                <div key={req.id} className="bg-[#0e0e0e] border border-rose-500/10 rounded-2xl p-5 flex items-center gap-5 hover:border-rose-500/20 transition-all group">
                  <div className="w-14 h-14 bg-black rounded-2xl p-2 border border-white/[0.06] shrink-0">
                    <img src={req.product_image || '/laptop.png'} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">#BH-{req.id}</span>
                      <span className="text-[9px] font-bold text-slate-500">{new Date(req.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white uppercase truncate mb-0.5">{req.product_name}</h3>
                    <p className="text-slate-400 text-xs font-semibold truncate italic">"{req.issue_description}"</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Truck size={12} className="text-slate-500" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        {req.delivery_method === 'SHIPPER' ? `Shipper · ${req.customer_address}` : 'Khách tự mang đến'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateTicket(undefined, req.id, { status: 'RECEIVED', staff_notes: 'Duyệt Online - Đã nhận đơn' })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    ><CheckCircle size={13} /> Duyệt</button>
                    <button
                      onClick={() => handleUpdateTicket(undefined, req.id, { status: 'REJECTED', staff_notes: 'Từ chối Online - Không đủ điều kiện' })}
                      className="flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    ><Ban size={13} /> Từ chối</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Update Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {updatingTicketId && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setUpdatingTicketId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative bg-[#111] border border-white/[0.08] p-8 rounded-3xl w-full max-w-lg shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-white uppercase">Cập nhật phiếu <span className="text-sky-400">#{updatingTicketId}</span></h2>
                <button onClick={() => setUpdatingTicketId(null)} className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateTicket} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái</label>
                  <select
                    value={updateForm.status}
                    onChange={e => setUpdateForm({ ...updateForm, status: e.target.value as TicketStatus })}
                    className="w-full h-11 bg-[#1a1a1a] border border-white/[0.08] rounded-xl px-4 text-white font-semibold text-sm outline-none focus:border-sky-500/50 appearance-none cursor-pointer"
                  >
                    <option value="PENDING_APPROVAL">0. Chờ duyệt Online</option>
                    <option value="RECEIVED">1. Đã tiếp nhận</option>
                    <option value="SENT_TO_MANUFACTURER">2. Đang gửi hãng</option>
                    <option value="REPAIRED_EXCHANGED">3. Đã sửa / Đổi máy</option>
                    <option value="READY_FOR_PICKUP">4. Chờ khách lấy</option>
                    <option value="CLOSED">5. Hoàn tất (Đóng)</option>
                    <option value="REJECTED">6. Từ chối bảo hành</option>
                  </select>
                </div>

                {updateForm.status === 'REPAIRED_EXCHANGED' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">S/N mới (nếu đổi máy)</label>
                    <input
                      value={updateForm.new_serial_number}
                      onChange={e => setUpdateForm({ ...updateForm, new_serial_number: e.target.value })}
                      placeholder="Nhập S/N mới..."
                      className="w-full h-11 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 text-emerald-400 font-mono text-sm outline-none focus:border-emerald-400"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ghi chú kỹ thuật</label>
                  <textarea rows={3} value={updateForm.staff_notes}
                    onChange={e => setUpdateForm({ ...updateForm, staff_notes: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 text-white text-sm font-semibold outline-none focus:border-sky-500/50 resize-none transition-all"
                    placeholder="Ghi chú nội bộ, mã vận đơn..."
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="submit" className="flex-1 h-11 bg-gradient-to-r from-sky-500 to-violet-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.01] shadow-lg shadow-sky-500/15 cursor-pointer">Lưu thay đổi</button>
                  <button type="button" onClick={() => setUpdatingTicketId(null)} className="px-6 h-11 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.06] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer">Hủy</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
