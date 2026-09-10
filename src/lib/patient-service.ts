import { z } from "zod";
import type { Patient, PatientSearchParams } from "@/lib/patient-types";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  doctorId: z.string().optional(),
  doctorName: z.string().optional(),
  notes: z.string().optional(),
});

const patientSeed: Patient[] = [
  {
    id: "pt-1001",
    patientNumber: "PT-1001",
    patientName: "Sarah Okafor",
    firstName: "Sarah",
    lastName: "Okafor",
    dateOfBirth: "1990-05-14",
    gender: "Female",
    phone: "+2348012345678",
    email: "sarah.okafor@example.com",
    address: "12 Marina Road",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    emergencyContactName: "Tunde Okafor",
    emergencyContactPhone: "+2348098765432",
    doctorId: "doc-001",
    doctorName: "Dr. Adebayo",
    status: "In Review",
    createdAt: "2026-08-01T09:10:00.000Z",
    updatedAt: "2026-08-01T09:10:00.000Z",
    notes: "Routine follow-up",
  },
  {
    id: "pt-1002",
    patientNumber: "PT-1002",
    patientName: "Michael Chen",
    firstName: "Michael",
    lastName: "Chen",
    dateOfBirth: "1971-02-08",
    gender: "Male",
    phone: "+2348123456789",
    email: "michael.chen@example.com",
    address: "8 Obi Street",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    emergencyContactName: "Jane Chen",
    emergencyContactPhone: "+2348145678901",
    doctorId: "doc-002",
    doctorName: "Dr. Hassan",
    status: "Sample Collected",
    createdAt: "2026-08-02T08:20:00.000Z",
    updatedAt: "2026-08-02T08:20:00.000Z",
    notes: "Urgent chemistry panel",
  },
  {
    id: "pt-1003",
    patientNumber: "PT-1003",
    patientName: "Aisha Yusuf",
    firstName: "Aisha",
    lastName: "Yusuf",
    dateOfBirth: "1988-11-21",
    gender: "Female",
    phone: "+2348134567890",
    email: "aisha.yusuf@example.com",
    address: "14 Greenview Estate",
    city: "Kano",
    state: "Kano",
    country: "Nigeria",
    emergencyContactName: "Usman Yusuf",
    emergencyContactPhone: "+2348156789012",
    doctorId: "doc-003",
    doctorName: "Dr. Nwosu",
    status: "Completed",
    createdAt: "2026-08-03T10:45:00.000Z",
    updatedAt: "2026-08-03T10:45:00.000Z",
    notes: "HbA1c review",
  },
];

export function generatePatientNumber() {
  return `PT-${Date.now().toString().slice(-6)}`;
}

export function normalizePatientRecord(input: unknown): Patient {
  const parsed = patientSchema.parse(input);
  const patientNumber = generatePatientNumber();

  const firstName = parsed.firstName.trim();
  const lastName = parsed.lastName.trim();

  return {
    id: `pt-${Math.random().toString(36).slice(2, 10)}`,
    patientNumber,
    patientName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    dateOfBirth: parsed.dateOfBirth,
    gender: parsed.gender,
    phone: parsed.phone,
    email: parsed.email || undefined,
    address: parsed.address,
    city: parsed.city,
    state: parsed.state,
    country: parsed.country,
    emergencyContactName: parsed.emergencyContactName,
    emergencyContactPhone: parsed.emergencyContactPhone,
    doctorId: parsed.doctorId,
    doctorName: parsed.doctorName,
    status: "Registered",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: parsed.notes,
  };
}

export function findDuplicatePatients(query: Partial<Patient>) {
  const matches = patientSeed.filter((patient) => {
    const samePhone = query.phone ? patient.phone === query.phone : false;
    const sameName = query.firstName && query.lastName
      ? patient.firstName.toLowerCase() === query.firstName.toLowerCase() && patient.lastName.toLowerCase() === query.lastName.toLowerCase()
      : false;
    const sameDob = query.dateOfBirth ? patient.dateOfBirth === query.dateOfBirth : false;

    return samePhone || (sameName && sameDob);
  });

  return matches;
}

export function searchPatients(params: PatientSearchParams) {
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const q = (params.q ?? "").trim().toLowerCase();
  const status = params.status?.trim();
  const sortBy = params.sortBy ?? "createdAt";
  const sortOrder = params.sortOrder ?? "desc";

  let filtered = [...patientSeed];

  if (q) {
    filtered = filtered.filter((patient) => {
      const haystack = [
        patient.patientNumber,
        `${patient.firstName} ${patient.lastName}`,
        patient.phone,
        patient.email ?? "",
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }

  if (status) {
    filtered = filtered.filter((patient) => patient.status === status);
  }

  filtered.sort((a, b) => {
    const aValue = a[sortBy] ?? "";
    const bValue = b[sortBy] ?? "";

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    data: filtered.slice(startIndex, startIndex + pageSize),
    meta: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function createPatient(input: unknown) {
  const patient = normalizePatientRecord(input);
  const duplicates = findDuplicatePatients(patient);
  if (duplicates.length > 0) {
    throw new Error("Duplicate patient record detected");
  }

  patientSeed.unshift(patient);
  return patient;
}

export function getPatientById(id: string) {
  return patientSeed.find((patient) => patient.id === id || patient.patientNumber === id) ?? null;
}

export function getPatientHistory(id: string) {
  const patient = getPatientById(id);
  if (!patient) {
    return [];
  }

  return [
    { type: "Registration", date: patient.createdAt, description: `Patient registered with ID ${patient.patientNumber}` },
    { type: "Consultation", date: patient.updatedAt, description: `${patient.doctorName ?? "Doctor"} assigned for follow-up` },
    { type: "Sample", date: patient.updatedAt, description: "Sample collection processed" },
  ];
}

export { patientSchema };
