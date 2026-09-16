import { getProducts } from '@/lib/actions/product-actions';
import { getClients } from '@/lib/actions/client-actions';
import { getLocations } from '@/lib/actions/inventory-actions';
import { getActiveContracts } from '@/lib/actions/tender-actions';
import { BillingForm } from './billing-form';

export default async function BillingPage() {
  const [products, clients, locations, contracts] = await Promise.all([
    getProducts(),
    getClients(),
    getLocations(),
    getActiveContracts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">FBR Digital Invoice & Billing</h1>
        <p className="text-gray-500 mt-1">
          Generate tax invoices with automatic tender rate resolution & FBR compliance
        </p>
      </div>
      <BillingForm
        products={products}
        clients={clients}
        locations={locations}
        contracts={contracts}
      />
    </div>
  );
}
