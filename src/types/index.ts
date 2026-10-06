export type Role = 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';

export interface LocationDetail {
  warehouse: string;
  aisle: string;
  shelf: string;
  bin: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStockLevel: number; // reorder trigger threshold
  maxStockLevel: number;
  location: LocationDetail;
  supplierId: string;
  supplierName: string;
  unit: string; // e.g. "pcs", "boxes", "kg", "units"
  status: StockStatus;
  createdAt: string;
  updatedAt: string;
}

export type MovementType =
  | 'restock'
  | 'sale'
  | 'damaged'
  | 'audit_recount'
  | 'transfer'
  | 'return';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  delta: number; // positive or negative
  previousStock: number;
  newStock: number;
  type: MovementType;
  reason: string;
  timestamp: string;
  userId: string;
  userName: string;
  referenceNo?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  leadTimeDays: number;
  rating: number; // 1-5
}

export type POStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface POItem {
  productId: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: POItem[];
  status: POStatus;
  totalAmount: number;
  createdAt: string;
  expectedDeliveryDate: string;
  receivedAt?: string;
  notes?: string;
  createdBy: string;
}

export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  city: string;
  capacity: number;
  currentOccupancy: number;
}

export interface SystemSettings {
  companyName: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  autoReorderEnabled: boolean;
  lowStockNotificationThresholdDays: number;
  allowNegativeInventory: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
}
