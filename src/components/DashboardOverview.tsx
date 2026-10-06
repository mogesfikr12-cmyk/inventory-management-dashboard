import React from 'react';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Warehouse,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

interface DashboardOverviewProps {
  onSelectProduct: (productId: string) => void;
  onQuickAdjust: (product: Product) => void;
  onOpenAddProduct: () => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectProduct,
  onQuickAdjust,
  onOpenAddProduct,
  setActiveTab,
}) => {
  const { products, movements, purchaseOrders, warehouses, settings } = useInventory();
  const { currentUser, hasPermission } = useAuth();

  // KPIs
  const totalItemsCount = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalCostValue = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const potentialMargin =
    totalRetailValue > 0
      ? (((totalRetailValue - totalCostValue) / totalRetailValue) * 100).toFixed(1)
      : '0';

  const lowStockItems = products.filter(
    (p) => p.status === 'low_stock' || p.status === 'out_of_stock'
  );

  const pendingPOs = purchaseOrders.filter((po) => po.status === 'ordered');
  const pendingPOValue = pendingPOs.reduce((acc, po) => acc + po.totalAmount, 0);

  // Status breakdown
  const inStockCount = products.filter((p) => p.status === 'in_stock').length;
  const lowStockCount = products.filter((p) => p.status === 'low_stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out_of_stock').length;
  const overstockedCount = products.filter((p) => p.status === 'overstocked').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Authorized Session • {currentUser.department}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Monitoring {products.length} catalog SKUs across {warehouses.length} regional distribution centers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('edit_stock') && (
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Stock Entry</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700 flex items-center space-x-1.5"
          >
            <ClipboardList className="w-4 h-4 text-blue-400" />
            <span>Purchase Orders</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Catalog SKUs
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{products.length}</p>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700">{totalItemsCount.toLocaleString()}</span>
              <span>total physical units</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Asset Inventory Value
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">
              {settings.currencySymbol}
              {totalCostValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Potential Margin: <strong>{potentialMargin}%</strong></span>
            </div>
          </div>
        </div>

        {/* KPI 3: Critical Low Stock */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Restock Alerts
            </span>
            <div
              className={`p-2 rounded-lg ${
                lowStockItems.length > 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p
              className={`text-2xl font-bold ${
                lowStockItems.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {lowStockItems.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {outOfStockCount} zero-stock, {lowStockCount} below reorder threshold
            </p>
          </div>
        </div>

        {/* KPI 4: Pending Inbound Shipments */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inbound Orders (POs)
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-slate-900">{pendingPOs.length} In-Transit</p>
            <p className="text-xs text-slate-500 mt-1">
              {settings.currencySymbol}
              {pendingPOValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} committed
            </p>
          </div>
        </div>
      </div>

      {/* Stock Health & Low Stock Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Replenishment Action Queue */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Priority Replenishment Queue ({lowStockItems.length})
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>View All Catalog</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Healthy Stock Levels</p>
              <p className="text-xs text-slate-500 mt-1">
                No inventory items are currently below minimum safety thresholds.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="cursor-pointer" onClick={() => onSelectProduct(prod.id)}>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {prod.sku}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          prod.currentStock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.currentStock === 0 ? 'Out of stock' : 'Low stock'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{prod.name}</p>
                    <p className="text-xs text-slate-500">
                      Supplier: {prod.supplierName} • {prod.location.warehouse}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {prod.currentStock} / {prod.minStockLevel} {prod.unit}
                      </p>
                      <span className="text-[10px] text-slate-400">Current vs Min</span>
                    </div>

                    <button
                      onClick={() => onQuickAdjust(prod)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                    >
                      Quick Adjust
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Distribution & Health Meter */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Catalog Health Breakdown
            </h2>

            {/* Visual multi-segmented bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 mb-4 border border-slate-200">
              <div
                title={`In Stock: ${inStockCount}`}
                style={{ width: `${(inStockCount / (products.length || 1)) * 100}%` }}
                className="bg-emerald-500 h-full"
              />
              <div
                title={`Low Stock: ${lowStockCount}`}
                style={{ width: `${(lowStockCount / (products.length || 1)) * 100}%` }}
                className="bg-amber-400 h-full"
              />
              <div
                title={`Out of Stock: ${outOfStockCount}`}
                style={{ width: `${(outOfStockCount / (products.length || 1)) * 100}%` }}
                className="bg-rose-500 h-full"
              />
              <div
                title={`Overstocked: ${overstockedCount}`}
                style={{ width: `${(overstockedCount / (products.length || 1)) * 100}%` }}
                className="bg-blue-400 h-full"
              />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Optimal Stock</span>
                </div>
                <span className="font-bold text-slate-800">{inStockCount} items</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="text-slate-600">Low Stock Reorder Trigger</span>
                </div>
                <span className="font-bold text-amber-700">{lowStockCount} items</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-slate-600">Out of Stock (Zero Units)</span>
                </div>
                <span className="font-bold text-rose-700">{outOfStockCount} items</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                  <span className="text-slate-600">Overstocked (&gt; Max Target)</span>
                </div>
                <span className="font-bold text-blue-700">{overstockedCount} items</span>
              </div>
            </div>
          </div>

          {/* Warehouses list */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span className="flex items-center">
                <Warehouse className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Active Facilities
              </span>
              <span className="text-[11px] text-slate-400">Occupancy</span>
            </div>
            <div className="space-y-2">
              {warehouses.map((wh) => (
                <div key={wh.id} className="text-xs">
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span className="font-medium truncate">{wh.name}</span>
                    <span className="font-mono">
                      {Math.round((wh.currentOccupancy / wh.capacity) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.round((wh.currentOccupancy / wh.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Movements Activity Log Feed */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Warehouse Stock Movements & Audit
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('movements')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            View Full Audit Trail →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Item / SKU</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Delta</th>
                <th className="py-2.5 px-3">Reason / Reference</th>
                <th className="py-2.5 px-3">Staff Member</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.slice(0, 5).map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-800 block">{mov.productName}</span>
                    <span className="font-mono text-[11px] text-blue-600">{mov.sku}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {mov.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">
                    <span
                      className={`inline-flex items-center ${
                        mov.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {mov.delta > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {mov.delta > 0 ? `+${mov.delta}` : mov.delta}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                    {mov.reason}
                    {mov.referenceNo && (
                      <span className="ml-1 text-[10px] font-mono text-slate-400">
                        [{mov.referenceNo}]
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {mov.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
