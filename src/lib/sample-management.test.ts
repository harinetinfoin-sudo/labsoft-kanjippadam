import { describe, expect, it } from "vitest";
import { createSample, rejectSample, searchSamples, updateSampleStatus } from "@/lib/sample-management";

describe("sample management", () => {
  it("creates a sample with generated identifiers", () => {
    const sample = createSample({
      orderId: "ORD-3001",
      patientId: "PT-2001",
      patientName: "Jane Doe",
      sampleType: "Urine",
      collectionDateTime: "2026-09-01T08:00:00.000Z",
      collector: "L. Smith",
      collectionLocation: "OPD",
      status: "Sample Pending",
    });

    expect(sample.sampleId).toMatch(/^SMP-/);
    expect(sample.barcode).toMatch(/^BC-/);
    expect(sample.status).toBe("Sample Pending");
  });

  it("searches sample records by identifier or patient", () => {
    const results = searchSamples("Sarah");
    expect(results.some((sample) => sample.patientName === "Sarah Okafor")).toBe(true);
  });

  it("updates a sample status and appends history", () => {
    const sample = createSample({
      orderId: "ORD-3002",
      patientId: "PT-2002",
      patientName: "John Brown",
      sampleType: "Plasma",
      collectionDateTime: "2026-09-02T10:00:00.000Z",
      collector: "E. Walker",
      collectionLocation: "Ward B",
      status: "Collected",
    });

    const updated = updateSampleStatus(sample.sampleId, "Received in Laboratory", "Received by bench technician");

    expect(updated?.status).toBe("Received in Laboratory");
    expect(updated?.history.at(-1)?.note).toBe("Received by bench technician");
  });

  it("rejects a sample with a reason", () => {
    const sample = createSample({
      orderId: "ORD-3003",
      patientId: "PT-2003",
      patientName: "Ruth King",
      sampleType: "Stool",
      collectionDateTime: "2026-09-03T13:15:00.000Z",
      collector: "A. Patel",
      collectionLocation: "ICU",
      status: "Collected",
    });

    const rejected = rejectSample(sample.sampleId, "Clotted specimen");

    expect(rejected?.status).toBe("Rejected");
    expect(rejected?.rejectionReason).toBe("Clotted specimen");
  });
});
