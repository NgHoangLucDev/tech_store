'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ChevronRight, Package, 
  Truck, CheckCircle, ArrowLeft, History,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type TicketStatus = 'RECEIVED' | 'SENT_TO_MANUFACTURER' | 'REPAIRED_EXCHANGED' | 'READY_FOR_PICKUP' | 'CLOSED' | 'PENDING_APPROVAL' | 'REJECTED';

export default function WarrantyRegisterPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'TRACK'>('REGISTER');
  const [step, setStep] = useState(0); // 0: Loading/Checking Auth
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [warranties, setWarranties] = useState<any[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<any | null>(null);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    issue_description: '',
    delivery_method: 'SHOWROOM',
    customer_address: '',
    media_urls: []
  });

  const [ticketId, setTicketId] = useState<number | null>(null);

  // Effect: Kiểm tra đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      if (user === null) {
        // Nếu chưa đăng nhập, chuyển hướng sang Login
        toast.error('Vui lòng đăng nhập để thực hiện bảo hành');
        router.push('/login?redirect=/warranty/register');
      } else if (user && user.phone) {
        // Nếu đã đăng nhập, tự động lấy dữ liệu theo SĐT của User
        setPhone(user.phone);
        await autoFetchWarranties(user.phone);
        setStep(3); // Nhảy thẳng đến bước chọn sản phẩm
      }
    };
    
    // Đợi 1 chút để Auth Store hydrate xong
    const timer = setTimeout(checkAuth, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const autoFetchWarranties = async (userPhone: string) => {
    setLoading(true);
    try {
      // Gọi API lấy bảo hành mà không cần OTP vì đã auth
      const res = await fetch(`/api/admin/warranty?phone=${userPhone}`);
      const data = await res.json();
      if (res.ok) {
        setWarranties(data);
        fetchUserTickets(data.map((w: any) => w.id));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUserTickets = async (warrantyIds: number[]) => {
    try {
      const res = await fetch('/api/admin/warranty/tickets');
      const data = await res.json();
      if (res.ok) {
        const filtered = data.filter((t: any) => warrantyIds.includes(t.warranty_id));
        setUserTickets(filtered);
      }
    } catch (err) { console.error(err); }
  };

  // Gửi Ticket
  const handleSubmitTicket = async () => {
    if (!formData.issue_description) return toast.error('Vui lòng mô tả lỗi');
    setLoading(true);
    try {
      const res = await fetch('/api/warranty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'SUBMIT_TICKET', 
          warranty_id: selectedWarranty.id, 
          ...formData 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTicketId(data.ticket_id);
        setStep(5);
      } else toast.error(data.error);
    } catch (err) { toast.error('Lỗi gửi yêu cầu'); }
    finally { setLoading(false); }
  };

  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'Đang chờ duyệt';
      case 'RECEIVED': return 'Đã nhận sản phẩm';
      case 'SENT_TO_MANUFACTURER': return 'Đang ở hãng';
      case 'REPAIRED_EXCHANGED': return 'Hãng đã xử lý xong';
      case 'READY_FOR_PICKUP': return 'Sẵn sàng trả khách';
      case 'CLOSED': return 'Đã hoàn thành';
      case 'REJECTED': return 'Từ chối bảo hành';
    }
  };

  if (step === 0) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-10">BẢO HÀNH ONLINE</h1>
          <div className="flex justify-center gap-4">
             <button onClick={() => setActiveTab('REGISTER')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'REGISTER' ? "bg-primary text-white" : "bg-white/5 text-slate-500")}>Đăng ký mới</button>
             <button onClick={() => { setActiveTab('TRACK'); fetchUserTickets(warranties.map(w => w.id)); }} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'TRACK' ? "bg-primary text-white" : "bg-white/5 text-slate-500")}>Lịch sử bảo hành</button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step >= 3 && activeTab === 'REGISTER' && (
            <motion.div key="register-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               {step === 3 && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                       <h2 className="text-2xl font-black uppercase">Chọn sản phẩm</h2>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Khách hàng: {user?.name}</div>
                    </div>
                    {warranties.map((w) => (
                      <div key={w.id} onClick={() => { setSelectedWarranty(w); setStep(4); }} className="bg-[#0a0a0a] border-2 border-white/5 rounded-[2.5rem] p-8 flex items-center gap-10 hover:border-primary cursor-pointer transition-all group">
                         <img src={w.product_image || '/laptop.png'} className="w-20 h-20 object-contain opacity-70" />
                         <div className="flex-1">
                            <span className="text-xl font-black uppercase block group-hover:text-primary">{w.product_name}</span>
                            <span className="text-[10px] font-mono text-slate-500">S/N: {w.serial_number}</span>
                         </div>
                         <ChevronRight size={24} className="text-slate-700 group-hover:text-primary" />
                      </div>
                    ))}
                    {warranties.length === 0 && (
                      <div className="p-20 bg-white/5 rounded-[3rem] text-center opacity-30 border-2 border-dashed border-white/5">
                        <p className="text-xs font-black uppercase tracking-widest">Bạn chưa mua sản phẩm nào để bảo hành</p>
                      </div>
                    )}
                 </div>
               )}
               {step === 4 && selectedWarranty && (
                 <div className="bg-[#0a0a0a] border-2 border-white/5 rounded-[4rem] p-16">
                    <button onClick={() => setStep(3)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 text-[10px] font-black uppercase tracking-widest">
                       <ArrowLeft size={14} /> Quay lại
                    </button>
                    <h2 className="text-4xl font-black uppercase mb-10">Mô tả tình trạng lỗi</h2>
                    <textarea rows={4} value={formData.issue_description} onChange={(e) => setFormData({...formData, issue_description: e.target.value})} className="w-full bg-white/5 border-2 border-white/5 rounded-3xl p-8 text-white font-bold outline-none focus:border-primary mb-10" />
                    
                    <div className="space-y-6 mb-10">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Hình thức gửi hàng</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setFormData({...formData, delivery_method: 'SHOWROOM'})} className={cn("p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3", formData.delivery_method === 'SHOWROOM' ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-slate-500")}>
                             <Package size={20} /> <span className="text-[10px] font-black uppercase">Tự mang đến</span>
                          </button>
                          <button onClick={() => setFormData({...formData, delivery_method: 'SHIPPER'})} className={cn("p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3", formData.delivery_method === 'SHIPPER' ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-slate-500")}>
                             <Truck size={20} /> <span className="text-[10px] font-black uppercase">Shipper lấy tận nhà</span>
                          </button>
                       </div>
                    </div>

                    <button onClick={handleSubmitTicket} disabled={loading} className="w-full h-20 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.4em]">
                       {loading ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU BẢO HÀNH'}
                    </button>
                 </div>
               )}
               {step === 5 && (
                 <div className="bg-[#0a0a0a] border-2 border-emerald-500/20 rounded-[4rem] p-20 text-center">
                    <CheckCircle size={60} className="text-emerald-500 mx-auto mb-8" />
                    <h2 className="text-4xl font-black uppercase mb-6">Đã gửi yêu cầu!</h2>
                    <p className="text-slate-500 mb-10">Mã phiếu của bạn là #BH-{ticketId}. Bạn có thể tra cứu tiến độ ở tab Lịch sử.</p>
                    <button onClick={() => { setActiveTab('TRACK'); setStep(3); fetchUserTickets(warranties.map(w => w.id)); }} className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px]">XEM LỊCH SỬ NGAY</button>
                 </div>
               )}
            </motion.div>
          )}

          {step >= 3 && activeTab === 'TRACK' && (
            <motion.div key="track-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <h2 className="text-2xl font-black uppercase">Tiến độ bảo hành của bạn</h2>
               {userTickets.length === 0 ? (
                 <div className="p-20 bg-white/5 rounded-[3rem] text-center opacity-30 border-2 border-dashed border-white/5">
                    <History size={40} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Bạn chưa có yêu cầu bảo hành nào</p>
                 </div>
               ) : (
                 userTickets.map((ticket) => (
                   <div key={ticket.id} className="bg-[#0a0a0a] border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">PHIẾU #BH-{ticket.id}</span>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{ticket.product_name}</h3>
                         </div>
                         <div className={cn("px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border", 
                           ticket.status === 'CLOSED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                           ticket.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                           'bg-amber-500/10 text-amber-500 border-amber-500/20'
                         )}>
                            {getStatusText(ticket.status)}
                         </div>
                      </div>
                      <div className="flex items-center gap-2 mb-8">
                         {[1, 2, 3, 4, 5].map((s) => (
                           <div key={s} className={cn("h-1 flex-1 rounded-full", 
                             (ticket.status === 'CLOSED' ? 5 : 
                              ticket.status === 'READY_FOR_PICKUP' ? 4 : 
                              ticket.status === 'REPAIRED_EXCHANGED' ? 3 : 
                              ticket.status === 'SENT_TO_MANUFACTURER' ? 2 : 1) >= s ? "bg-primary" : "bg-white/5"
                           )} />
                         ))}
                      </div>
                      <div className="grid grid-cols-2 gap-8 text-sm">
                         <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Lỗi khách báo</span>
                            <p className="text-white font-bold italic">"{ticket.issue_description}"</p>
                         </div>
                         <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cập nhật</span>
                            <p className="text-slate-400 font-medium">{new Date(ticket.updated_at).toLocaleString('vi-VN')}</p>
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


