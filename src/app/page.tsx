import { getDashboardStats } from '@/lib/actions/admin-actions';
import { StatCard } from '@/components/stat-card';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Users,
  FileCheck,
  AlertTriangle,
  DollarSign,
  Send,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Accounts Receivable Dashboard</h1>
        <p className="text-gray-500 mt-1">Order Chits & Outstanding Dues Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.productCount}
          icon={Package}
          iconColor="text-blue-600 bg-blue-100"
        />
        <StatCard
          title="Active Clients"
          value={stats.clientCount}
          icon={Users}
          iconColor="text-green-600 bg-green-100"
        />
        <StatCard
          title="Order Chits Scanned"
          value={stats.chitCount}
          icon={FileCheck}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatCard
          title="Total Unpaid Dues"
          value={formatCurrency(stats.totalOutstanding)}
          icon={DollarSign}
          iconColor="text-rose-600 bg-rose-100"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-rose-50/50">
          <h3 className="text-lg font-bold text-rose-900">Aging Report: Unpaid Chits</h3>
          <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">
            {stats.unpaidChits.length} Pending
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Client / Office</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Chit #</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Due Date</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Total Amount</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Balance Owed</th>
                <th className="text-center px-6 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.unpaidChits.map((chit: any) => {
                const balance = chit.totalAmount - chit.paidAmount;
                const isOverdue = chit.dueDate && new Date(chit.dueDate) < new Date();
                
                const whatsappMessage = encodeURIComponent(
                  `*Payment Reminder*\n\nDear ${chit.client.contactPerson || chit.client.department || 'Sir/Madam'},\n\nThis is a gentle reminder regarding Chit #${chit.chitNumber} for ${chit.client.name}. The outstanding balance is Rs ${balance.toLocaleString()}.\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\nBukhari Stationery`
                );
                
                return (
                  <tr key={chit.id} className="hover:bg-rose-50/30 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{chit.client.name}</p>
                      <p className="text-xs text-gray-500">{chit.client.department}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">{chit.chitNumber}</td>
                    <td className="px-6 py-4">
                      {chit.dueDate ? (
                        <span className={isOverdue ? "text-rose-600 font-bold" : "text-gray-600"}>
                          {new Date(chit.dueDate).toLocaleDateString()}
                          {isOverdue && " (Overdue)"}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      Rs {chit.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-600">
                      Rs {balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link 
                        href={`https://wa.me/${chit.client.phone?.replace(/[^0-9]/g, '') || ''}?text=${whatsappMessage}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition border border-green-200"
                      >
                        <Send className="h-3 w-3" />
                        Send Alert
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {stats.unpaidChits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No unpaid chits! All accounts are settled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}