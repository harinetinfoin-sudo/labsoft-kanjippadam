import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { calculateOrderTotal, createOrderNumber, listOrders, orderSchema } from "@/lib/orders";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "orders:read")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view orders" } },
      { status: 403 },
    );
  }

  return NextResponse.json({ success: true, data: listOrders() });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "orders:write")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to create orders" } },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const payload = orderSchema.parse(body);
    const totalAmount = calculateOrderTotal(payload.tests);

    const order = {
      id: `ord-${Date.now()}`,
      orderNumber: createOrderNumber(),
      patientId: payload.patientId,
      patientName: payload.patientId,
      doctorName: payload.doctorName,
      tests: payload.tests,
      totalAmount,
      paymentStatus: payload.paymentStatus,
      status: payload.status,
      createdAt: new Date().toISOString(),
    };

    await recordAuditEventFromRequest(request, {
      action: "Order creation",
      entityType: "order",
      entityId: order.orderNumber,
      actorId: user.id,
      actorName: user.name || user.email || 'Admin',
      previousValue: null,
      newValue: { orderId: order.id, orderNumber: order.orderNumber, totalAmount },
      metadata: { source: "web" },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid order payload";
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message } },
      { status: 400 },
    );
  }
}
