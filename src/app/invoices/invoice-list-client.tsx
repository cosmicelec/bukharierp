'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { exportInvoiceToExcel } from '@/lib/services/excel-export';
import { FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

interface Props {
  invoices: any[];
}

export function InvoiceListClient({ invoices }: Props) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExportExcel = async (inv: any) => {
    setExportingId(inv.id);
    setMessage(null);
    try {
      const res = await exportInvoiceToExcel({
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.client?.name || 'Customer',
        clientNtn: inv.client?.ntnNumber,
        clientStrn: inv.client?.strnNumber,
        clientAddress: inv.client?.address,
        date: new Date(inv.invoiceDate || inv.createdAt).toISOString().split('T')[0],
        subtotalTaxable: inv.subtotalTaxableValue,
        totalGst: inv.totalSalesTaxAmount,
        grandTotal: inv.grandTotalPayable,
        items: (inv.items || []).map((it: any) => ({
          hsCode: it.hsCode || it.product?.hsCode || '4802.5600',
          description: it.product?.name || 'Stationery Item',
          uom: it.uom || it.product?.baseUom || 'Units',
          quantity: it.quantity,
          unitPrice: it.unitPriceExclTax,
          gstPercent: it.salesTaxPercent || 18,
          gstAmount: it.salesTaxAmount,
          totalAmount: it.totalPriceInclTax,
        })),
      });

      setMessage(res.message);
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3 font-semibold">Invoice #</th>
                <th className="px-6 py-3 font-semibold">Client</th>
                <th className="px-6 py-3 font-semibold">Contract</th>
                <th className="px-6 py-3 text-right font-semibold">Taxable Amt</th>
                <th className="px-6 py-3 text-right font-semibold">GST (18%)</th>
                <th className="px-6 py-3 text-right font-semibold">Grand Total</th>
                <th className="px-6 py-3 text-center font-semibold">FBR Sync</th>
                <th className="px-6 py-3 text-center font-semibold">Status</th>
                <th className="px-6 py-3 text-center font-semibold">Excel Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-6 py-3.5 font-medium text-gray-800">{inv.client?.name}</td>
                  <td className="px-6 py-3.5 text-gray-500 font-mono">
                    {inv.tenderContract?.tenderReferenceNo || '—'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono">{formatCurrency(inv.subtotalTaxableValue)}</td>
                  <td className="px-6 py-3.5 text-right font-mono text-blue-600">
                    +{formatCurrency(inv.totalSalesTaxAmount)}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-bold text-gray-900">
                    {formatCurrency(inv.grandTotalPayable)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  <td className="px-6 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        inv.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <button
                      onClick={() => handleExportExcel(inv)}
                      disabled={exportingId === inv.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                      title="Inject data into invoice_template.xlsx and save to Desktop"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      {exportingId === inv.id ? 'Exporting...' : 'Export Excel'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
