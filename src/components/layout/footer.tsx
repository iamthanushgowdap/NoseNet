'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer';

export function Footer() {
  const pathname = usePathname();

  // Hide footer completely on assessor mobile screen
  if (pathname === '/assessor') {
    return null;
  }

  return (
    <HalftoneWordmarkFooter
      wordmark="NoseNet"
      label="NoseNet Model"
      meta="©2026 · APSCE Bangalore • ESP32 & BME688"
      preset="night"
      height="480px"
    />
  );
}

export default Footer;
