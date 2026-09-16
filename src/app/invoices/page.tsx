import { getInvoices } from '@/lib/actions/invoice-actions';
import { InvoiceListClient } from './invoice-list-client';

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoice History & Excel Export</h1>
        <p className="text-gray-500 mt-1">All generated invoices with FBR digital sync and Desktop Excel template injection</p>
      </div>

      <InvoiceListClient invoices={invoices} />
    </div>
  );
}
