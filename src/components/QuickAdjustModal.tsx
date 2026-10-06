import React, { useState } from 'react';
import { Product, MovementType } from '../types';
import { useInventory } from '../context/InventoryContext';
import { AlertCircle, ArrowUpRight, ArrowDownRight, RefreshCw, X } from 'lucide-react';

interface QuickAdjustModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickAdjustModal: React.FC<QuickAdjustModalProps> = ({
  product,
  onClose,
}) => {
  const { adjustStock, settings } = useInventory();

  const [adjustmentType, setAdjustmentType] = useState<MovementType>('restock');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!product) return null;

  // Is positive delta or negative
  const isAddition =
    adjustmentType === 'restock' || adjustmentType === 'return';
  const delta = isAddition ? Math.abs(quantity) : -Math.abs(quantity);
  const projectedStock = product.currentStock + delta;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }

    if (projectedStock < 0 && !settings.allowNegativeInventory) {
      setError(
        `Cannot reduce stock below zero. Current stock is ${product.currentStock}.`
      );
      return;
    }

    const defaultReason =
      reason.trim() ||
      `${adjustmentType.replace('_', ' ').toUpperCase()} adjustment`;

    const success = adjustStock(
      product.id,
      delta,
      adjustmentType,
      defaultReason,
      referenceNo.trim() || undefined
    );

    if (success) {
      onClose();
    } else {
      setError('Failed to update stock. Please check permissions and limits.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Quick Stock Adjustment
            </h3>
            <p className="text-xs text-slate-500">
              Update inventory level with audit trail
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product summary strip */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              {product.sku}
            </span>
            <p className="text-sm font-semibold text-slate-800 mt-1 line-clamp-1">
              {product.name}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Current Stock:</span>
            <p className="text-base font-bold text-slate-900">
              {product.currentStock} {product.unit}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('restock')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'restock'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>+ Restock</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('sale')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'sale'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-blue-600" />
                <span>- Sale / Issue</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('damaged')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'damaged'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>- Damaged</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('audit_recount')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'audit_recount'
                    ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span>Recount (Audit)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('return')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'return'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                <span>+ Return</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('transfer')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center space-y-1 transition-all ${
                  adjustmentType === 'transfer'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-indigo-600" />
                <span>- Transfer Out</span>
              </button>
            </div>
          </div>

          {/* Quantity & Projected Result */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity ({product.unit})
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 block">Projected Total</span>
              <span
                className={`text-base font-bold ${
                  projectedStock < 0
                    ? 'text-rose-600'
                    : projectedStock <= product.minStockLevel
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {projectedStock} {product.unit}
              </span>
            </div>
          </div>

          {/* Reason & Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Explanation
            </label>
            <input
              type="text"
              placeholder="e.g. Received new stock pallet from Apex, replaced damaged unit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reference / PO / SO # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. PO-8921, SO-4402"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
