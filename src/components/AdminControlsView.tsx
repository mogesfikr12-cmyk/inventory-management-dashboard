import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Settings as SettingsIcon,
  RotateCcw,
  Plus,
  Check,
  AlertTriangle,
  Lock,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { Role } from '../types';

export const AdminControlsView: React.FC = () => {
  const { currentUser, users, updateUserRole, toggleUserActive, addUser } = useAuth();
  const { settings, updateSettings, resetAllDataToDemo } = useInventory();

  // Settings form
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [allowNegative, setAllowNegative] = useState(settings.allowNegativeInventory);
  const [autoReorder, setAutoReorder] = useState(settings.autoReorderEnabled);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Add User modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('staff');
  const [newDept, setNewDept] = useState('Warehouse Fulfillment');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      currencySymbol,
      taxRate: Number(taxRate),
      allowNegativeInventory: allowNegative,
      autoReorderEnabled: autoReorder,
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addUser({
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      department: newDept,
      isActive: true,
    });

    setShowAddUserModal(false);
    setNewName('');
    setNewEmail('');
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Are you sure you want to restore the inventory database to demo initial state? This resets all products, movements, and POs.'
      )
    ) {
      resetAllDataToDemo();
      alert('Database restored to default demo state.');
    }
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-800">
              Administrative Operations & Access Control
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system parameters, role-based access control (RBAC), and user permissions
          </p>
        </div>

        {!isAdmin && (
          <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center space-x-1.5 font-medium">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Viewing as {currentUser.role}. Switch to Admin for full edit controls.</span>
          </div>
        )}
      </div>

      {/* RBAC Team Directory */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Staff & Role Management ({users.length})
            </h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team Member</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Team Member</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Access Role</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{u.name}</div>
                    <span className="font-mono text-[11px] text-slate-400">{u.email}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{u.department}</td>
                  <td className="py-2.5 px-3">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded font-bold capitalize bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-bold capitalize bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        u.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {isAdmin && u.id !== currentUser.id && (
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Role Permissions Reference Table */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="font-bold text-slate-700 uppercase mb-2">
            Role Permission Matrix
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-purple-700 block mb-1">Admin</span>
              <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                <li>Full CRUD on all products</li>
                <li>User role & account management</li>
                <li>System configurations & pricing</li>
                <li>Approve and receive shipments</li>
              </ul>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-blue-700 block mb-1">Manager</span>
              <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                <li>Create & edit products</li>
                <li>Create purchase orders (PO)</li>
                <li>Perform physical count audits</li>
                <li>Receive shipments & restock</li>
              </ul>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Warehouse Staff</span>
              <ul className="space-y-0.5 text-[11px] list-disc list-inside">
                <li>Log stock adjustments (+/-)</li>
                <li>Scan barcode/SKU verification</li>
                <li>View inventory levels & locations</li>
                <li>Receive inbound shipments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings Form */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Operational Parameters & Accounting Configuration
          </h3>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={companyName}
                disabled={!isAdmin}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                disabled={!isAdmin}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Standard Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                disabled={!isAdmin}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegative}
                disabled={!isAdmin}
                onChange={(e) => setAllowNegative(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Allow Negative Inventory Quantities
                </span>
                <span className="text-slate-500 text-[11px]">
                  Permit sales issuance even when physical count is recorded as 0.
                </span>
              </div>
            </label>

            <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReorder}
                disabled={!isAdmin}
                onChange={(e) => setAutoReorder(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Automatic Draft PO Reorder Trigger
                </span>
                <span className="text-slate-500 text-[11px]">
                  Generate draft purchase order when SKU stock falls below min threshold.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {savedSettingsNotice ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Settings updated successfully!
              </span>
            ) : (
              <span />
            )}

            {isAdmin && (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Save Settings
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Danger Zone / Reset */}
      <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-200 space-y-3">
        <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Database Administration & Reset</span>
        </div>
        <p className="text-xs text-rose-700">
          Restore initial seeded mock database (products, suppliers, warehouses, movement logs). All changes and customized entries will be refreshed.
        </p>
        <button
          onClick={handleResetData}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All to Default Seed Data</span>
        </button>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800">Add Team Member</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Jordan Miller"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="jordan.miller@inventory.corp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Department
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Fulfillment & Dispatch"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Permission Level
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="staff">Staff (Log moves, receive orders, scan)</option>
                  <option value="manager">Manager (Create POs, audit recounts, add SKUs)</option>
                  <option value="admin">Admin (Full administrative & security access)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
