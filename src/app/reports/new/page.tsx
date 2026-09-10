"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function NewReportPage() {
  const [form, setForm] = useState({
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    doctorName: "Dr. Adebayo",
    pathologistName: "Dr. Nwosu",
    sampleId: "SMP-101001",
    testName: "Complete Blood Count",
    laboratoryName: "LabSoft Diagnostic Center",
    templateName: "standard",
    rows: [
      { parameterName: "Hemoglobin", resultValue: "11.8", unit: "g/dL", referenceRange: "12.0-16.0", abnormalFlag: true, criticalFlag: false, comments: "Repeat review recommended" },
      { parameterName: "WBC Count", resultValue: "7.9", unit: "x10^9/L", referenceRange: "4.0-10.0", abnormalFlag: false, criticalFlag: false, comments: "Within expected range" },
    ],
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setMessage(response.ok ? `Report generated: ${payload.data.reportNumber}` : payload.error?.message ?? "Unable to generate report");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-600">Report generation</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Generate laboratory report</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Patient ID</span><input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Patient name</span><input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Doctor</span><input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Pathologist</span><input value={form.pathologistName} onChange={(e) => setForm({ ...form, pathologistName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Sample ID</span><input value={form.sampleId} onChange={(e) => setForm({ ...form, sampleId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Test name</span><input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
            <label className="space-y-2 text-sm md:col-span-2"><span className="font-medium text-slate-700">Laboratory name</span><input value={form.laboratoryName} onChange={(e) => setForm({ ...form, laboratoryName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
          </div>

          <div className="mt-6 space-y-4">
            {form.rows.map((row, index) => (
              <div key={`${row.parameterName}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-5">
                  <label className="space-y-2 text-sm md:col-span-2"><span className="font-medium text-slate-700">Parameter</span><input value={row.parameterName} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], parameterName: e.target.value }; setForm({ ...form, rows: next }); }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                  <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Result</span><input value={row.resultValue} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], resultValue: e.target.value }; setForm({ ...form, rows: next }); }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                  <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Unit</span><input value={row.unit ?? ""} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], unit: e.target.value }; setForm({ ...form, rows: next }); }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                  <label className="space-y-2 text-sm"><span className="font-medium text-slate-700">Reference</span><input value={row.referenceRange ?? ""} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], referenceRange: e.target.value }; setForm({ ...form, rows: next }); }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={row.abnormalFlag} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], abnormalFlag: e.target.checked }; setForm({ ...form, rows: next }); }} /> Abnormal</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={row.criticalFlag} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], criticalFlag: e.target.checked }; setForm({ ...form, rows: next }); }} /> Critical</label>
                  <label className="space-y-2 text-sm md:col-span-1"><span className="font-medium text-slate-700">Comment</span><input value={row.comments ?? ""} onChange={(e) => { const next = [...form.rows]; next[index] = { ...next[index], comments: e.target.value }; setForm({ ...form, rows: next }); }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5" /></label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">Generate report</button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
