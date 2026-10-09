'use client';

import { useEffect } from 'react';

export function AdminPwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[Admin PWA] Error registrando Service Worker:', err);
      });
    }
  }, []);

  return null;
}
