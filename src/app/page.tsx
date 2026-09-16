import { getDashboardStats } from '@/lib/actions/admin-actions';
import { StatCard } from '@/components/stat-card';
import { CdrTrackerWidget } from '@/components/cdr-tracker-widget';
import { formatCurrency } from '@/lib/utils';
import {
  Package,
  Users,
  FileCheck,
  Receipt,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Stationery Tender & Inventory Management Overview</p>
      </div>

      {/* KPI Grid */}
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
          title="Active Contracts"
          value={stats.contractCount}
          icon={FileCheck}
          iconColor="text-purple-600 bg-purple-100"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          iconColor="text-emerald-600 bg-emerald-100"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <p className="text-4xl font-bold text-amber-600">{stats.lowStockCount}</p>
          <p className="text-sm text-gray-500 mt-1">Items below minimum threshold</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-orange-100">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Pending FBR Sync</h3>
          </div>
          <p className="text-4xl font-bold text-orange-600">{stats.pendingFbr}</p>
          <p className="text-sm text-gray-500 mt-1">Invoices awaiting FBR submission</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Invoices</h3>
          </div>
          <p className="text-4xl font-bold text-blue-600">{stats.invoiceCount}</p>
          <p className="text-sm text-gray-500 mt-1">All time invoices generated</p>
        </div>
      </div>

      {/* Earnest Money (CDR) Tracker Section */}
      <CdrTrackerWidget />

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Invoice #</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">FBR Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentInvoices.map((inv: any) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4">{inv.client.name}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(inv.grandTotalPayable)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.fbrSyncStatus === 'SUCCESS'
                          ? 'bg-green-100 text-green-800'
                          : inv.fbrSyncStatus === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {inv.fbrSyncStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : inv.status === 'ISSUED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No invoices yet. Create your first invoice from the Billing page.
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
