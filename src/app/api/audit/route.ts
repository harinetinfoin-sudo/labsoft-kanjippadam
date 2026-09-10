import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/audit-service";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "users:read") && !hasPermission(role, "reports:verify")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "Only authorized administrators can view audit logs" } }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const entityType = searchParams.get("entityType") ?? undefined;
  const action = searchParams.get("action") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);

  const result = await getAuditLogs({ q: query, entityType, action, from, to, page, pageSize });
  return NextResponse.json({ success: true, data: result.data, meta: result.meta });
}
