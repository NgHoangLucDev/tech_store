'use client';

import { motion } from 'framer-motion';

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for premium feel
        staggerChildren: 0.1
      }}
      className="p-20"
    >
      {children}
    </motion.div>
  );
}
