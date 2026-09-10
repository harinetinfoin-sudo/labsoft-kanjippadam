import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { createReport, getReports, reportSchema } from "@/lib/report-generation";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "reports:read")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view reports" } }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: getReports() });
}

export async function POST(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "reports:verify")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to generate reports" } }, { status: 403 });
  }

  try {
    const body = await request.json();
    const payload = reportSchema.parse(body);
    const report = createReport(payload);
    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid report payload";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
