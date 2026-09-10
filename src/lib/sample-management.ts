import { z } from "zod";

export type SampleStatus =
  | "Order Created"
  | "Sample Pending"
  | "Collected"
  | "Received in Laboratory"
  | "Processing"
  | "Completed"
  | "Rejected"
  | "Recollection Requested"
  | "Recollected";

export type SampleRecord = {
  id: string;
  sampleId: string;
  barcode: string;
  orderId: string;
  patientId: string;
  patientName: string;
  sampleType: string;
  collectionDateTime: string;
  collector: string;
  collectionLocation: string;
  status: SampleStatus;
  processingLocation?: string;
  storageLocation?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{
    status: SampleStatus;
    timestamp: string;
    note?: string;
  }>;
};

export const sampleSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  patientId: z.string().min(1, "Patient ID is required"),
  patientName: z.string().min(2, "Patient name is required"),
  sampleType: z.string().min(2, "Sample type is required"),
  collectionDateTime: z.string().min(1, "Collection date/time is required"),
  collector: z.string().min(2, "Collector is required"),
  collectionLocation: z.string().min(2, "Collection location is required"),
  status: z.enum([
    "Order Created",
    "Sample Pending",
    "Collected",
    "Received in Laboratory",
    "Processing",
    "Completed",
    "Rejected",
    "Recollection Requested",
    "Recollected",
  ]).default("Sample Pending"),
  processingLocation: z.string().optional(),
  storageLocation: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export function generateSampleId() {
  return `SMP-${Date.now().toString().slice(-6)}`;
}

export function generateBarcode() {
  return `BC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export const seedSamples: SampleRecord[] = [
  {
    id: "sample-001",
    sampleId: "SMP-101001",
    barcode: "BC-8F4K7Z",
    orderId: "ORD-2048",
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    sampleType: "Whole Blood",
    collectionDateTime: "2026-08-28T08:15:00.000Z",
    collector: "N. Adebayo",
    collectionLocation: "Ward A",
    status: "Received in Laboratory",
    processingLocation: "Hematology bench",
    storageLocation: "Refrigerator 2",
    createdAt: "2026-08-28T08:10:00.000Z",
    updatedAt: "2026-08-28T08:45:00.000Z",
    history: [
      { status: "Order Created", timestamp: "2026-08-28T08:10:00.000Z", note: "Order created and sample scheduled" },
      { status: "Sample Pending", timestamp: "2026-08-28T08:12:00.000Z", note: "Awaiting collection" },
      { status: "Collected", timestamp: "2026-08-28T08:15:00.000Z", note: "Sample collected" },
      { status: "Received in Laboratory", timestamp: "2026-08-28T08:45:00.000Z", note: "Sample received by lab" },
    ],
  },
  {
    id: "sample-002",
    sampleId: "SMP-101002",
    barcode: "BC-E9Q2L4",
    orderId: "ORD-2049",
    patientId: "PT-1002",
    patientName: "Michael Chen",
    sampleType: "Serum",
    collectionDateTime: "2026-08-29T09:20:00.000Z",
    collector: "M. Okafor",
    collectionLocation: "Phlebotomy Unit",
    status: "Processing",
    processingLocation: "Chemistry analyzer",
    storageLocation: "Cold room A",
    createdAt: "2026-08-29T09:10:00.000Z",
    updatedAt: "2026-08-29T09:55:00.000Z",
    history: [
      { status: "Order Created", timestamp: "2026-08-29T09:10:00.000Z" },
      { status: "Sample Pending", timestamp: "2026-08-29T09:12:00.000Z" },
      { status: "Collected", timestamp: "2026-08-29T09:20:00.000Z" },
      { status: "Received in Laboratory", timestamp: "2026-08-29T09:45:00.000Z" },
      { status: "Processing", timestamp: "2026-08-29T09:55:00.000Z" },
    ],
  },
];

export function createSample(input: unknown): SampleRecord {
  const parsed = sampleSchema.parse(input);
  const now = new Date().toISOString();
  const sampleId = generateSampleId();
  const barcode = generateBarcode();

  const record: SampleRecord = {
    id: `sample-${Date.now()}`,
    sampleId,
    barcode,
    orderId: parsed.orderId,
    patientId: parsed.patientId,
    patientName: parsed.patientName,
    sampleType: parsed.sampleType,
    collectionDateTime: parsed.collectionDateTime,
    collector: parsed.collector,
    collectionLocation: parsed.collectionLocation,
    status: parsed.status,
    processingLocation: parsed.processingLocation,
    storageLocation: parsed.storageLocation,
    rejectionReason: parsed.rejectionReason,
    createdAt: now,
    updatedAt: now,
    history: [
      { status: "Order Created", timestamp: now, note: "Sample lifecycle started" },
      { status: parsed.status, timestamp: now, note: parsed.rejectionReason ?? "Sample update recorded" },
    ],
  };

  seedSamples.unshift(record);
  return record;
}

export function searchSamples(query?: string) {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return seedSamples;

  return seedSamples.filter((sample) =>
    [sample.sampleId, sample.barcode, sample.patientName, sample.patientId, sample.orderId, sample.sampleType].some((value) =>
      value.toLowerCase().includes(q),
    ),
  );
}

export function updateSampleStatus(sampleId: string, status: SampleStatus, note?: string) {
  const sample = seedSamples.find((item) => item.sampleId === sampleId || item.id === sampleId);
  if (!sample) return null;

  sample.status = status;
  sample.updatedAt = new Date().toISOString();
  sample.history.push({ status, timestamp: sample.updatedAt, note });
  return sample;
}

export function rejectSample(sampleId: string, rejectionReason: string) {
  const sample = updateSampleStatus(sampleId, "Rejected", rejectionReason);
  if (!sample) return null;
  sample.rejectionReason = rejectionReason;
  return sample;
}
