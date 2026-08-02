'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = function(...args: any[]) {
    // Check if it is a hydration error
    const isHydrationError = args.some(arg => {
      if (!arg) return false;
      const str = typeof arg === 'string' ? arg : (arg.message || arg.stack || '').toString();
      const lower = str.toLowerCase();
      return lower.includes('hydration') || 
             lower.includes('hydrat') || 
             lower.includes('mismatch') || 
             lower.includes('did not match') || 
             lower.includes("didn't match") ||
             lower.includes('server rendered html') ||
             lower.includes('server-rendered html');
    });

    if (isHydrationError) {
      // Check if it's caused by browser extension attributes
      const hasExtensionAttribute = args.some(arg => {
        if (!arg) return false;
        const str = typeof arg === 'string' ? arg : (arg.message || arg.stack || '').toString();
        const lower = str.toLowerCase();
        return lower.includes('bis_skin_checked') ||
               lower.includes('bis-skin-checked') ||
               lower.includes('cz-shortcut-listen') ||
               lower.includes('fdprocessedid') ||
               lower.includes('data-new-gr-c-s-check-loaded') ||
               lower.includes('data-gr-ext-installed') ||
               lower.includes('googtrans') ||
               lower.includes('grammarly') ||
               lower.includes('darkreader');
      });
      if (hasExtensionAttribute) {
        // Suppress this specific hydration error caused by browser extensions
        return;
      }
    }
    originalError.apply(console, args);
  };
}

export default function ClientPatch() {
  useEffect(() => {
    // Manually trigger rehydration on client mount to match server state during hydration
    useSettingsStore.persist.rehydrate();
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
