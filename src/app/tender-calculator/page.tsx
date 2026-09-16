import { getProducts } from '@/lib/actions/product-actions';
import { getContracts } from '@/lib/actions/tender-actions';
import { getClients } from '@/lib/actions/client-actions';
import { TenderCalculatorForm } from './calculator-form';

export default async function TenderCalculatorPage() {
  const [products, contracts, clients] = await Promise.all([
    getProducts(),
    getContracts(),
    getClients(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tender Rate Calculator & Bidding Engine</h1>
        <p className="text-gray-500 mt-1">
          Calculate profit margins with GST & WHT, then lock rates for won tenders
        </p>
      </div>
      <TenderCalculatorForm products={products} contracts={contracts} clients={clients} />
    </div>
  );
}
