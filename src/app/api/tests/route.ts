import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { searchTests, testSchema } from "@/lib/test-master";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "tests:read")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view tests" } },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  return NextResponse.json({ success: true, data: searchTests(searchParams.get("q") ?? undefined) });
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
  if (!hasPermission(role, "tests:write")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to create tests" } },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const payload = testSchema.parse(body);
    return NextResponse.json({ success: true, data: { ...payload, id: `test-${Date.now()}` } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid test payload";
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message } },
      { status: 400 },
    );
  }
}
