'use client';

import React from 'react';
import Image from 'next/image';

export const HeroBanners = () => {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      <div className="relative rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5">
        <Image 
          src="/banners/hero-side.png" 
          alt="Side Banner 1" 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer border border-white/5">
          <Image 
            src="/banners/hero-side.png" 
            alt="Side Banner 2" 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer bg-slate-900 flex flex-col items-center justify-center p-4 text-center border border-white/5 shadow-xl">
            <span className="text-[#E02027] font-black text-xl italic uppercase">BUILD PC</span>
            <span className="text-white text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">Nhận ngay ưu đãi khủng</span>
        </div>
      </div>
      {/* Small banners below */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-[#E02027] rounded-full flex items-center justify-center text-white">
                <span className="font-black italic">!</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">Trả góp</span>
                <span className="text-xs font-bold text-slate-800">Lãi suất 0%</span>
            </div>
         </div>
         <div className="bg-slate-100 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <span className="font-black italic">?</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">Tư vấn</span>
                <span className="text-xs font-bold text-slate-800">Hotline: 0986046133</span>
            </div>
         </div>
      </div>
    </div>
  );
};
