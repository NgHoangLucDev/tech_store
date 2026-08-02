'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { 
  ArrowLeft, Eye, EyeOff, X, 
  Smartphone, User, Lock, Mail, 
  ChevronRight, MessageSquare, Globe, ShieldCheck,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const { login } = useAuthStore();
  const { theme } = useSettingsStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const provider = sessionStorage.getItem('oauth_provider');

      if (!accessToken || !provider) return;

      // Xóa hash và session provider để tránh kích hoạt lặp lại
      window.location.hash = '';
      sessionStorage.removeItem('oauth_provider');

      const tId = toast.loading('Đang đăng nhập bằng ' + (provider === 'google' ? 'Google' : 'Facebook') + '...');

      try {
        let userEmail = '';
        let userName = '';

        if (provider === 'google') {
          const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
          if (!res.ok) throw new Error('Không thể lấy thông tin người dùng từ Google');
          const googleUser = await res.json();
          userEmail = googleUser.email;
          userName = googleUser.name;
        } else if (provider === 'facebook') {
          const res = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
          if (!res.ok) throw new Error('Không thể lấy thông tin người dùng từ Facebook');
          const facebookUser = await res.json();
          userEmail = facebookUser.email;
          userName = facebookUser.name;
        }

        if (!userEmail) {
          throw new Error('Dịch vụ liên kết không trả về địa chỉ Email');
        }

        // Gọi API xử lý đăng nhập/đăng ký tự động
        const res = await fetch('/api/auth/oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail, name: userName, provider })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Đăng nhập liên kết thất bại');
        }

        const loggedInUser = await res.json();
        login(loggedInUser);
        toast.success(`Chào mừng trở lại, ${loggedInUser.name}!`, { id: tId });
        router.push(loggedInUser.role === 'ADMIN' || loggedInUser.role === 'STAFF' ? '/admin/dashboard' : '/');
      } catch (err: any) {
        toast.error(err.message || 'Lỗi đăng nhập liên kết', { id: tId });
      }
    };

    handleOAuthCallback();
  }, [login, router]);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'your-google-client-id.apps.googleusercontent.com') {
      return toast.error('Vui lòng cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong file .env');
    }
    sessionStorage.setItem('oauth_provider', 'google');
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    const scope = encodeURIComponent('email profile openid');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
  };

  const handleFacebookLogin = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId || appId === 'your-facebook-app-id') {
      return toast.error('Vui lòng cấu hình NEXT_PUBLIC_FACEBOOK_APP_ID trong file .env');
    }
    sessionStorage.setItem('oauth_provider', 'facebook');
    const redirectUri = encodeURIComponent(window.location.origin + '/login');
    window.location.href = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&response_type=token&scope=email,public_profile`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      return toast.error('Vui lòng nhập Email hợp lệ để nhận OTP');
    }
    setIsSendingOtp(true);
    const t = toast.loading('Đang gửi mã OTP...');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        toast.success('Mã OTP đã được gửi đến Email của bạn!', { id: t });
        setShowOtp(true);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Không thể gửi OTP', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối', { id: t });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('Đang xác thực...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          loginId: formData.phone || formData.email, 
          password: formData.password 
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        toast.success(`Chào mừng trở lại, ${data.name}!`, { id: t });
        router.push((data.role === 'ADMIN' || data.role === 'STAFF') ? '/admin/dashboard' : '/');
      } else {
        toast.error(data.error || 'Sai thông tin đăng nhập', { id: t });
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ', { id: t });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return toast.error('Bạn phải đồng ý với điều khoản dịch vụ');
    
    // Nếu dùng email mà chưa hiện chỗ nhập OTP thì yêu cầu OTP trước
    if (formData.email && !showOtp) {
       return handleSendOtp();
    }

    const t = toast.loading('Đang tạo tài khoản...');
    const fullName = `${formData.lastName} ${formData.firstName}`.trim();
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: fullName, 
          phone: formData.phone, 
          email: formData.email,
          password: formData.password,
          otp: formData.otp
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Đăng ký thành công! Hãy đăng nhập.', { id: t });
        setMode('login');
        setShowOtp(false);
      } else {
        toast.error(data.error, { id: t });
        if (data.error.includes('OTP')) setShowOtp(true);
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ', { id: t });
    }
  };

  if (!mounted) return null;

  return (
    <div className={cn(
      "min-h-screen relative flex items-center justify-center p-6 selection:bg-primary selection:text-white overflow-hidden",
      theme === 'dark' ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <Image src="/tech-bg.png" alt="BG" fill className="object-cover opacity-20" />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-700",
          theme === 'dark' ? "from-slate-950 via-slate-900/40 to-slate-950" : "from-white via-slate-100/40 to-white"
        )} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn(
          "relative z-10 w-full max-w-[500px] backdrop-blur-2xl rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-500",
          theme === 'dark' ? "bg-slate-900/40 border-white/10" : "bg-white border-slate-200"
        )}
      >
        {/* Header Strip */}
        <div className={cn(
          "px-10 py-8 border-b flex items-center justify-between transition-all duration-500",
          theme === 'dark' ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50/50"
        )}>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
             <h2 className="font-black text-xs uppercase tracking-[0.3em]">
                {mode === 'login' ? 'Authentication Protocol' : 'Registration Sequence'}
             </h2>
          </div>
          <button onClick={() => router.push('/')} className="p-2 rounded-xl hover:bg-white/10 transition-all">
             <X size={18} />
          </button>
        </div>

        <div className="p-10">
          <div className="mb-10">
            <h3 className="text-3xl font-black tracking-tighter mb-2 uppercase">
              {mode === 'login' ? 'VÀO HỆ THỐNG' : 'ĐĂNG KÝ TÀI KHOẢN'}
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-primary font-black text-[10px] uppercase tracking-widest">TECH STORE</span>
               <div className="w-8 h-px bg-slate-700" />
            </div>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-5">
            <div className="flex justify-end mb-1">
               <button 
                 type="button" 
                 onClick={() => {
                   if (mode === 'login') setMode('register');
                   // Logics for email registration toggle can go here
                 }}
                 className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline italic transition-all"
               >
                  {mode === 'register' ? 'Đăng ký bằng SĐT' : 'Quên mật khẩu?'}
               </button>
            </div>

            <div className="space-y-4">
              {/* Phone/Email Input */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  {mode === 'login' ? <Smartphone size={18} /> : <Mail size={18} />}
                </div>
                <input 
                  required
                  name={mode === 'login' ? "phone" : "email"}
                  value={mode === 'login' ? formData.phone : formData.email}
                  onChange={handleChange}
                  placeholder={mode === 'login' ? "Số điện thoại / Email" : "Địa chỉ Email"}
                  className={cn(
                    "w-full h-14 pl-14 pr-6 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                    theme === 'dark' 
                      ? "bg-white/5 border-white/5 focus:border-primary text-white" 
                      : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                  )}
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <input 
                        required
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Họ"
                        className={cn(
                          "w-full h-14 px-6 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                          theme === 'dark' 
                            ? "bg-white/5 border-white/5 focus:border-primary text-white" 
                            : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                        )}
                      />
                    </div>
                    <div className="relative group">
                      <input 
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Tên"
                        className={cn(
                          "w-full h-14 px-6 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                          theme === 'dark' 
                            ? "bg-white/5 border-white/5 focus:border-primary text-white" 
                            : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                        )}
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                      <Smartphone size={18} />
                    </div>
                    <input 
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Số điện thoại"
                      className={cn(
                        "w-full h-14 pl-14 pr-6 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                        theme === 'dark' 
                          ? "bg-white/5 border-white/5 focus:border-primary text-white" 
                          : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                      )}
                    />
                  </div>
                </>
              )}

              {/* Password Input */}
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mật khẩu"
                  className={cn(
                    "w-full h-14 pl-14 pr-14 rounded-2xl border-2 outline-none font-bold text-sm transition-all",
                    theme === 'dark' 
                      ? "bg-white/5 border-white/5 focus:border-primary text-white" 
                      : "bg-slate-50 border-transparent focus:border-primary text-slate-900"
                  )}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* OTP Field - ONLY FOR REGISTER & IF EMAIL EXISTS */}
              <AnimatePresence>
                {showOtp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                     <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Verification Required</span>
                        <button type="button" onClick={() => setShowOtp(false)} className="text-[10px] text-slate-500 hover:text-white transition-all uppercase font-bold">Quay lại</button>
                     </div>
                     <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
                          <ShieldCheck size={18} />
                        </div>
                        <input 
                          required
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          placeholder="Mã OTP từ Email"
                          className={cn(
                            "w-full h-14 pl-14 pr-32 rounded-2xl border-2 outline-none font-black text-sm tracking-[0.5em] transition-all",
                            theme === 'dark' 
                              ? "bg-primary/10 border-primary/30 text-white" 
                              : "bg-blue-50 border-primary/20 text-slate-900"
                          )}
                        />
                        <button 
                          type="button"
                          disabled={isSendingOtp}
                          onClick={handleSendOtp}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all"
                        >
                           {isSendingOtp ? '...' : 'Gửi lại'}
                        </button>
                     </div>
                     <p className="text-[10px] text-slate-500 font-bold ml-2 uppercase tracking-widest">Hệ thống đã gửi mã 6 số đến email của bạn</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms Checkbox */}
              {mode === 'register' && (
                <div className="flex items-start gap-3 px-2 pt-2">
                   <div 
                     onClick={() => setAgreed(!agreed)}
                     className={cn(
                       "w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all",
                       agreed 
                         ? "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                         : (theme === 'dark' ? "border-white/20 bg-white/5" : "border-slate-300 bg-white")
                     )}
                   >
                      {agreed && <ShieldCheck size={12} className="text-white" />}
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Tôi đã đọc và đồng ý với các <span className="text-primary font-black cursor-pointer hover:underline">Điều khoản dịch vụ</span> & <span className="text-primary font-black cursor-pointer hover:underline">Chính sách bảo mật</span> của Tech Store.
                   </p>
                </div>
              )}
            </div>

            <button 
              type="submit"
              className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-red-600/20 transition-all active:scale-95"
            >
              {mode === 'login' ? 'VÀO HỆ THỐNG' : (showOtp ? 'XÁC NHẬN & TẠO TK' : 'TẠO TÀI KHOẢN')}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className={cn(
                  "px-4 font-black uppercase tracking-widest transition-all duration-500",
                  theme === 'dark' ? "bg-slate-900 text-slate-500" : "bg-white text-slate-400"
                )}>hoặc {mode === 'login' ? 'đăng nhập' : 'đăng ký'} bằng</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                 type="button" 
                 onClick={handleGoogleLogin}
                 className="h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-700/30 font-bold text-sm hover:bg-white/5 transition-all"
               >
                  <Globe size={18} className="text-red-500" />
                  Google
               </button>
               <button 
                 type="button" 
                 onClick={handleFacebookLogin}
                 className="h-14 flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-700/30 font-bold text-sm hover:bg-white/5 transition-all"
               >
                  <MessageSquare size={18} className="text-blue-500" />
                  Facebook
               </button>
            </div>

            <div className="text-center pt-8">
               <p className="text-xs text-slate-500 font-medium">
                  {mode === 'login' ? 'Bạn chưa có tài khoản?' : 'Bạn đã có tài khoản?'} {' '}
                  <button 
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setShowOtp(false);
                    }}
                    className="text-primary font-black uppercase tracking-widest hover:underline"
                  >
                    {mode === 'login' ? 'Đăng ký ngay!' : 'Đăng nhập!'}
                  </button>
               </p>
            </div>
          </form>
        </div>

        {/* Footer HUD */}
        <div className={cn(
          "px-10 py-6 bg-white/5 flex items-center justify-between",
          theme === 'dark' ? "text-slate-500" : "text-slate-400"
        )}>
           <span className="text-[9px] font-bold uppercase tracking-widest italic">Connection: Secure (AES-256)</span>
           <div className="flex gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
           </div>
        </div>
      </motion.div>
    </div>
  );
}
