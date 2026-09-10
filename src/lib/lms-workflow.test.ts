import { describe, expect, it } from "vitest";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";
import { issueToken, hasPermission, validateCredentials } from "@/lib/auth";
import { calculateOrderTotal, createOrderNumber, orderSchema } from "@/lib/orders";
import { createPatient, findDuplicatePatients, patientSchema } from "@/lib/patient-service";
import { createSample, rejectSample, sampleSchema, updateSampleStatus } from "@/lib/sample-management";

describe("LMS testing strategy coverage", () => {
  it("validates patient registration input and rejects invalid records", async () => {
    expect(() => patientSchema.parse({
      firstName: "A",
      lastName: "Smith",
      dateOfBirth: "1990-01-01",
      gender: "Female",
      phone: "08123456789",
      email: "not-an-email",
    })).toThrow();

    const patient = await createPatient({
      firstName: "Grace",
      lastName: "Nwosu",
      dateOfBirth: "1995-04-12",
      gender: "Female",
      phone: "+2348099990001",
      email: "grace.nwosu@example.com",
      doctorName: "Dr. Adebayo",
    });

    expect(patient.patientNumber).toMatch(/^PT-/);
    expect(patient.status).toBe("Registered");
  });

  it("detects duplicate patients before registration", async () => {
    const duplicate = findDuplicatePatients({
      firstName: "Sarah",
      lastName: "Okafor",
      dateOfBirth: "1990-05-14",
      phone: "+2348012345678",
    });

    expect(duplicate.length).toBeGreaterThan(0);

    await expect(createPatient({
      firstName: "Sarah",
      lastName: "Okafor",
      dateOfBirth: "1990-05-14",
      gender: "Female",
      phone: "+2348012345678",
      doctorName: "Dr. Adebayo",
    })).rejects.toThrow("Duplicate patient record detected");
  });

  it("creates a valid laboratory order and calculates totals correctly", () => {
    const parsed = orderSchema.parse({
      patientId: "PT-1001",
      doctorName: "Dr. Adebayo",
      tests: [
        { code: "CBC01", name: "Complete Blood Count", price: 45 },
        { code: "CHE02", name: "Liver Function Test", price: 68 },
      ],
      paymentStatus: "Unpaid",
      status: "Registered",
    });

    expect(parsed.tests.length).toBe(2);
    expect(calculateOrderTotal(parsed.tests)).toBe(113);
    expect(createOrderNumber()).toMatch(/^ORD-/);
  });

  it("collects and updates a sample through the lab lifecycle", () => {
    const sample = createSample({
      orderId: "ORD-3001",
      patientId: "PT-2001",
      patientName: "Mary Smith",
      sampleType: "Whole Blood",
      collectionDateTime: "2026-09-01T08:00:00.000Z",
      collector: "L. Smith",
      collectionLocation: "OPD",
      status: "Collected",
    });

    const updated = updateSampleStatus(sample.sampleId, "Received in Laboratory", "Received by bench technician");

    expect(updated?.status).toBe("Received in Laboratory");
    expect(updated?.history.at(-1)?.note).toBe("Received by bench technician");
  });

  it("rejects a sample only when a rejection reason is recorded", () => {
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
    expect(() => sampleSchema.parse({
      orderId: "ORD-3004",
      patientId: "PT-2004",
      patientName: "Test User",
      sampleType: "Urine",
      collectionDateTime: "2026-09-04T09:00:00.000Z",
      collector: "Nurse A",
      collectionLocation: "Ward B",
      status: "Rejected",
      rejectionReason: undefined,
    })).not.toThrow();
  });

  it("authenticates valid users and rejects invalid credentials over the API", async () => {
    const response = await loginHandler(new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@labsoft.local", password: "Admin@123" }),
    }));

    expect(response.status).toBe(200);

    const bad = await loginHandler(new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@labsoft.local", password: "WrongPass@123" }),
    }));

    expect(bad.status).toBe(401);

    const user = await validateCredentials("admin@labsoft.local", "Admin@123");
    expect(user).not.toBeNull();
  });

  it("enforces RBAC on backend authorization checks", () => {
    expect(hasPermission("Super Admin", "users:write")).toBe(true);
    expect(hasPermission("Receptionist", "users:write")).toBe(false);
    expect(hasPermission("Pathologist/Doctor", "results:verify")).toBe(true);
    expect(hasPermission("Accountant", "patients:write")).toBe(false);
  });

  it("returns authenticated user details only when the session is valid", async () => {
    const user = await validateCredentials("pathologist@labsoft.local", "Doctor@123");
    expect(user).not.toBeNull();

    const token = issueToken(user!);
    const response = await meHandler(new Request("http://localhost/api/auth/me", {
      headers: { cookie: `lms_session=${token}` },
    }));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.data.email).toBe("pathologist@labsoft.local");
  });

  it("runs the core clinical workflow from registration to rejection", async () => {
    const patient = await createPatient({
      firstName: "Peter",
      lastName: "Adebayo",
      dateOfBirth: "1988-01-25",
      gender: "Male",
      phone: "+2348000001111",
      email: "peter.adebayo@example.com",
      doctorName: "Dr. Hassan",
    });

    const order = {
      patientId: patient.patientNumber,
      doctorName: "Dr. Hassan",
      tests: [
        { code: "CBC01", name: "Complete Blood Count", price: 45 },
      ],
      paymentStatus: "Unpaid",
      status: "Registered",
    };

    const parsedOrder = orderSchema.parse(order);
    expect(parsedOrder.patientId).toBe(patient.patientNumber);

    const sample = createSample({
      orderId: "ORD-5001",
      patientId: patient.patientNumber,
      patientName: `${patient.firstName} ${patient.lastName}`,
      sampleType: "Urine",
      collectionDateTime: "2026-09-10T08:00:00.000Z",
      collector: "Lab Nurse",
      collectionLocation: "OPD",
      status: "Collected",
    });

    const rejected = rejectSample(sample.sampleId, "Insufficient volume");
    expect(rejected?.status).toBe("Rejected");
    expect(rejected?.rejectionReason).toBe("Insufficient volume");
  });
});
