import { NextResponse } from "next/server";
import {
  createInventoryCategory,
  createPurchaseOrder,
  createSupplier,
  inventoryCategorySchema,
  purchaseOrderSchema,
  supplierSchema,
} from "@/lib/inventory";
import { recordAuditEventFromRequest } from "@/lib/audit";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body.type;
    const user = await getCurrentUserFromRequest(request as any) as any;
    
    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    if (type === "category") {
      const payload = inventoryCategorySchema.parse(body.data ?? body);
      const created = createInventoryCategory(payload);
      await recordAuditEventFromRequest(request, {
        action: "Inventory category change",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: user.name || user.email || 'Admin',
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
        actorName: user.name || user.email || 'Admin',
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
        action: "Inventory purchase order change",
        entityType: "inventory",
        entityId: created.id,
        actorId: user.id,
        actorName: user.name || user.email || 'Admin',
        previousValue: null,
        newValue: { poNumber: created.poNumber, status: created.status },
        metadata: { source: "web" },
      });
      return NextResponse.json({ success: true, data: created }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: { code: "INVALID_TYPE" } }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: "ERROR", message: error.message } }, { status: 400 });
  }
}
