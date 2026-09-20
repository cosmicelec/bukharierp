'use client';

import { useState } from 'react';
import { Settings, ShieldAlert, FileText, CheckCircle2, Warehouse, Users, Building, Plus, Trash2, Save, FileCheck, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function AdminPanel({
  locations,
  clients,
  products,
}: {
  locations: any[];
  clients: any[];
  products: any[];
}) {
  const [activeTab, setActiveTab] = useState<'locations' | 'clients' | 'products'>('locations');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'locations' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Warehouse className="h-4 w-4" /> Locations
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'clients' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Users className="h-4 w-4" /> Clients
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Package className="h-4 w-4" /> Products
        </button>
      </div>
      <div className="p-6">
        {activeTab === 'locations' && <LocationsTab locations={locations} />}
        {activeTab === 'clients' && <ClientsTab clients={clients} />}
        {activeTab === 'products' && <ProductsTab products={products} />}
      </div>
    </div>
  );
}

function LocationsTab({ locations }: { locations: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [warehouseName, setWarehouseName] = useState('Main Godown (Zarghoon Rd)');
  const [floorName, setFloorName] = useState('');
  const [sectionAisle, setSectionAisle] = useState('');
  const [rackShelf, setRackShelf] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { createLocation } = await import('@/lib/actions/inventory-actions');
      await createLocation({
        warehouseName,
        floorCode: floorName.substring(0, 4).toUpperCase(),
        floorName,
        sectionAisle,
        rackShelf,
        locationCode: `${floorName.substring(0, 2).toUpperCase()}-${sectionAisle.replace(' ', '')}-${rackShelf.replace(' ', '')}`,
      });
      setShowForm(false);
      setFloorName('');
      setSectionAisle('');
      setRackShelf('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Warehouse Storage Locations</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Location
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse</label>
              <input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Floor</label>
              <input value={floorName} onChange={(e) => setFloorName(e.target.value)} placeholder="e.g. Ground Floor" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section / Aisle</label>
              <input value={sectionAisle} onChange={(e) => setSectionAisle(e.target.value)} placeholder="e.g. Aisle 03" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rack / Shelf</label>
              <input value={rackShelf} onChange={(e) => setRackShelf(e.target.value)} placeholder="e.g. Rack-B / Shelf-4" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Location'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Warehouse</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Floor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Section</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Rack / Shelf</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Location Code</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc: any) => (
              <tr key={loc.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">{loc.warehouseName}</td>
                <td className="px-4 py-3">{loc.floorName}</td>
                <td className="px-4 py-3">{loc.sectionAisle}</td>
                <td className="px-4 py-3 font-medium">{loc.rackShelf}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{loc.locationCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientsTab({ clients }: { clients: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { createClient } = await import('@/lib/actions/client-actions');
      await createClient({
        code,
        name,
        address,
        clientType: 'GOVERNMENT',
        city: 'Quetta',
      });
      setShowForm(false);
      setCode('');
      setName('');
      setAddress('');
      setDepartment('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Registered Clients & Departments</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CL-001" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center gap-1 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Client'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Department</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Address</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3">{c.department || c.clientType}</td>
                <td className="px-4 py-3">{c.address}, {c.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsTab({ products }: { products: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [baseUom, setBaseUom] = useState('Reams');
  const [baseCost, setBaseCost] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}