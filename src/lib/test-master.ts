import { z } from "zod";

export type LabTestStatus = "active" | "inactive";

export type LabTest = {
  id: string;
  code: string;
  name: string;
  category: string;
  department: string;
  specimenType: string;
  price: number;
  turnaroundHours: number;
  status: LabTestStatus;
  parameters: Array<{
    name: string;
    unit: string;
    referenceRange?: string;
    criticalValue?: string;
    gender?: "Male" | "Female" | "All";
    ageMin?: number;
    ageMax?: number;
  }>;
  instructions?: string;
};

export const testSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  category: z.string().min(2),
  department: z.string().min(2),
  specimenType: z.string().min(2),
  price: z.number().nonnegative(),
  turnaroundHours: z.number().int().positive(),
  status: z.enum(["active", "inactive"]),
  parameters: z.array(
    z.object({
      name: z.string().min(2),
      unit: z.string().min(1),
      referenceRange: z.string().optional(),
      criticalValue: z.string().optional(),
      gender: z.enum(["Male", "Female", "All"]).optional(),
      ageMin: z.number().optional(),
      ageMax: z.number().optional(),
    }),
  ),
  instructions: z.string().optional(),
});

export const testCatalog: LabTest[] = [
  {
    id: "test-001",
    code: "CBC01",
    name: "Complete Blood Count",
    category: "Hematology",
    department: "Hematology",
    specimenType: "Whole Blood",
    price: 45,
    turnaroundHours: 4,
    status: "active",
    parameters: [
      { name: "WBC", unit: "10^9/L", referenceRange: "4.0-11.0", criticalValue: "<2.0 or >30.0", gender: "All" },
      { name: "Hemoglobin", unit: "g/dL", referenceRange: "12.0-16.5", gender: "Female" },
    ],
    instructions: "Collect in EDTA tube and process promptly.",
  },
  {
    id: "test-002",
    code: "CHE02",
    name: "Liver Function Test",
    category: "Biochemistry",
    department: "Chemistry",
    specimenType: "Serum",
    price: 68,
    turnaroundHours: 6,
    status: "active",
    parameters: [
      { name: "ALT", unit: "U/L", referenceRange: "7-56", gender: "All" },
      { name: "AST", unit: "U/L", referenceRange: "10-40", gender: "All" },
    ],
  },
  {
    id: "test-003",
    code: "MIC03",
    name: "Urine Culture",
    category: "Microbiology",
    department: "Microbiology",
    specimenType: "Urine",
    price: 90,
    turnaroundHours: 24,
    status: "active",
    parameters: [{ name: "Culture growth", unit: "CFU/mL", referenceRange: "<10^4", gender: "All" }],
  },
];

export function searchTests(query?: string) {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return testCatalog;

  return testCatalog.filter((test) =>
    [test.code, test.name, test.category, test.department, test.specimenType].some((value) => value.toLowerCase().includes(q)),
  );
}
