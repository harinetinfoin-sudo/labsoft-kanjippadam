import { NextResponse } from "next/server";
import { getCurrentUserFromRequest, hasPermission } from "@/lib/auth";
import { recordAuditEventFromRequest } from "@/lib/audit-service";
import { createPatient, searchPatients } from "@/lib/patient-service";

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 },
    );
  }

  const role = user.roles[0];
  if (!hasPermission(role, "patients:read")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You do not have access to patient records" } },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(request.url);
  const result = searchPatients({
    q: searchParams.get("q") ?? undefined,
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 10),
    status: searchParams.get("status") ?? undefined,
    sortBy: (searchParams.get("sortBy") as "createdAt" | "lastName" | "patientNumber") ?? "createdAt",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc",
  });

  return NextResponse.json({ success: true, data: result.data, meta: result.meta });
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
  if (!hasPermission(role, "patients:write")) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "You are not allowed to register patients" } },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const patient = await createPatient(body);
    await recordAuditEventFromRequest(request, {
      action: "Patient creation",
      entityType: "patient",
      entityId: patient.patientNumber,
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      previousValue: null,
      newValue: { patientId: patient.id, patientNumber: patient.patientNumber, name: `${patient.firstName} ${patient.lastName}` },
      metadata: { source: "web" },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Patient validation failed";
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message } },
      { status: 400 },
    );
  }
}
