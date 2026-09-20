'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { BukhariAgentSidebar } from '@/components/bukhari-agent-sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-64 min-h-screen print:ml-0">
        <div className="p-6 lg:p-8 print:p-0">{children}</div>
      </main>
      <BukhariAgentSidebar />
    </>
  );
}
