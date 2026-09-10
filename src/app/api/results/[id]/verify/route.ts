import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { verifyResultEntry } from "@/lib/result-entry";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:verify")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Only authorized users can verify results" } }, { status: 403 });
  }

  const { id } = await params;
  const result = verifyResultEntry(id, `${user.firstName} ${user.lastName}`.trim() || user.email);
  if (result) {
    await recordAuditEventFromRequest(request, {
      action: "Result verification",
      entityType: "result",
      entityId: result.id,
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      previousValue: { status: "submitted" },
      newValue: { status: "verified", verifiedBy: result.verifiedBy },
      metadata: { source: "web" },
    });
  }
  return result
    ? NextResponse.json({ success: true, data: result })
    : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Result not found" } }, { status: 404 });
}
