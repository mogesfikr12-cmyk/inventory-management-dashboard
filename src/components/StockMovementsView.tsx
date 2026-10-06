import React, { useState, useMemo } from 'react';
import {
  ArrowLeftRight,
  Filter,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  ClipboardCheck,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { MovementType } from '../types';

export const StockMovementsView: React.FC = () => {
  const { movements, products, adjustStock } = useInventory();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Physical Audit Reconciliation state
  const [showAuditTool, setShowAuditTool] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditSuccess, setAuditSuccess] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesType = filterType === 'all' || m.type === filterType;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        m.sku.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.userName.toLowerCase().includes(q) ||
        (m.referenceNo && m.referenceNo.toLowerCase().includes(q)) ||
        m.reason.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [movements, filterType, searchQuery]);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const variance = physicalCount - selectedProduct.currentStock;
    if (variance === 0) {
      setAuditSuccess(`Audit verified: Physical count matches system stock (${physicalCount} ${selectedProduct.unit}). No adjustment needed.`);
      setTimeout(() => setAuditSuccess(null), 3000);
      return;
    }

    const reason = `Physical Audit Discrepancy (${variance > 0 ? '+' : ''}${variance} ${selectedProduct.unit}). ${auditNotes ? `Note: ${auditNotes}` : ''}`;
    const success = adjustStock(
      selectedProduct.id,
      variance,
      'audit_recount',
      reason,
      `AUDIT-${Date.now().toString().slice(-4)}`
    );

    if (success) {
      setAuditSuccess(`Stock reconciled! Updated to ${physicalCount} ${selectedProduct.unit} (Variance: ${variance > 0 ? '+' : ''}${variance}).`);
      setAuditNotes('');
      setTimeout(() => setAuditSuccess(null), 3500);
    }
  };

  const handleExportLogs = () => {
    const headers = [
      'ID',
      'Timestamp',
      'SKU',
      'Product Name',
      'Action Type',
      'Delta',
      'Previous Stock',
      'New Stock',
      'Staff Member',
      'Reference No',
      'Reason',
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.id}"`,
      `"${m.timestamp}"`,
      `"${m.sku}"`,
      `"${m.productName.replace(/"/g, '""')}"`,
      `"${m.type}"`,
      m.delta,
      m.previousStock,
      m.newStock,
      `"${m.userName}"`,
      `"${m.referenceNo || ''}"`,
      `"${m.reason.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `stock_movement_audit_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'restock':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'sale':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'damaged':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'audit_recount':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'return':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'transfer':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Audit Tool Toggle */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Warehouse Transaction & Audit Logs
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident activity logs for restocks, sales, damages, and cycle counts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAuditTool(!showAuditTool)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors border ${
              showAuditTool
                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Cycle Count Audit Tool</span>
          </button>

          <button
            onClick={handleExportLogs}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Cycle Count Audit Tool Panel */}
      {showAuditTool && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-purple-900">
                Physical Inventory Verification & Variance Reconciliation
              </h3>
            </div>
            <button
              onClick={() => setShowAuditTool(false)}
              className="text-xs text-purple-700 hover:underline font-semibold"
            >
              Close Tool
            </button>
          </div>

          <p className="text-xs text-purple-800 mb-4">
            Select a product to audit, input the physical count observed on the warehouse shelf, and submit to reconcile variance.
          </p>

          {auditSuccess && (
            <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{auditSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuditSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select Product SKU
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find((prod) => prod.id === e.target.value);
                  if (p) setPhysicalCount(p.currentStock);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} (Sys: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Physical Count ({selectedProduct?.unit || 'units'})
              </label>
              <input
                type="number"
                min="0"
                value={physicalCount}
                onChange={(e) => setPhysicalCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Audit Notes / Reason
              </label>
              <input
                type="text"
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="e.g. Monthly Aisle B count verification"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Reconcile Stock Count
              </button>
            </div>
          </form>

          {selectedProduct && (
            <div className="mt-3 text-xs text-purple-900 flex items-center space-x-4 bg-white/60 p-2.5 rounded-lg border border-purple-100">
              <span>
                System Expected: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong>
              </span>
              <span>•</span>
              <span>
                Physical Counted: <strong>{physicalCount} {selectedProduct.unit}</strong>
              </span>
              <span>•</span>
              <span
                className={`font-bold ${
                  physicalCount - selectedProduct.currentStock === 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                Discrepancy Variance:{' '}
                {physicalCount - selectedProduct.currentStock > 0 ? '+' : ''}
                {physicalCount - selectedProduct.currentStock} {selectedProduct.unit}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by SKU, staff name, reference #..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Action Types</option>
            <option value="restock">Restock (+)</option>
            <option value="sale">Sale / Issue (-)</option>
            <option value="damaged">Damaged (-)</option>
            <option value="audit_recount">Audit Recount</option>
            <option value="return">Customer Return (+)</option>
            <option value="transfer">Warehouse Transfer</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Item & SKU</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5 text-right">Delta Change</th>
                <th className="py-3 px-3.5 text-right">Stock Level (Before → After)</th>
                <th className="py-3 px-3.5">Reference #</th>
                <th className="py-3 px-3.5">Reason / Note</th>
                <th className="py-3 px-3.5">Logged By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(mov.timestamp).toLocaleDateString()}{' '}
                      <span className="text-[11px] text-slate-400">
                        {new Date(mov.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <span className="font-semibold text-slate-800 block truncate">
                        {mov.productName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-blue-600">
                        {mov.sku}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getTypeBadge(
                          mov.type
                        )}`}
                      >
                        {mov.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
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
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600 whitespace-nowrap">
                      {mov.previousStock} → <strong className="text-slate-900">{mov.newStock}</strong>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {mov.referenceNo || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate">
                      {mov.reason}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {mov.userName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
