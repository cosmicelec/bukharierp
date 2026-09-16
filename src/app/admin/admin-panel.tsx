'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Settings,
  DollarSign,
  Warehouse,
  Users,
  Package,
  Plus,
  Save,
  Trash2,
  Check,
  X,
  Edit2,
} from 'lucide-react';

interface Props {
  taxConfigs: any[];
  locations: any[];
  clients: any[];
  products: any[];
  contracts: any[];
}

type ActiveTab = 'tax' | 'warehouse' | 'clients' | 'products';

export function AdminPanel({ taxConfigs, locations, clients, products, contracts }: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('tax');

  const tabs = [
    { id: 'tax' as const, label: 'Tax Rates', icon: DollarSign },
    { id: 'warehouse' as const, label: 'Warehouse Mapper', icon: Warehouse },
    { id: 'clients' as const, label: 'Clients & Contracts', icon: Users },
    { id: 'products' as const, label: 'Product Master', icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'tax' && <TaxRatesTab taxConfigs={taxConfigs} />}
          {activeTab === 'warehouse' && <WarehouseMapperTab locations={locations} />}
          {activeTab === 'clients' && <ClientsTab clients={clients} contracts={contracts} />}
          {activeTab === 'products' && <ProductsTab products={products} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 1: Dynamic Taxation Rates
// ============================================================================
function TaxRatesTab({ taxConfigs }: { taxConfigs: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { createTaxConfiguration } = await import('@/lib/actions/admin-actions');
      await createTaxConfiguration({
        taxName,
        taxRatePercent: taxRate,
        effectiveFrom,
        description,
      });
      setShowForm(false);
      setTaxName('');
      setTaxRate(0);
      setEffectiveFrom('');
      setDescription('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">FBR Tax Rate Configuration</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Tax Rate
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tax Name</label>
              <input
                value={taxName}
                onChange={(e) => setTaxName(e.target.value)}
                placeholder="e.g., STANDARD_GST"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Effective From</label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Tax Name</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500">Rate (%)</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Effective From</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
          </tr>
        </thead>
        <tbody>
          {taxConfigs.map((tc: any) => (
            <tr key={tc.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-sm font-medium">{tc.taxName}</td>
              <td className="px-4 py-3 text-right font-semibold text-blue-600">{tc.taxRatePercent}%</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  tc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tc.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(tc.effectiveFrom).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{tc.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// TAB 2: Warehouse Mapper
// ============================================================================
function WarehouseMapperTab({ locations }: { locations: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [warehouseName, setWarehouseName] = useState('Main Godown (Zarghoon Rd)');
  const [floorCode, setFloorCode] = useState('');
  const [floorName, setFloorName] = useState('');
  const [sectionAisle, setSectionAisle] = useState('');
  const [rackShelf, setRackShelf] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { createLocation } = await import('@/lib/actions/inventory-actions');
      await createLocation({
        warehouseName,
        floorCode,
        floorName,
        sectionAisle,
        rackShelf,
        locationCode,
      });
      setShowForm(false);
      setFloorCode('');
      setFloorName('');
      setSectionAisle('');
      setRackShelf('');
      setLocationCode('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Warehouse Location Manager</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse</label>
              <input
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Floor Code</label>
              <input
                value={floorCode}
                onChange={(e) => setFloorCode(e.target.value)}
                placeholder="FL-00"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Floor Name</label>
              <input
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                placeholder="Ground Floor"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section / Aisle</label>
              <input
                value={sectionAisle}
                onChange={(e) => setSectionAisle(e.target.value)}
                placeholder="Section A - Paper Products"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rack / Shelf</label>
              <input
                value={rackShelf}
                onChange={(e) => setRackShelf(e.target.value)}
                placeholder="Rack-01 / Shelf-1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location Code</label>
              <input
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                placeholder="MG-FL0-SA-R01-S1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Register Location'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-500">Location Code</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Warehouse</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Floor</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Section / Aisle</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Rack / Shelf</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc: any) => (
            <tr key={loc.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-sm font-medium">{loc.locationCode}</td>
              <td className="px-4 py-3">{loc.warehouseName}</td>
              <td className="px-4 py-3">{loc.floorName} ({loc.floorCode})</td>
              <td className="px-4 py-3">{loc.sectionAisle}</td>
              <td className="px-4 py-3">{loc.rackShelf}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  loc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {loc.isActive ? 'Active' : 'Disabled'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// TAB 3: Client & Contract Manager
// ============================================================================
function ClientsTab({ clients, contracts }: { clients: any[]; contracts: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clientType, setClientType] = useState('GOVERNMENT');
  const [ntn, setNtn] = useState('');
  const [strn, setStrn] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Quetta');
  const [phone, setPhone] = useState('');
  const [isWht, setIsWht] = useState(true);
  const [whtRate, setWhtRate] = useState(5);
  const [saving, setSaving] = useState(false);

  // Contract form
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractClientId, setContractClientId] = useState('');
  const [tenderRef, setTenderRef] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [fy, setFy] = useState('2024-2025');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSaveClient = async () => {
    setSaving(true);
    try {
      const { createClient } = await import('@/lib/actions/client-actions');
      await createClient({
        code,
        name,
        clientType,
        ntnNumber: ntn,
        strnNumber: strn,
        isWithholdingAgent: isWht,
        defaultWhtRate: whtRate,
        address,
        city,
        phone,
      });
      setShowForm(false);
      setName('');
      setCode('');
      setNtn('');
      setStrn('');
      setAddress('');
      setPhone('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContract = async () => {
    setSaving(true);
    try {
      const { createContract } = await import('@/lib/actions/tender-actions');
      await createContract({
        tenderReferenceNo: tenderRef,
        clientId: contractClientId,
        title: contractTitle,
        financialYear: fy,
        startDate,
        endDate,
      });
      setShowContractForm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleContract = async (contractId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'WON_LOCKED' ? 'EXPIRED' : 'WON_LOCKED';
    const { updateContractStatus } = await import('@/lib/actions/tender-actions');
    await updateContractStatus(contractId, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Clients Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Client Directory</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>

        {showForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client Code</label>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CL-QTA-XXX-01" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={clientType} onChange={(e) => setClientType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="GOVERNMENT">Government</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="WALK_IN">Walk-In</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">NTN Number</label>
                <input value={ntn} onChange={(e) => setNtn(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">STRN Number</label>
                <input value={strn} onChange={(e) => setStrn(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WHT Rate (%)</label>
                <input type="number" value={whtRate} onChange={(e) => setWhtRate(parseFloat(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveClient} disabled={saving} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Client'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">NTN</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">WHT</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">City</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.clientType === 'GOVERNMENT' ? 'bg-purple-100 text-purple-800' :
                    c.clientType === 'CORPORATE' ? 'bg-blue-100 text-blue-800' :
                    c.clientType === 'WHOLESALE' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                  }`}>{c.clientType}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.ntnNumber || '—'}</td>
                <td className="px-4 py-3">{c.isWithholdingAgent ? `${c.defaultWhtRate}%` : 'No'}</td>
                <td className="px-4 py-3 text-gray-500">{c.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contracts Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Tender Contracts</h3>
          <button
            onClick={() => setShowContractForm(!showContractForm)}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> New Contract
          </button>
        </div>

        {showContractForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client</label>
                <select value={contractClientId} onChange={(e) => setContractClientId(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">-- Select --</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tender Reference</label>
                <input value={tenderRef} onChange={(e) => setTenderRef(e.target.value)} placeholder="TND-XXX-2024-XX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input value={contractTitle} onChange={(e) => setContractTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Financial Year</label>
                <input value={fy} onChange={(e) => setFy(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveContract} disabled={saving} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Create Contract'}
              </button>
              <button onClick={() => setShowContractForm(false)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Reference</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">FY</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Toggle</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{c.tenderReferenceNo}</td>
                <td className="px-4 py-3">{c.client?.name || '—'}</td>
                <td className="px-4 py-3 max-w-xs truncate">{c.title}</td>
                <td className="px-4 py-3">{c.financialYear}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'WON_LOCKED' ? 'bg-green-100 text-green-800' :
                    c.status === 'EXPIRED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleContract(c.id, c.status)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {c.status === 'WON_LOCKED' ? 'Set Expired' : 'Re-activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 4: Product Master List
// ============================================================================
function ProductsTab({ products }: { products: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [baseUom, setBaseUom] = useState('Reams');
  const [baseCost, setBaseCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [gstPercent, setGstPercent] = useState(18);
  const [minStock, setMinStock] = useState(50);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { createProduct } = await import('@/lib/actions/product-actions');
      await createProduct({
        sku,
        name,
        brand,
        hsCode,
        baseUom,
        baseCost,
        standardRetailPrice: retailPrice,
        standardGstPercent: gstPercent,
        minStockAlert: minStock,
      });
      setShowForm(false);
      setSku('');
      setName('');
      setBrand('');
      setHsCode('');
      setBaseCost(0);
      setRetailPrice(0);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Master List</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="PAP-A4-80G-XX" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">HS Code</label>
              <input value={hsCode} onChange={(e) => setHsCode(e.target.value)} placeholder="4802.5600" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base UOM</label>
              <select value={baseUom} onChange={(e) => setBaseUom(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="Reams">Reams</option>
                <option value="Pieces">Pieces</option>
                <option value="Dozens">Dozens</option>
                <option value="Boxes">Boxes</option>
                <option value="Packets">Packets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Stock Alert</label>
              <input type="number" value={minStock} onChange={(e) => setMinStock(parseInt(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Base Cost (PKR)</label>
              <input type="number" value={baseCost} onChange={(e) => setBaseCost(parseFloat(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Retail Price (PKR)</label>
              <input type="number" value={retailPrice} onChange={(e) => setRetailPrice(parseFloat(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GST %</label>
              <input type="number" value={gstPercent} onChange={(e) => setGstPercent(parseFloat(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Product Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Brand</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">HS Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">UOM</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Base Cost</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Retail Price</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">GST</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.brand}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.hsCode}</td>
                <td className="px-4 py-3">{p.baseUom}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.baseCost)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.standardRetailPrice)}</td>
                <td className="px-4 py-3 text-right">{p.standardGstPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
