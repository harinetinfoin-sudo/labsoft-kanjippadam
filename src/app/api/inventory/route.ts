import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { createInventoryCategory, createInventoryItem, createPurchaseOrder, createStockTransaction, createSupplier, getInventoryDashboard, getInventoryDetails, getInventoryItems, inventoryCategorySchema, inventoryItemSchema, purchaseOrderSchema, stockTransactionSchema, supplierSchema } from "@/lib/inventory-management";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "inventory:read")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view inventory" } }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("view") ?? "dashboard";

  if (mode === "details") {
    return NextResponse.json({ success: true, data: getInventoryDetails() });
  }

  if (mode === "items") {
    return NextResponse.json({ success: true, data: getInventoryItems() });
  }

  return NextResponse.json({ success: true, data: getInventoryDashboard() });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "inventory:write")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to update inventory" } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type } = body;

    if (type === "category") {
      const payload = inventoryCategorySchema.parse(body.data ?? body);
      const created = createInventoryCategory(payload);
      await recordAuditEventFromRequest(request, {
        action: "Inventory category change",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: (user as any).name}`.trim() || user.email || 'Admin',
        previousValue: null,
        newValue: { categoryName: created.name },
        metadata: { source: "web" },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (type === "supplier") {
      const payload = supplierSchema.parse(body.data ?? body);
      const created = createSupplier(payload);
      await recordAuditEventFromRequest(request, {
        action: "Inventory supplier change",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: (user as any).name}`.trim() || user.email || 'Admin',
        previousValue: null,
        newValue: { supplierName: created.name },
        metadata: { source: "web" },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (type === "purchase_order") {
      const payload = purchaseOrderSchema.parse(body.data ?? body);
      const created = createPurchaseOrder(payload);
      await recordAuditEventFromRequest(request, {
        action: "Inventory purchase order",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: (user as any).name}`.trim() || user.email || 'Admin',
        previousValue: null,
        newValue: { poNumber: created.poNumber, status: created.status },
        metadata: { source: "web" },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    if (type === "stock_transaction") {
      const payload = stockTransactionSchema.parse(body.data ?? body);
      const created = createStockTransaction(payload);
      await recordAuditEventFromRequest(request, {
        action: "Inventory stock change",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: (user as any).name || (user as any).email || 'Admin',
        previousValue: { quantity: payload.quantity },
        newValue: { quantity: created.quantity, balanceAfter: created.balanceAfter, transactionType: created.transactionType },
        metadata: { source: "web" },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    const payload = inventoryItemSchema.parse(body.data ?? body);
    const created = createInventoryItem(payload);
    await recordAuditEventFromRequest(request, {
      action: "Inventory item change",
      entityType: "inventory",
      entityId: created.id,
      actorId: user.id,
      actorName: (user as any).name}`.trim() || user.email || 'Admin',
      previousValue: null,
      newValue: { itemCode: created.itemCode, itemName: created.name, quantityOnHand: created.quantityOnHand },
      metadata: { source: "web" },
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inventory validation failed";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
