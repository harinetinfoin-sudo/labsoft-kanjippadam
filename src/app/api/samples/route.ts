import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { createSample, sampleSchema, searchSamples } from "@/lib/sample-management";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "samples:read")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view samples" } },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  return NextResponse.json({ success: true, data: searchSamples(searchParams.get("q") ?? undefined) });
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
  if (!hasPermission(role, "samples:write")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to register samples" } },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const sample = createSample(body);
    await recordAuditEventFromRequest(request, {
      action: "Sample collection",
      entityType: "sample",
      entityId: sample.sampleId,
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      previousValue: null,
      newValue: { sampleId: sample.sampleId, status: sample.status, sampleType: sample.sampleType },
      metadata: { source: "web" },
    });
    return NextResponse.json({ success: true, data: sample }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sample validation failed";
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message } },
      { status: 400 },
    );
  }
}
