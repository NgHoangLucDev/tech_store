'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, Ticket, MapPin, Store, ArrowRight, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import Image from 'next/image';
import toast from 'react-hot-toast';

import { useRouter } from 'next/navigation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [mounted, setMounted] = React.useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'shipping'>('shipping');
  const [address, setAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === 'TECHSTORE10') {
      setAppliedDiscount(totalPrice() * 0.1);
      toast.success("Đã áp dụng mã giảm giá 10%!");
    } else {
      toast.error("Mã giảm giá không hợp lệ");
    }
  };

  const finalPrice = totalPrice() - appliedDiscount;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiến hành đặt hàng");
      onClose();
      router.push('/login');
      return;
    }

    if (deliveryMethod === 'shipping' && !address) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }
    
    const t = toast.loading("Đang xử lý đơn hàng...");
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.email === 'admin' ? 1 : (user?.email === 'user' ? 2 : null),
          items: items,
          total_price: finalPrice,
          delivery_method: deliveryMethod,
          address: deliveryMethod === 'shipping' ? address : 'Nhận tại cửa hàng',
          discount_applied: appliedDiscount
        })
      });

      if (response.ok) {
        toast.success("Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.", { id: t });
        clearCart();
        onClose();
      } else {
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.", { id: t });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ.", { id: t });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
          />

          {/* Main Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[9999] h-full w-full max-w-xl bg-[#fafafa] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header - Premium Minimalist */}
            <header className="p-8 border-b bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Giỏ hàng</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {totalItems()} sản phẩm trong túi
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 transition-all active:scale-90"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-10 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center mb-8"
                  >
                    <ShoppingBag size={48} className="text-slate-300" />
                  </motion.div>
                  <h3 className="text-2xl font-black uppercase">Trống rỗng</h3>
                  <p className="text-slate-500 mt-3 max-w-[250px] text-sm leading-relaxed">
                    Túi của bạn đang tìm kiếm những siêu phẩm công nghệ. Hãy lấp đầy nó nhé!
                  </p>
                  <button 
                    onClick={onClose}
                    className="mt-10 px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
                  >
                    Khám phá ngay
                  </button>
                </div>
              ) : (
                <>
                  {/* Items Section */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Danh sách sản phẩm</h3>
                    </div>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div 
                          layout
                          key={item.id} 
                          className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          <div className="flex gap-6 relative z-10">
                            <div className="w-28 h-28 bg-[#f9f9f9] rounded-[2rem] relative overflow-hidden flex-shrink-0 border border-slate-50">
                              <Image 
                                src={item.image || '/laptop.png'} 
                                alt={item.name} 
                                fill 
                                className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <h4 className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight line-clamp-1">{item.name}</h4>
                                <div className="text-primary font-black text-xl mt-2">
                                  {item.price.toLocaleString('vi-VN')}₫
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-1 bg-slate-50 rounded-2xl p-1 border border-slate-100">
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-black"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm transition-all text-slate-400 hover:text-black"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                
                                <button 
                                  onClick={() => removeItem(item.id)}
                                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Delivery & Discount Section */}
                  <section className="space-y-8">
                    {/* Delivery Toggle */}
                    <div className="space-y-4">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Hình thức nhận hàng</h3>
                      <div className="grid grid-cols-2 gap-4 p-1.5 bg-slate-100 rounded-[2rem]">
                        <button 
                          onClick={() => setDeliveryMethod('shipping')}
                          className={`flex items-center justify-center gap-3 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                            deliveryMethod === 'shipping' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <MapPin size={16} /> Giao tận nơi
                        </button>
                        <button 
                          onClick={() => setDeliveryMethod('pickup')}
                          className={`flex items-center justify-center gap-3 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-widest transition-all ${
                            deliveryMethod === 'pickup' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Store size={16} /> Tại cửa hàng
                        </button>
                      </div>
                    </div>

                    {/* Address Input */}
                    {deliveryMethod === 'shipping' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ nhận hàng cụ thể</label>
                        <div className="relative">
                           <input 
                            type="text" 
                            placeholder="Số nhà, tên đường, quận/huyện..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm focus:border-black outline-none transition-all placeholder:text-slate-300"
                           />
                           <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                        </div>
                      </motion.div>
                    )}

                    {/* Discount Code */}
                    <div className="space-y-4">
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Mã ưu đãi</h3>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="Nhập mã giảm giá..."
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl px-12 py-4 text-sm focus:border-black outline-none transition-all placeholder:text-slate-300 uppercase font-bold"
                          />
                          <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200" size={18} />
                        </div>
                        <button 
                          onClick={handleApplyDiscount}
                          className="px-8 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg shadow-black/10"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>

            {/* Footer - Floating Summary Card */}
            {items.length > 0 && (
              <div className="p-8 bg-white border-t space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-400">
                    <span>Tạm tính:</span>
                    <span>{totalPrice().toLocaleString('vi-VN')}₫</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between text-sm font-medium text-emerald-500"
                    >
                      <span>Giảm giá:</span>
                      <span>-{appliedDiscount.toLocaleString('vi-VN')}₫</span>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-lg font-black uppercase tracking-tighter">Tổng thanh toán</span>
                    <span className="text-3xl font-black text-primary tracking-tighter">
                      {finalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full group relative h-20 bg-black text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] overflow-hidden hover:bg-primary transition-all shadow-2xl active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    Tiến hành đặt hàng
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>
                
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Cam kết bảo mật & Giao hàng siêu tốc trong 2h
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
