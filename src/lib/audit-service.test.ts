import { describe, expect, it } from "vitest";
import { getAuditLogs, recordAuditEvent } from "@/lib/audit-service";

describe("audit service", () => {
  it("records an append-only audit event with the expected metadata", async () => {
    const entry = await recordAuditEvent({
      action: "Patient registration",
      entityType: "patient",
      entityId: "PT-1001",
      actorId: "user-1",
      actorName: "Reception Staff",
      previousValue: null,
      newValue: { patientNumber: "PT-1001" },
      metadata: { source: "web", ipAddress: "10.0.0.1" },
    });

    expect(entry.action).toBe("Patient registration");
    expect(entry.entityType).toBe("patient");
    expect(entry.details).toMatchObject({
      actorName: "Reception Staff",
      entityId: "PT-1001",
      previousValue: null,
      newValue: { patientNumber: "PT-1001" },
    });
  });

  it("filters audit events by text search and entity type", async () => {
    await recordAuditEvent({
      action: "Order created",
      entityType: "order",
      entityId: "ORD-1001",
      actorId: "user-2",
      actorName: "Reception Staff",
    });

    const results = await getAuditLogs({
      entityType: "order",
      q: "ORD-1001",
      page: 1,
      pageSize: 10,
    });

    expect(results.data.length).toBeGreaterThanOrEqual(1);
    expect(results.data[0].entityId).toBe("ORD-1001");
  });
});
