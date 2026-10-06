import React, { useState, useEffect } from 'react';
import { Product, LocationDetail } from '../types';
import { useInventory } from '../context/InventoryContext';
import { X, Sparkles, AlertCircle } from 'lucide-react';

interface ProductFormModalProps {
  productToEdit?: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  productToEdit,
  isOpen,
  onClose,
}) => {
  const { addProduct, updateProduct, suppliers, warehouses, settings } = useInventory();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [barcode, setBarcode] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [maxStockLevel, setMaxStockLevel] = useState<number>(100);
  const [unit, setUnit] = useState('pcs');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [location, setLocation] = useState<LocationDetail>({
    warehouse: warehouses[0]?.name || 'Central Distribution Center',
    aisle: 'A-01',
    shelf: '01',
    bin: 'B-01',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setBarcode(productToEdit.barcode);
      setCostPrice(productToEdit.costPrice);
      setSellingPrice(productToEdit.sellingPrice);
      setCurrentStock(productToEdit.currentStock);
      setMinStockLevel(productToEdit.minStockLevel);
      setMaxStockLevel(productToEdit.maxStockLevel);
      setUnit(productToEdit.unit);
      setSupplierId(productToEdit.supplierId);
      setLocation(productToEdit.location);
    } else {
      // Default new product values
      generateNewSku('Electronics');
      setName('');
      setDescription('');
      setCategory('Electronics');
      generateBarcode();
      setCostPrice(25.0);
      setSellingPrice(49.99);
      setCurrentStock(20);
      setMinStockLevel(10);
      setMaxStockLevel(150);
      setUnit('pcs');
      if (suppliers.length > 0) setSupplierId(suppliers[0].id);
      if (warehouses.length > 0) {
        setLocation({
          warehouse: warehouses[0].name,
          aisle: 'A-01',
          shelf: '01',
          bin: 'B-01',
        });
      }
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const generateNewSku = (cat: string) => {
    const prefix = cat.slice(0, 4).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${randomNum}`);
  };

  const generateBarcode = () => {
    const randomCode = '890' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    setBarcode(randomCode);
  };

  const grossMargin =
    sellingPrice > 0 ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }

    if (!sku.trim()) {
      setError('SKU is required.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);
    const supplierName = selectedSupplier ? selectedSupplier.name : 'Unknown Supplier';

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        category,
        barcode: barcode.trim(),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minStockLevel: Number(minStockLevel),
        maxStockLevel: Number(maxStockLevel),
        unit,
        supplierId,
        supplierName,
        location,
      });
    } else {
      addProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim(),
        category,
        barcode: barcode.trim(),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        currentStock: Number(currentStock),
        minStockLevel: Number(minStockLevel),
        maxStockLevel: Number(maxStockLevel),
        unit,
        supplierId,
        supplierName,
        location,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-8">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {productToEdit ? 'Edit Product Item' : 'Register New Inventory Product'}
            </h3>
            <p className="text-xs text-slate-500">
              Enter SKU details, stock thresholds, pricing, and storage location
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Name and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Industrial Vibration Sensor"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (!productToEdit) generateNewSku(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Electronics">Electronics</option>
                <option value="Hardware & Tools">Hardware & Tools</option>
                <option value="Packaging & Storage">Packaging & Storage</option>
                <option value="Electronics & Sensors">Electronics & Sensors</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Safety Gear">Safety Gear</option>
              </select>
            </div>
          </div>

          {/* Row 2: SKU and Barcode with generator buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Stock Keeping Unit (SKU) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => generateNewSku(category)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Gen</span>
                </button>
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="ELEC-001"
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Barcode / UPC / EAN</label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center space-x-0.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gen EAN-13</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="8901234567890"
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical specifications, dimensions, packaging details..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Pricing & Profit Margin Preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase mb-2">
              Financial & Pricing Setup
            </div>
            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Unit Cost ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Selling Price ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block uppercase">Projected Margin</span>
                <span
                  className={`text-sm font-bold ${
                    Number(grossMargin) > 30 ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {grossMargin}%
                </span>
              </div>
            </div>
          </div>

          {/* Stock Levels & Unit */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase mb-2">
              Stock Thresholds & Quantities
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1" title="Alert trigger point">
                  Min Reorder
                </label>
                <input
                  type="number"
                  min="0"
                  value={minStockLevel}
                  onChange={(e) => setMinStockLevel(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={maxStockLevel}
                  onChange={(e) => setMaxStockLevel(parseInt(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Unit of Measure</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="pcs">pcs</option>
                  <option value="units">units</option>
                  <option value="boxes">boxes</option>
                  <option value="packs">packs</option>
                  <option value="rolls">rolls</option>
                  <option value="kg">kg</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supplier & Warehouse Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.leadTimeDays}d lead)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse Facility
              </label>
              <select
                value={location.warehouse}
                onChange={(e) => setLocation({ ...location, warehouse: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.name}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bin coordinates */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Aisle</label>
              <input
                type="text"
                placeholder="A-01"
                value={location.aisle}
                onChange={(e) => setLocation({ ...location, aisle: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Shelf</label>
              <input
                type="text"
                placeholder="02"
                value={location.shelf}
                onChange={(e) => setLocation({ ...location, shelf: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Bin / Slot</label>
              <input
                type="text"
                placeholder="B-04"
                value={location.bin}
                onChange={(e) => setLocation({ ...location, bin: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono uppercase"
              />
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              {productToEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
