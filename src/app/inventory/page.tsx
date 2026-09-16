import { getInventoryStock, getLowStockItems } from '@/lib/actions/inventory-actions';
import { getLocations } from '@/lib/actions/inventory-actions';
import { formatNumber } from '@/lib/utils';
import { Warehouse, AlertTriangle, MapPin, Package } from 'lucide-react';

export default async function InventoryPage() {
  const [stocks, locations, lowStockItems] = await Promise.all([
    getInventoryStock(),
    getLocations(),
    getLowStockItems(),
  ]);

  // Group stocks by floor -> section -> rack
  const groupedByFloor: Record<string, Record<string, any[]>> = {};
  stocks.forEach((stock: any) => {
    const floor = stock.location.floorName;
    const section = stock.location.sectionAisle;
    if (!groupedByFloor[floor]) groupedByFloor[floor] = {};
    if (!groupedByFloor[floor][section]) groupedByFloor[floor][section] = [];
    groupedByFloor[floor][section].push(stock);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Spatial Inventory & Warehouse Map</h1>
        <p className="text-gray-500 mt-1">
          Real-time stock levels organized by physical warehouse location
        </p>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-amber-800">
              Low Stock Alerts ({lowStockItems.length} items)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-amber-200 p-3 flex items-center gap-3"
              >
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    On-hand: <span className="text-amber-600 font-semibold">{item.quantityOnHand}</span>
                    {' / Min: '}{item.product.minStockAlert}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warehouse Spatial Tree */}
      <div className="space-y-4">
        {Object.entries(groupedByFloor).map(([floorName, sections]) => (
          <div key={floorName} className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Floor Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Warehouse className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{floorName}</h3>
              </div>
            </div>

            {/* Sections */}
            <div className="divide-y divide-gray-100">
              {Object.entries(sections).map(([sectionName, sectionStocks]) => (
                <div key={sectionName} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <h4 className="text-sm font-semibold text-gray-700">{sectionName}</h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">Rack/Shelf</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">Product</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">SKU</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-right">On-Hand</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-right">Allocated</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500 text-right">Available</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">Location Code</th>
                          <th className="px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionStocks.map((stock: any) => {
                          const available = stock.quantityOnHand - stock.quantityAllocated;
                          const isLow = stock.quantityOnHand <= stock.product.minStockAlert;
                          return (
                            <tr key={stock.id} className="border-t border-gray-50 hover:bg-blue-50/30">
                              <td className="px-3 py-2.5 text-sm">{stock.location.rackShelf}</td>
                              <td className="px-3 py-2.5 text-sm font-medium">{stock.product.name}</td>
                              <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{stock.product.sku}</td>
                              <td className="px-3 py-2.5 text-sm text-right font-medium">{formatNumber(stock.quantityOnHand)}</td>
                              <td className="px-3 py-2.5 text-sm text-right text-orange-600">{formatNumber(stock.quantityAllocated)}</td>
                              <td className="px-3 py-2.5 text-sm text-right font-semibold text-green-600">{formatNumber(available)}</td>
                              <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{stock.location.locationCode}</td>
                              <td className="px-3 py-2.5">
                                {isLow ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    LOW STOCK
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    OK
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedByFloor).length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No inventory data. Add products and warehouse locations first.</p>
          </div>
        )}
      </div>
    </div>
  );
}
