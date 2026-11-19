'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer';

export function Footer() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Hide footer completely on assessor mobile screen
  if (pathname === '/assessor') {
    return null;
  }

  return (
    <HalftoneWordmarkFooter
      wordmark="NOSENET"
      label="NoseNet Model"
      meta="©2026 · APSCE Bangalore • ESP32 & BME688"
      preset={theme === 'dark' ? 'night' : 'paper'}
      palette={
        theme === 'light'
          ? { background: '#ffffff', ink: '#18181b', warm: '#d97706' }
          : { background: '#0a0a0a', ink: '#e9e4da', warm: '#e9762b' }
      }
      height="clamp(320px, 42vh, 460px)"
    />
  );
}

export default Footer;
