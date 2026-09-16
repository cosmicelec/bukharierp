'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Landmark, AlertCircle, CheckCircle2, Clock, Plus, ShieldCheck } from 'lucide-react';

export interface CdrItem {
  id: string;
  tenderRefNo: string;
  tenderTitle: string;
  buyerName: string;
  cdrNumber: string;
  bankName: string;
  amountPkr: number;
  percentage: number;
  issuanceDate: string;
  expectedRefundDate: string;
  status: 'HELD_BY_BUYER' | 'UNLOCKED_READY_COLLECTION' | 'REFUNDED_DEPOSITED';
}

const INITIAL_MOCK_CDRS: CdrItem[] = [
  {
    id: 'cdr-1',
    tenderRefNo: 'TND-POST-2024-89B',
    tenderTitle: 'Annual Stationery Framework 2024-25',
    buyerName: 'Quetta GPO (Pakistan Post)',
    cdrNumber: 'CDR-HBL-2024-99182',
    bankName: 'HBL Jinnah Road Branch',
    amountPkr: 250000,
    percentage: 2.5,
    issuanceDate: '2024-07-10',
    expectedRefundDate: '2024-09-01',
    status: 'UNLOCKED_READY_COLLECTION', // Triggers collection alert!
  },
  {
    id: 'cdr-2',
    tenderRefNo: 'TND-SEC-2024-04',
    tenderTitle: 'Civil Secretariat Office Supplies Framework',
    buyerName: 'Balochistan Civil Secretariat',
    cdrNumber: 'CDR-NBP-2024-11029',
    bankName: 'NBP Civil Secretariat Branch',
    amountPkr: 500000,
    percentage: 3.0,
    issuanceDate: '2024-08-01',
    expectedRefundDate: '2025-06-30',
    status: 'HELD_BY_BUYER',
  },
  {
    id: 'cdr-3',
    tenderRefNo: 'TND-OGDCL-2024-12',
    tenderTitle: 'OGDCL Regional Quetta Bulk Reams Supply',
    buyerName: 'OGDCL Regional Office',
    cdrNumber: 'CDR-MCB-2024-44211',
    bankName: 'MCB Sariab Road Branch',
    amountPkr: 180000,
    percentage: 2.0,
    issuanceDate: '2024-06-15',
    expectedRefundDate: '2024-08-15',
    status: 'REFUNDED_DEPOSITED',
  },
];

export function CdrTrackerWidget() {
  const [cdrs, setCdrs] = useState<CdrItem[]>(INITIAL_MOCK_CDRS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCdr, setNewCdr] = useState({
    tenderRefNo: '',
    tenderTitle: '',
    buyerName: '',
    cdrNumber: '',
    bankName: 'HBL Quetta',
    amountPkr: 100000,
    percentage: 2.0,
    expectedRefundDate: '',
  });

  const totalPendingAmount = cdrs
    .filter((c) => c.status === 'HELD_BY_BUYER' || c.status === 'UNLOCKED_READY_COLLECTION')
    .reduce((sum, c) => sum + c.amountPkr, 0);

  const readyForCollection = cdrs.filter((c) => c.status === 'UNLOCKED_READY_COLLECTION');

  const handleStatusChange = (id: string, newStatus: CdrItem['status']) => {
    setCdrs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddCdr = (e: React.FormEvent) => {
    e.preventDefault();
    const item: CdrItem = {
      id: `cdr-${Date.now()}`,
      tenderRefNo: newCdr.tenderRefNo || 'TND-MANUAL',
      tenderTitle: newCdr.tenderTitle || 'Stationery Tender',
      buyerName: newCdr.buyerName || 'Government Department',
      cdrNumber: newCdr.cdrNumber,
      bankName: newCdr.bankName,
      amountPkr: Number(newCdr.amountPkr),
      percentage: Number(newCdr.percentage),
      issuanceDate: new Date().toISOString().split('T')[0],
      expectedRefundDate: newCdr.expectedRefundDate || '2025-06-30',
      status: 'HELD_BY_BUYER',
    };
    setCdrs([item, ...cdrs]);
    setShowAddModal(false);
    setNewCdr({
      tenderRefNo: '',
      tenderTitle: '',
      buyerName: '',
      cdrNumber: '',
      bankName: 'HBL Quetta',
      amountPkr: 100000,
      percentage: 2.0,
      expectedRefundDate: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-500/30 text-blue-300">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">Earnest Money (CDR) Tracker</h3>
            <p className="text-xs text-blue-200/80">
              Bank Call Deposit Receipts submitted as tender bid security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-gray-300 uppercase tracking-wider font-medium">
              Total Locked Capital:
            </span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(totalPendingAmount)}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Add CDR
          </button>
        </div>
      </div>

      {/* High-Priority Collection Alert Banner */}
      {readyForCollection.length > 0 && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-900 text-xs font-medium">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Action Required:</strong> {readyForCollection.length} CDR(s) amounting to{' '}
              <strong>
                {formatCurrency(readyForCollection.reduce((acc, c) => acc + c.amountPkr, 0))}
              </strong>{' '}
              are <strong>UNLOCKED</strong> and ready to be collected from the department!
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            Refund Ready
          </span>
        </div>
      )}

      {/* CDR Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold">Tender & Client</th>
              <th className="px-6 py-3 font-semibold">CDR # / Issuing Bank</th>
              <th className="px-6 py-3 text-right font-semibold">Security Amount</th>
              <th className="px-6 py-3 font-semibold">Issuance Date</th>
              <th className="px-6 py-3 font-semibold">Refund Target</th>
              <th className="px-6 py-3 text-center font-semibold">Lifecycle Status</th>
              <th className="px-6 py-3 text-center font-semibold">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cdrs.map((cdr) => {
              const isUnlocked = cdr.status === 'UNLOCKED_READY_COLLECTION';
              const isDeposited = cdr.status === 'REFUNDED_DEPOSITED';

              return (
                <tr
                  key={cdr.id}
                  className={`hover:bg-gray-50/80 transition ${
                    isUnlocked ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="px-6 py-3.5">
                    <p className="font-bold text-gray-900">{cdr.tenderTitle}</p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Ref: {cdr.tenderRefNo} &bull; {cdr.buyerName}
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="font-mono font-semibold text-blue-700">{cdr.cdrNumber}</p>
                    <p className="text-[11px] text-gray-500">{cdr.bankName}</p>
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono">
                    <p className="font-bold text-gray-900">{formatCurrency(cdr.amountPkr)}</p>
                    <p className="text-[10px] text-gray-400">({cdr.percentage}% tender value)</p>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 font-mono">{cdr.issuanceDate}</td>
                  <td className="px-6 py-3.5 font-mono">
                    <span
                      className={
                        isUnlocked ? 'text-emerald-700 font-bold' : 'text-gray-600'
                      }
                    >
                      {cdr.expectedRefundDate}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Collection
                      </span>
                    ) : isDeposited ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                        Refund Deposited
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                        <Clock className="h-3.5 w-3.5" /> Held by Department
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleStatusChange(cdr.id, 'REFUNDED_DEPOSITED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                      >
                        Mark Deposited
                      </button>
                    ) : !isDeposited ? (
                      <button
                        onClick={() => handleStatusChange(cdr.id, 'UNLOCKED_READY_COLLECTION')}
                        className="px-2.5 py-1 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded text-[11px] font-semibold transition"
                      >
                        Set Unlocked
                      </button>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Archived</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add CDR Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-blue-600" />
              Register New Tender Earnest Money (CDR)
            </h4>

            <form onSubmit={handleAddCdr} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tender Title</label>
                  <input
                    required
                    value={newCdr.tenderTitle}
                    onChange={(e) => setNewCdr({ ...newCdr, tenderTitle: e.target.value })}
                    placeholder="e.g., Annual Paper Tender"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tender Ref #</label>
                  <input
                    required
                    value={newCdr.tenderRefNo}
                    onChange={(e) => setNewCdr({ ...newCdr, tenderRefNo: e.target.value })}
                    placeholder="TND-GPO-2024-01"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Buyer Department</label>
                  <input
                    required
                    value={newCdr.buyerName}
                    onChange={(e) => setNewCdr({ ...newCdr, buyerName: e.target.value })}
                    placeholder="e.g., Quetta GPO"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">CDR / Draft #</label>
                  <input
                    required
                    value={newCdr.cdrNumber}
                    onChange={(e) => setNewCdr({ ...newCdr, cdrNumber: e.target.value })}
                    placeholder="CDR-HBL-99212"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Issuing Bank</label>
                  <input
                    required
                    value={newCdr.bankName}
                    onChange={(e) => setNewCdr({ ...newCdr, bankName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Security Amount (PKR)</label>
                  <input
                    type="number"
                    required
                    value={newCdr.amountPkr}
                    onChange={(e) => setNewCdr({ ...newCdr, amountPkr: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Refund Target Date</label>
                  <input
                    type="date"
                    required
                    value={newCdr.expectedRefundDate}
                    onChange={(e) => setNewCdr({ ...newCdr, expectedRefundDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Save CDR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
