import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { amendReport, buildPdfHtml, getReportById, releaseReport } from "@/lib/report-generation";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(_request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "reports:read")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view this report" } }, { status: 403 });
  }

  const { id } = await params;
  const report = getReportById(id);
  return report
    ? NextResponse.json({ success: true, data: { ...report, pdfHtml: buildPdfHtml(report) } })
    : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Report not found" } }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "reports:verify")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to manage reports" } }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === "release") {
      const report = releaseReport(id, `${user.firstName} ${user.lastName}`.trim() || user.email, body.releaseNote);
      if (report) {
        await recordAuditEventFromRequest(request, {
          action: "Report release",
          entityType: "report",
          entityId: report.reportNumber,
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          previousValue: { status: "Report Generated" },
          newValue: { status: "Released", releaseNote: body.releaseNote ?? "Released to clinician" },
          metadata: { source: "web" },
        });
      }
      return report
        ? NextResponse.json({ success: true, data: report })
        : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Report not found" } }, { status: 404 });
    }

    if (body.action === "amend") {
      const report = amendReport(id, body.reason ?? "Controlled correction", `${user.firstName} ${user.lastName}`.trim() || user.email);
      if (report) {
        await recordAuditEventFromRequest(request, {
          action: "Report amendment",
          entityType: "report",
          entityId: report.reportNumber,
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          previousValue: { status: "Released" },
          newValue: { status: "Amended", reason: body.reason ?? "Controlled correction" },
          metadata: { source: "web" },
        });
      }
      return report
        ? NextResponse.json({ success: true, data: report })
        : NextResponse.json({ success: false, error: { code: "INVALID_STATE", message: "Report amendment requires an existing report record" } }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: { code: "INVALID_ACTION", message: "Unsupported report action" } }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Report action failed";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
