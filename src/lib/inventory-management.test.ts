import { describe, expect, it } from "vitest";
import { createInventoryItem, createStockTransaction, getExpiryAlerts, getLowStockAlerts, getStockLedger } from "@/lib/inventory-management";

describe("inventory management", () => {
  it("flags low stock and expiring batches", () => {
    const item = createInventoryItem({
      itemCode: "RGT-001",
      name: "EDTA tubes",
      categoryId: "cat-lab-supplies",
      unit: "box",
      reorderLevel: 50,
      quantityOnHand: 12,
      minimumStockLevel: 25,
      storageLocation: "Store A",
      costPerUnit: 8.5,
      supplierId: "sup-med-supply",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      batchNumber: "EDTA-2026-01",
      lotNumber: "LOT-EDTA-001",
      stockReceived: 0,
      stockIssued: 0,
      stockAdjustment: 0,
      stockTransfer: 0,
    });

    expect(item.quantityOnHand).toBe(12);
    expect(getLowStockAlerts().some((alert) => alert.itemCode === "RGT-001")).toBe(true);
    expect(getExpiryAlerts().some((alert) => alert.itemCode === "RGT-001")).toBe(true);
  });

  it("tracks stock ledger and FEFO order", () => {
    const item = createInventoryItem({
      itemCode: "RGT-002",
      name: "PCR Kit",
      categoryId: "cat-molecular",
      unit: "kit",
      reorderLevel: 10,
      quantityOnHand: 0,
      minimumStockLevel: 8,
      storageLocation: "Freezer -20C",
      costPerUnit: 45,
      supplierId: "sup-bioquest",
      batchNumber: "PCR-2026-01",
      lotNumber: "LOT-PCR-001",
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      stockReceived: 0,
      stockIssued: 0,
      stockAdjustment: 0,
      stockTransfer: 0,
    });

    createStockTransaction({
      inventoryItemId: item.id,
      transactionType: "stock_received",
      quantity: 25,
      batchNumber: "PCR-2026-01",
      lotNumber: "LOT-PCR-001",
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      unitCost: 40,
      referenceType: "purchase_order",
      referenceId: "PO-1001",
      remarks: "Initial delivery",
      createdBy: "inventory-manager",
    });

    const ledger = getStockLedger(item.id);
    expect(ledger.some((entry) => entry.transactionType === "stock_received")).toBe(true);
    expect(item.stockStatus).toBe("healthy");
    expect(item.fefoPolicy).toBe("FEFO");
  });
});
