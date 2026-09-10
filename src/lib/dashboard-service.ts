import { listOrders } from "@/lib/orders";
import { searchPatients } from "@/lib/patient-service";
import { resultEntries } from "@/lib/result-entry";
import { seedSamples } from "@/lib/sample-management";
import { getExpiryAlerts, getInventoryDashboard, getLowStockAlerts, stockLedgerSeed } from "@/lib/inventory-management";
import { reportSeed } from "@/lib/report-generation";

export type DashboardRange = "today" | "yesterday" | "week" | "month" | "custom";

export type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  tone: "cyan" | "amber" | "emerald" | "violet";
};

export type DashboardRow = {
  key: string;
  title: string;
  meta?: string;
  value?: string | number;
  badge?: string;
};

export type DashboardSection = {
  title: string;
  rows: DashboardRow[];
};

export type AuditLogEntry = {
  id: string;
  action: string;
  actor: string;
  entity: string;
  type: string;
  timestamp: string;
  details?: string;
};

function clampDate(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString();
}

function getWindow(range: DashboardRange, customStart?: string, customEnd?: string) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (range === "today") {
    return { start: startOfToday, end: endOfToday };
  }

  if (range === "yesterday") {
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
      end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999),
    };
  }

  if (range === "week") {
    const weekStart = new Date(startOfToday);
    weekStart.setDate(weekStart.getDate() - 6);
    return { start: weekStart, end: endOfToday };
  }

  if (range === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: monthStart, end: endOfToday };
  }

  if (customStart && customEnd) {
    return {
      start: new Date(customStart),
      end: new Date(customEnd),
    };
  }

  return { start: startOfToday, end: endOfToday };
}

function matchesDateRange(dateValue: string | undefined, start: Date, end: Date) {
  if (!dateValue) return false;
  const value = new Date(dateValue);
  return value >= start && value <= end;
}

function asCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

function getFinancialRows(events: Array<{ id: string; label: string; amount: number; status: string; timestamp: string }>, range: DashboardRange, customStart?: string, customEnd?: string) {
  const { start, end } = getWindow(range, customStart, customEnd);
  return events
    .filter((event) => matchesDateRange(event.timestamp, start, end))
    .map((event) => ({ key: event.id, title: event.label, meta: event.status, value: asCurrency(event.amount) }));
}

export function getAuditLogEntries(range: DashboardRange = "today", customStart?: string, customEnd?: string): AuditLogEntry[] {
  const { start, end } = getWindow(range, customStart, customEnd);
  const patients = searchPatients({ page: 1, pageSize: 1000 }).data;
  const orders = listOrders();
  const samples = seedSamples;
  const results = resultEntries;
  const reportItems = reportSeed;
  const inventoryMoves = stockLedgerSeed;

  const entries: AuditLogEntry[] = [
    ...patients.map((patient) => ({
      id: `patient-${patient.id}`,
      action: "Patient registration",
      actor: patient.doctorName ?? "Reception",
      entity: patient.patientNumber,
      type: "patient",
      timestamp: patient.createdAt,
      details: `${patient.firstName} ${patient.lastName}`,
    })),
    ...orders.map((order) => ({
      id: `order-${order.id}`,
      action: "Order created",
      actor: order.doctorName,
      entity: order.orderNumber,
      type: "order",
      timestamp: order.createdAt,
      details: `${order.patientName} • ${order.paymentStatus}`,
    })),
    ...samples.map((sample) => ({
      id: `sample-${sample.id}`,
      action: `Sample ${sample.status}`,
      actor: sample.collector,
      entity: sample.sampleId,
      type: "sample",
      timestamp: sample.createdAt,
      details: sample.sampleType,
    })),
    ...results.map((result) => ({
      id: `result-${result.id}`,
      action: `Result ${result.status}`,
      actor: result.technician,
      entity: result.testName,
      type: "result",
      timestamp: result.updatedAt,
      details: result.patientName,
    })),
    ...reportItems.map((report) => ({
      id: `report-${report.id}`,
      action: `Report ${report.status}`,
      actor: report.pathologistName ?? "System",
      entity: report.reportNumber,
      type: "report",
      timestamp: report.generatedAt,
      details: report.patientName,
    })),
    ...inventoryMoves.map((move) => ({
      id: `inventory-${move.id}`,
      action: move.transactionType.replace(/_/g, " "),
      actor: move.createdBy,
      entity: move.referenceId ?? move.inventoryItemId,
      type: "inventory",
      timestamp: move.transactionDate,
      details: `${move.quantity} units`,
    })),
  ];

  return entries.filter((entry) => matchesDateRange(entry.timestamp, start, end));
}

export function getDashboardSummary(role: string, range: DashboardRange = "today", customStart?: string, customEnd?: string) {
  const { start, end } = getWindow(range, customStart, customEnd);
  const patients = searchPatients({ page: 1, pageSize: 1000 }).data;
  const orders = listOrders();
  const results = resultEntries;
  const samples = seedSamples;
  const reports = reportSeed;
  const inventory = getInventoryDashboard();
  const alerts = [...getLowStockAlerts(), ...getExpiryAlerts()];

  const patientRows = patients.filter((patient) => matchesDateRange(patient.createdAt, start, end));
  const orderRows = orders.filter((order) => matchesDateRange(order.createdAt, start, end));
  const paidOrderValue = orders
    .filter((order) => order.paymentStatus === "Paid")
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const outstandingInvoices = orders
    .filter((order) => order.paymentStatus !== "Paid")
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingVerification = results.filter((result) => result.status === "submitted" || result.status === "draft").length;
  const submittedResults = results.filter((result) => result.status === "submitted").length;
  const criticalResults = results.filter((result) => result.parameters.some((parameter) => parameter.criticalFlag)).length;
  const pendingReports = reports.filter((report) => report.status !== "Released" && report.status !== "Amended").length;
  const pendingSamples = samples.filter((sample) => ["SAMPLE_PENDING", "COLLECTED", "RECEIVED_IN_LABORATORY", "PROCESSING"].includes(sample.status)).length;

  const roleMetrics: Record<string, DashboardMetric[]> = {
    "Super Admin": [
      { label: "Total patients", value: String(patients.length), change: `${patientRows.length} this range`, tone: "cyan" },
      { label: "Total orders", value: String(orders.length), change: `${orderRows.length} this range`, tone: "amber" },
      { label: "Revenue", value: asCurrency(paidOrderValue), change: `${asCurrency(outstandingInvoices)} outstanding`, tone: "emerald" },
      { label: "Pending tests", value: String(pendingVerification), change: `${submittedResults} awaiting verification`, tone: "violet" },
    ],
    Receptionist: [
      { label: "Today's registrations", value: String(patientRows.length), change: `${patients.length} total`, tone: "cyan" },
      { label: "Today's orders", value: String(orderRows.length), change: `${orders.length} total`, tone: "amber" },
      { label: "Pending payments", value: String(orders.filter((order) => order.paymentStatus !== "Paid").length), change: asCurrency(outstandingInvoices), tone: "violet" },
      { label: "Pending samples", value: String(pendingSamples), change: `${samples.filter((sample) => sample.status === "Sample Pending").length} awaiting collection`, tone: "emerald" },
    ],
    "Lab Technician": [
      { label: "Pending samples", value: String(pendingSamples), change: "Awaiting processing", tone: "cyan" },
      { label: "Pending tests", value: String(results.filter((result) => result.status !== "verified").length), change: `${submittedResults} submitted`, tone: "amber" },
      { label: "Result entry queue", value: String(results.filter((result) => result.status === "draft" || result.status === "submitted").length), change: "Needs technician action", tone: "emerald" },
      { label: "Critical results", value: String(criticalResults), change: "Escalate review", tone: "violet" },
    ],
    "Pathologist/Doctor": [
      { label: "Verification queue", value: String(submittedResults), change: "Ready for review", tone: "cyan" },
      { label: "Critical results", value: String(criticalResults), change: "Requires signoff", tone: "amber" },
      { label: "Pending reports", value: String(pendingReports), change: `${reports.filter((report) => report.status === "Released").length} released`, tone: "emerald" },
      { label: "Review load", value: String(Math.max(1, submittedResults + criticalResults)), change: "Current workload", tone: "violet" },
    ],
    Accountant: [
      { label: "Revenue", value: asCurrency(paidOrderValue), change: `${orderRows.length} orders in range`, tone: "emerald" },
      { label: "Payments", value: asCurrency(orders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.totalAmount, 0)), change: "Cleared this period", tone: "cyan" },
      { label: "Outstanding invoices", value: String(orders.filter((order) => order.paymentStatus !== "Paid").length), change: asCurrency(outstandingInvoices), tone: "amber" },
      { label: "Monthly summary", value: asCurrency(paidOrderValue + outstandingInvoices), change: "Current cycle total", tone: "violet" },
    ],
    "Inventory Manager": [
      { label: "Current stock", value: String(inventory.summary.totalItems), change: `${inventory.summary.stockValue.toFixed(2)} value`, tone: "cyan" },
      { label: "Low stock", value: String(inventory.summary.lowStock), change: "Needs reorder", tone: "amber" },
      { label: "Expiring items", value: String(inventory.summary.expiringSoon), change: "Review inventory", tone: "violet" },
      { label: "Recent movements", value: String(stockLedgerSeed.filter((entry) => matchesDateRange(entry.transactionDate, start, end)).length), change: "Stock history", tone: "emerald" },
    ],
  };

  const sectionMap: Record<string, DashboardSection[]> = {
    "Super Admin": [
      {
        title: "Operational overview",
        rows: [
          { key: "patients", title: "Patients", value: patients.length },
          { key: "orders", title: "Orders", value: orders.length },
          { key: "revenue", title: "Revenue", value: asCurrency(paidOrderValue) },
          { key: "activity", title: "System activity", value: getAuditLogEntries(range, customStart, customEnd).length },
        ],
      },
      {
        title: "Inventory alerts",
        rows: alerts.slice(0, 5).map((alert) => ({
          key: alert.id,
          title: alert.itemName,
          meta: alert.type,
          badge: alert.severity,
          value: alert.itemCode,
        })),
      },
    ],
    Receptionist: [
      {
        title: "Front desk queue",
        rows: [
          { key: "registrations", title: "Registrations", value: patientRows.length, badge: "today" },
          { key: "new-orders", title: "Orders", value: orderRows.length, badge: "today" },
          { key: "pending-payments", title: "Pending payments", value: orders.filter((order) => order.paymentStatus !== "Paid").length },
          { key: "pending-samples", title: "Pending samples", value: pendingSamples },
        ],
      },
    ],
    "Lab Technician": [
      {
        title: "Workflow queue",
        rows: [
          { key: "samples", title: "Pending samples", value: pendingSamples },
          { key: "tests", title: "Pending tests", value: results.filter((result) => result.status !== "verified").length },
          { key: "entries", title: "Result entry queue", value: results.filter((result) => result.status === "draft" || result.status === "submitted").length },
          { key: "critical", title: "Critical results", value: criticalResults },
        ],
      },
    ],
    "Pathologist/Doctor": [
      {
        title: "Review queue",
        rows: [
          { key: "verification", title: "Verification queue", value: submittedResults },
          { key: "critical", title: "Critical results", value: criticalResults },
          { key: "reports", title: "Pending reports", value: pendingReports },
        ],
      },
    ],
    Accountant: [
      {
        title: "Financial summary",
        rows: [
          { key: "revenue", title: "Revenue", value: asCurrency(paidOrderValue) },
          { key: "payments", title: "Payments", value: asCurrency(orders.filter((order) => order.paymentStatus === "Paid").reduce((sum, order) => sum + order.totalAmount, 0)) },
          { key: "outstanding", title: "Outstanding invoices", value: asCurrency(outstandingInvoices) },
        ],
      },
      {
        title: "Recent financial activity",
        rows: getFinancialRows(
          orders.map((order) => ({
            id: order.id,
            label: `${order.patientName} • ${order.orderNumber}`,
            amount: order.totalAmount,
            status: order.paymentStatus,
            timestamp: order.createdAt,
          })),
          range,
          customStart,
          customEnd,
        ),
      },
    ],
    "Inventory Manager": [
      {
        title: "Stock overview",
        rows: [
          { key: "current", title: "Current stock", value: inventory.summary.totalItems },
          { key: "low", title: "Low stock", value: inventory.summary.lowStock },
          { key: "expiring", title: "Expiring items", value: inventory.summary.expiringSoon },
          { key: "value", title: "Stock value", value: asCurrency(inventory.summary.stockValue) },
        ],
      },
      {
        title: "Recent stock movements",
        rows: stockLedgerSeed
          .filter((entry) => matchesDateRange(entry.transactionDate, start, end))
          .slice(0, 5)
          .map((entry) => ({
            key: entry.id,
            title: entry.referenceId ?? entry.inventoryItemId,
            meta: entry.transactionType.replace(/_/g, " "),
            value: `${entry.quantity} units`,
            badge: entry.batchNumber ?? "batch",
          })),
      },
    ],
  };

  return {
    role,
    range,
    metrics: roleMetrics[role] ?? roleMetrics["Super Admin"],
    sections: sectionMap[role] ?? sectionMap["Super Admin"],
    alerts,
    auditEntries: getAuditLogEntries(range, customStart, customEnd),
  };
}
