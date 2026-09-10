import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { rejectSample, updateSampleStatus } from "@/lib/sample-management";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to update samples" } },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note, rejectionReason } = body ?? {};

    if (rejectionReason) {
      const sample = rejectSample(id, rejectionReason);
      return sample
        ? NextResponse.json({ success: true, data: sample })
        : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Sample not found" } }, { status: 404 });
    }

    if (status) {
      const sample = updateSampleStatus(id, status, note);
      return sample
        ? NextResponse.json({ success: true, data: sample })
        : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Sample not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "A valid status or rejection reason is required" } }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update sample";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
