import React, { useState } from 'react';
import { Product } from '../types';
import { useInventory } from '../context/InventoryContext';
import { Barcode, Search, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products } = useInventory();
  const [code, setCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  if (!isOpen) return null;

  const handleScanOrSubmit = (val: string) => {
    const query = val.trim();
    if (!query) return;

    const match = products.find(
      (p) =>
        p.barcode === query ||
        p.sku.toLowerCase() === query.toLowerCase() ||
        p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      setScannedProduct(match);
      setNotFound(false);
    } else {
      setScannedProduct(null);
      setNotFound(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Barcode className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Barcode / SKU Terminal Scanner
              </h3>
              <p className="text-xs text-slate-500">Scan physical label or type SKU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Virtual laser scan simulation viewport */}
          <div className="relative h-28 bg-slate-900 rounded-xl flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-slate-700">
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
            <Barcode className="w-24 h-12 text-slate-600 mb-1" />
            <span className="text-xs font-mono text-slate-400">
              ALIGN BARCODE OR QR CODE IN FIELD
            </span>
          </div>

          {/* Input field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Barcode / SKU Input
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  handleScanOrSubmit(e.target.value);
                }}
                placeholder="Scan or enter barcode (e.g. 8901234567891 or ELEC-SENS-401)"
                className="w-full pl-9 pr-24 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => handleScanOrSubmit(code)}
                className="absolute right-1.5 top-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Lookup
              </button>
            </div>
          </div>

          {/* Quick scan chips from existing catalog */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Scan Samples (Click to test):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCode(p.barcode);
                    handleScanOrSubmit(p.barcode);
                  }}
                  className="px-2 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 transition-colors"
                >
                  {p.sku}
                </button>
              ))}
            </div>
          </div>

          {/* Matched product card */}
          {scannedProduct && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Item Verified in Warehouse</span>
                </div>
                <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-slate-700">
                  {scannedProduct.sku}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{scannedProduct.name}</p>
              <div className="text-xs text-slate-600 flex justify-between">
                <span>
                  Current Stock: <strong>{scannedProduct.currentStock} {scannedProduct.unit}</strong>
                </span>
                <span>
                  Location: <strong>{scannedProduct.location.aisle}-{scannedProduct.location.bin}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectProduct(scannedProduct);
                  onClose();
                }}
                className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 shadow-xs"
              >
                <span>Open Product Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {notFound && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center font-medium">
              No matching SKU or Barcode found in current inventory catalog.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
