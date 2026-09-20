import { getAllLocations } from '@/lib/actions/inventory-actions';
import { getAllClients } from '@/lib/actions/client-actions';
import { getAllProducts } from '@/lib/actions/product-actions';
import { AdminPanel } from './admin-panel';
import { Settings } from 'lucide-react';

export default async function AdminPage() {
  const [locations, clients, products] = await Promise.all([
    getAllLocations(),
    getAllClients(),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="h-8 w-8 text-gray-400" />
          Admin Panel
        </h1>
        <p className="text-gray-500 mt-1">
          Configure warehouse locations, clients, and products
        </p>
      </div>
      <AdminPanel
        locations={locations}
        clients={clients}
        products={products}
      />
    </div>
  );
}