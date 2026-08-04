'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  Truck, CreditCard, CheckCircle2, ShoppingCart,
  MapPin, Phone, User, Mail, ChevronRight,
  ArrowLeft, ShieldCheck, Box, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | string>('');
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
  const [isCustomAddress, setIsCustomAddress] = useState(true);
  const [customAddr, setCustomAddr] = useState({
    label: 'Nhà riêng',
    province: '',
    district: '',
    ward: '',
    detail: ''
  });
  
   const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    paymentMethod: 'cod',
    hasVat: false,
    vatMst: '',
    vatCompanyName: '',
    vatCompanyAddress: '',
    vatEmail: '',
    vatContactName: '',
    vatContactPhone: ''
  });

  const [isCheckingMst, setIsCheckingMst] = useState(false);
  const [isTrialOrder, setIsTrialOrder] = useState(false);

  const checkMST = async () => {
    if (!formData.vatMst || formData.vatMst.length < 10) {
      toast.error('Vui lòng nhập Mã số thuế hợp lệ (10-13 chữ số)');
      return;
    }
    
    setIsCheckingMst(true);
    const t = toast.loading('Đang truy vấn dữ liệu Tổng Cục Thuế...');
    
    try {
      // Giả lập API kiểm tra MST (Trong thực tế sẽ gọi API Masothue/Provisional)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data dựa trên MST mẫu
      if (formData.vatMst === '0101234567') {
        setFormData(prev => ({
          ...prev,
          vatCompanyName: 'CÔNG TY TNHH THƯƠNG MẠI CÔNG NGHỆ TECH-STORE',
          vatCompanyAddress: 'Tầng 12, Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP. HCM',
        }));
        toast.success('Đã tìm thấy thông tin công ty!', { id: t });
      } else {
        toast.error('Không tìm thấy thông tin MST này. Vui lòng tự nhập tay.', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối dịch vụ thuế', { id: t });
    } finally {
      setIsCheckingMst(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    if (items.length === 0) {
      router.push('/cart');
    }
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      router.push('/login');
      return;
    }
    if (user) {
      const fetchAddresses = async () => {
        try {
          const res = await fetch(`/api/user/addresses?userId=${user.id}`);
          const data = await res.json();
          if (res.ok && data.length > 0) {
            setAddresses(data);
            const defaultAddr = data.find((a: any) => a.is_default === 1) || data[0];
            setSelectedAddressId(defaultAddr.id);
            setIsCustomAddress(false);
            setFormData(prev => ({
              ...prev,
              name: defaultAddr.receiver_name,
              phone: defaultAddr.receiver_phone,
              email: user.email || '',
              address: `${defaultAddr.detail}, ${defaultAddr.ward}, ${defaultAddr.district}, ${defaultAddr.province}`
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: user.name || '',
              phone: user.phone || '',
              email: user.email || '',
              address: user.address || ''
            }));
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchAddresses();
    }
  }, [user, items, router]);

  const handleAddressChange = (addrId: number | string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'custom') {
      setIsCustomAddress(true);
      setFormData(prev => ({
        ...prev,
        name: user?.name || '',
        phone: user?.phone || '',
        address: ''
      }));
    } else {
      setIsCustomAddress(false);
      const addr = addresses.find(a => a.id === Number(addrId));
      if (addr) {
        setFormData(prev => ({
          ...prev,
          name: addr.receiver_name,
          phone: addr.receiver_phone,
          address: `${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`
        }));
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const validateVat = () => {
    if (!formData.hasVat) return true;
    
    if (!formData.vatMst || formData.vatMst.length < 10) {
      toast.error('Mã số thuế không hợp lệ');
      return false;
    }
    if (!formData.vatCompanyName) {
      toast.error('Vui lòng nhập tên công ty');
      return false;
    }
    if (!formData.vatCompanyAddress) {
      toast.error('Vui lòng nhập địa chỉ công ty');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.vatEmail || !emailRegex.test(formData.vatEmail)) {
      toast.error('Email nhận hóa đơn không hợp lệ');
      return false;
    }
    return true;
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.hasVat && !validateVat()) return;

    const t = toast.loading('Đang khởi tạo đơn hàng...');
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          items,
          totalPrice: totalPrice(),
          shippingInfo: formData,
          isTrial: isTrialOrder,
          depositAmount: isTrialOrder ? totalPrice() * 0.1 : 0.00,
          vatInfo: formData.hasVat ? {
            mst: formData.vatMst,
            companyName: formData.vatCompanyName,
            companyAddress: formData.vatCompanyAddress,
            email: formData.vatEmail,
            contactName: formData.vatContactName,
            contactPhone: formData.vatContactPhone
          } : null
        })
      });

      if (res.ok) {
        const data = await res.json();

        // Lưu địa chỉ vào sổ địa chỉ nếu được chọn
        if (isCustomAddress && saveToAddressBook && user) {
          try {
            await fetch('/api/user/addresses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                label: customAddr.label,
                receiverName: formData.name,
                receiverPhone: formData.phone,
                province: customAddr.province,
                district: customAddr.district,
                ward: customAddr.ward,
                detail: customAddr.detail,
                isDefault: false
              })
            });
          } catch (addrErr) {
            console.error('Lỗi lưu sổ địa chỉ:', addrErr);
          }
        }

        toast.success('Đặt hàng thành công!', { id: t });
        clearCart();
        router.push(`/checkout/success?id=${data.orderId}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Lỗi đặt hàng', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ', { id: t });
    }
  };

  if (!mounted || items.length === 0) return null;

  const steps = [
    { name: 'Giỏ hàng', icon: <ShoppingCart size={20} />, active: true, completed: true },
    { name: 'Thông tin đặt hàng', icon: <Truck size={20} />, active: true, completed: false },
    { name: 'Thanh toán', icon: <CreditCard size={20} />, active: false, completed: false },
    { name: 'Hoàn tất', icon: <CheckCircle2 size={20} />, active: false, completed: false },
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
                        : "bg-slate-900/50 border-white/10 text-slate-500",
                     step.completed && "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20"
                   )}>
                      {step.completed ? <CheckCircle2 size={24} /> : step.icon}
                   </div>
                   <span className={cn(
                     "mt-4 text-[10px] font-black uppercase tracking-widest text-center max-w-[100px]",
                     step.active ? (step.completed ? "text-emerald-500" : "text-primary") : "text-slate-500"
                   )}>{step.name}</span>
                </div>
              ))}
              <div className="absolute top-7 left-0 w-full h-[2px] bg-white/5 -z-10" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Left: Shipping Form */}
           <div className="lg:col-span-7 space-y-8">
              <div className={cn(
                "backdrop-blur-xl rounded-[3rem] border p-10 transition-all duration-500",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
              )}>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                       <MapPin size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Thông tin giao hàng</h2>
                 </div>

                 <div className="space-y-6">
                     {/* SELECT SAVED ADDRESS */}
                     {user && addresses.length > 0 && (
                        <div className="space-y-4 mb-6 pb-6 border-b border-white/5">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Chọn địa chỉ nhận hàng</label>
                           <div className="grid grid-cols-1 gap-4">
                              {addresses.map((addr) => (
                                 <div 
                                    key={addr.id}
                                    onClick={() => handleAddressChange(addr.id)}
                                    className={cn(
                                       "p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4",
                                       selectedAddressId === addr.id 
                                          ? "bg-primary/10 border-primary text-primary" 
                                          : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"
                                    )}
                                 >
                                    <div className={cn(
                                       "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1",
                                       selectedAddressId === addr.id ? "border-primary text-primary" : "border-slate-500"
                                    )}>
                                       {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    <div className="flex-1">
                                       <div className="flex items-center gap-3 mb-2">
                                          <span className="text-xs font-black uppercase text-white">{addr.receiver_name}</span>
                                          <span className="px-2 py-0.5 bg-white/10 rounded-md text-[8px] font-bold text-slate-300 uppercase">{addr.label}</span>
                                          {addr.is_default === 1 && <span className="px-2 py-0.5 bg-emerald-500/10 rounded-md text-[8px] font-bold text-emerald-500 uppercase border border-emerald-500/20">Mặc định</span>}
                                       </div>
                                       <p className="text-[10px] font-bold text-slate-500 mb-1">{addr.receiver_phone}</p>
                                       <p className="text-xs font-medium text-slate-300">{addr.detail}, {addr.ward}, {addr.district}, {addr.province}</p>
                                    </div>
                                 </div>
                              ))}

                              <div 
                                 onClick={() => handleAddressChange('custom')}
                                 className={cn(
                                    "p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                                    selectedAddressId === 'custom' 
                                       ? "bg-primary/10 border-primary text-primary" 
                                       : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"
                                 )}
                              >
                                 <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                    selectedAddressId === 'custom' ? "border-primary" : "border-slate-500"
                                 )}>
                                    {selectedAddressId === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                 </div>
                                 <span className="text-xs font-black uppercase tracking-widest text-white">Giao đến địa chỉ khác...</span>
                              </div>
                           </div>
                        </div>
                     )}

                     {isCustomAddress ? (
                        <div className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Họ và tên người nhận</label>
                                 <input 
                                   required
                                   value={formData.name}
                                   onChange={e => setFormData({...formData, name: e.target.value})}
                                   className={cn(
                                     "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                     theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                   )}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Số điện thoại</label>
                                 <input 
                                   required
                                   value={formData.phone}
                                   onChange={e => setFormData({...formData, phone: e.target.value})}
                                   className={cn(
                                     "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                     theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                   )}
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Tỉnh / Thành phố</label>
                                 <input 
                                   required
                                   placeholder="Ví dụ: TP. Hồ Chí Minh"
                                   value={customAddr.province}
                                   onChange={e => {
                                     const val = e.target.value;
                                     setCustomAddr(prev => {
                                       const updated = { ...prev, province: val };
                                       setFormData(fd => ({ ...fd, address: `${updated.detail}, ${updated.ward}, ${updated.district}, ${updated.province}` }));
                                       return updated;
                                     });
                                   }}
                                   className={cn(
                                     "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-xs transition-all",
                                     theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                   )}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Quận / Huyện</label>
                                 <input 
                                   required
                                   placeholder="Ví dụ: Quận 12"
                                   value={customAddr.district}
                                   onChange={e => {
                                     const val = e.target.value;
                                     setCustomAddr(prev => {
                                       const updated = { ...prev, district: val };
                                       setFormData(fd => ({ ...fd, address: `${updated.detail}, ${updated.ward}, ${updated.district}, ${updated.province}` }));
                                       return updated;
                                     });
                                   }}
                                   className={cn(
                                     "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-xs transition-all",
                                     theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                   )}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Phường / Xã</label>
                                 <input 
                                   required
                                   placeholder="Ví dụ: P. Tân Thới Nhất"
                                   value={customAddr.ward}
                                   onChange={e => {
                                     const val = e.target.value;
                                     setCustomAddr(prev => {
                                       const updated = { ...prev, ward: val };
                                       setFormData(fd => ({ ...fd, address: `${updated.detail}, ${updated.ward}, ${updated.district}, ${updated.province}` }));
                                       return updated;
                                     });
                                   }}
                                   className={cn(
                                     "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-xs transition-all",
                                     theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                   )}
                                 />
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Địa chỉ chi tiết</label>
                              <input 
                                required
                                placeholder="Ví dụ: 154/7 Cống Lở"
                                value={customAddr.detail}
                                onChange={e => {
                                  const val = e.target.value;
                                  setCustomAddr(prev => {
                                    const updated = { ...prev, detail: val };
                                    setFormData(fd => ({ ...fd, address: `${updated.detail}, ${updated.ward}, ${updated.district}, ${updated.province}` }));
                                    return updated;
                                  });
                                }}
                                className={cn(
                                  "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                  theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                )}
                              />
                           </div>

                           {user && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
                                 <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Nhãn sổ địa chỉ</label>
                                    <select 
                                       value={customAddr.label}
                                       onChange={(e) => setCustomAddr({...customAddr, label: e.target.value})}
                                       className={cn(
                                          "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-sm transition-all appearance-none",
                                          theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                                       )}
                                    >
                                       <option value="Nhà riêng" className={theme === 'dark' ? "bg-slate-950" : "bg-white"}>Nhà riêng</option>
                                       <option value="Văn phòng" className={theme === 'dark' ? "bg-slate-950" : "bg-white"}>Văn phòng</option>
                                       <option value="Khác" className={theme === 'dark' ? "bg-slate-950" : "bg-white"}>Khác</option>
                                    </select>
                                 </div>
                                 <div className="pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                       <div 
                                          onClick={() => setSaveToAddressBook(!saveToAddressBook)}
                                          className={cn(
                                             "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                                             saveToAddressBook ? "bg-primary border-primary" : "border-slate-500 group-hover:border-primary"
                                          )}
                                       >
                                          {saveToAddressBook && <Box size={14} className="text-white" />}
                                       </div>
                                       <span className={cn(
                                          "text-[10px] font-black uppercase tracking-widest transition-colors",
                                          saveToAddressBook ? "text-primary" : "text-slate-500"
                                       )}>Lưu địa chỉ này vào sổ địa chỉ</span>
                                    </label>
                                 </div>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="p-8 rounded-[2rem] bg-white/5 border-2 border-white/5 space-y-4">
                           <div className="flex justify-between items-center pb-4 border-b border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Người nhận hàng</span>
                              <span className="text-sm font-black text-white uppercase">{formData.name}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-white/5">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Số điện thoại</span>
                              <span className="text-sm font-black text-white">{formData.phone}</span>
                           </div>
                           <div className="flex flex-col gap-2">
                              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Địa chỉ giao hàng</span>
                              <span className="text-xs font-bold text-primary">{formData.address}</span>
                           </div>
                        </div>
                     )}

                    <div className="space-y-2 pb-6 border-b border-white/5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Ghi chú (Tùy chọn)</label>
                       <input 
                         value={formData.note}
                         onChange={e => setFormData({...formData, note: e.target.value})}
                         placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                         className={cn(
                           "w-full h-14 rounded-2xl px-6 border-2 outline-none font-bold text-sm transition-all",
                           theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-slate-200 focus:border-primary"
                         )}
                       />
                      </div>
                     {/* TRIAL TOGGLE & HUD */}
                     <div className="pt-6 pb-6 border-b border-white/5 space-y-4">
                        <div className={cn(
                          "p-6 rounded-[2.5rem] border-2 transition-all relative overflow-hidden",
                          isTrialOrder 
                            ? "bg-purple-500/10 border-purple-500/30 text-purple-200" 
                            : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                        )}>
                           {/* Decorative Glow */}
                           {isTrialOrder && (
                             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                           )}
                           
                           <label className="flex items-start gap-4 cursor-pointer group select-none">
                              <div 
                                onClick={() => setIsTrialOrder(!isTrialOrder)}
                                className={cn(
                                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-1",
                                  isTrialOrder ? "bg-purple-500 border-purple-500 text-white" : "border-slate-500 group-hover:border-purple-500"
                                )}
                              >
                                 {isTrialOrder && <Check size={14} className="text-white" />}
                              </div>
                              <div className="flex-1">
                                 <span className={cn(
                                    "text-sm font-black uppercase tracking-wider transition-colors",
                                    isTrialOrder ? "text-purple-400" : "text-white"
                                 )}>Đăng ký dùng thử 3 ngày (Try Before You Buy)</span>
                                 <p className="text-xs text-slate-400 font-medium mt-1">Trải nghiệm sản phẩm tại nhà 3 ngày miễn phí. Trả hàng hoàn cọc 100% nếu không ưng ý.</p>
                              </div>
                           </label>

                           <AnimatePresence>
                             {isTrialOrder && (
                               <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="overflow-hidden mt-6 pt-6 border-t border-white/5 space-y-4 text-xs font-bold text-slate-300"
                               >
                                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                     <span className="text-slate-400">Số tiền đặt cọc cần thanh toán (10%):</span>
                                     <span className="text-sm font-black text-purple-400">{formatPrice(totalPrice() * 0.1)}</span>
                                  </div>
                                  <div className="space-y-2 text-[11px] leading-relaxed text-slate-400 font-medium">
                                     <p>💡 <span className="text-white font-bold">Quy trình dùng thử:</span></p>
                                     <ol className="list-decimal pl-4 space-y-1.5">
                                        <li>Sau khi đặt hàng, bạn thực hiện thanh toán khoản tiền cọc 10% đơn hàng.</li>
                                        <li>Nhân viên G-Store sẽ đóng gói và shipper giao máy nguyên seal tới địa chỉ của bạn.</li>
                                        <li>Bạn có trọn vẹn 3 ngày dùng thử sản phẩm kể từ thời điểm nhận hàng.</li>
                                        <li>Hết hạn, bạn truy cập website để chọn <span className="text-white font-bold">MUA ĐỨT</span> (khấu trừ cọc vào hóa đơn) hoặc <span className="text-white font-bold">TRẢ HÀNG</span> (G-Store thu hồi máy tận nhà và hoàn lại 100% tiền cọc).</li>
                                     </ol>
                                  </div>
                               </motion.div>
                             )}
                           </AnimatePresence>
                        </div>
                     </div>

                     {/* VAT TOGGLE */}
                    <div className="pt-4">
                       <label className="flex items-center gap-4 cursor-pointer group">
                          <div 
                            onClick={() => setFormData({...formData, hasVat: !formData.hasVat})}
                            className={cn(
                              "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                              formData.hasVat ? "bg-primary border-primary" : "border-slate-500 group-hover:border-primary"
                            )}
                          >
                             {formData.hasVat && <Box size={14} className="text-white" />}
                          </div>
                          <span className={cn(
                             "text-[11px] font-black uppercase tracking-widest transition-colors",
                             formData.hasVat ? "text-primary" : "text-slate-500"
                          )}>Tôi muốn xuất hóa đơn VAT cho công ty</span>
                       </label>

                       <AnimatePresence>
                          {formData.hasVat && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                               <div className={cn(
                                 "mt-6 p-8 rounded-[2rem] border-2 space-y-6 transition-all",
                                 theme === 'dark' ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
                               )}>
                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                     <div className="md:col-span-8 space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Mã số thuế</label>
                                        <div className="flex gap-2">
                                           <input 
                                             value={formData.vatMst}
                                             onChange={e => setFormData({...formData, vatMst: e.target.value})}
                                             placeholder="Nhập MST (10 hoặc 13 số)"
                                             className={cn(
                                               "flex-1 h-14 rounded-xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                               theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-white border-slate-200 focus:border-primary"
                                             )}
                                           />
                                           <button 
                                             onClick={checkMST}
                                             disabled={isCheckingMst}
                                             className="px-6 h-14 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50"
                                           >
                                              Kiểm tra
                                           </button>
                                        </div>
                                     </div>
                                  </div>

                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Tên công ty (Theo GPKD)</label>
                                     <input 
                                       value={formData.vatCompanyName}
                                       onChange={e => setFormData({...formData, vatCompanyName: e.target.value})}
                                       placeholder="Ví dụ: Công ty TNHH Giải pháp Công nghệ Tech-Store"
                                       className={cn(
                                         "w-full h-14 rounded-xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                         theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-white border-slate-200 focus:border-primary"
                                       )}
                                     />
                                  </div>

                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Địa chỉ trụ sở chính</label>
                                     <input 
                                       value={formData.vatCompanyAddress}
                                       onChange={e => setFormData({...formData, vatCompanyAddress: e.target.value})}
                                       className={cn(
                                         "w-full h-14 rounded-xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                         theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-white border-slate-200 focus:border-primary"
                                       )}
                                     />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Email nhận hóa đơn</label>
                                        <input 
                                          value={formData.vatEmail}
                                          onChange={e => setFormData({...formData, vatEmail: e.target.value})}
                                          placeholder="abc@company.com"
                                          className={cn(
                                            "w-full h-14 rounded-xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                            theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-white border-slate-200 focus:border-primary"
                                          )}
                                        />
                                     </div>
                                     <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">SĐT liên hệ kế toán</label>
                                        <input 
                                          value={formData.vatContactPhone}
                                          onChange={e => setFormData({...formData, vatContactPhone: e.target.value})}
                                          className={cn(
                                            "w-full h-14 rounded-xl px-6 border-2 outline-none font-bold text-sm transition-all",
                                            theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-white border-slate-200 focus:border-primary"
                                          )}
                                        />
                                     </div>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>

              {/* Payment Methods */}
              <div className={cn(
                "backdrop-blur-xl rounded-[3rem] border p-10 transition-all duration-500",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
              )}>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                       <CreditCard size={24} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Phương thức thanh toán</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: <Truck size={20} /> },
                      { id: 'transfer', name: 'Chuyển khoản Ngân hàng', icon: <CreditCard size={20} /> },
                    ].map(method => (
                      <div 
                        key={method.id}
                        onClick={() => setFormData({...formData, paymentMethod: method.id})}
                        className={cn(
                          "p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4",
                          formData.paymentMethod === method.id 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20"
                        )}
                      >
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center",
                           formData.paymentMethod === method.id ? "bg-primary text-white" : "bg-white/10"
                         )}>
                            {method.icon}
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest">{method.name}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right: Summary */}
           <div className="lg:col-span-5">
              <div className={cn(
                "backdrop-blur-2xl rounded-[3rem] border p-10 sticky top-32 space-y-8 transition-all duration-500",
                theme === 'dark' ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-2xl"
              )}>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic">Đơn hàng của bạn</h2>
                    <span className="text-[10px] font-black bg-primary px-3 py-1 rounded-lg text-white uppercase tracking-widest">{items.length} SP</span>
                 </div>

                 <div className="max-h-[300px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                    {items.map(item => (
                       <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-white/5 shrink-0">
                             <Image src={item.image} alt={item.name} fill className="object-cover" />
                             <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-bl-xl shadow-lg">
                                {item.quantity}
                             </div>
                          </div>
                          <div className="flex-1">
                             <h4 className="text-[10px] font-black uppercase tracking-widest line-clamp-1">{item.name}</h4>
                             <span className="text-xs font-bold text-primary">{formatPrice(item.price)}</span>
                          </div>
                       </div>
                    ))}
                 </div>

                 <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center text-slate-500">
                       <span className="text-[10px] font-black uppercase tracking-widest">Tạm tính</span>
                       <span className="font-bold">{formatPrice(totalPrice())}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                       <span className="text-[10px] font-black uppercase tracking-widest">Phí giao hàng</span>
                       <span className="font-bold text-emerald-500 uppercase tracking-widest text-[10px]">Miễn phí</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 pb-1">Tổng tiền thanh toán</span>
                       <span className="text-3xl font-black text-red-500 tracking-tighter">{formatPrice(totalPrice())}</span>
                    </div>
                 </div>

                 <button 
                   onClick={handleOrder}
                   className="w-full h-20 bg-red-600 text-white rounded-[2rem] font-black flex flex-col items-center justify-center gap-1 hover:bg-red-700 transition-all shadow-2xl shadow-red-600/30 group active:scale-95"
                 >
                    <span className="text-sm uppercase tracking-[0.3em]">XÁC NHẬN ĐẶT HÀNG</span>
                    <span className="text-[9px] opacity-60 font-bold uppercase tracking-widest">Nhấn để hoàn tất giao dịch</span>
                 </button>

                 <div className="flex flex-col items-center gap-4 pt-4 opacity-40">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={16} className="text-primary" />
                       <span className="text-[8px] font-black uppercase tracking-widest italic">Encrypted Secure Transaction</span>
                    </div>
                    <button 
                      onClick={() => router.push('/cart')}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors"
                    >
                       <ArrowLeft size={14} /> Quay lại giỏ hàng
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
