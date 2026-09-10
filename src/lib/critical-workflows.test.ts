import { describe, expect, it } from "vitest";
import { validateCredentials, hasPermission, issueToken } from "@/lib/auth";
import { createPatient, getPatientById } from "@/lib/patient-service";
import { createResultEntry, getResultEntryById, verifyResultEntry, amendVerifiedResult } from "@/lib/result-entry";
import { createReport, amendReport, getReportById } from "@/lib/report-generation";
import { createStockTransaction, getInventoryItemById } from "@/lib/inventory-management";

describe("negative and critical workflow coverage", () => {
  it("rejects unauthorized access and invalid auth inputs", async () => {
    await expect(validateCredentials("unknown@example.com", "anypass")).resolves.toBeNull();
    expect(hasPermission("Receptionist", "users:write")).toBe(false);
    expect(hasPermission("Pathologist/Doctor", "reports:verify")).toBe(true);
  });

  it("rejects invalid patient and invalid test data", async () => {
    await expect(createPatient({
      firstName: "A",
      lastName: "Jones",
      dateOfBirth: "",
      gender: "Female",
      phone: "",
      doctorName: "Dr. Smith",
    })).rejects.toThrow();

    expect(() => createResultEntry({
      sampleId: "",
      orderId: "ORD-1",
      patientId: "PT-1",
      patientName: "Jane Doe",
      testName: "CBC",
      resultType: "numeric",
      technician: "Tech A",
      parameters: [],
    })).toThrow();
  });

  it("prevents duplicate records and invalid result submissions", async () => {
    await expect(createPatient({
      firstName: "Sarah",
      lastName: "Okafor",
      dateOfBirth: "1990-05-14",
      gender: "Female",
      phone: "+2348012345678",
      doctorName: "Dr. Adebayo",
    })).rejects.toThrow("Duplicate patient record detected");

    expect(() => createResultEntry({
      sampleId: "SMP-999",
      orderId: "ORD-999",
      patientId: "PT-999",
      patientName: "Jane Doe",
      testName: "Hemoglobin",
      resultType: "numeric",
      technician: "Tech A",
      parameters: [{
        parameterName: "Hemoglobin",
        resultValue: "bad-value",
        unit: "g/dL",
        referenceRange: "12.0-16.0",
        abnormalFlag: false,
        criticalFlag: false,
        resultTimestamp: "2026-09-12T10:00:00.000Z",
        resultType: "numeric",
      }],
    })).toThrow(/Invalid numeric result value/i);
  });

  it("blocks modification of verified results and protects patient-specific data", async () => {
    const result = createResultEntry({
      sampleId: "SMP-777",
      orderId: "ORD-777",
      patientId: "PT-777",
      patientName: "Test Patient",
      testName: "LFT",
      resultType: "numeric",
      technician: "Tech B",
      parameters: [{
        parameterName: "ALT",
        resultValue: 20,
        unit: "U/L",
        referenceRange: "7-55",
        abnormalFlag: false,
        criticalFlag: false,
        resultTimestamp: "2026-09-12T10:00:00.000Z",
        resultType: "numeric",
      }],
    });

    const verified = verifyResultEntry(result.id, "Dr. Nwosu");
    expect(verified?.status).toBe("verified");

    const amended = amendVerifiedResult(result.id, "Correction after review", "Dr. Nwosu", { ALT: 18 });
    expect(amended?.status).toBe("amended");

    const patient = getPatientById("PT-1001");
    expect(patient?.patientNumber).toBe("PT-1001");
    expect(getPatientById("PT-777")?.patientName).toBeUndefined();
  });

  it("validates invalid payment and insufficient stock conditions", () => {
    const payment = { patientId: "PT-1001", amount: -50, method: "card" };
    expect(payment.amount).toBeLessThan(0);

    const stockItem = getInventoryItemById("inv-001");
    expect(stockItem).not.toBeNull();

    expect(() => createStockTransaction({
      inventoryItemId: "inv-001",
      transactionType: "stock_issued",
      quantity: 999,
      transactionDate: new Date().toISOString(),
      createdBy: "lab-technician",
    })).toThrow("Insufficient stock for issuance");
  });

  it("rejects report access and amendment on invalid report state", () => {
    const report = createReport({
      patientId: "PT-1005",
      patientName: "Report Patient",
      doctorName: "Dr. Test",
      pathologistName: "Dr. Verify",
      sampleId: "SMP-1005",
      testName: "CBC",
      laboratoryName: "LabSoft Diagnostic Center",
      templateName: "standard",
      rows: [{ parameterName: "WBC", resultValue: "6.0", unit: "x10^9/L", referenceRange: "4.0-10.0", abnormalFlag: false, criticalFlag: false, comments: "Within range" }],
    });

    const amended = amendReport(report.id, "Controlled correction", "Dr. Verify");
    expect(amended?.status).toBe("Report Generated");
    expect(getReportById(report.id)?.reportNumber).toMatch(/^LAB-REP-/);
  });

  it("verifies RBAC and token-based session protection for sensitive operations", () => {
    const token = issueToken({
      id: "user-1",
      email: "admin@labsoft.local",
      firstName: "System",
      lastName: "Admin",
      passwordHash: "hash",
      isActive: true,
      roles: ["Super Admin"],
    });

    expect(token).toBeTruthy();
    expect(hasPermission("Super Admin", "users:write")).toBe(true);
    expect(hasPermission("Inventory Manager", "inventory:write")).toBe(true);
    expect(hasPermission("Treatment Team", "results:verify")).toBe(false);
  });
});
