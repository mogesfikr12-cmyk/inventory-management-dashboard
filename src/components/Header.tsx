import React, { useState } from 'react';
import {
  Boxes,
  Bell,
  Search,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  Plus,
  AlertTriangle,
  Barcode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

interface HeaderProps {
  onOpenAddProduct: () => void;
  onOpenQuickScan: () => void;
  onSelectProduct: (productId: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddProduct,
  onOpenQuickScan,
  onSelectProduct,
  setActiveTab,
}) => {
  const { currentUser, users, switchUser, hasPermission } = useAuth();
  const { products, settings } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Low stock alerts
  const lowStockProducts = products.filter(
    (p) => p.status === 'low_stock' || p.status === 'out_of_stock'
  );

  // Global search filtering
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery)
        )
        .slice(0, 6)
    : [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                {settings.companyName || 'StockPilot IMS'}
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Live Ops
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Central Real-Time Inventory & Warehouse Controls
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Quick search by SKU, product name, or barcode..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && searchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Matching Inventory ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No matching SKU or product found.
                </div>
              ) : (
                searchResults.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod.id);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50/60 flex items-center justify-between border-b border-slate-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{prod.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <span className="font-mono font-medium text-blue-600">{prod.sku}</span>
                        <span>•</span>
                        <span>{prod.category}</span>
                        <span>•</span>
                        <span>{prod.location.warehouse}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          prod.currentStock <= prod.minStockLevel
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {prod.currentStock} {prod.unit}
                      </span>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {settings.currencySymbol}
                        {prod.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Scanner Action */}
          <button
            onClick={onOpenQuickScan}
            title="Scan Barcode / QR"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Barcode className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Scan SKU</span>
          </button>

          {/* Add Product Button (Managers/Admins) */}
          {hasPermission('edit_stock') && (
            <button
              onClick={onOpenAddProduct}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}

          {/* Notifications / Alerts Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Stock Alerts"
            >
              <Bell className="w-5 h-5" />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {/* Notification Flyout */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-sm text-slate-800">
                      Inventory Alerts ({lowStockProducts.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setShowNotifications(false);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View in Catalog
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {lowStockProducts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-500">
                      🎉 All stock items are within healthy operating levels!
                    </div>
                  ) : (
                    lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p.id);
                          setShowNotifications(false);
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-start justify-between"
                      >
                        <div className="pr-2">
                          <p className="text-xs font-semibold text-slate-800">{p.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">SKU: {p.sku}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Loc: {p.location.aisle}-{p.location.shelf} ({p.location.warehouse})
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-md ${
                              p.currentStock === 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.currentStock === 0 ? 'Depleted (0)' : `${p.currentStock} left`}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Min target: {p.minStockLevel}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs ring-2 ring-blue-100">
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.2 text-[10px] font-bold uppercase rounded border ${getRoleBadge(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md border ${getRoleBadge(
                        currentUser.role
                      )}`}
                    >
                      {currentUser.role} Role
                    </span>
                    <span className="text-[11px] text-slate-500">{currentUser.department}</span>
                  </div>
                </div>

                {/* Quick Role Switcher for Testing & Admin Controls */}
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Switch User / Role Profile:
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-600 text-white font-medium shadow-xs'
                            : 'hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{u.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            u.id === currentUser.id
                              ? 'bg-blue-700 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {u.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setActiveTab('admin');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <Shield className="w-4 h-4 mr-2 text-purple-600" />
                      Admin Control Center
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Switch to first staff member or reset
                      switchUser(users.find((u) => u.role === 'staff')?.id || users[0].id);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2 text-slate-400" />
                    Switch to Staff View
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
