'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  CheckCircle, Package, Truck, CreditCard, 
  ArrowRight, ShoppingBag, ShieldCheck, MapPin, Phone, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface OrderItem {
  id: number;
  product_name: string;
  product_image: string;
  product_brand: string;
  quantity: number;
  price: string | number;
}

interface OrderDetail {
  id: number;
  total_price: string | number;
  status: string;
  shipping_address: string;
  customer_phone: string;
  customer_name: string;
  note: string;
  payment_method?: string;
  created_at: string;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useSettingsStore();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy thông tin đơn hàng');
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const res = await fetch(`/api/orders/detail?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('Không tìm thấy đơn hàng trong hệ thống');
        }
      } catch (err) {
        setError('Lỗi kết nối hệ thống');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-500",
        theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      )}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Đang tải biên lai đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center transition-colors duration-500",
        theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      )}>
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
            <CheckCircle className="rotate-45" size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Lỗi Đơn Hàng</h2>
          <p className="text-sm font-medium text-slate-500">{error || 'Đã xảy ra lỗi không xác định'}</p>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/25"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 selection:bg-primary selection:text-white relative",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor */}
      <div className="fixed inset-0 z-0">
        <Image src="/tech-bg.png" alt="BG" fill className="object-cover opacity-10" />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b",
          theme === 'dark' ? "from-slate-950 via-slate-950/80 to-slate-950" : "from-white via-slate-50/80 to-white"
        )} />
      </div>

      <Header />

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center">
        {/* Animated Checkmark HUD */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/30 border border-emerald-400/20 mb-6"
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CheckCircle size={48} className="stroke-[2.5]" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Transaction Confirmed</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              GIAO DỊCH THÀNH CÔNG
            </h1>
            <p className="text-slate-500 text-sm font-medium">Cảm ơn bạn đã lựa chọn hệ thống TechStore Premium.</p>
          </motion.div>
        </div>

        {/* Receipt Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.8, delay: 0.4 }}
          className={cn(
            "w-full max-w-2xl backdrop-blur-2xl rounded-[3rem] border p-8 md:p-12 shadow-2xl relative overflow-hidden mb-12",
            theme === 'dark' 
              ? "bg-slate-900/60 border-white/10 shadow-black/50" 
              : "bg-white border-slate-200 shadow-slate-200/50"
          )}
        >
          {/* Top Notch Decor */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[6px] bg-primary rounded-b-full shadow-lg" />
          
          <div className="flex justify-between items-start border-b border-dashed border-white/10 pb-8 mb-8">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Mã đơn hàng</span>
              <span className="text-2xl font-black text-primary tracking-tight">#{order.id}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Thời gian đặt</span>
              <span className="text-xs font-bold">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
            </div>
          </div>

          {/* Product Items */}
          <div className="space-y-6 mb-8 pb-8 border-b border-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Danh sách sản phẩm</h3>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-6 items-center group">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0 p-2 flex items-center justify-center">
                  <img src={item.product_image || '/laptop.png'} alt={item.product_name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-primary transition-colors line-clamp-1">{item.product_name}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{item.product_brand}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-500 block">SL: {item.quantity}</span>
                  <span className="text-xs font-black text-primary">{formatPrice(item.price)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer & Shipping details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/5">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Thông tin giao nhận</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <User size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-bold">{order.customer_name}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-bold">{order.customer_phone}</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-xs font-medium text-slate-400 leading-relaxed">{order.shipping_address}</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Thanh toán</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CreditCard size={14} className="text-primary shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {order.payment_method === 'transfer' ? 'Chuyển khoản ngân hàng' : 'Thanh toán COD'}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck size={14} className="text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-500 block">Miễn phí vận chuyển</span>
                    <span className="text-[10px] text-slate-500 font-medium">Giao hàng tiêu chuẩn 2-3 ngày</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-end bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tổng cộng hóa đơn</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Đã áp dụng VAT</span>
            </div>
            <span className="text-3xl font-black text-red-500 tracking-tighter">{formatPrice(order.total_price)}</span>
          </div>
        </motion.div>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <button
            onClick={() => router.push('/profile?tab=orders')}
            className="w-64 h-16 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3 group"
          >
            Quản lý đơn hàng <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-64 h-16 bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <ShoppingBag size={14} /> Tiếp tục mua sắm
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 mt-12 text-slate-500"
        >
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-[8px] font-black uppercase tracking-widest italic">Encrypted Secure Transaction ID: {order.id}</span>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
