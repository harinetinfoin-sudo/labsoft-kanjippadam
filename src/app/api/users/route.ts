import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission, listUsers } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "users:read")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view users" } },
      { status: 403 },
    );
  }

  const users = await listUsers();
  return NextResponse.json({
    success: true,
    data: users.map((item) => ({
      id: item.id,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      roles: item.roles,
    })),
  });
}
