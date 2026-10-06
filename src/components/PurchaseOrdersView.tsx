import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  Truck,
  FileText,
  AlertCircle,
  X,
  Trash2,
  Calendar,
  Building,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { POItem, POStatus } from '../types';

export const PurchaseOrdersView: React.FC = () => {
  const {
    purchaseOrders,
    suppliers,
    products,
    createPurchaseOrder,
    receivePurchaseOrder,
    updatePurchaseOrderStatus,
    settings,
  } = useInventory();
  const { currentUser, hasPermission } = useAuth();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPOToView, setSelectedPOToView] = useState<string | null>(null);

  // New PO Form state
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<POItem[]>([]);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState('');
  const [itemQuantityToAdd, setItemQuantityToAdd] = useState(10);
  const [formError, setFormError] = useState('');

  const filteredPOs = purchaseOrders.filter((po) => {
    if (activeFilter === 'all') return true;
    return po.status === activeFilter;
  });

  const getStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'received':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ordered':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const handleAddItemToPO = () => {
    if (!selectedItemToAdd) return;
    const prod = products.find((p) => p.id === selectedItemToAdd);
    if (!prod) return;

    // Check if already in line items
    const existingIndex = lineItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...lineItems];
      updated[existingIndex].quantity += itemQuantityToAdd;
      updated[existingIndex].totalCost =
        updated[existingIndex].quantity * updated[existingIndex].unitCost;
      setLineItems(updated);
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          quantity: itemQuantityToAdd,
          unitCost: prod.costPrice,
          totalCost: itemQuantityToAdd * prod.costPrice,
        },
      ]);
    }
  };

  const handleRemoveLineItem = (productId: string) => {
    setLineItems(lineItems.filter((i) => i.productId !== productId));
  };

  // Quick auto-populate low stock items for this supplier
  const handleAutoPopulateLowStock = () => {
    const lowStockForSupplier = products.filter(
      (p) =>
        p.supplierId === supplierId &&
        (p.status === 'low_stock' || p.status === 'out_of_stock')
    );

    if (lowStockForSupplier.length === 0) {
      alert('No critical low-stock items detected for this supplier.');
      return;
    }

    const itemsToAdd: POItem[] = lowStockForSupplier.map((p) => {
      const reorderQty = Math.max(20, p.maxStockLevel - p.currentStock);
      return {
        productId: p.id,
        sku: p.sku,
        productName: p.name,
        quantity: reorderQty,
        unitCost: p.costPrice,
        totalCost: reorderQty * p.costPrice,
      };
    });

    setLineItems(itemsToAdd);
  };

  const totalPOCost = lineItems.reduce((acc, i) => acc + i.totalCost, 0);

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (lineItems.length === 0) {
      setFormError('Please add at least one line item to the order.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    createPurchaseOrder({
      supplierId,
      supplierName: supplier.name,
      items: lineItems,
      totalAmount: totalPOCost,
      expectedDeliveryDate: expectedDate,
      notes: notes.trim() || undefined,
      createdBy: currentUser.name,
    });

    setShowCreateModal(false);
    setLineItems([]);
    setNotes('');
  };

  const handleReceivePO = (poId: string) => {
    if (
      window.confirm(
        'Confirm receipt of shipment? This will automatically increment stock quantities in your warehouse and log the receiving audit trail.'
      )
    ) {
      receivePurchaseOrder(poId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Procurement & Purchase Orders (PO)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage replenishment orders and receive inbound inventory shipments
          </p>
        </div>

        {hasPermission('create_po') && (
          <button
            onClick={() => {
              setShowCreateModal(true);
              setLineItems([]);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs font-semibold border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveFilter('ordered')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'ordered'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          In-Transit / Ordered (
          {purchaseOrders.filter((p) => p.status === 'ordered').length})
        </button>
        <button
          onClick={() => setActiveFilter('received')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'received'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Received Fulfilled (
          {purchaseOrders.filter((p) => p.status === 'received').length})
        </button>
        <button
          onClick={() => setActiveFilter('draft')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeFilter === 'draft'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Drafts ({purchaseOrders.filter((p) => p.status === 'draft').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPOs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No purchase orders found matching this filter.
          </div>
        ) : (
          filteredPOs.map((po) => (
            <div
              key={po.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {po.orderNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusBadge(
                      po.status
                    )}`}
                  >
                    {po.status}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    {po.supplierName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    Expected Delivery: {po.expectedDeliveryDate}
                  </p>
                </div>

                {/* Items preview */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Line Items ({po.items.length})
                  </span>
                  {po.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span className="truncate max-w-[180px]">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-mono text-slate-500 font-semibold">
                        {settings.currencySymbol}
                        {item.totalCost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {po.items.length > 3 && (
                    <div className="text-[11px] text-blue-600 font-medium">
                      + {po.items.length - 3} more items...
                    </div>
                  )}
                </div>

                {po.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    "{po.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Order Total
                  </span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {settings.currencySymbol}
                    {po.totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {po.status === 'ordered' && hasPermission('edit_stock') && (
                    <button
                      onClick={() => handleReceivePO(po.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1 shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Receive Stock</span>
                    </button>
                  )}

                  {po.status === 'draft' && (
                    <button
                      onClick={() =>
                        updatePurchaseOrderStatus(po.id, 'ordered')
                      }
                      className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1 shadow-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Submit to Vendor</span>
                    </button>
                  )}

                  {po.status === 'received' && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Restocked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Purchase Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  New Supplier Purchase Order
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePOSubmit}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Vendor & Expected Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Vendor / Supplier
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => {
                      setSupplierId(e.target.value);
                      setLineItems([]);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.leadTimeDays}d lead time)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Quick auto-fill button */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-xs text-blue-900 font-medium">
                  Auto-fill items currently below safety threshold for this vendor:
                </div>
                <button
                  type="button"
                  onClick={handleAutoPopulateLowStock}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-colors shrink-0 shadow-xs"
                >
                  Load Depleted SKUs
                </button>
              </div>

              {/* Add item to PO bar */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Add Item to Order
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedItemToAdd}
                      onChange={(e) => setSelectedItemToAdd(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">-- Choose Product Item --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name} ({settings.currencySymbol}
                          {p.costPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      value={itemQuantityToAdd}
                      onChange={(e) =>
                        setItemQuantityToAdd(parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-2 py-2 text-xs font-bold border border-slate-300 rounded-lg"
                      placeholder="Qty"
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToPO}
                      className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Line items table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Cost</th>
                      <th className="p-2.5 text-right">Total</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lineItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-6 text-center text-slate-400"
                        >
                          No items added to this PO yet.
                        </td>
                      </tr>
                    ) : (
                      lineItems.map((item) => (
                        <tr key={item.productId}>
                          <td className="p-2.5">
                            <span className="font-medium text-slate-800">
                              {item.productName}
                            </span>
                            <span className="block font-mono text-[10px] text-blue-600">
                              {item.sku}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold">
                            {item.quantity}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            {settings.currencySymbol}
                            {item.unitCost.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {settings.currencySymbol}
                            {item.totalCost.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveLineItem(item.productId)
                              }
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Order total footer */}
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Estimated Order Total:
                </span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {settings.currencySymbol}
                  {totalPOCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special delivery instructions or order justification..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
