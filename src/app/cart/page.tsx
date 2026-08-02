'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  Trash2, Plus, Minus, ShoppingBag, 
  ArrowRight, ShieldCheck, Truck, 
  ChevronRight, CreditCard, ShoppingCart,
  Ticket, CheckCircle2, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, addItem } = useCartStore();
  const { theme } = useSettingsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [crossSellItems, setCrossSellItems] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setCrossSellItems([]);
      return;
    }

    const fetchCrossSell = async () => {
      try {
        const itemIds = items.map(item => item.id).join(',');
        const res = await fetch(`/api/products/relations?productId=${itemIds}&type=cross_sell`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const cartIds = items.map(item => item.id.toString());
          const filtered = data.filter((p: any) => !cartIds.includes(p.id.toString()));
          // Loại bỏ trùng lặp nếu nhiều sản phẩm trong giỏ hàng cùng gợi ý 1 sản phẩm bán chéo
          const unique = filtered.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setCrossSellItems(unique);
        }
      } catch (err) {
        console.error("Lỗi lấy sản phẩm bán chéo:", err);
      }
    };

    fetchCrossSell();
  }, [items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!mounted) return null;

  const steps = [
    { name: 'Giỏ hàng', icon: <ShoppingCart size={20} />, active: true },
    { name: 'Thông tin đặt hàng', icon: <Truck size={20} />, active: false },
    { name: 'Thanh toán', icon: <CreditCard size={20} />, active: false },
    { name: 'Hoàn tất', icon: <CheckCircle2 size={20} />, active: false },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 selection:bg-primary selection:text-white",
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

      <main className="relative z-10 container mx-auto px-6 pt-32 pb-24">
        {/* Stepper HUD */}
        <div className="max-w-4xl mx-auto mb-16">
           <div className="flex items-center justify-between relative">
              {steps.map((step, idx) => (
                <div key={idx} className="flex flex-col items-center relative z-10">
                   <div className={cn(
                     "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                     step.active 
                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/30" 
                        : "bg-slate-900/50 border-white/10 text-slate-500"
                   )}>
                      {step.icon}
                   </div>
                   <span className={cn(
                     "mt-4 text-[10px] font-black uppercase tracking-widest text-center max-w-[100px]",
                     step.active ? "text-primary" : "text-slate-500"
                   )}>{step.name}</span>
                </div>
              ))}
              {/* Connecting Lines */}
              <div className="absolute top-7 left-0 w-full h-[2px] bg-white/5 -z-10" />
           </div>
        </div>

        <header className="mb-12">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Cart Initialization</span>
           </div>
           <h1 className="text-6xl font-black tracking-tighter uppercase italic leading-none">
              GIỎ HÀNG <span className="text-primary">MODULES</span>
           </h1>
        </header>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-8"
          >
             <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-700 border border-white/5">
                <ShoppingCart size={48} />
             </div>
             <div className="text-center">
                <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Giỏ hàng đang trống</h2>
                <p className="text-slate-500 font-medium">Hệ thống chưa nhận diện bất kỳ module sản phẩm nào trong buffer.</p>
             </div>
             <Link href="/">
                <button className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                   QUAY LẠI CỬA HÀNG
                </button>
             </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
             {/* Left Panel: Items */}
             <div className="lg:col-span-8 space-y-6">
                <AnimatePresence mode="popLayout">
                   {items.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "backdrop-blur-xl rounded-[2.5rem] border p-6 flex flex-col md:flex-row items-center gap-8 group transition-all duration-500",
                          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
                        )}
                      >
                         <div className="relative w-32 h-32 rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                            <Image src={typeof item.image === 'string' && item.image ? item.image : '/laptop.png'} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>

                         <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-black tracking-tighter uppercase leading-none">{item.name}</h3>
                            <div className="flex flex-col gap-1">
                               <span className="text-primary font-black text-lg">{formatPrice(item.price)}</span>
                               {item.original_price && (
                                 <span className="text-xs text-slate-500 line-through font-bold opacity-60">
                                    {formatPrice(item.original_price)}
                                 </span>
                               )}
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline mt-4"
                            >
                               <Trash2 size={12} /> Xoá khỏi giỏ
                            </button>
                         </div>

                         <div className="flex items-center bg-slate-900/50 rounded-2xl border border-white/5 p-1">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                            >
                               <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-black text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                            >
                               <Plus size={16} />
                            </button>
                         </div>
                      </motion.div>
                   ))}
                </AnimatePresence>

                {/* Coupon Section */}
                <div className={cn(
                  "backdrop-blur-xl rounded-[2rem] border transition-all duration-500",
                  theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                )}>
                   <button 
                     onClick={() => setShowCoupon(!showCoupon)}
                     className="w-full p-6 flex items-center justify-between text-primary font-black text-xs uppercase tracking-widest group"
                   >
                      <div className="flex items-center gap-3">
                         <Ticket size={18} />
                         Sử dụng mã giảm giá / Phiếu mua hàng
                      </div>
                      <ChevronDown className={cn("transition-transform", showCoupon && "rotate-180")} size={18} />
                   </button>
                   
                   <AnimatePresence>
                      {showCoupon && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden px-6 pb-6"
                        >
                           <div className="flex gap-2">
                              <input 
                                value={coupon}
                                onChange={e => setCoupon(e.target.value)}
                                placeholder="Nhập mã ưu đãi của bạn..."
                                className={cn(
                                  "flex-1 h-14 px-6 rounded-xl border-2 outline-none font-bold text-sm transition-all",
                                  theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                )}
                              />
                              <button className="px-8 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                 ÁP DỤNG
                              </button>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                 </div>

                 {/* Gợi ý bán chéo (Cross-sell) */}
                 {crossSellItems.length > 0 && (
                    <div className="space-y-6 pt-12">
                       <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                          <h3 className="text-xl font-black uppercase tracking-[0.2em] italic">Có thể bạn sẽ cần mua thêm</h3>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {crossSellItems.slice(0, 4).map((p) => (
                             <div 
                               key={p.id} 
                               className={cn(
                                 "p-6 rounded-[2rem] border flex items-center gap-6 group transition-all duration-500",
                                 theme === 'dark' ? "bg-white/5 border-white/5 hover:border-primary/20 hover:bg-white/[0.07]" : "bg-white border-slate-200 shadow-md hover:border-primary/20 hover:bg-slate-50"
                               )}
                             >
                                <div className="relative w-16 h-16 bg-black rounded-2xl overflow-hidden shrink-0 border border-white/5 flex items-center justify-center p-1">
                                   <Image src={p.image} alt={p.name} fill className="object-contain p-1 group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h4 className={cn("text-[10px] font-black truncate uppercase tracking-wider", theme === 'dark' ? "text-white" : "text-slate-900")}>{p.name}</h4>
                                   <p className="text-slate-500 text-[8px] font-black uppercase">{p.brand}</p>
                                   <p className="text-primary font-black text-xs mt-1">{p.price.toLocaleString('vi-VN')}₫</p>
                                   <button 
                                     onClick={() => {
                                       addItem({
                                         id: p.id,
                                         name: p.name,
                                         price: p.price,
                                         image: p.image,
                                         original_price: p.originalPrice
                                       });
                                       toast.success("Đã thêm phụ kiện gợi ý vào giỏ hàng!");
                                     }}
                                     className="mt-2 text-[8px] font-black uppercase tracking-widest text-primary hover:underline block"
                                   >
                                      + Thêm vào giỏ
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

             {/* Right Panel: Summary */}
             <div className="lg:col-span-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "backdrop-blur-2xl rounded-[3rem] border p-10 sticky top-32 space-y-8 transition-all duration-500",
                    theme === 'dark' ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-2xl"
                  )}
                >
                   <div className="space-y-2">
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic">Tổng cộng</h2>
                      <div className="w-12 h-1 bg-primary" />
                   </div>

                   <div className="space-y-4 pt-6">
                      <div className="flex justify-between items-center text-slate-500">
                         <span className="text-[10px] font-black uppercase tracking-widest">Tạm tính</span>
                         <span className="font-bold text-white">{formatPrice(totalPrice())}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500">
                         <span className="text-[10px] font-black uppercase tracking-widest">Ưu đãi Coupon</span>
                         <span className="font-bold text-primary">- 0₫</span>
                      </div>
                      <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 pb-1">Thành tiền</span>
                            <span className="text-3xl font-black text-red-500 tracking-tighter">{formatPrice(totalPrice())}</span>
                         </div>
                         <p className="text-[9px] text-slate-500 italic text-right uppercase font-bold">(Đã bao gồm thuế VAT)</p>
                      </div>
                   </div>

                   <button 
                     onClick={() => router.push('/checkout')}
                     className="w-full h-16 bg-red-600 text-white rounded-2xl font-black flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 group active:scale-95"
                   >
                      ĐẶT HÀNG NGAY
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                   </button>

                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary border border-white/5">
                            <ShieldCheck size={16} />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bảo mật giao dịch tuyệt đối</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary border border-white/5">
                            <Truck size={16} />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Giao hàng miễn phí toàn quốc</span>
                      </div>
                   </div>
                </motion.div>
             </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
