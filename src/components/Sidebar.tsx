import React from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ClipboardList,
  Building2,
  BarChart3,
  ShieldCheck,
  Warehouse,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useAuth();
  const { products } = useInventory();

  const lowStockCount = products.filter(
    (p) => p.status === 'low_stock' || p.status === 'out_of_stock'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'products',
      label: 'Inventory Catalog',
      icon: Package,
      badge: products.length,
      badgeColor: 'bg-slate-200 text-slate-700',
    },
    {
      id: 'movements',
      label: 'Stock Audit & Logs',
      icon: ArrowLeftRight,
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: ClipboardList,
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Building2,
    },
    {
      id: 'analytics',
      label: 'Valuation & Analytics',
      icon: BarChart3,
    },
    {
      id: 'admin',
      label: 'Admin & Team Controls',
      icon: ShieldCheck,
      restricted: false,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Warehouse Status Widget at bottom */}
      <div className="p-3 m-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Warehouse className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">
              Fulfillment Health
            </span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 space-y-1.5">
          <div className="flex justify-between">
            <span>Catalog Items:</span>
            <span className="font-semibold text-white">{products.length} SKUs</span>
          </div>
          <div className="flex justify-between">
            <span>Critical Restocks:</span>
            <span className={`font-semibold ${lowStockCount > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
              {lowStockCount} items
            </span>
          </div>
          <div className="flex justify-between">
            <span>Access Permission:</span>
            <span className="font-semibold text-blue-300 capitalize">
              {currentUser.role}
            </span>
          </div>
        </div>

        {lowStockCount > 0 && (
          <button
            onClick={() => setActiveTab('products')}
            className="mt-2.5 w-full py-1 text-center bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Review {lowStockCount} Low Stock</span>
          </button>
        )}
      </div>
    </aside>
  );
};
