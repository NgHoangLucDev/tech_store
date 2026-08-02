'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Play, Camera, MessageCircle, Send, Cpu } from 'lucide-react';
import { useSettingsStore, translations } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export const Footer = () => {
  const { language, theme } = useSettingsStore();
  const t = translations[language];

  return (
    <footer className={cn(
      "border-t pt-20 pb-10 transition-colors duration-500",
      theme === 'dark' ? "bg-slate-950/50 backdrop-blur-3xl border-white/5" : "bg-slate-50 border-slate-200"
    )}>
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* About */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 group-hover:scale-105 transition-transform duration-300" style={{ transitionTimingFunction: 'var(--ease-spring)' }}>
                <Cpu size={28} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className={cn("text-2xl font-black tracking-tighter uppercase italic leading-none transition-colors", theme === 'dark' ? "text-white" : "text-slate-900")}>
                  {t.brand}
                </span>
                <span className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">
                  {t.tagline}
                </span>
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              Chuyên cung cấp thiết bị công nghệ chính hãng — laptop, màn hình, linh kiện và phụ kiện cao cấp với dịch vụ bảo hành tận tâm.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={<MessageCircle size={18} />} href="https://zalo.me" label="Zalo" theme={theme} />
              <SocialIcon icon={<Play size={18} />} href="https://youtube.com" label="YouTube" theme={theme} />
              <SocialIcon icon={<Camera size={18} />} href="https://instagram.com" label="Instagram" theme={theme} />
              <SocialIcon icon={<Send size={18} />} href="https://t.me" label="Telegram" theme={theme} />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Liên hệ</h3>
            <ul className="space-y-4">
              <ContactItem icon={<Phone size={16} />} text="+84 986 046 133" theme={theme} href="tel:+84986046133" />
              <ContactItem icon={<Mail size={16} />} text="hoanglucmedia@gmail.com" theme={theme} href="mailto:hoanglucmedia@gmail.com" />
              <ContactItem icon={<MapPin size={16} />} text="154/7 Cống Lở, P. Tân Sơn, TP.HCM" theme={theme} />
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-8">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Chính sách</h3>
            <ul className="space-y-4">
              <FooterLink href="/chinh-sach-mua-hang" text="Chính sách mua hàng" theme={theme} />
              <FooterLink href="/van-chuyen" text="Vận chuyển & giao hàng" theme={theme} />
              <FooterLink href="/warranty" text="Bảo hành sản phẩm" theme={theme} />
              <FooterLink href="/doi-tra" text="Đổi trả & hoàn tiền" theme={theme} />
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-8">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-500">Hỗ trợ</h3>
            <ul className="space-y-4">
              <FooterLink href="/about" text="Về chúng tôi" theme={theme} />
              <FooterLink href="/showrooms" text="Hệ thống cửa hàng" theme={theme} />
              <FooterLink href="/blog" text="Tin tức & đánh giá" theme={theme} />
              <FooterLink href="/lien-he" text="Liên hệ tư vấn" theme={theme} />
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={cn(
          "pt-10 border-t flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500",
          theme === 'dark' ? "border-white/5" : "border-slate-200"
        )}>
          <div className="flex items-center gap-4 text-slate-500 text-[10px] font-medium">
            <span>© {new Date().getFullYear()} {t.brand}. Bảo lưu mọi quyền.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/chinh-sach-bao-mat"
              className={cn("text-[10px] font-medium transition-colors", theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700")}
            >
              Chính sách bảo mật
            </Link>
            <div className="w-1 h-1 bg-slate-400 rounded-full" />
            <Link
              href="/dieu-khoan"
              className={cn("text-[10px] font-medium transition-colors", theme === 'dark' ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700")}
            >
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon, href, label, theme }: { icon: React.ReactNode; href: string; label: string; theme: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-[0.94]",
      theme === 'dark' ? "text-slate-400 hover:text-primary hover:bg-primary/10 border-white/5" : "text-slate-600 hover:text-primary hover:bg-primary/5 border-slate-200"
    )}
    style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '200ms' }}
  >
    {icon}
  </a>
);

const ContactItem = ({ icon, text, theme, href }: { icon: React.ReactNode; text: string; theme: string; href?: string }) => {
  const content = (
    <li className={cn(
      "flex items-center gap-4 transition-colors group",
      theme === 'dark' ? "text-slate-500 hover:text-white" : "text-slate-600 hover:text-slate-900",
      href ? "cursor-pointer" : ""
    )}>
      <div className="text-slate-400 group-hover:text-primary transition-colors shrink-0">{icon}</div>
      <span className="text-xs font-medium">{text}</span>
    </li>
  );
  return href ? <a href={href}>{content}</a> : content;
};

const FooterLink = ({ text, theme, href }: { text: string; theme: string; href: string }) => (
  <li>
    <Link href={href} className={cn(
      "text-xs font-medium transition-all inline-block hover:translate-x-0.5",
      theme === 'dark' ? "text-slate-500 hover:text-primary" : "text-slate-600 hover:text-primary"
    )}
    style={{ transitionTimingFunction: 'var(--ease-smooth)', transitionDuration: '150ms' }}
    >
      {text}
    </Link>
  </li>
);


