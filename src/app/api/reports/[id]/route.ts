import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { releaseReport } from "@/lib/reports";
import { recordAuditEventFromRequest } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request as any) as any;
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.role?.();
  // permission check if exists

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "release") {
      const report = releaseReport(id, user.name || user.email || 'Admin');
      if (report) {
        await recordAuditEventFromRequest(request, {
          action: "Report release",
          entityType: "report",
          entityId: report.reportNumber,
          actorId: user.id,
          actorName: user.name || user.email || 'Admin',
          previousValue: { status: "Report Generated" },
          newValue: { status: "Released", releaseNote: body.releaseNote ?? "Released to clinician" },
          metadata: { source: "web" },
        });
      }
      return NextResponse.json({ success: true, data: report });
    }

    return NextResponse.json({ success: false, error: { code: "INVALID_ACTION" } }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}
