'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  MapPin, Trash2, Edit3, X, Package, Truck, Box,
  Search, ChevronDown, ChevronUp, DollarSign, RefreshCcw,
  FileText, ArrowUpDown, Info, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// ── Status config ─────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  PENDING:   { label: 'Đang chờ',   bg: 'bg-amber-500/15',   text: 'text-amber-300',   border: 'border-amber-500/25',   dot: 'bg-amber-400' },
  SHIPPED:   { label: 'Đang giao',  bg: 'bg-sky-500/15',     text: 'text-sky-300',     border: 'border-sky-500/25',     dot: 'bg-sky-400' },
  COMPLETED: { label: 'Hoàn thành', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
  CANCELLED: { label: 'Đã hủy',    bg: 'bg-rose-500/15',    text: 'text-rose-300',    border: 'border-rose-500/25',    dot: 'bg-rose-400' },
} as const;

const TRIAL_STATUS: Record<string, { label: string; color: string }> = {
  TRIALING:        { label: 'Đang thử',    color: 'text-indigo-400' },
  APPROVED_PAID:   { label: 'Đã chuyển mua', color: 'text-emerald-400' },
  REJECTED_RETURN: { label: 'Yêu cầu trả', color: 'text-rose-400' },
  COLLECTED:       { label: 'Đã thu hồi',  color: 'text-slate-400' },
};

export default function AdminOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [adminSeenOrders, setAdminSeenOrders] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    address: '', total_price: '', vat_status: 'PENDING', status: '',
    packer_name: '', shipper_name: '', shipper_phone: '', note: '',
    is_trial: false, trial_days: '3', trial_status: 'TRIALING',
    trial_feedback: '', deposit_amount: '', deposit_status: '', deposit_note: ''
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const stored = localStorage.getItem('tech_store_admin_seen_orders');
    if (stored) { try { setAdminSeenOrders(JSON.parse(stored)); } catch (e) { } }
  }, []);

  const markAdminOrderAsSeen = (orderId: number, currentStatus: string) => {
    const updated = { ...adminSeenOrders, [orderId.toString()]: currentStatus };
    setAdminSeenOrders(updated);
    localStorage.setItem('tech_store_admin_seen_orders', JSON.stringify(updated));
  };

  const hasAdminOrderUpdate = (order: any) => adminSeenOrders[order.id.toString()] !== order.status;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch { toast.error('Lỗi tải đơn hàng'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    setMounted(true);
    if (user && (user.role === 'ADMIN' || user.role === 'STAFF')) fetchOrders();
  }, [user]);

  const updateStatus = async (id: number, newStatus: string) => {
    const t = toast.loading('Đang cập nhật...');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Gửi actor_name làm packer_name — backend chỉ ghi khi chưa có (first-touch)
        body: JSON.stringify({ id, status: newStatus, actor_name: user?.name || 'Nhân viên', packer_name: user?.name || 'Nhân viên' })
      });
      if (res.ok) { toast.success('Đã cập nhật trạng thái', { id: t }); fetchOrders(); }
      else toast.error('Lỗi cập nhật', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  const fetchTimeline = async (orderId: number) => {
    try {
      setTimelineLoading(true);
      const res = await fetch(`/api/admin/orders/timeline?order_id=${orderId}`);
      if (res.ok) setTimeline(await res.json());
    } catch { } finally { setTimelineLoading(false); }
  };

  const runMockCron = async () => {
    const t = toast.loading('Đang quét hạn dùng thử...');
    try {
      const res = await fetch('/api/cron/trial-check', { method: 'POST' });
      if (res.ok) { const data = await res.json(); toast.success(data.message, { id: t }); fetchOrders(); }
      else toast.error('Lỗi khi chạy quét', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('Đang cập nhật...');
    try {
      let trialExpiredAt = null;
      if (formData.is_trial) {
        const days = parseInt(formData.trial_days) || 3;
        const now = new Date(); now.setDate(now.getDate() + days);
        trialExpiredAt = now.toISOString().slice(0, 19).replace('T', ' ');
      }
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id, address: formData.address,
          total_price: parseFloat(formData.total_price), status: formData.status || undefined,
          packer_name: formData.packer_name, shipper_name: formData.shipper_name,
          shipper_phone: formData.shipper_phone, note: formData.note || undefined,
          actor_name: user?.name || 'Nhân viên', vatStatus: editingOrder.has_vat ? formData.vat_status : undefined,
          is_trial: formData.is_trial ? 1 : 0, trial_expired_at: trialExpiredAt,
          trial_status: formData.is_trial ? formData.trial_status : null,
          trial_feedback: formData.is_trial ? formData.trial_feedback : null,
          deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : undefined,
          deposit_status: formData.deposit_status || undefined, deposit_note: formData.deposit_note || undefined
        })
      });
      if (res.ok) { toast.success('Đã cập nhật đơn hàng', { id: t }); setIsModalOpen(false); fetchOrders(); }
      else toast.error('Lỗi cập nhật', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa đơn hàng này sẽ xóa vĩnh viễn mọi dữ liệu liên quan. Bạn chắc chứ?')) return;
    const t = toast.loading('Đang xóa...');
    try {
      const res = await fetch('/api/admin/orders', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (res.ok) { toast.success('Đã xóa đơn hàng', { id: t }); fetchOrders(); }
      else toast.error('Lỗi khi xóa', { id: t });
    } catch { toast.error('Lỗi kết nối', { id: t }); }
  };

  const openEditModal = (order: any) => {
    markAdminOrderAsSeen(order.id, order.status);
    setEditingOrder(order);
    // Hiển thị packer_name từ DB — là người đầu tiên thay đổi trạng thái (không override)
    setFormData({
      address: order.address || '', total_price: order.total_price.toString(),
      vat_status: order.vat_status || 'PENDING', status: order.status || 'PENDING',
      packer_name: order.packer_name || '', shipper_name: order.shipper_name || '',
      shipper_phone: order.shipper_phone || '', note: '', is_trial: order.is_trial === 1,
      trial_days: '3', trial_status: order.trial_status || 'TRIALING',
      trial_feedback: order.trial_feedback || '',
      deposit_amount: order.deposit_amount ? order.deposit_amount.toString() : '',
      deposit_status: order.deposit_status || '', deposit_note: ''
    });
    setTimeline([]); fetchTimeline(order.id); setIsModalOpen(true);
  };

  const toggleExpandOrder = (id: number) => {
    setExpandedOrders(prev => {
      const isExpanding = !prev.includes(id);
      if (isExpanding) { const o = orders.find(o => o.id === id); if (o) markAdminOrderAsSeen(o.id, o.status); }
      return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalRevenue     = orders.filter(o => o.status === 'COMPLETED').reduce((a, o) => a + Number(o.total_price), 0);
  const pendingCount     = orders.filter(o => o.status === 'PENDING').length;
  const trialingCount    = orders.filter(o => o.is_trial === 1 && o.trial_status === 'TRIALING').length;
  const pendingVatCount  = orders.filter(o => o.has_vat === 1 && o.vat_status === 'PENDING').length;

  // ── Filter / Sort ─────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const matchSearch =
      o.id.toString().includes(searchTerm) ||
      (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customer_phone || '').includes(searchTerm) ||
      (o.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'TRIAL') return o.is_trial === 1;
    return o.status === statusFilter;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'highest_price') return Number(b.total_price) - Number(a.total_price);
    if (sortBy === 'lowest_price') return Number(a.total_price) - Number(b.total_price);
    return 0;
  });

  if (!mounted || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return null;

  const FILTER_TABS = [
    { label: 'Tất cả',    value: 'ALL',       count: orders.length },
    { label: 'Đang chờ',  value: 'PENDING',   count: orders.filter(o => o.status === 'PENDING').length },
    { label: 'Đang giao', value: 'SHIPPED',   count: orders.filter(o => o.status === 'SHIPPED').length },
    { label: 'Hoàn thành',value: 'COMPLETED', count: orders.filter(o => o.status === 'COMPLETED').length },
    { label: 'Dùng thử',  value: 'TRIAL',     count: orders.filter(o => o.is_trial === 1).length },
    { label: 'Đã hủy',    value: 'CANCELLED', count: orders.filter(o => o.status === 'CANCELLED').length },
  ];

  return (
    <div className="space-y-7">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
              <Package className="w-3 h-3 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Quản lý giao dịch</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Đơn Hàng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runMockCron}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <RefreshCcw size={13} /> Quét dùng thử
          </button>
          <div className="px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-wider">
            {orders.length} đơn
          </div>
        </div>
      </header>

      {/* ── KPI Stats ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: 'Doanh thu',    value: `${totalRevenue.toLocaleString()}₫`, sub: 'Hoàn thành',  from: 'from-emerald-500/20', border: 'border-emerald-500/20', text: 'text-emerald-300', icon: DollarSign },
          { label: 'Chờ xử lý',   value: `${pendingCount} đơn`,              sub: 'Cần xác nhận',        from: 'from-amber-500/20',   border: 'border-amber-500/20',   text: 'text-amber-300',   icon: Package    },
          { label: 'Đang dùng thử', value: `${trialingCount} thiết bị`,      sub: 'Trong thời hạn', from: 'from-indigo-500/20',  border: 'border-indigo-500/20',  text: 'text-indigo-300',  icon: Box        },
          { label: 'Hóa đơn VAT',  value: `${pendingVatCount} đơn`,          sub: 'Yêu cầu xuất',  from: 'from-rose-500/20',    border: 'border-rose-500/20',    text: 'text-rose-300',    icon: FileText   },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={cn('bg-gradient-to-br to-transparent rounded-2xl border p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4', s.from, s.border)}>
              <div className={cn('p-2 sm:p-2.5 rounded-xl bg-black/20 shrink-0', s.text)}><Icon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5 truncate">{s.label}</p>
                <p className={cn('text-base sm:text-xl font-black truncate', s.text)}>{s.value}</p>
                <p className="text-[8px] text-slate-600 font-bold mt-0.5 truncate hidden sm:block">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 bg-[#0e0e0e] border border-white/[0.05] rounded-2xl">
        {/* Status tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {FILTER_TABS.map(tab => {
            const hasUnread = orders.some(o => {
              const match = tab.value === 'ALL' ? true : tab.value === 'TRIAL' ? o.is_trial === 1 : o.status === tab.value;
              return match && hasAdminOrderUpdate(o);
            });
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all relative cursor-pointer whitespace-nowrap shrink-0',
                  statusFilter === tab.value
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
                )}
              >
                {tab.label}
                <span className={cn('text-[8px] px-1.5 py-0.5 rounded-md font-black',
                  statusFilter === tab.value ? 'bg-sky-500/20 text-sky-400' : 'bg-white/5 text-slate-600'
                )}>{tab.count}</span>
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text" placeholder="Tìm tên, SĐT, mã đơn..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 bg-white/[0.03] border border-white/[0.06] rounded-xl pl-9 pr-4 text-white text-xs font-medium placeholder:text-slate-600 outline-none focus:border-sky-500/40 transition-all"
            />
          </div>
          <div className="relative shrink-0">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-9 bg-white/[0.03] border border-white/[0.06] rounded-xl pl-8 pr-3 text-white text-[10px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest_price">Giá trị ↓</option>
              <option value="lowest_price">Giá trị ↑</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Order List ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Đang tải dữ liệu...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-white/[0.06] text-slate-600">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isExpanded = expandedOrders.includes(order.id);
            const statusCfg = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] ?? ORDER_STATUS.PENDING;
            const trialCfg = order.trial_status ? TRIAL_STATUS[order.trial_status] : null;

            return (
              <motion.div
                key={order.id}
                layout
                className={cn(
                  'rounded-2xl border transition-all duration-200 overflow-hidden',
                  isExpanded
                    ? 'bg-[#0e0e0e] border-sky-500/20'
                    : 'bg-[#0a0a0a] border-white/[0.05] hover:border-white/[0.09]'
                )}
              >
                {/* ── Summary Row ── */}
                <div
                  onClick={() => toggleExpandOrder(order.id)}
                  className="p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 cursor-pointer select-none"
                >
                  {/* Row Top: ID + customer + Price on mobile */}
                  <div className="flex-1 min-w-0 space-y-1 w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          #ORD-{order.id}
                        </span>
                        <span className="text-[9px] font-medium text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {/* Mobile price indicator */}
                      <div className="sm:hidden text-right">
                        <p className="text-xs font-black text-primary">{Number(order.total_price).toLocaleString()}₫</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-base font-extrabold text-white uppercase truncate leading-tight">
                      {order.customer_name || 'Khách vãng lai'}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{order.address || 'Tại cửa hàng'}</span>
                    </div>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden sm:block shrink-0 text-left w-36">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Giá trị</p>
                    <p className="text-lg font-black text-white">{Number(order.total_price).toLocaleString()}₫</p>
                    <p className="text-[9px] text-slate-600 font-bold">{order.delivery_method === 'pickup' ? 'Tại quầy' : 'Giao tận nơi'}</p>
                  </div>

                  {/* Badges & Actions Container on Mobile */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 text-xs">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border', statusCfg.bg, statusCfg.text, statusCfg.border)}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
                        {statusCfg.label}
                      </span>
                      {order.has_vat === 1 && (
                        <span className="px-1.5 py-0.5 rounded-lg text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">VAT</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="h-7 bg-black border border-white/10 rounded-lg px-1.5 text-[9px] font-bold text-slate-300 uppercase cursor-pointer outline-none appearance-none"
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>

                      <button onClick={() => openEditModal(order)} title="Chỉnh sửa"
                        className="p-1.5 bg-white/5 hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 rounded-lg transition-all cursor-pointer">
                        <Edit3 size={12} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(order.id)} title="Xóa"
                          className="p-1.5 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      )}
                      <button onClick={() => toggleExpandOrder(order.id)}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer">
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Expanded Detail ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      className="border-t border-white/[0.05]"
                    >
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Products */}
                        <div className="lg:col-span-7 space-y-3">
                          <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-2">
                            <Box size={11} /> Sản phẩm trong đơn ({order.items?.length || 0})
                          </p>
                          <div className="space-y-2 max-h-[280px] overflow-y-auto no-scrollbar">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                                  <div className="relative w-12 h-12 bg-black rounded-xl overflow-hidden shrink-0 border border-white/[0.06]">
                                    <Image src={item.image || '/laptop.png'} alt={item.name} fill className="object-contain p-1" sizes="48px" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-sky-400/70 uppercase tracking-widest">{item.brand || 'Tech-Store'}</p>
                                    <p className="text-xs font-bold text-white truncate uppercase">{item.name}</p>
                                    <p className="text-[9px] text-slate-500">Số lượng: <span className="text-slate-300 font-extrabold">{item.quantity}</span></p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-white">{Number(item.price).toLocaleString()}₫</p>
                                    {item.quantity > 1 && <p className="text-[8px] text-slate-500">x{item.quantity}</p>}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-600 text-xs italic py-4">Không có sản phẩm nào.</p>
                            )}
                          </div>
                          {order.note && (
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Ghi chú khách</p>
                              <p className="text-xs text-slate-300 font-semibold">{order.note}</p>
                            </div>
                          )}
                        </div>

                        {/* Shipping + VAT + Trial */}
                        <div className="lg:col-span-5 space-y-3">
                          {/* Shipping */}
                          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                            <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                              <Truck size={11} /> Thông tin vận chuyển
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase mb-0.5">Người nhận</p>
                                <p className="font-bold text-white">{order.customer_name || 'Khách vãng lai'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase mb-0.5">SĐT</p>
                                <p className="font-bold text-white">{order.customer_phone || '—'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[9px] text-slate-500 uppercase mb-0.5">Địa chỉ</p>
                                <p className="font-semibold text-slate-300 leading-relaxed">{order.address || 'Nhận tại cửa hàng'}</p>
                              </div>
                              {(order.packer_name || order.shipper_name) && (
                                <>
                                  {order.packer_name && <div>
                                    <p className="text-[9px] text-slate-500 uppercase mb-0.5">Đóng gói</p>
                                    <p className="font-black text-emerald-400 uppercase">{order.packer_name}</p>
                                  </div>}
                                  {order.shipper_name && <div>
                                    <p className="text-[9px] text-slate-500 uppercase mb-0.5">Shipper</p>
                                    <p className="font-black text-indigo-400 uppercase">{order.shipper_name} {order.shipper_phone && `(${order.shipper_phone})`}</p>
                                  </div>}
                                </>
                              )}
                            </div>
                          </div>

                          {/* VAT */}
                          {order.has_vat === 1 && (
                            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15">
                              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <FileText size={11} /> Hóa đơn đỏ (VAT)
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">MST</p><p className="font-bold text-white">{order.vat_mst}</p></div>
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Công ty</p><p className="font-bold text-white truncate">{order.vat_company_name}</p></div>
                                <div className="col-span-2"><p className="text-[9px] text-slate-500 uppercase mb-0.5">Email</p><p className="font-semibold text-slate-300">{order.vat_email}</p></div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                                <span className={cn('px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border',
                                  order.vat_status === 'ISSUED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                )}>
                                  {order.vat_status === 'ISSUED' ? 'Đã xuất' : 'Chờ xuất'}
                                </span>
                                {order.vat_status !== 'ISSUED' && (
                                  <button
                                    onClick={async () => {
                                      const t = toast.loading('Đang xuất hóa đơn...');
                                      const res = await fetch('/api/admin/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, vatStatus: 'ISSUED' }) });
                                      if (res.ok) { toast.success('Đã xuất hóa đơn!', { id: t }); fetchOrders(); }
                                      else toast.error('Lỗi cập nhật', { id: t });
                                    }}
                                    className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500 border border-sky-500/20 text-sky-400 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                  >Đồng bộ e-Invoice →</button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Trial */}
                          {order.is_trial === 1 && (
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Info size={11} /> Chi tiết dùng thử
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Cọc</p><p className="font-black text-amber-300">{order.deposit_amount ? `${Number(order.deposit_amount).toLocaleString()}₫` : 'N/A'}</p></div>
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Hạn thử</p><p className="font-bold text-white">{order.trial_expired_at ? new Date(order.trial_expired_at).toLocaleDateString('vi-VN') : 'N/A'}</p></div>
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Tình trạng</p><p className={cn('font-black uppercase', trialCfg?.color ?? 'text-slate-400')}>{trialCfg?.label ?? 'N/A'}</p></div>
                                <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Trạng thái cọc</p><p className="font-bold text-slate-300 text-[10px]">
                                  {order.deposit_status === 'PENDING_DEPOSIT' ? '⏳ Chờ nộp' :
                                    order.deposit_status === 'DEPOSITED' ? '✅ Đã nhận' :
                                      order.deposit_status === 'REFUNDED' ? '💳 Đã hoàn' :
                                        order.deposit_status === 'FORFEITED' ? '🚨 Tịch thu' : 'N/A'}
                                </p></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </section>

      {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto no-scrollbar">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            />
            <div className="relative min-h-screen flex items-start justify-center p-4 md:p-10 pointer-events-none">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-[#0d0d0d] border border-white/[0.08] p-6 md:p-10 rounded-3xl w-full max-w-5xl shadow-2xl pointer-events-auto mt-8 mb-8"
              >
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <span className="text-[9px] font-black text-sky-400 uppercase tracking-[0.35em] block mb-1">Cập nhật đơn hàng</span>
                    <h2 className="text-2xl font-black text-white uppercase">#ORD-{editingOrder?.id}</h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1">
                    <X size={22} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* Form */}
                  <form onSubmit={handleUpdateDetails} className="lg:col-span-7 space-y-5 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trạng thái đơn</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                          className="w-full h-11 bg-[#161616] border border-white/[0.08] rounded-xl px-4 text-white font-semibold text-sm outline-none focus:border-sky-500/40 appearance-none cursor-pointer">
                          <option value="PENDING" className="bg-black">Chờ xử lý</option>
                          <option value="SHIPPED" className="bg-black">Đang giao</option>
                          <option value="COMPLETED" className="bg-black">Hoàn thành</option>
                          <option value="CANCELLED" className="bg-black">Đã hủy</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          Nhân viên đóng gói
                          <span className="text-[8px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded font-bold normal-case tracking-normal">Tự đặt</span>
                        </label>
                        <input
                          type="text"
                          value={formData.packer_name || '—'}
                          readOnly
                          className="w-full h-11 bg-[#0f0f0f] border border-white/[0.05] rounded-xl px-4 text-slate-400 text-sm font-semibold outline-none cursor-not-allowed select-none"
                        />
                        <p className="text-[9px] text-slate-600">
                          {formData.packer_name
                            ? `Người đầu tiên thay đổi trạng thái đơn hàng`
                            : `Chưa có — sẽ tự điền khi ai đó thay đổi trạng thái`}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tên Shipper</label>
                        <input type="text" value={formData.shipper_name} onChange={e => setFormData({ ...formData, shipper_name: e.target.value })}
                          placeholder="Tên shipper..." className="w-full h-11 bg-[#161616] border border-white/[0.08] rounded-xl px-4 text-white text-sm font-medium outline-none focus:border-sky-500/40 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SĐT Shipper</label>
                        <input type="text" value={formData.shipper_phone} onChange={e => setFormData({ ...formData, shipper_phone: e.target.value })}
                          placeholder="SĐT liên hệ..." className="w-full h-11 bg-[#161616] border border-white/[0.08] rounded-xl px-4 text-white text-sm font-medium outline-none focus:border-sky-500/40 transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ghi chú kiểm tra / Lý do hủy</label>
                      <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })}
                        rows={2} placeholder="Ghi chú nội bộ..."
                        className="w-full bg-[#161616] border border-white/[0.08] rounded-xl p-4 text-white text-sm font-medium outline-none focus:border-sky-500/40 resize-none transition-all" />
                    </div>

                    {/* Trial Section */}
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 space-y-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="is_trial" checked={formData.is_trial}
                          onChange={e => setFormData({ ...formData, is_trial: e.target.checked })}
                          className="w-4 h-4 rounded bg-white/5 border border-white/10 text-sky-500 focus:ring-0 outline-none cursor-pointer" />
                        <label htmlFor="is_trial" className="text-xs font-black text-white uppercase tracking-wider cursor-pointer">
                          Kích hoạt chế độ dùng thử (Try Before You Buy)
                        </label>
                      </div>
                      {formData.is_trial && (
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-indigo-500/15">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-400/70 uppercase tracking-widest">Số ngày thử</label>
                            <select value={formData.trial_days} onChange={e => setFormData({ ...formData, trial_days: e.target.value })}
                              className="w-full h-10 bg-[#0a0a0a] border border-indigo-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-indigo-400 appearance-none cursor-pointer">
                              {['3', '5', '7', '10'].map(d => <option key={d} value={d} className="bg-black">{d} ngày</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-indigo-400/70 uppercase tracking-widest">Trạng thái thử</label>
                            <select value={formData.trial_status} onChange={e => setFormData({ ...formData, trial_status: e.target.value })}
                              className="w-full h-10 bg-[#0a0a0a] border border-indigo-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-indigo-400 appearance-none cursor-pointer">
                              <option value="TRIALING" className="bg-black">Đang dùng thử</option>
                              <option value="APPROVED_PAID" className="bg-black">Khách đồng ý mua</option>
                              <option value="REJECTED_RETURN" className="bg-black">Yêu cầu trả hàng</option>
                              <option value="COLLECTED" className="bg-black">Đã thu hồi</option>
                            </select>
                          </div>
                          {formData.trial_status === 'REJECTED_RETURN' && (
                            <div className="col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Phản hồi trả hàng</label>
                              <textarea value={formData.trial_feedback} onChange={e => setFormData({ ...formData, trial_feedback: e.target.value })}
                                rows={2} placeholder="Lý do khách trả..."
                                className="w-full bg-[#0a0a0a] border border-rose-500/20 rounded-xl p-3 text-white font-bold text-xs outline-none focus:border-rose-400 resize-none" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deposit */}
                    {formData.is_trial && (
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-4">
                        <p className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">🔐 Quản lý đặt cọc</p>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-500/15">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest">Số tiền cọc (VNĐ)</label>
                            <input type="number" value={formData.deposit_amount} onChange={e => setFormData({ ...formData, deposit_amount: e.target.value })}
                              placeholder="Ví dụ: 10000000" className="w-full h-10 bg-[#0a0a0a] border border-amber-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-amber-500" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest">Trạng thái cọc</label>
                            <select value={formData.deposit_status} onChange={e => setFormData({ ...formData, deposit_status: e.target.value })}
                              className="w-full h-10 bg-[#0a0a0a] border border-amber-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-amber-500 appearance-none cursor-pointer">
                              <option value="" className="bg-black">-- Chọn --</option>
                              <option value="PENDING_DEPOSIT" className="bg-black">⏳ Chờ nộp cọc</option>
                              <option value="DEPOSITED" className="bg-black">✅ Đã nhận cọc</option>
                              <option value="REFUNDED" className="bg-black">💳 Đã hoàn cọc</option>
                              <option value="FORFEITED" className="bg-black">🚨 Tịch thu cọc</option>
                            </select>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest">Ghi chú cọc</label>
                            <input type="text" value={formData.deposit_note} onChange={e => setFormData({ ...formData, deposit_note: e.target.value })}
                              placeholder="Nhận tiền mặt..." className="w-full h-10 bg-[#0a0a0a] border border-amber-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-amber-500" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Địa chỉ giao hàng</label>
                        <input required value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                          className="w-full h-11 bg-[#161616] border border-white/[0.08] rounded-xl px-4 text-white text-sm font-medium outline-none focus:border-sky-500/40 transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Giá trị đơn (VNĐ)</label>
                        <input required type="number" value={formData.total_price} onChange={e => setFormData({ ...formData, total_price: e.target.value })}
                          className="w-full h-11 bg-[#161616] border border-white/[0.08] rounded-xl px-4 text-white text-sm font-medium outline-none focus:border-sky-500/40 transition-all" />
                      </div>
                    </div>

                    {editingOrder?.has_vat && (
                      <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-3">
                        <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Hóa đơn VAT</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">MST</p><p className="font-bold text-white">{editingOrder.vat_mst}</p></div>
                          <div><p className="text-[9px] text-slate-500 uppercase mb-0.5">Công ty</p><p className="font-bold text-white truncate">{editingOrder.vat_company_name}</p></div>
                        </div>
                        <select value={formData.vat_status} onChange={e => setFormData({ ...formData, vat_status: e.target.value })}
                          className="w-full h-10 bg-[#0a0a0a] border border-rose-500/20 rounded-xl px-4 text-white font-bold text-xs outline-none focus:border-rose-400 appearance-none cursor-pointer">
                          <option value="PENDING" className="bg-black">Chờ xuất</option>
                          <option value="ISSUED" className="bg-black">Đã xuất hóa đơn</option>
                          <option value="CANCELLED" className="bg-black">Đã hủy hóa đơn</option>
                        </select>
                      </div>
                    )}

                    <button type="submit" className="w-full h-12 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/15 hover:scale-[1.01] transition-all cursor-pointer">
                      Xác nhận cập nhật đơn hàng
                    </button>
                  </form>

                  {/* Timeline */}
                  <div className="lg:col-span-5 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05] flex flex-col max-h-[600px] overflow-y-auto no-scrollbar text-left">
                    <p className="text-[9px] font-black text-sky-400 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                      <CheckCircle2 size={11} /> Lịch sử xử lý & Traceability
                    </p>
                    {timelineLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3 opacity-40">
                        <div className="w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đang tải...</span>
                      </div>
                    ) : timeline.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center py-16 text-slate-600 italic text-xs">
                        Chưa có lịch sử cập nhật.
                      </div>
                    ) : (
                      <div className="relative border-l border-white/[0.08] pl-5 ml-3 space-y-5 flex-1">
                        {timeline.map((log: any) => (
                          <div key={log.id} className="relative group/log">
                            <div className="absolute -left-[23px] top-1 w-3 h-3 bg-[#0d0d0d] border-2 border-sky-500 rounded-full group-hover/log:scale-125 transition-transform" />
                            <p className="text-[9px] font-black text-slate-500 mb-1">{new Date(log.created_at).toLocaleString('vi-VN')}</p>
                            <p className="text-xs font-black text-white uppercase mb-2">
                              Giai đoạn: <span className="text-sky-400">{log.status}</span>
                            </p>
                            <div className="text-xs font-semibold text-slate-400 bg-white/[0.03] p-3 rounded-xl border border-white/[0.05] leading-relaxed">{log.note}</div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[9px]">
                              <span className="text-slate-500">Thực hiện: {log.actor_name}</span>
                              {log.packer_name && <span className="font-black text-emerald-400">• Đóng gói: {log.packer_name}</span>}
                              {log.shipper_name && <span className="font-black text-indigo-400">• Shipper: {log.shipper_name}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
