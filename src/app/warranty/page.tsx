'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Search, ShieldCheck, Calendar, AlertCircle, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function WarrantyPage() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!phone) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/warranty?query=${phone}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
        if (data.length === 0) setError('Không tìm thấy thông tin bảo hành cho từ khóa này.');
      } else {
        setError(data.error || 'Đã có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Hãy đảm bảo MySQL đang chạy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/10">
      <Header />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6 border border-primary/20"
            >
              <ShieldCheck size={16} />
              Bảo hành điện tử 4.0
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-6">
              Tra cứu <span className="text-primary">Bảo hành</span>
            </h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
              Nhập số điện thoại mua hàng hoặc Số Sê-ri (S/N) thiết bị để kiểm tra thời hạn và lịch sử bảo hành.
            </p>
          </div>
 
          {/* Search Box */}
          <div className="glass-morphism p-4 md:p-8 rounded-[3rem] shadow-2xl mb-16 border border-white relative z-10">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại hoặc Số Sê-ri (S/N) thiết bị..."
                  className="w-full h-16 md:h-20 pl-16 pr-8 rounded-[1.5rem] bg-white border-2 border-slate-50 focus:border-primary transition-all outline-none text-xl font-bold tracking-tight"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={28} />
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="px-12 h-16 md:h-20 bg-primary text-white rounded-[1.5rem] font-black hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/30 disabled:opacity-50 text-lg uppercase tracking-widest"
              >
                {loading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-6 bg-red-50 border border-red-100 text-red-600 rounded-[2rem] mb-12 shadow-sm"
              >
                <AlertCircle size={24} />
                <span className="font-bold">{error}</span>
              </motion.div>
            )}

            {result && result.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between px-6">
                  <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sản phẩm của bạn</h2>
                  <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold">{result.length} Thiết bị</span>
                </div>

                <div className="grid gap-6">
                  {result.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row items-center justify-between group hover:border-primary/30 hover:shadow-2xl transition-all duration-500 cursor-default"
                    >
                      <div className="flex flex-col lg:flex-row items-center gap-10">
                        <div className="w-28 h-28 bg-muted/20 rounded-3xl flex items-center justify-center p-6 relative overflow-hidden group-hover:scale-105 transition-transform">
                          <Image 
                            src={item.product_image || '/laptop.png'} 
                            alt="Product" 
                            fill
                            className="object-contain p-4"
                          />
                        </div>
                        <div className="text-center lg:text-left">
                          <h3 className="font-black text-2xl text-slate-900 leading-tight mb-2">{item.product_name}</h3>
                          <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-md">Serial: {item.serial_number}</span>
                          </div>
                          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Calendar size={16} className="text-primary" />
                              <span className="opacity-60">Kích hoạt:</span> {new Date(item.start_date).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                              <Calendar size={16} className="text-accent" />
                              <span className="opacity-60">Hết hạn:</span> {new Date(item.end_date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 lg:mt-0 flex flex-col items-center lg:items-end gap-3">
                         <div className={cn(
                           "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all",
                           item.status === 'ACTIVE' 
                            ? "bg-green-500 text-white shadow-green-500/30" 
                            : "bg-slate-200 text-slate-500 shadow-none"
                         )}>
                           {item.status === 'ACTIVE' ? 'Đang bảo hành' : 'Đã hết hạn'}
                         </div>
                         {item.status === 'ACTIVE' && (
                           <button className="text-xs font-black text-primary hover:text-accent transition-colors mt-2 underline underline-offset-4 uppercase">
                             Gửi yêu cầu hỗ trợ
                           </button>
                         )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : result && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Chưa có dữ liệu bảo hành</h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


