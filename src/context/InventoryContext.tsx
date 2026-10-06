import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Supplier,
  StockMovement,
  PurchaseOrder,
  WarehouseLocation,
  SystemSettings,
  StockStatus,
  MovementType,
  POStatus,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SUPPLIERS,
  INITIAL_MOVEMENTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_WAREHOUSES,
  INITIAL_SETTINGS,
} from '../data/mockData';
import { useAuth } from './AuthContext';

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  movements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  warehouses: WarehouseLocation[];
  settings: SystemSettings;
  addProduct: (product: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    delta: number,
    type: MovementType,
    reason: string,
    referenceNo?: string
  ) => boolean;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => string;
  updatePurchaseOrderStatus: (id: string, status: POStatus) => void;
  receivePurchaseOrder: (id: string) => boolean;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllDataToDemo: () => void;
  getProductById: (id: string) => Product | undefined;
}

const STORAGE_PRODUCTS_KEY = 'aim_inventory_products';
const STORAGE_SUPPLIERS_KEY = 'aim_inventory_suppliers';
const STORAGE_MOVEMENTS_KEY = 'aim_inventory_movements';
const STORAGE_PO_KEY = 'aim_inventory_purchase_orders';
const STORAGE_WAREHOUSES_KEY = 'aim_inventory_warehouses';
const STORAGE_SETTINGS_KEY = 'aim_inventory_settings';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function computeStockStatus(
  current: number,
  min: number,
  max: number
): StockStatus {
  if (current <= 0) return 'out_of_stock';
  if (current <= min) return 'low_stock';
  if (current > max && max > 0) return 'overstocked';
  return 'in_stock';
}

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MOVEMENTS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PO_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
    } catch {
      return INITIAL_PURCHASE_ORDERS;
    }
  });

  const [warehouses] = useState<WarehouseLocation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WAREHOUSES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(suppliers));
    } catch (e) {
      console.warn(e);
    }
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_MOVEMENTS_KEY, JSON.stringify(movements));
    } catch (e) {
      console.warn(e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PO_KEY, JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn(e);
    }
  }, [purchaseOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  const addProduct = (
    productData: Omit<Product, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const status = computeStockStatus(
      productData.currentStock,
      productData.minStockLevel,
      productData.maxStockLevel
    );

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now().toString(36)}`,
      status,
      createdAt: now,
      updatedAt: now,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Log initial stock creation if > 0
    if (newProduct.currentStock > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now().toString(36)}`,
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        delta: newProduct.currentStock,
        previousStock: 0,
        newStock: newProduct.currentStock,
        type: 'restock',
        reason: 'Initial Product Stock Entry',
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        referenceNo: 'INIT-STOCK',
      };
      setMovements((prev) => [movement, ...prev]);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const updated = { ...prod, ...updates, updatedAt: now };
        updated.status = computeStockStatus(
          updated.currentStock,
          updated.minStockLevel,
          updated.maxStockLevel
        );
        return updated;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (
    productId: string,
    delta: number,
    type: MovementType,
    reason: string,
    referenceNo?: string
  ): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const previousStock = product.currentStock;
    const newStock = previousStock + delta;

    if (newStock < 0 && !settings.allowNegativeInventory) {
      return false; // Prevent negative stock if disabled in settings
    }

    const now = new Date().toISOString();
    const newStatus = computeStockStatus(
      newStock,
      product.minStockLevel,
      product.maxStockLevel
    );

    // Update product
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              currentStock: newStock,
              status: newStatus,
              updatedAt: now,
            }
          : p
      )
    );

    // Create movement audit trail
    const movement: StockMovement = {
      id: `mov-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      delta,
      previousStock,
      newStock,
      type,
      reason,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      referenceNo: referenceNo || `ADJ-${Date.now().toString().slice(-5)}`,
    };

    setMovements((prev) => [movement, ...prev]);
    return true;
  };

  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>
  ): string => {
    const count = purchaseOrders.length + 1;
    const orderNumber = `PO-2026-${String(count).padStart(3, '0')}`;
    const id = `po-${Date.now().toString(36)}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id,
      orderNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    return id;
  };

  const updatePurchaseOrderStatus = (id: string, status: POStatus) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, status } : po))
    );
  };

  const receivePurchaseOrder = (id: string): boolean => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po || po.status === 'received') return false;

    const now = new Date().toISOString();

    // Mark PO received
    setPurchaseOrders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'received', receivedAt: now } : p
      )
    );

    // Auto-restock each line item
    po.items.forEach((item) => {
      adjustStock(
        item.productId,
        item.quantity,
        'restock',
        `Received against PO ${po.orderNumber} from ${po.supplierName}`,
        po.orderNumber
      );
    });

    return true;
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now().toString(36)}`,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllDataToDemo = () => {
    setProducts(INITIAL_PRODUCTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setMovements(INITIAL_MOVEMENTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        suppliers,
        movements,
        purchaseOrders,
        warehouses,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        receivePurchaseOrder,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        updateSettings,
        resetAllDataToDemo,
        getProductById,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
