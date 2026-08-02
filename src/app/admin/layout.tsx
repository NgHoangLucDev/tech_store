'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/features/admin/AdminSidebar';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF'))) {
      router.push('/login');
    }
  }, [isMounted, user, router]);

  if (!isMounted) return null;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-x-hidden">
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-0 lg:ml-72 min-h-screen h-screen overflow-y-auto pt-16 lg:pt-8 pb-20 lg:pb-10 px-3 sm:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
