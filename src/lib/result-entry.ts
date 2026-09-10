import { z } from "zod";

export type ResultType =
  | "numeric"
  | "text"
  | "positive_negative"
  | "reactive_nonreactive"
  | "qualitative"
  | "semi_quantitative";

export type ResultStatus = "draft" | "submitted" | "verified" | "amended";

export type ResultParameter = {
  id: string;
  parameterName: string;
  resultValue: string | number | null;
  unit?: string;
  referenceRange?: string;
  abnormalFlag: boolean;
  criticalFlag: boolean;
  comments?: string;
  technician?: string;
  resultTimestamp: string;
  resultType: ResultType;
};

export type ResultHistoryEvent = {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  note?: string;
};

export type ResultEntry = {
  id: string;
  sampleId: string;
  orderId: string;
  patientId: string;
  patientName: string;
  testName: string;
  status: ResultStatus;
  resultType: ResultType;
  parameters: ResultParameter[];
  technician: string;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  directResult?: string;
  createdAt: string;
  updatedAt: string;
  history: ResultHistoryEvent[];
  amendments: Array<{
    id: string;
    reason: string;
    createdBy: string;
    createdAt: string;
    previousValues: Record<string, unknown>;
    amendedValues: Record<string, unknown>;
  }>;
};

export const resultParameterSchema = z.object({
  id: z.string().optional(),
  parameterName: z.string().min(1, "Parameter name is required"),
  resultValue: z.union([z.string(), z.number(), z.null()]).optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  abnormalFlag: z.boolean().default(false),
  criticalFlag: z.boolean().default(false),
  comments: z.string().optional(),
  technician: z.string().optional(),
  resultTimestamp: z.string().min(1, "Result timestamp is required"),
  resultType: z.enum([
    "numeric",
    "text",
    "positive_negative",
    "reactive_nonreactive",
    "qualitative",
    "semi_quantitative",
  ]),
});

export const resultEntrySchema = z.object({
  sampleId: z.string().min(1),
  orderId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  testName: z.string().min(1),
  resultType: z.enum([
    "numeric",
    "text",
    "positive_negative",
    "reactive_nonreactive",
    "qualitative",
    "semi_quantitative",
  ]),
  status: z.enum(["draft", "submitted", "verified", "amended"]).default("draft"),
  technician: z.string().min(1),
  directResult: z.string().optional(),
  parameters: z.array(resultParameterSchema).min(1),
});

export const resultEntries: ResultEntry[] = [
  {
    id: "res-1001",
    sampleId: "SMP-101001",
    orderId: "ORD-2048",
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    testName: "Complete Blood Count",
    status: "submitted",
    resultType: "numeric",
    parameters: [
      {
        id: "param-1",
        parameterName: "Hemoglobin",
        resultValue: 11.8,
        unit: "g/dL",
        referenceRange: "12.0-16.0",
        abnormalFlag: true,
        criticalFlag: false,
        comments: "Mildly low; repeat review if symptomatic.",
        technician: "A. Bello",
        resultTimestamp: "2026-08-28T09:00:00.000Z",
        resultType: "numeric",
      },
      {
        id: "param-2",
        parameterName: "WBC Count",
        resultValue: 7.9,
        unit: "x10^9/L",
        referenceRange: "4.0-10.0",
        abnormalFlag: false,
        criticalFlag: false,
        comments: "Within expected range.",
        technician: "A. Bello",
        resultTimestamp: "2026-08-28T09:01:00.000Z",
        resultType: "numeric",
      },
    ],
    technician: "A. Bello",
    submittedAt: "2026-08-28T09:05:00.000Z",
    createdAt: "2026-08-28T08:55:00.000Z",
    updatedAt: "2026-08-28T09:05:00.000Z",
    history: [
      { id: "h1", action: "saved", actor: "A. Bello", timestamp: "2026-08-28T08:55:00.000Z", note: "Draft created" },
      { id: "h2", action: "submitted", actor: "A. Bello", timestamp: "2026-08-28T09:05:00.000Z", note: "Result submitted for verification" },
    ],
    amendments: [],
  },
];

function normalizeNumeric(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
}

function parseReferenceRange(range?: string) {
  if (!range) return null;
  const cleaned = range.replace(/\s+/g, "");
  const match = cleaned.match(/^([0-9.]+)\s*[-–to]+\s*([0-9.]+)$/i);
  if (match) {
    return { low: Number(match[1]), high: Number(match[2]) };
  }
  return null;
}

export function autoFlagResult(parameter: ResultParameter) {
  const normalized = normalizeNumeric(parameter.resultValue);
  const range = parseReferenceRange(parameter.referenceRange);

  if (normalized === null || range === null) {
    return {
      abnormalFlag: parameter.abnormalFlag ?? false,
      criticalFlag: parameter.criticalFlag ?? false,
    };
  }

  const abnormal = normalized < range.low || normalized > range.high;
  const critical = abnormal && (normalized >= range.high * 1.25 || normalized <= range.low * 0.75);

  return {
    abnormalFlag: abnormal,
    criticalFlag: critical,
  };
}

export function createResultEntry(input: unknown): ResultEntry {
  const parsed = resultEntrySchema.parse(input);
  const now = new Date().toISOString();
  const parameters = parsed.parameters.map((param) => {
    if (param.resultType === "numeric") {
      const rawValue = param.resultValue;
      if (rawValue !== null && rawValue !== undefined && rawValue !== "") {
        const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue);
        if (!Number.isFinite(numericValue)) {
          throw new Error(`Invalid numeric result value for parameter "${param.parameterName}"`);
        }
      }
    }

    const autoFlags = autoFlagResult({
      ...param,
      id: param.id ?? `param-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      resultValue: param.resultValue ?? null,
      abnormalFlag: param.abnormalFlag ?? false,
      criticalFlag: param.criticalFlag ?? false,
    });

    return {
      ...param,
      id: param.id ?? `param-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      resultValue: param.resultValue !== undefined && param.resultValue !== null && param.resultValue !== "" && param.resultType === "numeric"
        ? Number(param.resultValue)
        : param.resultValue ?? null,
      abnormalFlag: autoFlags.abnormalFlag,
      criticalFlag: autoFlags.criticalFlag,
      technician: param.technician ?? parsed.technician,
    } satisfies ResultParameter;
  });

  const record: ResultEntry = {
    id: `res-${Date.now()}`,
    sampleId: parsed.sampleId,
    orderId: parsed.orderId,
    patientId: parsed.patientId,
    patientName: parsed.patientName,
    testName: parsed.testName,
    status: parsed.status,
    resultType: parsed.resultType,
    parameters,
    technician: parsed.technician,
    directResult: parsed.directResult,
    createdAt: now,
    updatedAt: now,
    history: [
      {
        id: `history-${Date.now()}`,
        action: parsed.status,
        actor: parsed.technician,
        timestamp: now,
        note: parsed.status === "draft" ? "Draft saved" : "Result created",
      },
    ],
    amendments: [],
  };

  resultEntries.unshift(record);
  return record;
}

export function getResultEntryById(id: string) {
  return resultEntries.find((entry) => entry.id === id) ?? null;
}

export function getPendingResults() {
  return resultEntries.filter((entry) => entry.status !== "verified");
}

export function submitResultEntry(id: string, actor = "System") {
  const entry = getResultEntryById(id);
  if (!entry) return null;
  entry.status = "submitted";
  entry.submittedAt = new Date().toISOString();
  entry.updatedAt = entry.submittedAt;
  entry.history.push({
    id: `history-${Date.now()}`,
    action: "submitted",
    actor,
    timestamp: entry.submittedAt,
    note: "Result submitted for pathologist verification",
  });
  return entry;
}

export function verifyResultEntry(id: string, verifiedBy: string) {
  const entry = getResultEntryById(id);
  if (!entry) return null;
  if (entry.status === "verified") {
    return entry;
  }

  entry.status = "verified";
  entry.verifiedAt = new Date().toISOString();
  entry.verifiedBy = verifiedBy;
  entry.updatedAt = entry.verifiedAt;
  entry.history.push({
    id: `history-${Date.now()}`,
    action: "verified",
    actor: verifiedBy,
    timestamp: entry.verifiedAt,
    note: "Result verified and report ready",
  });
  return entry;
}

export function amendVerifiedResult(id: string, reason: string, amendedBy: string, amendedValues: Record<string, unknown>) {
  const entry = getResultEntryById(id);
  if (!entry) return null;
  if (entry.status !== "verified") {
    return null;
  }

  const previousValues = JSON.parse(JSON.stringify(entry.parameters));
  entry.status = "amended";
  entry.updatedAt = new Date().toISOString();
  entry.history.push({
    id: `history-${Date.now()}`,
    action: "amended",
    actor: amendedBy,
    timestamp: entry.updatedAt,
    note: `Correction requested: ${reason}`,
  });
  entry.amendments.push({
    id: `amend-${Date.now()}`,
    reason,
    createdBy: amendedBy,
    createdAt: entry.updatedAt,
    previousValues,
    amendedValues,
  });
  return entry;
}

export function updateDraftResult(id: string, patch: Partial<ResultEntry>) {
  const entry = getResultEntryById(id);
  if (!entry) return null;
  Object.assign(entry, patch, { updatedAt: new Date().toISOString() });
  entry.history.push({
    id: `history-${Date.now()}`,
    action: "edited",
    actor: patch.technician ?? entry.technician,
    timestamp: entry.updatedAt,
    note: "Draft updated",
  });
  return entry;
}

export function getResultHistory(id: string) {
  const entry = getResultEntryById(id);
  return entry?.history ?? [];
}
