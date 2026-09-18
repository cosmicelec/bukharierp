'use client';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calculator,
  FileCheck,
  Warehouse,
  Receipt,
  FileText,
  Settings,
  Package,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { clearSession, getCurrentUserSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

const navItems = [
  {
    group: 'MAIN',
    adminOnly: false,
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    group: 'BIDDING ENGINE',
    adminOnly: true,
    items: [
      { name: 'Tender Calculator', href: '/tender-calculator', icon: Calculator },
      { name: 'Active Contracts', href: '/contracts', icon: FileCheck },
    ],
  },
  {
    group: 'INVENTORY',
    adminOnly: false,
    items: [
      { name: 'Warehouse Map', href: '/inventory', icon: Warehouse },
    ],
  },
  {
    group: 'BILLING',
    adminOnly: false,
    items: [
      { name: 'New Invoice', href: '/billing', icon: Receipt },
      { name: 'Invoice History', href: '/invoices', icon: FileText },
    ],
  },
  {
    group: 'ADMINISTRATION',
    adminOnly: true,
    items: [
      { name: 'Admin Panel', href: '/admin', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Use state to prevent hydration mismatch between server and client
  const [user, setUser] = useState({ username: 'admin', role: 'Admin' });

  useEffect(() => {
    const session = getCurrentUserSession();
    if (session) {
      setUser(session as any);
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
    router.refresh();
  };

  const filteredNavItems = navItems.filter(group => {
    if (group.adminOnly && user.role !== 'Admin') return false;
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
        <Package className="h-8 w-8 text-blue-400" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">BUKHARI ERP</h1>
          <p className="text-xs text-gray-400">Stationery & Tenders</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {filteredNavItems.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.group}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Operator Session & Logout Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {user.role === 'Admin' ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-200 truncate">{user.username}</p>
              <p className="text-[10px] text-blue-400 font-mono font-medium">{user.role} Operator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Lock Vault & Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
