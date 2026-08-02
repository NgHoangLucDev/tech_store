'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SidebarAds = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Left Ad */}
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed left-4 top-[20%] z-40 hidden 2xl:block w-[120px] group"
          >
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50"
            >
              <X size={12} />
            </button>
            <div className="relative aspect-[1/5] rounded-xl overflow-hidden shadow-2xl border-4 border-white">
              <Image src="/banners/sidebar-ad.png" alt="Left Ad" fill className="object-cover" />
            </div>
          </motion.div>

          {/* Right Ad */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-4 top-[20%] z-40 hidden 2xl:block w-[120px] group"
          >
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -left-2 bg-slate-800 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50"
            >
              <X size={12} />
            </button>
            <div className="relative aspect-[1/5] rounded-xl overflow-hidden shadow-2xl border-4 border-white">
              <Image src="/banners/sidebar-ad.png" alt="Right Ad" fill className="object-cover" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
