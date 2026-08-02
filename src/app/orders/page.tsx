'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Tự động chuyển hướng sang trang Profile với tab đơn hàng
    router.replace('/profile?tab=orders');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
