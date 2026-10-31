import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AppProvider } from '@/context/app-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NoseNet — IoT Cake Freshness and Adulteration Testing System',
  description:
    'IoT-based cake freshness and adulteration detection device with ESP32 & SmartElex BME688.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NoseNet',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark bg-black ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-black text-white flex flex-col min-h-screen selection:bg-neutral-800 selection:text-white antialiased font-sans">
        <AppProvider>
          <Suspense fallback={<div className="h-16 border-b border-neutral-800 bg-black" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col bg-black text-white w-full">{children}</main>
          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
