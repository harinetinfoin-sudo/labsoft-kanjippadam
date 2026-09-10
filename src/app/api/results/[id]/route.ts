import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { amendVerifiedResult, getResultEntryById, submitResultEntry, updateDraftResult } from "@/lib/result-entry";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(_request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:read")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to view result details" } }, { status: 403 });
  }

  const { id } = await params;
  const result = getResultEntryById(id);
  return result
    ? NextResponse.json({ success: true, data: result })
    : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Result not found" } }, { status: 404 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const role = user.roles[0];
  if (!hasPermission(role, "results:write")) {
    return NextResponse.json({ success: false, error: { code: "FORBIDDEN", message: "You do not have permission to modify results" } }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const action = body?.action;

    if (action === "submit") {
      const result = submitResultEntry(id, user.firstName || user.email);
      if (result) {
        await recordAuditEventFromRequest(request, {
          action: "Result submission",
          entityType: "result",
          entityId: result.id,
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          previousValue: { status: "draft" },
          newValue: { status: "submitted" },
          metadata: { source: "web" },
        });
      }
      return result
        ? NextResponse.json({ success: true, data: result })
        : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Result not found" } }, { status: 404 });
    }

    if (action === "amend") {
      const result = amendVerifiedResult(id, body.reason, user.firstName || user.email, body.amendedValues ?? {});
      if (result) {
        await recordAuditEventFromRequest(request, {
          action: "Result amendment",
          entityType: "result",
          entityId: result.id,
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          previousValue: { status: "verified" },
          newValue: { status: "amended", reason: body.reason ?? "Correction" },
          metadata: { source: "web" },
        });
      }
      return result
        ? NextResponse.json({ success: true, data: result })
        : NextResponse.json({ success: false, error: { code: "INVALID_STATE", message: "Only verified results can be amended" } }, { status: 409 });
    }

    const result = updateDraftResult(id, body);
    if (result) {
      await recordAuditEventFromRequest(request, {
        action: "Result modification",
        entityType: "result",
        entityId: result.id,
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        previousValue: { modified: true },
        newValue: { resultId: result.id, status: result.status },
        metadata: { source: "web" },
      });
    }
    return result
      ? NextResponse.json({ success: true, data: result })
      : NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Result not found" } }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Result update failed";
    return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }
}
