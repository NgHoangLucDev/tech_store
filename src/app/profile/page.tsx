'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { 
  User, ShieldCheck, Camera, Package, MapPin, 
  ChevronRight, ShoppingBag, Activity, Lock, Eye, EyeOff,
  Plus, Trash2, Edit3, X, Truck, Clock, Calendar, AlertCircle, Check
} from 'lucide-react';

interface UserAddress {
  id: number;
  user_id: number;
  label: string;
  receiver_name: string;
  receiver_phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  is_default: number;
}
import { cn } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_image?: string;
  product_name: string;
  quantity: number;
  price: number | string;
}

interface Order {
  id: number;
  created_at: string;
  total_amount: number | string;
  status: string;
  shipping_address?: string;
  items: OrderItem[];
}

function ProfileContent() {
  const { user, login, logout } = useAuthStore();
  const { theme } = useSettingsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ORDERS' | 'SECURITY' | 'ADDRESSES'>(tabParam === 'orders' ? 'ORDERS' : 'PROFILE');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // States cho Tracking Vận đơn
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  // State và Helper quản lý dấu chấm đỏ thông báo đơn hàng có thay đổi
  const [seenOrders, setSeenOrders] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const stored = localStorage.getItem('tech_store_seen_orders');
    if (stored) {
      try {
        setSeenOrders(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const markOrderAsSeen = (orderId: number, currentStatus: string) => {
    const updated = { ...seenOrders, [orderId.toString()]: currentStatus };
    setSeenOrders(updated);
    localStorage.setItem('tech_store_seen_orders', JSON.stringify(updated));
  };

  const hasOrderUpdate = (order: any) => {
    const lastSeenStatus = seenOrders[order.id.toString()];
    return lastSeenStatus !== order.status;
  };

  const hasAnyOrderUpdate = orders.some(o => hasOrderUpdate(o));

  const handleOpenTracking = async (orderId: number) => {
    if (!user?.phone) return toast.error('Vui lòng cập nhật số điện thoại tài khoản');
    setTrackingOrderId(orderId);
    setShowTrackingModal(true);
    setLoadingTracking(true);
    setTrackingData(null);
    
    // Đánh dấu đã xem đơn hàng này
    const order = orders.find(o => o.id === orderId);
    if (order) {
      markOrderAsSeen(order.id, order.status);
    }
    try {
      const res = await fetch(`/api/user/order-timeline?order_id=${orderId}&phone=${user.phone}`);
      const data = await res.json();
      if (res.ok) {
        setTrackingData(data);
      } else {
        toast.error(data.error || 'Lỗi lấy thông tin vận đơn');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setLoadingTracking(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    otp: ''
  });
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [mounted, setMounted] = useState(false);

  // States for password changing
  const [pwdMode, setPwdMode] = useState<'password' | 'otp'>('password');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityOtp, setSecurityOtp] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [isSendingSecurityOtp, setIsSendingSecurityOtp] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<UserAddress | null>(null);
  const [addrFormData, setAddrFormData] = useState({
    label: 'Nhà riêng',
    receiverName: '',
    receiverPhone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
    isDefault: false
  });

  const fetchAddresses = useCallback(async () => {
    if (!user?.id) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch(`/api/user/addresses?userId=${user.id}`);
      const data = await res.json();
      if (res.ok) setAddresses(data);
    } catch (err) { console.error(err); }
    finally { setLoadingAddresses(false); }
  }, [user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFormData.receiverName || !addrFormData.receiverPhone || !addrFormData.province || !addrFormData.district || !addrFormData.ward || !addrFormData.detail) {
      return toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
    }
    const t = toast.loading('Đang lưu địa chỉ...');
    try {
      const url = '/api/user/addresses';
      const method = editingAddr ? 'PUT' : 'POST';
      const body = {
        id: editingAddr?.id,
        userId: user?.id,
        ...addrFormData
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingAddr ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!', { id: t });
        setIsAddrModalOpen(false);
        setEditingAddr(null);
        setAddrFormData({
          label: 'Nhà riêng',
          receiverName: '',
          receiverPhone: '',
          province: '',
          district: '',
          ward: '',
          detail: '',
          isDefault: false
        });
        fetchAddresses();
      } else {
        toast.error(data.error || 'Lưu thất bại', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
    const t = toast.loading('Đang xóa địa chỉ...');
    try {
      const res = await fetch(`/api/user/addresses?id=${id}&userId=${user?.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Xóa địa chỉ thành công!', { id: t });
        fetchAddresses();
      } else {
        toast.error(data.error || 'Xóa thất bại', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  const handleSetDefaultAddress = async (addr: UserAddress) => {
    const t = toast.loading('Đang đặt làm mặc định...');
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: addr.id,
          userId: user?.id,
          label: addr.label,
          receiverName: addr.receiver_name,
          receiverPhone: addr.receiver_phone,
          province: addr.province,
          district: addr.district,
          ward: addr.ward,
          detail: addr.detail,
          isDefault: true
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Đã đặt làm địa chỉ mặc định!', { id: t });
        fetchAddresses();
      } else {
        toast.error(data.error || 'Thất bại', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  const openAddModal = () => {
    setEditingAddr(null);
    setAddrFormData({
      label: 'Nhà riêng',
      receiverName: '',
      receiverPhone: '',
      province: '',
      district: '',
      ward: '',
      detail: '',
      isDefault: false
    });
    setIsAddrModalOpen(true);
  };

  const openEditAddrModal = (addr: UserAddress) => {
    setEditingAddr(addr);
    setAddrFormData({
      label: addr.label,
      receiverName: addr.receiver_name,
      receiverPhone: addr.receiver_phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      detail: addr.detail,
      isDefault: addr.is_default === 1
    });
    setIsAddrModalOpen(true);
  };

  const fetchOrders = useCallback(async () => {
    if (!user?.phone) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/user/orders?phone=${user.phone}`);
      const data = await res.json();
      if (res.ok) setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoadingOrders(false); }
  }, [user]);

  const sendSecurityOtp = async () => {
    if (!user?.email) return toast.error('Không tìm thấy email liên kết với tài khoản');
    setIsSendingSecurityOtp(true);
    const t = toast.loading('Đang gửi mã OTP đến email của bạn...');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (res.ok) {
        toast.success('Mã OTP đã được gửi đến email của bạn!', { id: t });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Gửi OTP thất bại', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    } finally {
      setIsSendingSecurityOtp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }
    const t = toast.loading('Đang thực hiện đổi mật khẩu...');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          mode: pwdMode,
          oldPassword: pwdMode === 'password' ? oldPassword : undefined,
          otp: pwdMode === 'otp' ? securityOtp : undefined,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Đổi mật khẩu thành công!', { id: t });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSecurityOtp('');
      } else {
        toast.error(data.error || 'Đổi mật khẩu thất bại', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) {
      const timer = setTimeout(() => {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          otp: ''
        });
        fetchOrders();
        fetchAddresses();
      }, 0);
      return () => clearTimeout(timer);
    } else {
      router.push('/login');
    }
  }, [user, mounted, router, fetchOrders, fetchAddresses]);

  useEffect(() => {
    if (user && activeTab === 'ADDRESSES') {
      fetchAddresses();
    }
  }, [user, activeTab, fetchAddresses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) return toast.error('Vui lòng nhập Email hợp lệ');
    const t = toast.loading('Đang gửi mã OTP...');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        toast.success('Mã OTP đã được gửi đến Email của bạn!', { id: t });
        setShowOtpInput(true);
      } else {
        const data = await res.json();
        toast.error(data.error, { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('Đang cập nhật...');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            currentEmail: user?.email, 
            ...formData,
            otp: showOtpInput ? formData.otp : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        login({ 
          ...user!, 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          address: formData.address 
        });
        toast.success('Đã cập nhật thông tin thành công!', { id: t });
        setShowOtpInput(false);
        setFormData(prev => ({ ...prev, otp: '' }));
      } else {
        toast.error(data.error, { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SHIPPED': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'DELIVERED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (!mounted || !user) return null;

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
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Secure User Hub</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">
                 TÀI KHOẢN <span className="text-primary">CORE</span>
              </h1>
           </div>
           
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setActiveTab('PROFILE')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'PROFILE' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                )}
              >
                Cấu hình
              </button>
              <button 
                onClick={() => setActiveTab('SECURITY')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'SECURITY' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                )}
              >
                Bảo mật
              </button>
              <button 
                onClick={() => setActiveTab('ORDERS')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative",
                  activeTab === 'ORDERS' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                )}
              >
                Đơn hàng {orders.length > 0 && `(${orders.length})`}
                {hasAnyOrderUpdate && (
                  <span className="absolute top-1.5 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('ADDRESSES')}
                className={cn(
                  "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'ADDRESSES' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                )}
              >
                Sổ địa chỉ
              </button>
            </div>
         </header>

         <AnimatePresence mode="wait">
          {(activeTab === 'PROFILE' || activeTab === 'SECURITY') ? (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               {/* Profile Content Left Card (shared between Cấu hình and Bảo mật) */}
               <div className="lg:col-span-4 space-y-8">
                  <div className={cn(
                    "backdrop-blur-xl rounded-[2.5rem] border p-10 relative overflow-hidden transition-all duration-500",
                    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
                  )}>
                     <div className="relative w-32 h-32 mx-auto mb-8">
                        <div className="w-full h-full bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary border-2 border-primary/30">
                           <User size={64} />
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all border border-slate-200">
                           <Camera size={18} />
                        </button>
                     </div>
                     <div className="text-center">
                        <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 leading-none">{user.name}</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                           <ShieldCheck size={14} className="text-primary" />
                           <span className="text-[9px] font-black text-primary uppercase tracking-widest">{user.role} Status</span>
                        </div>
                     </div>
                     <div className="mt-10 pt-10 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tín nhiệm</span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">A+ Grade</span>
                        </div>

                        {user && (user.role === 'ADMIN' || user.role === 'STAFF') && (
                          <Link href="/admin/dashboard" className="block w-full">
                            <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3">
                               <Activity size={14} />
                               Admin Dashboard
                            </button>
                          </Link>
                        )}

                        <button onClick={() => logout()} className="w-full mt-6 py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Đăng xuất</button>
                     </div>
                  </div>
               </div>

               <div className="lg:col-span-8">
                  {activeTab === 'PROFILE' ? (
                    <form onSubmit={handleUpdate} className={cn(
                      "backdrop-blur-xl rounded-[3rem] border p-12 transition-all duration-500 h-full",
                      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
                    )}>
                       <div className="space-y-10">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Họ và tên định danh</label>
                                <input name="name" value={formData.name} onChange={handleChange} className={cn("w-full h-16 rounded-2xl px-6 border-2 outline-none font-bold text-sm", theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900")} />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Số điện thoại</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className={cn("w-full h-16 rounded-2xl px-6 border-2 outline-none font-bold text-sm", theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900")} />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Email (ID)</label>
                             <input name="email" value={formData.email} onChange={handleChange} className={cn("w-full h-16 rounded-2xl px-6 border-2 outline-none font-bold text-sm", theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900")} />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Địa chỉ giao hàng</label>
                             <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={cn("w-full rounded-2xl p-6 border-2 outline-none font-bold text-sm resize-none", theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900")} />
                          </div>
                          <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">Lưu cấu hình</button>
                       </div>
                    </form>
                  ) : (
                    <form onSubmit={handleChangePassword} className={cn(
                      "backdrop-blur-xl rounded-[3rem] border p-12 transition-all duration-500 h-full",
                      theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-xl"
                    )}>
                      <div className="space-y-8">
                         <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">ĐỔI MẬT KHẨU BẢO MẬT</h3>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
                         </div>

                         {/* Mode selector */}
                         <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5 max-w-md">
                            <button
                              type="button"
                              onClick={() => {
                                setPwdMode('password');
                                setSecurityOtp('');
                              }}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                pwdMode === 'password' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                              )}
                            >
                              Nhớ mật khẩu cũ
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPwdMode('otp');
                                setOldPassword('');
                              }}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                pwdMode === 'otp' ? "bg-primary text-white" : "text-slate-500 hover:text-white"
                              )}
                            >
                              Quên mật khẩu cũ (Dùng OTP)
                            </button>
                         </div>

                         <div className="space-y-6">
                            {pwdMode === 'password' ? (
                               <div className="space-y-3 relative group">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Mật khẩu cũ</label>
                                  <div className="relative">
                                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock size={16} />
                                     </div>
                                     <input
                                        required
                                        type={showOldPwd ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu cũ của bạn"
                                        className={cn(
                                          "w-full h-16 pl-14 pr-14 rounded-2xl border-2 outline-none font-bold text-sm",
                                          theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                                        )}
                                     />
                                     <button
                                        type="button"
                                        onClick={() => setShowOldPwd(!showOldPwd)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                     >
                                        {showOldPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                     </button>
                                  </div>
                               </div>
                            ) : (
                               <div className="space-y-3 relative group">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Xác thực OTP qua Email ({user.email})</label>
                                  <div className="flex gap-4">
                                     <div className="relative flex-1">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                           <ShieldCheck size={16} />
                                        </div>
                                        <input
                                           required
                                           type="text"
                                           value={securityOtp}
                                           onChange={(e) => setSecurityOtp(e.target.value)}
                                           placeholder="Nhập mã OTP 6 số"
                                           className={cn(
                                             "w-full h-16 pl-14 pr-6 rounded-2xl border-2 outline-none font-bold text-sm tracking-[0.2em]",
                                             theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                                           )}
                                        />
                                     </div>
                                     <button
                                        type="button"
                                        disabled={isSendingSecurityOtp}
                                        onClick={sendSecurityOtp}
                                        className="h-16 px-6 bg-primary/20 text-primary hover:bg-primary/30 active:scale-95 transition-all rounded-2xl text-xs font-black uppercase tracking-widest shrink-0"
                                     >
                                        {isSendingSecurityOtp ? 'Đang gửi...' : 'Gửi mã OTP'}
                                     </button>
                                  </div>
                               </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-3 relative group">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Mật khẩu mới</label>
                                  <div className="relative">
                                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock size={16} />
                                     </div>
                                     <input
                                        required
                                        type={showNewPwd ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mật khẩu mới"
                                        className={cn(
                                          "w-full h-16 pl-14 pr-14 rounded-2xl border-2 outline-none font-bold text-sm",
                                          theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                                        )}
                                     />
                                     <button
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                     >
                                        {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                     </button>
                                  </div>
                               </div>

                               <div className="space-y-3 relative group">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">Xác nhận mật khẩu</label>
                                  <div className="relative">
                                     <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                                        <Lock size={16} />
                                     </div>
                                     <input
                                        required
                                        type={showConfirmPwd ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Xác nhận mật khẩu mới"
                                        className={cn(
                                          "w-full h-16 pl-14 pr-14 rounded-2xl border-2 outline-none font-bold text-sm",
                                          theme === 'dark' ? "bg-white/5 border-white/5 focus:border-primary text-white" : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                                        )}
                                     />
                                     <button
                                        type="button"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                     >
                                        {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl">Xác nhận đổi mật khẩu</button>
                      </div>
                    </form>
                  )}
               </div>
            </motion.div>
          ) : null}
          {activeTab === 'ORDERS' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               {loadingOrders ? (
                 <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
               ) : orders.length === 0 ? (
                 <div className="py-40 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/5 opacity-40">
                    <ShoppingBag size={48} className="mx-auto mb-6" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Bạn chưa có đơn hàng nào</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 gap-8">
                    {orders.map((order: any) => (
                      <div key={order.id} className={cn(
                        "backdrop-blur-xl rounded-[3rem] border p-10 transition-all group overflow-hidden relative",
                        theme === 'dark' ? "bg-white/5 border-white/10 hover:border-primary/30" : "bg-white border-slate-200 shadow-lg hover:border-primary/30"
                      )}>
                         {/* TRIAL INFO BLOCK */}
                         {order.is_trial === 1 && (
                           <div className="mb-8 p-6 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 text-purple-200 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                 <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-purple-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg">ĐƠN DÙNG THỬ 3 NGÀY</span>
                                    {order.trial_status === 'TRIALING' && (
                                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider rounded-lg animate-pulse">ĐANG DÙNG THỬ</span>
                                    )}
                                    {order.trial_status === 'APPROVED_PAID' && (
                                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider rounded-lg">ĐÃ MUA ĐỨT</span>
                                    )}
                                    {order.trial_status === 'REJECTED_RETURN' && (
                                      <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider rounded-lg">YÊU CẦU TRẢ HÀNG</span>
                                    )}
                                    {order.trial_status === 'COLLECTED' && (
                                      <span className="px-3 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/20 text-[9px] font-black uppercase tracking-wider rounded-lg">ĐÃ THU HỒI</span>
                                    )}
                                 </div>
                                 <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                                    Tiền đặt cọc: <span className="text-purple-400 font-black">{Number(order.deposit_amount).toLocaleString('vi-VN')}₫</span>
                                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded-md font-black text-[9px]">
                                      {order.deposit_status === 'PENDING_DEPOSIT' && '🔴 CHỜ ĐÓNG CỌC'}
                                      {order.deposit_status === 'DEPOSITED' && '🟢 ĐÃ ĐÓNG CỌC'}
                                      {order.deposit_status === 'REFUNDED' && '🔵 ĐÃ HOÀN CỌC'}
                                      {order.deposit_status === 'FORFEITED' && '⚫ CỌC BỊ TỊCH THU'}
                                    </span>
                                 </div>
                              </div>
                              
                              {order.trial_status === 'TRIALING' && (
                                <div className="pt-4 border-t border-purple-500/20 flex flex-wrap items-center justify-between gap-4">
                                   <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                      <Clock size={14} className="text-purple-400" />
                                      <span>Hạn dùng thử đến:</span>
                                      <span className="text-white font-black">{order.trial_expired_at ? new Date(order.trial_expired_at).toLocaleString('vi-VN') : 'N/A'}</span>
                                   </div>
                                   <Link href={`/trial/feedback?order_id=${order.id}`} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2">
                                      Quyết định (Mua / Trả) <ChevronRight size={14} />
                                   </Link>
                                </div>
                              )}

                              {order.trial_status === 'REJECTED_RETURN' && (
                                <div className="text-[11px] leading-relaxed text-slate-400">
                                   📌 <span className="text-slate-300 font-bold">Ghi chú thu hồi:</span> G-Store đã tiếp nhận yêu cầu trả máy của bạn. Chúng tôi sẽ hoàn cọc 100% khi shipper thu hồi thiết bị nguyên vẹn về kho.
                                </div>
                              )}
                           </div>
                         )}

                                                  <div className="flex flex-wrap items-center justify-between gap-6 mb-8 pb-8 border-b border-white/5">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                  <Package size={24} />
                               </div>
                               <div>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Mã đơn #{order.id}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(order.created_at).toLocaleString('vi-VN')}</span>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Tổng thanh toán</span>
                                  <span className="text-2xl font-black text-primary tracking-tighter">{Number(order.total_price || order.total_amount || 0).toLocaleString('vi-VN')}₫</span>
                               </div>
                               <div className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border relative flex items-center gap-1.5", getOrderStatusColor(order.status))}>
                                  {order.status}
                                  {hasOrderUpdate(order) && (
                                    <span className="flex h-2 w-2 relative shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </span>
                                  )}
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-6 group/item">
                                 <div className="w-20 h-20 bg-black/40 rounded-2xl p-3 border border-white/5 shrink-0">
                                    <img src={item.product_image || '/laptop.png'} className="w-full h-full object-contain" alt="" />
                                 </div>
                                 <div className="flex-1">
                                    <span className="text-sm font-black uppercase text-white block mb-1 group-hover/item:text-primary transition-colors">{item.product_name}</span>
                                    <div className="flex items-center gap-4">
                                       <span className="text-[10px] font-bold text-slate-500 uppercase">Số lượng: {item.quantity}</span>
                                       <span className="text-[10px] font-bold text-primary uppercase">{Number(item.price).toLocaleString('vi-VN')}₫</span>
                                    </div>
                                 </div>
                                 {order.status === 'COMPLETED' ? (
                                   <Link href={`/warranty/register`} className="px-6 py-2 bg-white/5 hover:bg-primary hover:text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                      Bảo hành
                                   </Link>
                                 ) : (
                                   <div className="px-4 py-2 bg-white/5 text-slate-500 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-not-allowed select-none animate-pulse" title="Bảo hành sẽ kích hoạt sau khi hoàn thành đơn hàng">
                                      Chờ kích hoạt
                                   </div>
                                 )}
                              </div>
                            ))}
                         </div>

                         <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-500">
                               <MapPin size={14} />
                               <span className="text-[10px] font-bold uppercase truncate max-w-md">{order.shipping_address}</span>
                            </div>
                            <button
                               type="button"
                               onClick={() => handleOpenTracking(order.id)}
                               className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest hover:gap-4 transition-all"
                            >
                               Chi tiết vận đơn <ChevronRight size={14} />
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'ADDRESSES' && (
            <motion.div key="addresses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               <div className="flex justify-between items-center">
                 <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">SỔ ĐỊA CHỈ GIAO HÀNG</h3>
                   <p className="text-xs text-slate-500 mt-1 font-medium">Quản lý các địa chỉ nhận hàng của bạn để thanh toán nhanh hơn</p>
                 </div>
                 <button 
                   type="button"
                   onClick={openAddModal}
                   className="px-6 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                 >
                   <Plus size={14} /> Thêm địa chỉ mới
                 </button>
               </div>

               {loadingAddresses ? (
                 <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
               ) : addresses.length === 0 ? (
                 <div className="py-40 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/5 opacity-40">
                    <MapPin size={48} className="mx-auto mb-6" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Bạn chưa lưu địa chỉ nào</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {addresses.map((addr) => (
                     <div key={addr.id} className={cn(
                       "backdrop-blur-xl rounded-[3rem] border p-8 transition-all group overflow-hidden relative flex flex-col justify-between gap-6",
                       theme === 'dark' ? "bg-white/5 border-white/10 hover:border-primary/30" : "bg-white border-slate-200 shadow-lg hover:border-primary/30"
                     )}>
                       <div>
                         <div className="flex items-center justify-between gap-4 mb-4">
                           <span className="px-4 py-1.5 bg-primary/10 rounded-xl text-[9px] font-black uppercase text-primary border border-primary/20">
                             {addr.label}
                           </span>
                           {addr.is_default === 1 && (
                             <span className="px-4 py-1.5 bg-emerald-500/10 rounded-xl text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/20">
                               Mặc định
                             </span>
                           )}
                         </div>

                         <h4 className="text-xl font-black uppercase tracking-tight mb-2">{addr.receiver_name}</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">{addr.receiver_phone}</p>
                         
                         <p className="text-sm text-slate-300 font-medium leading-relaxed">
                           {addr.detail}, {addr.ward}, {addr.district}, {addr.province}
                         </p>
                       </div>

                       <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div>
                           {addr.is_default !== 1 && (
                             <button 
                               type="button"
                               onClick={() => handleSetDefaultAddress(addr)}
                               className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                             >
                               Đặt mặc định
                             </button>
                           )}
                         </div>
                         <div className="flex items-center gap-4">
                           <button 
                             type="button"
                             onClick={() => openEditAddrModal(addr)}
                             className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                           >
                             <Edit3 size={14} />
                           </button>
                           <button 
                             type="button"
                             onClick={() => handleDeleteAddress(addr.id)}
                             className="p-3 bg-red-500/5 rounded-xl hover:bg-red-500 text-red-500/50 hover:text-white transition-all"
                           >
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </motion.div>
          )}
         </AnimatePresence>

         {/* Address Edit/Add Modal */}
         <AnimatePresence>
           {isAddrModalOpen && (
             <div className="fixed inset-0 z-[1000] overflow-y-auto no-scrollbar">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                 onClick={() => setIsAddrModalOpen(false)} 
                 className="fixed inset-0 bg-black/90 backdrop-blur-xl" 
               />
               
               <div className="relative min-h-screen flex items-center justify-center p-4 md:p-12 pointer-events-none">
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                   className="relative bg-[#0a0a0a] border-2 border-white/5 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl shadow-2xl pointer-events-auto"
                 >
                  <div className="absolute top-0 right-0 p-8">
                     <button type="button" onClick={() => setIsAddrModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X size={32} />
                     </button>
                  </div>
                  
                  <header className="mb-10">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] block mb-4">Địa chỉ giao nhận</span>
                     <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                       {editingAddr ? 'CẬP NHẬT ĐỊA CHỈ' : 'THÊM ĐỊA CHỈ MỚI'}
                     </h2>
                  </header>

                  <form onSubmit={handleSaveAddress} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Họ và tên người nhận *</label>
                           <input 
                              required
                              type="text"
                              value={addrFormData.receiverName}
                              onChange={(e) => setAddrFormData({...addrFormData, receiverName: e.target.value})}
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Số điện thoại *</label>
                           <input 
                              required
                              type="text"
                              value={addrFormData.receiverPhone}
                              onChange={(e) => setAddrFormData({...addrFormData, receiverPhone: e.target.value})}
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Tỉnh / Thành phố *</label>
                           <input 
                              required
                              type="text"
                              value={addrFormData.province}
                              onChange={(e) => setAddrFormData({...addrFormData, province: e.target.value})}
                              placeholder="Ví dụ: TP. Hồ Chí Minh"
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all text-xs"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Quận / Huyện *</label>
                           <input 
                              required
                              type="text"
                              value={addrFormData.district}
                              onChange={(e) => setAddrFormData({...addrFormData, district: e.target.value})}
                              placeholder="Ví dụ: Quận 12"
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all text-xs"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Phường / Xã *</label>
                           <input 
                              required
                              type="text"
                              value={addrFormData.ward}
                              onChange={(e) => setAddrFormData({...addrFormData, ward: e.target.value})}
                              placeholder="Ví dụ: P. Tân Thới Nhất"
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all text-xs"
                           />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Địa chỉ chi tiết (Số nhà, Tên đường) *</label>
                        <input 
                           required
                           type="text"
                           value={addrFormData.detail}
                           onChange={(e) => setAddrFormData({...addrFormData, detail: e.target.value})}
                           placeholder="Ví dụ: 154/7 Cống Lở"
                           className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all"
                        />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Loại địa chỉ</label>
                           <select 
                              value={addrFormData.label}
                              onChange={(e) => setAddrFormData({...addrFormData, label: e.target.value})}
                              className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-white font-bold outline-none focus:border-primary transition-all appearance-none"
                           >
                              <option value="Nhà riêng" className="bg-[#0a0a0a]">Nhà riêng</option>
                              <option value="Văn phòng" className="bg-[#0a0a0a]">Văn phòng</option>
                              <option value="Khác" className="bg-[#0a0a0a]">Khác</option>
                           </select>
                        </div>
                        
                        <div className="pt-6">
                           <label className="flex items-center gap-3 cursor-pointer group">
                              <div 
                                 onClick={() => setAddrFormData({...addrFormData, isDefault: !addrFormData.isDefault})}
                                 className={cn(
                                    "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                                    addrFormData.isDefault ? "bg-primary border-primary" : "border-slate-500 group-hover:border-primary"
                                 )}
                              >
                                 {addrFormData.isDefault && <ShieldCheck size={14} className="text-white" />}
                              </div>
                              <span className={cn(
                                 "text-[10px] font-black uppercase tracking-widest transition-colors",
                                 addrFormData.isDefault ? "text-primary" : "text-slate-500"
                              )}>Đặt làm địa chỉ mặc định</span>
                           </label>
                        </div>
                     </div>

                     <button type="submit" className="w-full h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                        LƯU ĐỊA CHỈ
                     </button>
                  </form>
                 </motion.div>
               </div>
             </div>
           )}
          </AnimatePresence>
 
         {/* Order Tracking Modal */}
         <AnimatePresence>
           {showTrackingModal && (
             <div className="fixed inset-0 z-[1000] overflow-y-auto no-scrollbar">
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                  onClick={() => setShowTrackingModal(false)} 
                  className="fixed inset-0 bg-black/90 backdrop-blur-xl" 
                />
                
                <div className="relative min-h-screen flex items-center justify-center p-4 md:p-12 pointer-events-none">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                    className="relative bg-[#0a0a0a] border-2 border-white/5 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] w-full max-w-2xl shadow-2xl pointer-events-auto"
                  >
                     <div className="absolute top-0 right-0 p-8">
                        <button type="button" onClick={() => setShowTrackingModal(false)} className="text-slate-500 hover:text-white transition-colors">
                           <X size={32} />
                        </button>
                     </div>
                     
                     <header className="mb-10">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] block mb-4">MÃ ĐƠN HÀNG #ORD-{trackingOrderId}</span>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                          CHI TIẾT VẬN ĐƠN
                        </h2>
                     </header>

                     {loadingTracking ? (
                       <div className="py-20 text-center">
                          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                          <p className="text-xs text-slate-500 uppercase tracking-widest mt-4 font-bold">Đang tải hành trình đơn hàng...</p>
                       </div>
                     ) : trackingData ? (
                       <div className="space-y-8">
                          {/* Main Order Info */}
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                             <div className="space-y-1">
                                <span className="text-slate-500 block uppercase font-bold text-[9px]">Người nhận & SĐT</span>
                                <span className="font-bold text-white uppercase">{trackingData.order.customer_name} - {trackingData.order.customer_phone}</span>
                             </div>
                             <div className="space-y-1">
                                <span className="text-slate-500 block uppercase font-bold text-[9px]">Hình thức giao hàng</span>
                                <span className="font-bold text-primary uppercase">{trackingData.order.delivery_method === 'pickup' ? 'Nhận tại cửa hàng' : 'Giao hàng tận nơi'}</span>
                             </div>
                             <div className="space-y-1 md:col-span-2">
                                <span className="text-slate-500 block uppercase font-bold text-[9px]">Địa chỉ giao</span>
                                <span className="font-medium text-slate-300">{trackingData.order.shipping_address}</span>
                             </div>
                             {trackingData.order.packer_name && (
                               <div className="space-y-1">
                                  <span className="text-slate-500 block uppercase font-bold text-[9px]">Nhân viên đóng gói</span>
                                  <span className="font-bold text-purple-400 uppercase">{trackingData.order.packer_name}</span>
                                </div>
                             )}
                             {trackingData.order.shipper_name && (
                               <div className="space-y-1">
                                  <span className="text-slate-500 block uppercase font-bold text-[9px]">Shipper vận chuyển</span>
                                  <span className="font-bold text-emerald-400 uppercase">{trackingData.order.shipper_name} ({trackingData.order.shipper_phone})</span>
                                </div>
                             )}
                          </div>

                          {/* TIMELINE LIST */}
                          <div className="space-y-6 relative pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10 text-left">
                             {trackingData.logs && trackingData.logs.length > 0 ? (
                               trackingData.logs.map((log: any, idx: number) => {
                                 const isLast = idx === trackingData.logs.length - 1;
                                 return (
                                   <div key={log.id} className="relative group">
                                      {/* Icon dot */}
                                      <div className={cn(
                                        "absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all z-10",
                                        isLast 
                                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                                          : "bg-[#0a0a0a] border-white/10 text-slate-500"
                                      )}>
                                         {isLast ? <Truck size={12} className="animate-bounce" /> : <Clock size={12} />}
                                      </div>
                                      
                                      <div className="space-y-1 text-left">
                                         <div className="flex items-center gap-3">
                                            <span className={cn(
                                              "text-xs font-black uppercase tracking-wider",
                                              isLast ? "text-primary" : "text-white"
                                            )}>{log.status}</span>
                                            <span className="text-[10px] font-bold text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                                         </div>
                                         <p className="text-xs text-slate-300 font-medium leading-relaxed">{log.note}</p>
                                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block pt-0.5">Xử lý bởi: {log.actor_name}</span>
                                      </div>
                                   </div>
                                 );
                               })
                             ) : (
                               <div className="py-6 text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                  <AlertCircle size={16} /> Đơn hàng đang được tiếp nhận và xử lý hành trình
                               </div>
                             )}
                          </div>
                       </div>
                     ) : (
                       <div className="py-20 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">
                          ❌ Không tìm thấy thông tin vận đơn này.
                       </div>
                     )}

                     <button 
                       type="button" 
                       onClick={() => setShowTrackingModal(false)} 
                       className="w-full h-16 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white/10 active:scale-95 transition-all mt-8"
                     >
                        ĐÓNG CỬA SỔ
                     </button>
                  </motion.div>
                </div>
             </div>
           )}
         </AnimatePresence>
       </main>

      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
