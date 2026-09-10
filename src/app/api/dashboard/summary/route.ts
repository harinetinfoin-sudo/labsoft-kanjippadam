import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/dashboard-service";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0] ?? "Super Admin";
  const canViewDashboard = ["users:read", "reports:read", "inventory:read", "patients:read"].some((permission) => hasPermission(role, permission));

  if (!canViewDashboard) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have access to dashboard data" } }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") as "today" | "yesterday" | "week" | "month" | "custom") ?? "today";
  const customStart = searchParams.get("customStart") ?? undefined;
  const customEnd = searchParams.get("customEnd") ?? undefined;

  return NextResponse.json({
    success: true,
    data: getDashboardSummary(role, range, customStart, customEnd),
  });
}
