import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { ThemeProvider } from '@/context/theme-context';
import { Navbar } from '@/components/layout/navbar';
import { RoleBanner } from '@/components/layout/role-banner';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'NoseNet — IoT Cake Freshness and Adulteration Assessment',
  description:
    'Local-first scientific dashboard and mobile sensory assessment terminal for IoT electronic nose cake testing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
        <ThemeProvider>
          <AppProvider>
            <RoleBanner />
            <Suspense fallback={<div className="h-16 border-b border-slate-800 bg-slate-950" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
