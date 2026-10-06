import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductCatalog } from './components/ProductCatalog';
import { StockMovementsView } from './components/StockMovementsView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { SuppliersView } from './components/SuppliersView';
import { AnalyticsView } from './components/AnalyticsView';
import { AdminControlsView } from './components/AdminControlsView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductFormModal } from './components/ProductFormModal';
import { QuickAdjustModal } from './components/QuickAdjustModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { Product } from './types';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ClipboardList,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { getProductById } = useInventory();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productToQuickAdjust, setProductToQuickAdjust] = useState<Product | null>(null);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) || null : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Application Header */}
      <Header
        onOpenAddProduct={() => {
          setProductToEdit(null);
          setIsAddProductOpen(true);
        }}
        onOpenQuickScan={() => setIsQuickScanOpen(true)}
        onSelectProduct={(id) => setSelectedProductId(id)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Mobile Top Navigation Strip */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-2 flex items-center justify-between border-b border-slate-800">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 capitalize">
          {activeTab}
        </span>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Mobile Slide-out Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-slate-900 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main View Port */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onSelectProduct={(id) => setSelectedProductId(id)}
              onQuickAdjust={(p) => setProductToQuickAdjust(p)}
              onOpenAddProduct={() => {
                setProductToEdit(null);
                setIsAddProductOpen(true);
              }}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'products' && (
            <ProductCatalog
              onSelectProduct={(id) => setSelectedProductId(id)}
              onEditProduct={(p) => {
                setProductToEdit(p);
                setIsAddProductOpen(true);
              }}
              onQuickAdjust={(p) => setProductToQuickAdjust(p)}
              onOpenAddProduct={() => {
                setProductToEdit(null);
                setIsAddProductOpen(true);
              }}
            />
          )}

          {activeTab === 'movements' && <StockMovementsView />}

          {activeTab === 'orders' && <PurchaseOrdersView />}

          {activeTab === 'suppliers' && <SuppliersView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'admin' && <AdminControlsView />}
        </main>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="md:hidden bg-white border-t border-slate-200 grid grid-cols-5 py-1 z-20">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 text-[10px] ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center py-1 text-[10px] ${
            activeTab === 'products' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Package className="w-4 h-4 mb-0.5" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`flex flex-col items-center py-1 text-[10px] ${
            activeTab === 'movements' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 mb-0.5" />
          <span>Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center py-1 text-[10px] ${
            activeTab === 'orders' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ClipboardList className="w-4 h-4 mb-0.5" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center py-1 text-[10px] ${
            activeTab === 'admin' ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </button>
      </div>

      {/* Modal: Product Detailed View */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
          onEdit={(prod) => {
            setSelectedProductId(null);
            setProductToEdit(prod);
            setIsAddProductOpen(true);
          }}
          onQuickAdjust={(prod) => {
            setSelectedProductId(null);
            setProductToQuickAdjust(prod);
          }}
        />
      )}

      {/* Modal: Add or Edit Product */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsAddProductOpen(false);
          setProductToEdit(null);
        }}
      />

      {/* Modal: Quick Stock Adjustment (+/-) */}
      <QuickAdjustModal
        product={productToQuickAdjust}
        onClose={() => setProductToQuickAdjust(null)}
      />

      {/* Modal: Barcode / SKU Terminal Scan */}
      <BarcodeScannerModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
        onSelectProduct={(p) => {
          setSelectedProductId(p.id);
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <DashboardContent />
      </InventoryProvider>
    </AuthProvider>
  );
}

export default App;
