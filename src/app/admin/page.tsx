import { getTaxConfigurations } from '@/lib/actions/admin-actions';
import { getAllLocations } from '@/lib/actions/inventory-actions';
import { getAllClients } from '@/lib/actions/client-actions';
import { getAllProducts } from '@/lib/actions/product-actions';
import { getContracts } from '@/lib/actions/tender-actions';
import { AdminPanel } from './admin-panel';
import { Settings } from 'lucide-react';

export default async function AdminPage() {
  const [taxConfigs, locations, clients, products, contracts] = await Promise.all([
    getTaxConfigurations(),
    getAllLocations(),
    getAllClients(),
    getAllProducts(),
    getContracts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-gray-400" />
          Dynamic Admin Panel
        </h1>
        <p className="text-gray-500 mt-1">
          Configure taxes, warehouse locations, clients, and products — no code changes required
        </p>
      </div>
      <AdminPanel
        taxConfigs={taxConfigs}
        locations={locations}
        clients={clients}
        products={products}
        contracts={contracts}
      />
    </div>
  );
}
