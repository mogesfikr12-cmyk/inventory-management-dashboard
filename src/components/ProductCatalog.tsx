import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Sliders,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Warehouse,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { Product, StockStatus } from '../types';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';

interface ProductCatalogProps {
  onSelectProduct: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  onQuickAdjust: (product: Product) => void;
  onOpenAddProduct: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onSelectProduct,
  onEditProduct,
  onQuickAdjust,
  onOpenAddProduct,
}) => {
  const { products, deleteProduct, settings, warehouses, addProduct } = useInventory();
  const { hasPermission } = useAuth();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [sortField, setSortField] = useState<'name' | 'sku' | 'currentStock' | 'sellingPrice'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // CSV Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.barcode.includes(query) ||
          p.supplierName.toLowerCase().includes(query);

        // Category
        const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;

        // Status
        const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

        // Warehouse
        const matchesWarehouse =
          selectedWarehouse === 'all' || p.location.warehouse === selectedWarehouse;

        return matchesSearch && matchesCat && matchesStatus && matchesWarehouse;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') comp = a.name.localeCompare(b.name);
        if (sortField === 'sku') comp = a.sku.localeCompare(b.sku);
        if (sortField === 'currentStock') comp = a.currentStock - b.currentStock;
        if (sortField === 'sellingPrice') comp = a.sellingPrice - b.sellingPrice;
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedWarehouse,
    sortField,
    sortOrder,
  ]);

  const toggleSort = (field: 'name' | 'sku' | 'currentStock' | 'sellingPrice') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'low_stock':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'out_of_stock':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'overstocked':
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Name',
      'Category',
      'Barcode',
      'Cost Price',
      'Selling Price',
      'Current Stock',
      'Min Stock Level',
      'Max Stock Level',
      'Unit',
      'Warehouse',
      'Aisle',
      'Shelf',
      'Bin',
      'Supplier',
      'Status',
    ];

    const rows = filteredProducts.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.barcode}"`,
      p.costPrice,
      p.sellingPrice,
      p.currentStock,
      p.minStockLevel,
      p.maxStockLevel,
      `"${p.unit}"`,
      `"${p.location.warehouse}"`,
      `"${p.location.aisle}"`,
      `"${p.location.shelf}"`,
      `"${p.location.bin}"`,
      `"${p.supplierName}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV parser
  const handleImportSubmit = () => {
    setImportFeedback(null);
    if (!importText.trim()) return;

    try {
      const lines = importText.trim().split('\n');
      if (lines.length < 2) {
        setImportFeedback('CSV must contain a header line and at least one data row.');
        return;
      }

      let importedCount = 0;
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((s) => s.replace(/^"|"$/g, '').trim());
        if (parts.length >= 6) {
          const sku = parts[0] || `IMPORT-${Date.now().toString().slice(-4)}`;
          const name = parts[1] || 'Imported Item';
          const category = parts[2] || 'General';
          const costPrice = parseFloat(parts[4]) || 10;
          const sellingPrice = parseFloat(parts[5]) || 20;
          const currentStock = parseInt(parts[6]) || 15;

          addProduct({
            sku: sku.toUpperCase(),
            name,
            description: 'Imported via CSV batch upload',
            category,
            barcode: parts[3] || '890' + Math.floor(Math.random() * 1000000000),
            costPrice,
            sellingPrice,
            currentStock,
            minStockLevel: 5,
            maxStockLevel: 100,
            unit: 'pcs',
            supplierId: 'sup-1',
            supplierName: 'Apex Industrial Technologies',
            location: {
              warehouse: warehouses[0]?.name || 'Central Distribution Center',
              aisle: 'A-01',
              shelf: '01',
              bin: 'B-01',
            },
          });
          importedCount++;
        }
      }

      setImportFeedback(`Successfully imported ${importedCount} items into catalog!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportText('');
        setImportFeedback(null);
      }, 1500);
    } catch {
      setImportFeedback('Error parsing CSV format. Please verify comma separation.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by SKU, name, barcode, or supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {hasPermission('edit_stock') && (
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Import CSV</span>
              </button>
            )}

            {hasPermission('edit_stock') && (
              <button
                onClick={onOpenAddProduct}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters dropdown row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1 text-slate-500 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low_stock">⚠️ Low Stock (Reorder)</option>
            <option value="out_of_stock">⛔ Out of Stock (0)</option>
            <option value="in_stock">✅ In Stock (Optimal)</option>
            <option value="overstocked">📦 Overstocked</option>
          </select>

          {/* Warehouse Facility Filter */}
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.name}>
                {wh.name}
              </option>
            ))}
          </select>

          {(selectedCategory !== 'all' ||
            selectedStatus !== 'all' ||
            selectedWarehouse !== 'all' ||
            searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedWarehouse('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-900">{products.length}</strong> catalog items
          </div>
          <div className="text-slate-400 text-[11px]">
            Click item row or eye button for full stock timeline
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
              <tr>
                <th
                  onClick={() => toggleSort('sku')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>SKU / Barcode</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>Product Name & Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('currentStock')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Stock Level</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('sellingPrice')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Cost / Selling</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3.5">Storage Location</th>
                <th className="py-3 px-3.5">Supplier</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    No products found matching the active search & filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const margin =
                    p.sellingPrice > 0
                      ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0)
                      : '0';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* SKU & Barcode */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600 block text-xs">
                          {p.sku}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.barcode}
                        </span>
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-3.5 max-w-xs">
                        <div
                          onClick={() => onSelectProduct(p.id)}
                          className="font-semibold text-slate-800 hover:text-blue-600 cursor-pointer line-clamp-1"
                        >
                          {p.name}
                        </div>
                        <span className="text-[11px] text-slate-500">{p.category}</span>
                      </td>

                      {/* Stock Level with progress bar */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">
                          {p.currentStock}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            {p.unit}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Min: {p.minStockLevel} | Max: {p.maxStockLevel}
                        </div>
                        {/* mini bar */}
                        <div className="w-20 ml-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              p.currentStock <= p.minStockLevel
                                ? 'bg-rose-500'
                                : p.currentStock > p.maxStockLevel
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                p.maxStockLevel > 0
                                  ? (p.currentStock / p.maxStockLevel) * 100
                                  : 0
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      {/* Pricing & Margin */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap font-mono">
                        <div className="font-semibold text-slate-800">
                          {settings.currencySymbol}
                          {p.sellingPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: {settings.currencySymbol}
                          {p.costPrice.toFixed(2)} ({margin}% mg)
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">
                          {p.location.aisle}-{p.location.bin}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-36">
                          {p.location.warehouse}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-3.5 text-slate-600 truncate max-w-32">
                        {p.supplierName}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                            p.status
                          )}`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onQuickAdjust(p)}
                            title="Quick Adjust Stock (+/-)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectProduct(p.id)}
                            title="View Full Item Details"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {hasPermission('edit_stock') && (
                            <button
                              onClick={() => onEditProduct(p)}
                              title="Edit Product"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {hasPermission('delete_items') && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete ${p.sku}?`
                                  )
                                ) {
                                  deleteProduct(p.id);
                                }
                              }}
                              title="Delete Product"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Bulk CSV Inventory Import
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Paste comma-separated data below. Header line format:
                <br />
                <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800 block mt-1">
                  SKU,Name,Category,Barcode,CostPrice,SellingPrice,InitialStock
                </code>
              </p>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`SKU,Name,Category,Barcode,CostPrice,SellingPrice,InitialStock\nTEST-001,"Industrial Ball Bearing","Hardware","890111222333",14.50,32.00,40\nTEST-002,"USB-C Industrial Cable","Electronics","890444555666",6.00,15.99,100`}
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              {importFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    importFeedback.includes('Successfully')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {importFeedback}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Parse & Import Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
