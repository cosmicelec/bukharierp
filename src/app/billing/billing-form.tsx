'use client';

import { useState } from 'react';
import { createNewInvoice, resolveRate, syncInvoiceToFBR } from '@/lib/actions/invoice-actions';
import { formatCurrency } from '@/lib/utils';
import { Receipt, Plus, Trash2, Send, CheckCircle } from 'lucide-react';

interface Props {
  products: any[];
  clients: any[];
  locations: any[];
  contracts: any[];
}

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  locationId: string;
  rateType: string;
  unitPrice: number;
  gstPercent: number;
  lineTotal: number;
  gstAmount: number;
}

export function BillingForm({ products, clients, locations, contracts }: Props) {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [addingProduct, setAddingProduct] = useState('');
  const [addingQty, setAddingQty] = useState(1);
  const [addingLocation, setAddingLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);
  const [fbrResult, setFbrResult] = useState<any>(null);

  const client = clients.find((c: any) => c.id === selectedClient);

  const handleAddItem = async () => {
    if (!addingProduct || !selectedClient || !addingLocation) return;
    const rate = await resolveRate(selectedClient, addingProduct);
    const product = products.find((p: any) => p.id === addingProduct);
    const subtotal = rate.unitPriceExclTax * addingQty;
    const gstAmt = subtotal * (rate.gstPercent / 100);

    setLineItems((prev) => [
      ...prev,
      {
        productId: addingProduct,
        productName: product?.name || '',
        quantity: addingQty,
        locationId: addingLocation,
        rateType: rate.rateType,
        unitPrice: rate.unitPriceExclTax,
        gstPercent: rate.gstPercent,
        lineTotal: subtotal + gstAmt,
        gstAmount: gstAmt,
      },
    ]);
    setAddingProduct('');
    setAddingQty(1);
    setAddingLocation('');
  };

  const removeItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotalTaxable = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalGst = lineItems.reduce((sum, item) => sum + item.gstAmount, 0);
  const grandTotal = subtotalTaxable + totalGst;
  const whtAmount = client?.isWithholdingAgent ? grandTotal * (client.defaultWhtRate / 100) : 0;

  const handleSubmit = async () => {
    if (!selectedClient || lineItems.length === 0) return;
    setSubmitting(true);
    try {
      const invoice = await createNewInvoice({
        clientId: selectedClient,
        tenderContractId: selectedContract || undefined,
        items: lineItems.map((li) => ({
          productId: li.productId,
          quantity: li.quantity,
          locationId: li.locationId,
        })),
      });
      setCreatedInvoice(invoice);
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFbrSync = async () => {
    if (!createdInvoice) return;
    const result = await syncInvoiceToFBR(createdInvoice.id);
    setFbrResult(result);
  };

  if (createdInvoice) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-2xl mx-auto text-center space-y-6">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-gray-900">Invoice Created!</h2>
        <p className="text-gray-500">Invoice # {createdInvoice.invoiceNumber}</p>
        <p className="text-3xl font-bold text-blue-600">{formatCurrency(createdInvoice.grandTotalPayable)}</p>

        {!fbrResult ? (
          <button
            onClick={handleFbrSync}
            className="bg-green-600 text-white rounded-lg px-6 py-3 text-sm font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Push to FBR (Generate QR Code)
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">FBR Sync: {fbrResult.success ? 'SUCCESS' : 'FAILED'}</p>
            {fbrResult.fbrInvoiceNumber && (
              <p className="text-sm text-green-600 mt-1">FBR #: {fbrResult.fbrInvoiceNumber}</p>
            )}
          </div>
        )}

        <button
          onClick={() => { setCreatedInvoice(null); setFbrResult(null); setLineItems([]); }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Create Another Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Client & Contract
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => { setSelectedClient(e.target.value); setLineItems([]); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Client --</option>
              {clients.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.clientType})
                </option>
              ))}
            </select>
          </div>
          {client && (
            <div className="flex items-end">
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1 w-full">
                <p><span className="text-gray-500">NTN:</span> <span className="font-mono">{client.ntnNumber || 'N/A'}</span></p>
                <p><span className="text-gray-500">STRN:</span> <span className="font-mono">{client.strnNumber || 'N/A'}</span></p>
                <p><span className="text-gray-500">WHT Agent:</span> {client.isWithholdingAgent ? `Yes (${client.defaultWhtRate}%)` : 'No'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item */}
      {selectedClient && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Product Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
              <select
                value={addingProduct}
                onChange={(e) => setAddingProduct(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">-- Product --</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
              <input
                type="number"
                value={addingQty}
                onChange={(e) => setAddingQty(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pick Location</label>
              <select
                value={addingLocation}
                onChange={(e) => setAddingLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">-- Location --</option>
                {locations.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.locationCode} ({l.rackShelf})</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      )}

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Qty</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Rate Type</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Unit Price</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">GST</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Line Total</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-3">{i + 1}</td>
                    <td className="px-6 py-3 font-medium">{item.productName}</td>
                    <td className="px-6 py-3">{item.quantity}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.rateType === 'LOCKED_TENDER' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.rateType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-6 py-3 text-right text-blue-600">{formatCurrency(item.gstAmount)}</td>
                    <td className="px-6 py-3 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="px-6 py-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal Taxable Amount</span>
              <span className="font-medium">{formatCurrency(subtotalTaxable)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sales Tax (GST)</span>
              <span className="font-medium text-blue-600">+ {formatCurrency(totalGst)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-100 pt-2">
              <span className="font-semibold text-gray-900">Grand Total</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>
            {whtAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Anticipated WHT Deduction ({client?.defaultWhtRate}%)</span>
                <span className="text-red-600">- {formatCurrency(whtAmount)}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-green-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Receipt className="h-4 w-4" />
              {submitting ? 'Generating Invoice...' : 'Generate Invoice & Push to FBR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
