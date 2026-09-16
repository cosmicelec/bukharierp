'use client';

import { useState } from 'react';
import { calculateRate, lockRate } from '@/lib/actions/tender-actions';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Calculator, Lock, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  products: any[];
  contracts: any[];
  clients: any[];
}

export function TenderCalculatorForm({ products, contracts, clients }: Props) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [baseCost, setBaseCost] = useState(0);
  const [freight, setFreight] = useState(0);
  const [margin, setMargin] = useState(15);
  const [gst, setGst] = useState(18);
  const [wht, setWht] = useState(5);
  const [quantity, setQuantity] = useState(1000);
  const [selectedContract, setSelectedContract] = useState('');
  const [result, setResult] = useState<any>(null);
  const [locking, setLocking] = useState(false);
  const [lockSuccess, setLockSuccess] = useState(false);
  const [ppraOverride, setPpraOverride] = useState(false);

  const wholesaleFloorPrice = (baseCost + freight) * (1 + gst / 100);
  const isLossMakingPPRA = result && (result.quotedGrossRate < wholesaleFloorPrice || margin < 0);

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setBaseCost(product.baseCost);
    }
  };

  const handleCalculate = async () => {
    const calc = await calculateRate({
      baseCost,
      freightPerUnit: freight,
      targetMarginPercent: margin,
      gstPercent: gst,
      whtPercent: wht,
    });
    setResult(calc);
    setLockSuccess(false);
  };

  const handleLock = async () => {
    if (!selectedContract || !selectedProduct || !result) return;
    setLocking(true);
    try {
      await lockRate({
        contractId: selectedContract,
        productId: selectedProduct,
        biddingParams: {
          baseCost,
          freightPerUnit: freight,
          targetMarginPercent: margin,
          gstPercent: gst,
          whtPercent: wht,
        },
        committedQuantity: quantity,
      });
      setLockSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to lock rate');
    } finally {
      setLocking(false);
    }
  };

  const handleReset = () => {
    setSelectedProduct('');
    setBaseCost(0);
    setFreight(0);
    setMargin(15);
    setGst(18);
    setWht(5);
    setQuantity(1000);
    setSelectedContract('');
    setResult(null);
    setLockSuccess(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          Cost & Margin Parameters
        </h2>

        {/* Product Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — {p.baseUom}
              </option>
            ))}
          </select>
        </div>

        {/* Cost Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Cost (PKR)</label>
            <input
              type="number"
              value={baseCost}
              onChange={(e) => setBaseCost(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Freight/Handling (PKR)</label>
            <input
              type="number"
              value={freight}
              onChange={(e) => setFreight(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rate Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Margin %</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate %</label>
            <input
              type="number"
              value={gst}
              onChange={(e) => setGst(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WHT Deduction %</label>
            <input
              type="number"
              value={wht}
              onChange={(e) => setWht(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contract & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tender Contract</label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Contract --</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tenderReferenceNo} — {c.client?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Committed Qty</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleCalculate}
            className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calculate Rate
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Right: Live Financial Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Live Financial Breakdown</h2>

        {!result ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Enter parameters and click Calculate</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Breakdown Rows */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Total Cost per Unit</span>
                <span className="text-sm font-medium">{formatCurrency(result.effectiveBaseCost)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Target Net Profit ({margin}%)</span>
                <span className="text-sm font-medium text-green-600">+ {formatCurrency(result.desiredProfitAmount)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Quoted Net Price (Excl. Tax)</span>
                <span className="text-sm font-semibold">{formatCurrency(result.netRateExclTax)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">+ FBR Sales Tax ({gst}% GST)</span>
                <span className="text-sm font-medium text-blue-600">+ {formatCurrency(result.gstAmount)}</span>
              </div>
            </div>

            {/* Highlighted Gross Rate */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-900">FINAL GROSS TENDER RATE</span>
                <span className="text-2xl font-bold text-blue-700">{formatCurrency(result.quotedGrossRate)}</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Per unit — inclusive of all taxes</p>
            </div>

            {/* WHT & Net Cash */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Govt WHT Deducted at Source ({wht}%)</span>
                <span className="text-sm font-medium text-red-600">- {formatCurrency(result.estimatedWhtDeduction)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Net Cash Realized per Unit</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(result.finalRealizedNetCash)}</span>
              </div>
            </div>

            {/* Total Tender Value */}
            {quantity > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Tender Value (Gross)</span>
                  <span className="text-sm font-bold">{formatCurrency(result.quotedGrossRate * quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Guaranteed Profit</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(result.desiredProfitAmount * quantity)}</span>
                </div>
              </div>
            )}

            {/* PPRA Margin Warning Alert (Loss-Making Bid Prevention) */}
            {isLossMakingPPRA && (
              <div className="bg-red-600 text-white rounded-xl p-4 shadow-lg flex items-start gap-3 border-2 border-red-700 animate-pulse">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5 text-yellow-300" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm tracking-wide text-yellow-200">
                    ⚠️ PPRA VIOLATION & LOSS-MAKING BID ALERT!
                  </h4>
                  <p className="text-xs text-red-100 leading-relaxed">
                    Your quoted tender rate (<strong>{formatCurrency(result.quotedGrossRate)}</strong>) is below the wholesale procurement cost + GST floor (<strong>{formatCurrency(wholesaleFloorPrice)}</strong>). Under PPRA rules, predatory below-cost bidding risks contract disqualification and immediate operational financial losses!
                  </p>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ppraOverride}
                      onChange={(e) => setPpraOverride(e.target.checked)}
                      className="rounded text-red-700 focus:ring-red-500 w-4 h-4 bg-white"
                    />
                    <span className="text-xs text-yellow-100 font-semibold underline">
                      Owner/Admin Override: I acknowledge the financial loss and authorize rate locking.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Lock Button */}
            {selectedContract && selectedProduct && (
              <button
                onClick={handleLock}
                disabled={locking || (isLossMakingPPRA && !ppraOverride)}
                className={`w-full text-white rounded-lg px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                  isLossMakingPPRA ? 'bg-red-700 hover:bg-red-800' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Lock className="h-4 w-4" />
                {locking ? 'Locking Rate...' : isLossMakingPPRA ? 'Lock Deficit Rate (Override Active)' : 'Lock Tender Rate for Client'}
              </button>
            )}

            {lockSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 text-center">
                ✅ Rate successfully locked for the selected contract!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
