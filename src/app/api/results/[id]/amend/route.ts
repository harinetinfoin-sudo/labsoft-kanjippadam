import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { amendVerifiedResult, getResultEntryById } from "@/lib/result-entry";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:verify")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to amend verified results" } }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const entry = getResultEntryById(id);
    if (!entry) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Result not found" } }, { status: 404 });
    }

    if (entry.status !== "verified") {
      return NextResponse.json({ success: false, error: { code: "INVALID_STATE", message: "Only verified results can be amended" } }, { status: 409 });
    }

    const amended = amendVerifiedResult(id, body.reason ?? "Correction", `${user.firstName} ${user.lastName}`.trim() || user.email, body.amendedValues ?? {});
    return amended
      ? NextResponse.json({ success: true, data: amended })
      : NextResponse.json({ success: false, error: { code: "INVALID_STATE", message: "Unable to amend result" } }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Amendment failed";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
