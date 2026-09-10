export type PatientStatus =
  | "Registered"
  | "In Review"
  | "Sample Pending"
  | "Sample Collected"
  | "Processing"
  | "Result Pending"
  | "Verification Pending"
  | "Completed"
  | "Cancelled";

export type Patient = {
  id: string;
  patientNumber: string;
  patientName?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other" | "Prefer not to say";
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  doctorId?: string;
  doctorName?: string;
  status: PatientStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type PatientSearchParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  sortBy?: "createdAt" | "lastName" | "patientNumber";
  sortOrder?: "asc" | "desc";
};
