import React from 'react';
import { Product } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Barcode as BarcodeIcon,
  Tag,
  Building,
  Edit,
  Trash2,
  Sliders,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onQuickAdjust: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onQuickAdjust,
}) => {
  const { movements, settings, deleteProduct } = useInventory();
  const { hasPermission } = useAuth();

  if (!product) return null;

  // Filter movements for this product
  const productMovements = movements.filter((m) => m.productId === product.id);

  const inventoryValue = product.currentStock * product.costPrice;
  const retailValue = product.currentStock * product.sellingPrice;
  const marginPercent =
    product.sellingPrice > 0
      ? (((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)
      : '0';

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${product.name}" (${product.sku}) from the inventory catalog?`
      )
    ) {
      deleteProduct(product.id);
      onClose();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'low_stock':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'out_of_stock':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'overstocked':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
              {product.sku}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                product.status
              )}`}
            >
              {product.status.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{product.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {product.category}
                </span>
                <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Supplier: {product.supplierName}
                </span>
              </div>
            </div>

            {/* Barcode Mock Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center shrink-0 min-w-44">
              <BarcodeIcon className="w-20 h-8 mx-auto text-slate-800 tracking-widest" />
              <div className="text-xs font-mono font-semibold tracking-wider text-slate-700 mt-1">
                {product.barcode}
              </div>
              <span className="text-[10px] text-slate-400 block uppercase">Standard UPC/EAN</span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">
                Current On-Hand
              </span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">
                {product.currentStock} <span className="text-xs font-normal text-slate-500">{product.unit}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Min: {product.minStockLevel} | Max: {product.maxStockLevel}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">
                Unit Cost / Sell
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                {settings.currencySymbol}{product.costPrice.toFixed(2)} / {settings.currencySymbol}{product.sellingPrice.toFixed(2)}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Margin: {marginPercent}%
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">
                Total Asset Cost
              </span>
              <p className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                {settings.currencySymbol}{inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Valued at Cost
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase font-medium">
                Location
              </span>
              <div className="flex items-center text-xs font-semibold text-slate-800 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1 shrink-0" />
                <span className="truncate">{product.location.warehouse}</span>
              </div>
              <p className="text-[11px] font-mono text-slate-600 mt-1">
                Aisle: {product.location.aisle} • Bin: {product.location.bin}
              </p>
            </div>
          </div>

          {/* Stock Level Progress */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-700">Stock Capacity Utilization</span>
              <span className="text-slate-500 font-mono">
                {product.currentStock} / {product.maxStockLevel} {product.unit} (
                {product.maxStockLevel > 0
                  ? Math.round((product.currentStock / product.maxStockLevel) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  product.currentStock <= product.minStockLevel
                    ? 'bg-rose-500'
                    : product.currentStock > product.maxStockLevel
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    product.maxStockLevel > 0
                      ? (product.currentStock / product.maxStockLevel) * 100
                      : 0
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Stock Movements Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Stock Activity History ({productMovements.length})
              </h4>
            </div>

            {productMovements.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-lg">
                No recorded stock movement entries for this item yet.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {productMovements.map((mov) => (
                  <div key={mov.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold flex items-center ${
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
                        <span className="font-semibold text-slate-700 capitalize">
                          {mov.type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{mov.reason}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                        <span>Staff: {mov.userName}</span>
                        {mov.referenceNo && <span>Ref: {mov.referenceNo}</span>}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      {new Date(mov.timestamp).toLocaleDateString()} {new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {hasPermission('delete_items') && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete SKU</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onQuickAdjust(product);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Stock (+/-)</span>
              </button>

              {hasPermission('edit_stock') && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
