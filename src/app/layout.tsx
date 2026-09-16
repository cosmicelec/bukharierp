import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';
import { JarvisMic } from '@/components/jarvis-mic'; // <-- 1. Import Jarvis here

export const metadata: Metadata = {
  title: 'Bukhari Stationery ERP - Tender & Inventory Management',
  description: 'Comprehensive Stationery Tender & Inventory Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <AppShell>{children}</AppShell>
        
        {/* 2. Mount Jarvis globally so it appears on every screen */}
        <JarvisMic />
      </body>
    </html>
  );
}
