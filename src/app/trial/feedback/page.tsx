'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowRight, CheckCircle2, AlertTriangle, MessageSquare, CreditCard, Home, Check, Clock } from 'lucide-react';

function FeedbackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [step, setStep] = useState<'decision' | 'pay_method' | 'online_pay' | 'feedback_form' | 'success'>('decision');
  const [decision, setDecision] = useState<'APPROVED_PAID' | 'REJECTED_RETURN' | null>(null);
  const [payMethod, setPayMethod] = useState<'online' | 'cash' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Simulated Card Info
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('Mã đơn hàng không hợp lệ.');
      setLoading(false);
      return;
    }

    fetch(`/api/trial/feedback?order_id=${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Đơn hàng không tồn tại hoặc lỗi hệ thống.');
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
        setLoading(false);
        
        // Nếu đơn hàng đã phản hồi trước đó rồi
        if (data.order.trial_status !== 'TRIALING') {
          setStep('success');
          setDecision(data.order.trial_status);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [orderId]);

  const handleSubmitDecision = async () => {
    if (!decision) return;
    
    setSubmitting(true);
    const tId = toast.loading('Đang gửi phản hồi lên hệ thống...');
    try {
      const res = await fetch('/api/trial/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          decision,
          payment_method: payMethod,
          feedback: feedbackText
        })
      });
      
      if (res.ok) {
        toast.success('Gửi phản hồi thành công!', { id: tId });
        setStep('success');
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Lỗi gửi phản hồi', { id: tId });
      }
    } catch (err) {
      toast.error('Lỗi kết nối mạng.', { id: tId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-black text-xs text-primary uppercase tracking-[0.4em]">Đang kết nối G-Store...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500 mb-6 animate-pulse">
          <AlertTriangle size={36} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">ĐÃ XẢY RA LỖI</h2>
        <p className="text-slate-400 text-sm max-w-md mb-8">{error || 'Không tìm thấy đơn hàng dùng thử hợp lệ.'}</p>
        <a href="/" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
          Về trang chủ G-Store
        </a>
      </div>
    );
  }

  const getRemainingDays = () => {
    if (!order || !order.trial_expired_at) return 'N/A';
    const diff = new Date(order.trial_expired_at).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Đã hết hạn';
    return `${days} ngày`;
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl mx-auto w-full mb-10 flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.5em] block mb-2">G-Store Smart Portal</span>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Xác nhận đơn dùng thử</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 block uppercase">Mã đơn hàng</span>
          <span className="font-mono font-black text-slate-200">#ORD-{order.id}</span>
        </div>
      </header>

      {/* Step Progress HUD */}
      <div className="max-w-4xl mx-auto w-full mb-10">
         <div className="flex items-center justify-between relative">
            {[
              { label: 'Đặt hàng & Cọc 10%', desc: 'Đã hoàn tất', completed: true, active: false },
              { label: 'Trải nghiệm 3 ngày', desc: 'Đã bàn giao', completed: true, active: false },
              { label: 'Gửi quyết định', desc: 'Đang thực hiện', completed: false, active: true },
              { label: 'Kết thúc dùng thử', desc: 'Bảo hành / Hoàn cọc', completed: false, active: false }
            ].map((st, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : (st.active ? 'bg-primary border-primary text-white animate-pulse' : 'bg-white/5 border-white/5 text-slate-500')}`}>
                    {st.completed ? <Check size={16} /> : (idx + 1)}
                 </div>
                 <span className={`mt-3 text-[10px] font-black uppercase tracking-widest text-center ${st.completed ? 'text-emerald-500' : (st.active ? 'text-primary' : 'text-slate-500')}`}>{st.label}</span>
                 <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{st.desc}</span>
              </div>
            ))}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10" />
         </div>
      </div>

      {/* Main Card */}
      <main className="max-w-4xl mx-auto w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 flex-1 shadow-2xl backdrop-blur-xl relative mb-12">
        {step === 'decision' && (
          <div className="space-y-10">
            <div className="text-center max-w-xl mx-auto">
              <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Bạn có hài lòng với thiết bị?</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Xin chào <span className="text-white font-bold">{order.customer_name}</span>. Thời gian dùng thử sản phẩm của bạn đã hết hạn. Hãy xác nhận quyết định mua hoặc trả hàng ở dưới:
              </p>
            </div>

            {/* Trial Alert HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                     <CreditCard size={22} />
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-0.5">Tiền đặt cọc của bạn (10%)</span>
                     <span className="text-base font-black text-white">{Number(order.deposit_amount).toLocaleString('vi-VN')}₫</span>
                     <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded text-[8px] font-black uppercase tracking-widest">
                       {order.deposit_status === 'DEPOSITED' ? 'Đã cọc' : (order.deposit_status === 'PENDING_DEPOSIT' ? 'Chờ cọc' : order.deposit_status)}
                     </span>
                  </div>
               </div>

               <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                     <Clock size={22} className="animate-pulse" />
                  </div>
                  <div>
                     <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">Thời gian dùng thử còn lại</span>
                     <span className="text-base font-black text-white">{getRemainingDays()}</span>
                     <span className="text-[9px] font-bold text-slate-400 block mt-0.5">
                       Hạn cuối: {order.trial_expired_at ? new Date(order.trial_expired_at).toLocaleString('vi-VN') : 'N/A'}
                     </span>
                  </div>
               </div>
            </div>

            {/* Product items review */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider text-left">Danh sách thiết bị bạn đang dùng thử:</h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-6 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <img src={item.thumbnail} alt={item.product_name} className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-bold text-white text-sm truncate">{item.product_name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-primary">{(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Tổng thanh toán (Giá trị máy):</span>
                <span className="text-2xl font-black text-white">{order.total_price.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            {/* Decisions Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => { setDecision('APPROVED_PAID'); setStep('pay_method'); }}
                className="group p-8 bg-primary rounded-3xl text-left hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between min-h-[160px] shadow-lg shadow-primary/20"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-white text-lg">Tôi ưng ý & Mua máy</h3>
                  <p className="text-white/80 text-xs mt-1">Giữ lại thiết bị, tiến hành thanh toán phần còn lại và kích hoạt bảo hành điện tử.</p>
                </div>
              </button>

              <button 
                onClick={() => { setDecision('REJECTED_RETURN'); setStep('feedback_form'); }}
                className="group p-8 bg-white/5 border border-white/5 rounded-3xl text-left hover:bg-white/10 hover:border-white/10 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between min-h-[160px]"
              >
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-slate-400 group-hover:text-white mb-4">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-wider text-white text-lg">Tôi muốn trả hàng</h3>
                  <p className="text-slate-400 text-xs mt-1">Sản phẩm chưa phù hợp nhu cầu. Gửi góp ý và hoàn lại 100% tiền đặt cọc.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP: Payment Method */}
        {step === 'pay_method' && (
          <div className="space-y-8 text-left max-w-xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight text-center">Chọn hình thức thanh toán</h2>
            <p className="text-slate-400 text-xs text-center">Vui lòng lựa chọn phương thức thanh toán thuận tiện nhất với quý khách:</p>
            
            <div className="space-y-4 pt-4">
              <button 
                onClick={() => { setPayMethod('online'); setStep('online_pay'); }}
                className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-6 hover:bg-white/10 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Thanh toán trực tuyến (Simulated)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Thanh toán tức thì bằng thẻ ngân hàng hoặc thẻ tín dụng quốc tế.</p>
                </div>
              </button>

              <button 
                onClick={() => { setPayMethod('cash'); }}
                className={`w-full p-6 border rounded-2xl flex items-center gap-6 transition-all text-left ${payMethod === 'cash' ? 'bg-primary/5 border-primary' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Home size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Thanh toán tiền mặt tại nhà</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Nhân viên G-Store sẽ đến thu tiền mặt tại địa chỉ của bạn.</p>
                </div>
              </button>
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                onClick={() => setStep('decision')}
                className="w-1/2 h-14 bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Quay lại
              </button>
              <button 
                onClick={handleSubmitDecision}
                disabled={payMethod !== 'cash' || submitting}
                className="w-1/2 h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl disabled:opacity-40 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}

        {/* STEP: Online simulated checkout */}
        {step === 'online_pay' && (
          <div className="space-y-6 text-left max-w-md mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight text-center">Cổng thanh toán G-Pay</h2>
            
            <div className="bg-gradient-to-r from-indigo-600 to-primary p-6 rounded-2xl text-white space-y-8 relative overflow-hidden shadow-xl mb-4">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <CreditCard size={120} />
              </div>
              <div className="flex justify-between items-start">
                <span className="font-black italic tracking-widest text-lg">G-CARD</span>
                <span className="text-[9px] font-mono opacity-85">Nạp tiền Demo</span>
              </div>
              <div>
                <span className="font-mono text-xl tracking-[0.2em]">{cardNumber || '•••• •••• •••• ••••'}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] uppercase block opacity-60">Chủ thẻ</span>
                  <span className="font-bold uppercase tracking-wider text-xs">{cardName || 'NGUYỄN VĂN A'}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase block opacity-60">Hạn dùng</span>
                  <span className="font-bold text-xs">{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Số thẻ</label>
                <input 
                  type="text" 
                  placeholder="4123 4567 8901 2345"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Ngày hết hạn</label>
                  <input 
                    type="text" 
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-500 ml-2">CVV</label>
                  <input 
                    type="password" 
                    placeholder="***"
                    maxLength={3}
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-500 ml-2">Tên chủ thẻ (Không dấu)</label>
                <input 
                  type="text" 
                  placeholder="NGUYEN VAN A"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setStep('pay_method')}
                className="w-1/3 h-14 bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Trở lại
              </button>
              <button 
                onClick={handleSubmitDecision}
                disabled={submitting || !cardNumber || !cardName}
                className="w-2/3 h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Thanh toán {(order.total_price).toLocaleString('vi-VN')}đ
              </button>
            </div>
          </div>
        )}

        {/* STEP: Return Feedback Form */}
        {step === 'feedback_form' && (
          <div className="space-y-6 text-left max-w-xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tight text-center">Góp ý trả hàng dùng thử</h2>
            <p className="text-slate-400 text-xs text-center">G-Store vô cùng tiếc nuối khi chưa làm bạn ưng ý. Xin hãy để lại góp ý về sản phẩm để chúng tôi nâng cấp chất lượng phục vụ:</p>

            <div className="space-y-3 pt-4">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Lý do không ưng ý sản phẩm</label>
              <textarea 
                rows={4}
                required
                placeholder="Ví dụ: Laptop hơi nặng, dung lượng pin chưa đạt kỳ vọng của tôi, hoặc bàn phím gõ không thoải mái..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button 
                onClick={() => setStep('decision')}
                className="w-1/2 h-14 bg-white/5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmitDecision}
                disabled={!feedbackText || submitting}
                className="w-1/2 h-14 bg-red-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 disabled:opacity-40 transition-all"
              >
                Gửi yêu cầu trả hàng
              </button>
            </div>
          </div>
        )}

        {/* STEP: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-12 space-y-6 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} />
            </div>

            {decision === 'APPROVED_PAID' ? (
              <>
                <h2 className="text-4xl font-black uppercase tracking-tight">CẢM ƠN BẠN ĐÃ MUA HÀNG</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Đơn hàng dùng thử của bạn đã chuyển trạng thái thành **ĐÃ MUA**. Bảo hành điện tử 24 tháng cho thiết bị đã được kích hoạt tự động.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
                  Bạn có thể dùng số điện thoại <span className="text-white font-black">{order.customer_phone}</span> để tra cứu bảo hành bất kỳ lúc nào.
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black uppercase tracking-tight">ĐÃ GHI NHẬN TRẢ HÀNG</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Chúng tôi đã tiếp nhận yêu cầu trả sản phẩm dùng thử của bạn. Nhân viên giao nhận của G-Store sẽ liên hệ sớm nhất để đến tận nhà thu hồi máy về kho.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">
                  Ý kiến góp ý của bạn: <span className="italic text-slate-300">"{feedbackText || 'Không có góp ý'}"</span>. Cảm ơn bạn rất nhiều!
                </div>
              </>
            )}

            <div className="pt-8">
              <a href="/" className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all">
                Trang chủ G-Store
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full mt-12 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        © {new Date().getFullYear()} G-Store Electronics. Bảo lưu mọi quyền.
      </footer>
    </div>
  );
}

export default function TrialFeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-black text-xs text-primary uppercase tracking-[0.4em]">Đang tải...</span>
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}
