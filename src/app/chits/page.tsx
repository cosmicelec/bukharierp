import { getChits } from '@/lib/actions/chit-actions';
import { Camera } from 'lucide-react';
import Link from 'next/link';
import { ChitTable } from './chit-table';

export default async function ChitsPage() {
  const chits = await getChits();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Chits Vault</h1>
          <p className="text-gray-500 mt-1">
            Digitized physical order slips and ledger tracking
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/chits/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
          >
            <Camera className="h-4 w-4" />
            Capture New Chit
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Chits Scanned</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{chits.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Unpaid Chits</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {chits.filter((c) => c.status !== 'PAID').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue Tracked</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            Rs {chits.reduce((acc, c) => acc + c.totalAmount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      <ChitTable chits={chits} />
    </div>
  );
}
