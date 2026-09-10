import { z } from "zod";

export type InventoryCategory = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  tinNumber?: string;
  isActive: boolean;
  createdAt: string;
};

export type InventoryItem = {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  supplierId?: string;
  supplierName?: string;
  unit: string;
  quantityOnHand: number;
  minimumStockLevel: number;
  reorderLevel: number;
  purchasePrice: number;
  costPerUnit?: number;
  storageLocation: string;
  batchNumber?: string;
  lotNumber?: string;
  expiryDate?: string;
  stockReceived: number;
  stockIssued: number;
  stockAdjustment: number;
  stockTransfer: number;
  fefoPolicy: "FIFO" | "FEFO";
  stockStatus: "healthy" | "low" | "critical" | "expired";
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName?: string;
  status: "Draft" | "Ordered" | "Received" | "Closed";
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
};

export type StockTransactionType =
  | "stock_received"
  | "stock_issued"
  | "stock_adjustment"
  | "stock_transfer"
  | "expiry"
  | "recount";

export type StockTransaction = {
  id: string;
  inventoryItemId: string;
  transactionType: StockTransactionType;
  quantity: number;
  balanceAfter: number;
  transactionDate: string;
  batchNumber?: string;
  lotNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  referenceType?: string;
  referenceId?: string;
  remarks?: string;
  createdBy: string;
};

export type InventoryAlert = {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: "low_stock" | "expiry";
  severity: "low" | "medium" | "high";
  message: string;
  createdAt: string;
};

export const inventoryCategoriesSeed: InventoryCategory[] = [
  { id: "cat-lab-supplies", name: "Lab Supplies", description: "General consumables and disposables", createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "cat-molecular", name: "Molecular Diagnostics", description: "PCR and molecular reagents", createdAt: "2026-08-01T00:00:00.000Z" },
  { id: "cat-chemistry", name: "Chemistry Reagents", description: "Chemistry and analyzer reagents", createdAt: "2026-08-01T00:00:00.000Z" },
];

export const suppliersSeed: Supplier[] = [
  {
    id: "sup-med-supply",
    name: "MedSupply Ltd.",
    contactPerson: "Adebayo Joseph",
    phone: "+2348000001111",
    email: "ops@medsupply.example",
    address: "Plot 21, Lekki Phase 1",
    tinNumber: "TIN-001",
    isActive: true,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "sup-bioquest",
    name: "BioQuest Diagnostics",
    contactPerson: "Grace Jide",
    phone: "+2348000002222",
    email: "sales@bioquest.example",
    address: "Ikeja, Lagos",
    tinNumber: "TIN-002",
    isActive: true,
    createdAt: "2026-08-01T00:00:00.000Z",
  },
];

export const inventoryItemsSeed: InventoryItem[] = [
  {
    id: "inv-001",
    itemCode: "RGT-001",
    name: "EDTA tubes",
    categoryId: "cat-lab-supplies",
    categoryName: "Lab Supplies",
    supplierId: "sup-med-supply",
    supplierName: "MedSupply Ltd.",
    unit: "box",
    quantityOnHand: 12,
    minimumStockLevel: 25,
    reorderLevel: 50,
    purchasePrice: 8.5,
    costPerUnit: 8.5,
    storageLocation: "Store A",
    batchNumber: "EDTA-2026-01",
    lotNumber: "LOT-EDTA-001",
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    stockReceived: 120,
    stockIssued: 108,
    stockAdjustment: 0,
    stockTransfer: 0,
    fefoPolicy: "FEFO",
    stockStatus: "low",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "inv-002",
    itemCode: "RGT-002",
    name: "PCR Kit",
    categoryId: "cat-molecular",
    categoryName: "Molecular Diagnostics",
    supplierId: "sup-bioquest",
    supplierName: "BioQuest Diagnostics",
    unit: "kit",
    quantityOnHand: 18,
    minimumStockLevel: 8,
    reorderLevel: 15,
    purchasePrice: 45,
    costPerUnit: 45,
    storageLocation: "Freezer -20C",
    batchNumber: "PCR-2026-01",
    lotNumber: "LOT-PCR-001",
    expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    stockReceived: 40,
    stockIssued: 22,
    stockAdjustment: 0,
    stockTransfer: 0,
    fefoPolicy: "FEFO",
    stockStatus: "healthy",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

export const purchaseOrdersSeed: PurchaseOrder[] = [
  {
    id: "po-001",
    poNumber: "PO-1001",
    supplierId: "sup-bioquest",
    supplierName: "BioQuest Diagnostics",
    status: "Received",
    expectedDate: "2026-08-20T00:00:00.000Z",
    receivedDate: "2026-08-18T00:00:00.000Z",
    notes: "PCR kits with batch tracking",
    createdBy: "inventory-manager",
    createdAt: "2026-08-15T00:00:00.000Z",
  },
];

export const stockLedgerSeed: StockTransaction[] = [
  {
    id: "txn-001",
    inventoryItemId: "inv-001",
    transactionType: "stock_received",
    quantity: 120,
    balanceAfter: 120,
    transactionDate: "2026-08-01T00:00:00.000Z",
    batchNumber: "EDTA-2026-01",
    lotNumber: "LOT-EDTA-001",
    expiryDate: "2026-12-31T00:00:00.000Z",
    unitCost: 8.5,
    referenceType: "purchase_order",
    referenceId: "PO-1001",
    remarks: "Initial stock receipt",
    createdBy: "inventory-manager",
  },
  {
    id: "txn-002",
    inventoryItemId: "inv-001",
    transactionType: "stock_issued",
    quantity: -108,
    balanceAfter: 12,
    transactionDate: new Date().toISOString(),
    batchNumber: "EDTA-2026-01",
    lotNumber: "LOT-EDTA-001",
    expiryDate: "2026-12-31T00:00:00.000Z",
    referenceType: "sample_run",
    referenceId: "RUN-101",
    remarks: "Issued to sample processing",
    createdBy: "lab-technician",
  },
];

export const inventoryAlertsSeed: InventoryAlert[] = [];

export const inventoryCategorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  tinNumber: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const inventoryItemSchema = z.object({
  itemCode: z.string().min(2, "Item code is required"),
  name: z.string().min(2, "Item name is required"),
  categoryId: z.string().min(1, "Category is required"),
  supplierId: z.string().optional(),
  unit: z.string().min(1, "Unit is required"),
  quantityOnHand: z.number().nonnegative(),
  minimumStockLevel: z.number().nonnegative(),
  reorderLevel: z.number().nonnegative(),
  purchasePrice: z.number().nonnegative().default(0),
  costPerUnit: z.number().nonnegative().optional(),
  storageLocation: z.string().min(2, "Storage location is required"),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  stockReceived: z.number().nonnegative().default(0),
  stockIssued: z.number().nonnegative().default(0),
  stockAdjustment: z.number().default(0),
  stockTransfer: z.number().default(0),
  fefoPolicy: z.enum(["FIFO", "FEFO"]).default("FEFO"),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  status: z.enum(["Draft", "Ordered", "Received", "Closed"]).default("Draft"),
  expectedDate: z.string().optional(),
  receivedDate: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().min(1, "Created by is required"),
});

export const stockTransactionSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item is required"),
  transactionType: z.enum(["stock_received", "stock_issued", "stock_adjustment", "stock_transfer", "expiry", "recount"]),
  quantity: z.number(),
  transactionDate: z.string().optional(),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  unitCost: z.number().nonnegative().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  remarks: z.string().optional(),
  createdBy: z.string().min(1, "Created by is required"),
});

export function getInventoryItemById(id: string) {
  return inventoryItemsSeed.find((item) => item.id === id) ?? null;
}

export function getCategoryById(id: string) {
  return inventoryCategoriesSeed.find((category) => category.id === id) ?? null;
}

export function getSupplierById(id: string) {
  return suppliersSeed.find((supplier) => supplier.id === id) ?? null;
}

export function getInventorySummary() {
  const totalItems = inventoryItemsSeed.length;
  const lowStock = inventoryItemsSeed.filter((item) => item.quantityOnHand <= item.minimumStockLevel).length;
  const expiringSoon = getExpiryAlerts().length;
  const stockValue = inventoryItemsSeed.reduce((sum, item) => sum + item.quantityOnHand * (item.purchasePrice ?? item.costPerUnit ?? 0), 0);

  return { totalItems, lowStock, expiringSoon, stockValue };
}

export function getLowStockAlerts(): InventoryAlert[] {
  const alerts: InventoryAlert[] = inventoryItemsSeed
    .filter((item) => item.quantityOnHand <= item.minimumStockLevel)
    .map((item) => ({
      id: `alert-${item.id}`,
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      type: "low_stock",
      severity: item.quantityOnHand <= item.reorderLevel / 2 ? "high" : "medium",
      message: `${item.name} is below minimum stock level (${item.quantityOnHand} remaining)`,
      createdAt: new Date().toISOString(),
    }));

  return alerts;
}

export function getExpiryAlerts(): InventoryAlert[] {
  const now = Date.now();
  const alerts: InventoryAlert[] = inventoryItemsSeed
    .filter((item) => {
      if (!item.expiryDate) return false;
      const expiry = new Date(item.expiryDate).getTime();
      return expiry > now && expiry <= now + 45 * 24 * 60 * 60 * 1000;
    })
    .map((item) => ({
      id: `expiry-${item.id}`,
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.name,
      type: "expiry",
      severity: new Date(item.expiryDate ?? Date.now()).getTime() <= now + 14 * 24 * 60 * 60 * 1000 ? "high" : "medium",
      message: `${item.name} expires on ${new Date(item.expiryDate ?? Date.now()).toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
    }));

  return alerts;
}

export function createInventoryItem(input: unknown): InventoryItem {
  const parsed = inventoryItemSchema.parse(input);
  const now = new Date().toISOString();

  const price = parsed.purchasePrice ?? parsed.costPerUnit ?? 0;

  const item: InventoryItem = {
    id: `inv-${Date.now()}`,
    itemCode: parsed.itemCode,
    name: parsed.name,
    categoryId: parsed.categoryId,
    supplierId: parsed.supplierId,
    unit: parsed.unit,
    quantityOnHand: parsed.quantityOnHand,
    minimumStockLevel: parsed.minimumStockLevel,
    reorderLevel: parsed.reorderLevel,
    purchasePrice: price,
    costPerUnit: price,
    storageLocation: parsed.storageLocation,
    batchNumber: parsed.batchNumber,
    lotNumber: parsed.lotNumber,
    expiryDate: parsed.expiryDate,
    stockReceived: parsed.stockReceived,
    stockIssued: parsed.stockIssued,
    stockAdjustment: parsed.stockAdjustment,
    stockTransfer: parsed.stockTransfer,
    fefoPolicy: parsed.fefoPolicy,
    stockStatus: parsed.quantityOnHand <= parsed.minimumStockLevel ? "low" : "healthy",
    createdAt: now,
    updatedAt: now,
  };

  inventoryItemsSeed.unshift(item);
  return item;
}

export function createSupplier(input: unknown): Supplier {
  const parsed = supplierSchema.parse(input);
  const supplier: Supplier = {
    id: `sup-${Date.now()}`,
    name: parsed.name,
    contactPerson: parsed.contactPerson,
    phone: parsed.phone,
    email: parsed.email || undefined,
    address: parsed.address,
    tinNumber: parsed.tinNumber,
    isActive: parsed.isActive,
    createdAt: new Date().toISOString(),
  };

  suppliersSeed.unshift(supplier);
  return supplier;
}

export function createPurchaseOrder(input: unknown): PurchaseOrder {
  const parsed = purchaseOrderSchema.parse(input);
  const po: PurchaseOrder = {
    id: `po-${Date.now()}`,
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    supplierId: parsed.supplierId,
    supplierName: getSupplierById(parsed.supplierId)?.name,
    status: parsed.status,
    expectedDate: parsed.expectedDate,
    receivedDate: parsed.receivedDate,
    notes: parsed.notes,
    createdBy: parsed.createdBy,
    createdAt: new Date().toISOString(),
  };

  purchaseOrdersSeed.unshift(po);
  return po;
}

export function createStockTransaction(input: unknown): StockTransaction {
  const parsed = stockTransactionSchema.parse(input);
  const currentItem = getInventoryItemById(parsed.inventoryItemId);

  if (!currentItem) {
    throw new Error("Inventory item not found");
  }

  const myDate = parsed.transactionDate ?? new Date().toISOString();
  const quantity = Number(parsed.quantity ?? 0);

  if (parsed.transactionType === "stock_issued" && quantity <= 0) {
    throw new Error("Issued stock quantity must be greater than zero");
  }

  if (parsed.transactionType === "stock_issued" && quantity > currentItem.quantityOnHand) {
    throw new Error("Insufficient stock for issuance");
  }

  const updatedBalance = parsed.transactionType === "stock_issued"
    ? currentItem.quantityOnHand - quantity
    : currentItem.quantityOnHand + quantity;

  const ledgerQuantity = parsed.transactionType === "stock_issued" ? -quantity : quantity;

  const transaction: StockTransaction = {
    id: `txn-${Date.now()}`,
    inventoryItemId: parsed.inventoryItemId,
    transactionType: parsed.transactionType,
    quantity: ledgerQuantity,
    balanceAfter: updatedBalance,
    transactionDate: myDate,
    batchNumber: parsed.batchNumber ?? currentItem.batchNumber,
    lotNumber: parsed.lotNumber ?? currentItem.lotNumber,
    expiryDate: parsed.expiryDate ?? currentItem.expiryDate,
    unitCost: parsed.unitCost ?? currentItem.purchasePrice,
    referenceType: parsed.referenceType,
    referenceId: parsed.referenceId,
    remarks: parsed.remarks,
    createdBy: parsed.createdBy,
  };

  stockLedgerSeed.unshift(transaction);
  currentItem.quantityOnHand = Math.max(0, updatedBalance);
  currentItem.updatedAt = myDate;
  currentItem.stockReceived = parsed.transactionType === "stock_received" ? currentItem.stockReceived + Math.max(quantity, 0) : currentItem.stockReceived;
  currentItem.stockIssued = parsed.transactionType === "stock_issued" ? currentItem.stockIssued + Math.max(0, quantity) : currentItem.stockIssued;
  currentItem.stockAdjustment = parsed.transactionType === "stock_adjustment" ? currentItem.stockAdjustment + quantity : currentItem.stockAdjustment;
  currentItem.stockTransfer = parsed.transactionType === "stock_transfer" ? currentItem.stockTransfer + Math.abs(quantity) : currentItem.stockTransfer;
  currentItem.stockStatus = currentItem.quantityOnHand <= currentItem.minimumStockLevel ? "low" : "healthy";
  currentItem.fefoPolicy = currentItem.fefoPolicy || "FEFO";

  return transaction;
}

export function getStockLedger(itemId: string) {
  return stockLedgerSeed.filter((entry) => entry.inventoryItemId === itemId).sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

export function getInventoryItems() {
  return inventoryItemsSeed;
}

export function getSuppliers() {
  return suppliersSeed;
}

export function getPurchaseOrders() {
  return purchaseOrdersSeed;
}

export function getInventoryDashboard() {
  const summary = getInventorySummary();
  return {
    summary,
    alerts: [...getLowStockAlerts(), ...getExpiryAlerts()],
    items: inventoryItemsSeed.map((item) => ({
      id: item.id,
      itemCode: item.itemCode,
      name: item.name,
      stock: item.quantityOnHand,
      minimumStockLevel: item.minimumStockLevel,
      supplier: item.supplierName ?? "N/A",
      storageLocation: item.storageLocation,
      expiryDate: item.expiryDate,
      stockStatus: item.stockStatus,
    })),
  };
}

export function getInventoryReports() {
  return {
    lowStock: getLowStockAlerts(),
    expiringSoon: getExpiryAlerts(),
    ledger: stockLedgerSeed,
    inventory: inventoryItemsSeed,
  };
}

export function getTransactionHistory() {
  return stockLedgerSeed;
}

export function createInventoryCategory(input: unknown) {
  const parsed = inventoryCategorySchema.parse(input);
  const category: InventoryCategory = {
    id: `cat-${Date.now()}`,
    name: parsed.name,
    description: parsed.description,
    createdAt: new Date().toISOString(),
  };

  inventoryCategoriesSeed.unshift(category);
  return category;
}

export function getInventoryCategories() {
  return inventoryCategoriesSeed;
}

export function getInventoryDetails() {
  return {
    categories: inventoryCategoriesSeed,
    items: inventoryItemsSeed,
    suppliers: suppliersSeed,
    purchaseOrders: purchaseOrdersSeed,
    transactionHistory: stockLedgerSeed,
    alerts: [...getLowStockAlerts(), ...getExpiryAlerts()],
  };
}
