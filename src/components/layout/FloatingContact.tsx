'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function FloatingContact() {
  const pathname = usePathname();

  // Khai báo ẩn Floating Contact khi ở trong khu vực Admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 select-none">
        {/* Phone Button */}
        <a
          href="tel:0986046133"
          title="Gọi điện trực tiếp"
          className="contact-btn relative flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 group"
        >
          {/* Wave pulse animation effect */}
          <span className="absolute inset-0 rounded-full bg-blue-600 opacity-75 animate-ping-slow pointer-events-none"></span>
          
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:rotate-12">
            <path d="M4.978 2.22a.75.75 0 0 1 1.06-.025l2.357 2.357a.75.75 0 0 1-.02 1.077L6.84 7.16a10.72 10.72 0 0 0 5.42 5.42l1.533-1.534a.75.75 0 0 1 1.077-.02l2.358 2.358a.75.75 0 0 1-.025 1.06l-2.15 2.15a3 3 0 0 1-3.21.642 16.738 16.738 0 0 1-7.23-7.23 3 3 0 0 1 .642-3.21l2.15-2.15Z" />
          </svg>
        </a>

        {/* Zalo Button */}
        <a
          href="https://zalo.me/0986046133"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat qua Zalo"
          className="contact-btn relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0068FF] text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
        >
          <span className="absolute inset-0 rounded-full bg-[#0068FF] opacity-50 animate-ping-slow delay-75 pointer-events-none"></span>
          
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10">
            <circle cx="20" cy="20" r="20" fill="#0068FF" className="opacity-0" />
            <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="950" fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" letterSpacing="-0.2px">Zalo</text>
          </svg>
        </a>

        {/* Messenger Button */}
        <a
          href="https://www.facebook.com/nguyenhoangluc.user"
          target="_blank"
          rel="noopener noreferrer"
          title="Chat qua Messenger"
          className="contact-btn relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0084FF] text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 group"
        >
          <span className="absolute inset-0 rounded-full bg-[#0084FF] opacity-50 animate-ping-slow delay-150 pointer-events-none"></span>

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:scale-110">
            <path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.91 1.45 5.51 3.73 7.17.14.1.23.26.23.44l.02 2.25c.01.55.53.94 1.05.77l2.5-1.07c.15-.06.31-.07.46-.02 1.03.35 2.14.54 3.3.54 5.52 0 10-4.14 10-9.25S17.52 2 12 2Zm1.18 11.59-2.22-2.37-4.32 2.37 4.75-5.06 2.26 2.37 4.28-2.37-4.75 5.06Z" />
          </svg>
        </a>
      </div>

      <style jsx global>{`
        @keyframes pingSlow {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          70% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  );
}
