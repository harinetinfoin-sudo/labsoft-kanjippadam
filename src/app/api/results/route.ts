import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { createResultEntry, getPendingResults, resultEntrySchema } from "@/lib/result-entry";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:read")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view results" } }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const entries = getPendingResults();
  const filtered = status ? entries.filter((entry) => entry.status === status) : entries;

  return NextResponse.json({ success: true, data: filtered });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:write")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to enter results" } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const payload = resultEntrySchema.parse(body);
    const record = createResultEntry(payload);
    await recordAuditEventFromRequest(request, {
      action: "Result creation",
      entityType: "result",
      entityId: record.id,
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      previousValue: null,
      newValue: { resultId: record.id, testName: record.testName, status: record.status },
      metadata: { source: "web" },
    });
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid result payload";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
