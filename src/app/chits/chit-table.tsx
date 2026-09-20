'use client';

import React, { useState } from 'react';
import { Search, Filter, Printer } from 'lucide-react';

export function ChitTable({ chits }: { chits: any[] }) {
  const [printingChit, setPrintingChit] = useState<any | null>(null);

  const handlePrint = (chit: any) => {
    setPrintingChit(chit);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Chit #, Client, or Officer..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Chit #</th>
                <th className="px-6 py-3 font-semibold">Client / Office</th>
                <th className="px-6 py-3 font-semibold">Officer</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Amount</th>
                <th className="px-6 py-3 font-semibold text-right">Paid</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
                <th className="px-6 py-3 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {chits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No chits found. Start by capturing physical slips.
                  </td>
                </tr>
              ) : (
                chits.map((chit) => (
                  <tr key={chit.id} className="hover:bg-blue-50/30 cursor-pointer">
                    <td className="px-6 py-4 font-mono font-medium text-blue-600">
                      {chit.chitNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{chit.client.name}</p>
                      <p className="text-[11px] text-gray-500">{chit.client.department}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{chit.issuingOfficer}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(chit.dateIssued).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      Rs {chit.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                      Rs {chit.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          chit.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : chit.status === 'PARTIALLY_PAID'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {chit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <button
                         onClick={(e) => { e.stopPropagation(); handlePrint(chit); }}
                         className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                         title="Print Receipt"
                       >
                         <Printer className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Thermal Print Layout */}
      {printingChit && (
        <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-[80mm] print:bg-white print:text-black print:p-4 print:font-mono text-sm leading-tight">
          <div className="text-center mb-4 border-b-2 border-black border-dashed pb-2">
            <h1 className="text-xl font-bold">BUKHARI STATIONERY</h1>
            <p className="text-xs">Zarghoon Road, Quetta</p>
            <p className="text-xs">Ph: 081-1234567</p>
          </div>
          
          <div className="mb-4">
            <p><strong>CHIT #:</strong> {printingChit.chitNumber}</p>
            <p><strong>DATE:</strong> {new Date(printingChit.dateIssued).toLocaleDateString()}</p>
            <p><strong>CLIENT:</strong> {printingChit.client.name}</p>
            <p><strong>DEPT:</strong> {printingChit.client.department || 'N/A'}</p>
            <p><strong>OFFICER:</strong> {printingChit.issuingOfficer}</p>
          </div>

          <div className="border-t border-b border-black py-2 my-2">
            <div className="flex justify-between font-bold">
              <span>TOTAL (PKR)</span>
              <span>{printingChit.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span>PAID</span>
              <span>{printingChit.paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span>BALANCE</span>
              <span>{(printingChit.totalAmount - printingChit.paidAmount).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-center mt-6 text-xs border-t-2 border-black border-dashed pt-2">
            <p>Thank you for your business!</p>
            <p className="mt-2 tracking-widest text-[8px]">* {printingChit.chitNumber} *</p>
          </div>
        </div>
      )}
    </>
  );
}