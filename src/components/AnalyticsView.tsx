import React from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Boxes,
  PieChart,
  Warehouse,
  AlertTriangle,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const AnalyticsView: React.FC = () => {
  const { products, settings, warehouses } = useInventory();

  const totalCost = products.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
  const totalRetail = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const totalMargin =
    totalRetail > 0 ? (((totalRetail - totalCost) / totalRetail) * 100).toFixed(1) : '0';

  // Category breakdown
  const categoryMap = new Map<string, { count: number; totalCost: number; units: number }>();
  products.forEach((p) => {
    const existing = categoryMap.get(p.category) || { count: 0, totalCost: 0, units: 0 };
    existing.count += 1;
    existing.totalCost += p.currentStock * p.costPrice;
    existing.units += p.currentStock;
    categoryMap.set(p.category, existing);
  });

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    ...data,
    percentOfCost: totalCost > 0 ? (data.totalCost / totalCost) * 100 : 0,
  }));

  // Top 5 Highest Value Assets
  const topValueAssets = [...products]
    .sort((a, b) => b.currentStock * b.costPrice - a.currentStock * a.costPrice)
    .slice(0, 5);

  // Overstocked items
  const overstocked = products.filter((p) => p.status === 'overstocked');

  // Depleted items
  const outOfStock = products.filter((p) => p.status === 'out_of_stock');

  const handleExportFullReport = () => {
    const content = `INVENTORY VALUATION & EXECUTIVE REPORT
Date: ${new Date().toISOString()}
Company: ${settings.companyName}
Total Catalog SKUs: ${products.length}
Total Inventory Valuation (Cost): ${settings.currencySymbol}${totalCost.toFixed(2)}
Total Inventory Valuation (Retail): ${settings.currencySymbol}${totalRetail.toFixed(2)}
Estimated Gross Margin Potential: ${totalMargin}%

--- CATEGORY BREAKDOWN ---
${categoryBreakdown
  .map(
    (c) =>
      `${c.name}: ${c.count} SKUs | ${c.units} Units | ${settings.currencySymbol}${c.totalCost.toFixed(
        2
      )} (${c.percentOfCost.toFixed(1)}%)`
  )
  .join('\n')}

--- CRITICAL REORDER CANDIDATES ---
${products
  .filter((p) => p.currentStock <= p.minStockLevel)
  .map((p) => `${p.sku}: ${p.name} - Stock: ${p.currentStock}/${p.minStockLevel} (Supplier: ${p.supplierName})`)
  .join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_executive_report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">
              Inventory Valuation & Strategic Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Asset cost-basis breakdown, category concentration, and working capital insights
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Executive Report</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Capital Invested (Cost)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {settings.currencySymbol}
            {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Weighted purchase cost of inventory</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Projected Gross Retail Value
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {settings.currencySymbol}
            {totalRetail.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Margin Potential: {totalMargin}%
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Potential Profit Spread
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2 font-mono">
            {settings.currencySymbol}
            {(totalRetail - totalCost).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Realizable gross profit upon full turnover
          </p>
        </div>
      </div>

      {/* Grid: Category Breakdown & Top Value Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Capital Distribution by Category
            </h3>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {cat.name} ({cat.count} SKUs, {cat.units} units)
                  </span>
                  <span className="font-mono text-slate-600 font-semibold">
                    {settings.currencySymbol}
                    {cat.totalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{' '}
                    <span className="text-slate-400 font-normal">
                      ({cat.percentOfCost.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${cat.percentOfCost}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Capital Heavy Inventory SKUs */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <Boxes className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Top 5 Capital Investments (Asset Value)
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topValueAssets.map((p, idx) => {
              const itemTotalCost = p.currentStock * p.costPrice;
              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                      <span className="font-mono text-[11px] text-blue-600 font-medium">
                        {p.sku} • {p.currentStock} {p.unit} in stock
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-900">
                    {settings.currencySymbol}
                    {itemTotalCost.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overstocked & Depleted Warnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overstocked warning card */}
        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span>Overstocked Capital Risk ({overstocked.length} items)</span>
          </div>
          <p className="text-slate-600">
            Items exceeding maximum storage capacity limits can lead to trapped cash flow and storage overflow.
          </p>
          <div className="space-y-1">
            {overstocked.map((p) => (
              <div key={p.id} className="flex justify-between bg-white/70 p-2 rounded">
                <span className="font-medium text-slate-800">{p.name}</span>
                <span className="font-bold text-blue-800">
                  {p.currentStock} / {p.maxStockLevel} max
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock warning card */}
        <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-rose-900 font-bold">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Zero-Stock Fulfillment Blockers ({outOfStock.length} items)</span>
          </div>
          <p className="text-slate-600">
            Completely depleted inventory ready for immediate purchase order requisition.
          </p>
          <div className="space-y-1">
            {outOfStock.map((p) => (
              <div key={p.id} className="flex justify-between bg-white/70 p-2 rounded">
                <span className="font-medium text-slate-800">{p.name}</span>
                <span className="font-bold text-rose-700">0 {p.unit} remaining</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
