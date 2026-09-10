import { z } from "zod";

export type ReportStatus =
  | "Verification Pending"
  | "Pathologist Review"
  | "Verified"
  | "Report Generated"
  | "Released"
  | "Amended";

export type ReportTemplate = {
  id: string;
  name: string;
  heading: string;
  subtitle: string;
  format: "standard" | "microbiology" | "chemistry" | "haematology";
};

export type ReportRow = {
  parameterName: string;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  abnormalFlag: boolean;
  criticalFlag: boolean;
  comments?: string;
};

export type ReportRecord = {
  id: string;
  reportNumber: string;
  reportVersion: number;
  status: ReportStatus;
  generatedAt: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  pathologistName: string;
  sampleId: string;
  testName: string;
  laboratoryName: string;
  templateName: string;
  rows: ReportRow[];
  releaseNote?: string;
  isImmutable: boolean;
  revisionHistory: Array<{
    version: number;
    timestamp: string;
    actor: string;
    note: string;
  }>;
};

export const reportTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  heading: z.string(),
  subtitle: z.string(),
  format: z.enum(["standard", "microbiology", "chemistry", "haematology"]),
});

export const reportSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  doctorName: z.string().min(1),
  pathologistName: z.string().min(1),
  sampleId: z.string().min(1),
  testName: z.string().min(1),
  laboratoryName: z.string().default("LabSoft Diagnostic Center"),
  templateName: z.string().default("standard"),
  rows: z.array(
    z.object({
      parameterName: z.string().min(1),
      resultValue: z.string().min(1),
      unit: z.string().optional(),
      referenceRange: z.string().optional(),
      abnormalFlag: z.boolean().default(false),
      criticalFlag: z.boolean().default(false),
      comments: z.string().optional(),
    }),
  ).min(1),
});

export const reportTemplates: ReportTemplate[] = [
  {
    id: "tmpl-standard",
    name: "Standard Clinical Report",
    heading: "Laboratory Report",
    subtitle: "Clinical pathology report",
    format: "standard",
  },
  {
    id: "tmpl-haematology",
    name: "Haematology Report",
    heading: "Haematology Report",
    subtitle: "Blood cell analysis",
    format: "haematology",
  },
  {
    id: "tmpl-chemistry",
    name: "Chemistry Report",
    heading: "Clinical Chemistry Report",
    subtitle: "Biochemistry and serum studies",
    format: "chemistry",
  },
  {
    id: "tmpl-microbiology",
    name: "Microbiology Report",
    heading: "Microbiology Report",
    subtitle: "Culture and sensitivity findings",
    format: "microbiology",
  },
];

export const reportSeed: ReportRecord[] = [
  {
    id: "rep-1001",
    reportNumber: "LAB-REP-2026-001",
    reportVersion: 1,
    status: "Released",
    generatedAt: "2026-08-28T10:00:00.000Z",
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    doctorName: "Dr. Adebayo",
    pathologistName: "Dr. Nwosu",
    sampleId: "SMP-101001",
    testName: "Complete Blood Count",
    laboratoryName: "LabSoft Diagnostic Center",
    templateName: "standard",
    rows: [
      { parameterName: "Hemoglobin", resultValue: "11.8", unit: "g/dL", referenceRange: "12.0-16.0", abnormalFlag: true, criticalFlag: false, comments: "Mildly low" },
      { parameterName: "WBC Count", resultValue: "7.9", unit: "x10^9/L", referenceRange: "4.0-10.0", abnormalFlag: false, criticalFlag: false, comments: "Within range" },
    ],
    isImmutable: true,
    revisionHistory: [
      { version: 1, timestamp: "2026-08-28T10:00:00.000Z", actor: "Dr. Nwosu", note: "Report released" },
    ],
  },
];

export function generateReportNumber() {
  return `LAB-REP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

export function createReport(input: unknown): ReportRecord {
  const parsed = reportSchema.parse(input);
  const now = new Date().toISOString();
  const record: ReportRecord = {
    id: `rep-${Date.now()}`,
    reportNumber: generateReportNumber(),
    reportVersion: 1,
    status: "Report Generated",
    generatedAt: now,
    patientId: parsed.patientId,
    patientName: parsed.patientName,
    doctorName: parsed.doctorName,
    pathologistName: parsed.pathologistName,
    sampleId: parsed.sampleId,
    testName: parsed.testName,
    laboratoryName: parsed.laboratoryName,
    templateName: parsed.templateName,
    rows: parsed.rows,
    isImmutable: false,
    revisionHistory: [
      { version: 1, timestamp: now, actor: parsed.pathologistName, note: "Initial report generated" },
    ],
  };

  reportSeed.unshift(record);
  return record;
}

export function releaseReport(id: string, actor: string, releaseNote?: string) {
  const report = reportSeed.find((item) => item.id === id);
  if (!report) return null;

  report.status = "Released";
  report.isImmutable = true;
  report.releaseNote = releaseNote ?? "Released to clinician";
  report.revisionHistory.push({ version: report.reportVersion, timestamp: new Date().toISOString(), actor, note: report.releaseNote });
  return report;
}

export function amendReport(id: string, reason: string, actor: string) {
  const report = reportSeed.find((item) => item.id === id);
  if (!report) return null;
  if (report.isImmutable) {
    report.reportVersion += 1;
    report.status = "Amended";
    report.isImmutable = false;
    report.revisionHistory.push({ version: report.reportVersion, timestamp: new Date().toISOString(), actor, note: reason });
    return report;
  }

  return report;
}

export function getReportById(id: string) {
  return reportSeed.find((report) => report.id === id) ?? null;
}

export function getReports() {
  return reportSeed;
}

export function buildPdfHtml(report: ReportRecord) {
  return `
    <html>
      <head><title>${report.reportNumber}</title></head>
      <body style="font-family: Arial, sans-serif; color: #111827; padding: 32px;">
        <h1 style="text-align:center; margin-bottom: 8px;">${report.laboratoryName}</h1>
        <p style="text-align:center; margin: 0 0 20px; color: #475569;">${report.templateName.toUpperCase()} REPORT</p>
        <div style="display:flex; justify-content:space-between; border-bottom: 1px solid #cbd5e1; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <strong>Report No:</strong> ${report.reportNumber}<br />
            <strong>Patient:</strong> ${report.patientName}<br />
            <strong>Sample:</strong> ${report.sampleId}
          </div>
          <div>
            <strong>Doctor:</strong> ${report.doctorName}<br />
            <strong>Pathologist:</strong> ${report.pathologistName}<br />
            <strong>Date:</strong> ${new Date(report.generatedAt).toLocaleString()}
          </div>
        </div>
        <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">Parameter</th>
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">Result</th>
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">Reference</th>
              <th style="border:1px solid #e2e8f0; padding:8px; text-align:left;">Comment</th>
            </tr>
          </thead>
          <tbody>
            ${report.rows.map((row) => `
              <tr>
                <td style="border:1px solid #e2e8f0; padding:8px;">${row.parameterName}</td>
                <td style="border:1px solid #e2e8f0; padding:8px;">${row.resultValue} ${row.unit ?? ""}</td>
                <td style="border:1px solid #e2e8f0; padding:8px;">${row.referenceRange ?? "-"}</td>
                <td style="border:1px solid #e2e8f0; padding:8px;">${row.comments ?? "-"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="margin-top: 24px;">
          <p><strong>Signed by:</strong> ${report.pathologistName}</p>
          <p><strong>Authorized signature</strong></p>
        </div>
      </body>
    </html>
  `;
}
