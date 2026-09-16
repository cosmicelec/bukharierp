import { getContracts } from '@/lib/actions/tender-actions';
import { formatCurrency } from '@/lib/utils';
import { FileCheck, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function ContractsPage() {
  const contracts = await getContracts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tender Contracts</h1>
          <p className="text-gray-500 mt-1">Manage active and historical tender agreements</p>
        </div>
        <Link
          href="/admin"
          className="bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Contract
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Reference No.</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Client</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Financial Year</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Locked Rates</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium">{c.tenderReferenceNo}</td>
                  <td className="px-6 py-4">{c.client?.name}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{c.title}</td>
                  <td className="px-6 py-4">{c.financialYear}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status === 'WON_LOCKED'
                          ? 'bg-green-100 text-green-800'
                          : c.status === 'DRAFT'
                          ? 'bg-gray-100 text-gray-800'
                          : c.status === 'SUBMITTED'
                          ? 'bg-blue-100 text-blue-800'
                          : c.status === 'EXPIRED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-blue-600">
                      {c.lockedRates?.length || 0} products
                    </span>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No contracts found. Create one from the Admin Panel.
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
