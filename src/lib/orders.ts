import { z } from "zod";

export type OrderStatus =
  | "Draft"
  | "Registered"
  | "Sample Pending"
  | "Sample Collected"
  | "Processing"
  | "Result Pending"
  | "Verification Pending"
  | "Completed"
  | "Cancelled";

export type Order = {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  tests: Array<{ code: string; name: string; price: number }>;
  totalAmount: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  status: OrderStatus;
  createdAt: string;
};

export const orderSchema = z.object({
  patientId: z.string().min(1),
  doctorName: z.string().min(1),
  tests: z.array(z.object({ code: z.string(), name: z.string(), price: z.number().nonnegative() })).min(1),
  paymentStatus: z.enum(["Unpaid", "Partial", "Paid"]).default("Unpaid"),
  status: z.enum([
    "Draft",
    "Registered",
    "Sample Pending",
    "Sample Collected",
    "Processing",
    "Result Pending",
    "Verification Pending",
    "Completed",
    "Cancelled",
  ]).default("Registered"),
});

export function calculateOrderTotal(tests: Array<{ price: number }>) {
  return tests.reduce((sum, test) => sum + Number(test.price ?? 0), 0);
}

export function createOrderNumber() {
  return `ORD-${Date.now().toString().slice(-6)}`;
}

export const seedOrders: Order[] = [
  {
    id: "ord-001",
    orderNumber: "ORD-2048",
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    doctorName: "Dr. Adebayo",
    tests: [{ code: "CBC01", name: "Complete Blood Count", price: 45 }],
    totalAmount: 45,
    paymentStatus: "Unpaid",
    status: "Sample Collected",
    createdAt: "2026-08-02T08:00:00.000Z",
  },
  {
    id: "ord-002",
    orderNumber: "ORD-2049",
    patientId: "PT-1002",
    patientName: "Michael Chen",
    doctorName: "Dr. Hassan",
    tests: [{ code: "CHE02", name: "Liver Function Test", price: 68 }],
    totalAmount: 68,
    paymentStatus: "Paid",
    status: "Completed",
    createdAt: "2026-08-03T10:00:00.000Z",
  },
];

export function listOrders() {
  return seedOrders;
}
