"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function NewResultPage() {
  const [form, setForm] = useState({
    sampleId: "SMP-101001",
    orderId: "ORD-2048",
    patientId: "PT-1001",
    patientName: "Sarah Okafor",
    testName: "Complete Blood Count",
    resultType: "numeric",
    technician: "A. Bello",
    status: "draft",
    parameters: [
      {
        parameterName: "Hemoglobin",
        resultValue: "11.8",
        unit: "g/dL",
        referenceRange: "12.0-16.0",
        resultType: "numeric",
        resultTimestamp: new Date().toISOString(),
      },
      {
        parameterName: "Platelets",
        resultValue: "240",
        unit: "x10^9/L",
        referenceRange: "150-450",
        resultType: "numeric",
        resultTimestamp: new Date().toISOString(),
      },
    ],
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setMessage(response.ok ? `Result saved: ${payload.data.id}` : payload.error?.message ?? "Unable to save result");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-600">Result entry</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">New result entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Sample ID</span>
              <input value={form.sampleId} onChange={(e) => setForm({ ...form, sampleId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Order ID</span>
              <input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">Patient name</span>
              <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">Test name</span>
              <input value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {form.parameters.map((param, index) => (
              <div key={`${param.parameterName}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Parameter</span>
                    <input value={param.parameterName} onChange={(e) => {
                      const next = [...form.parameters];
                      next[index] = { ...next[index], parameterName: e.target.value };
                      setForm({ ...form, parameters: next });
                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Result</span>
                    <input value={String(param.resultValue ?? "")} onChange={(e) => {
                      const next = [...form.parameters];
                      next[index] = { ...next[index], resultValue: e.target.value };
                      setForm({ ...form, parameters: next });
                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Unit</span>
                    <input value={param.unit ?? ""} onChange={(e) => {
                      const next = [...form.parameters];
                      next[index] = { ...next[index], unit: e.target.value };
                      setForm({ ...form, parameters: next });
                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
                  </label>
                </div>
                <div className="mt-3">
                  <label className="space-y-2 text-sm">
                    <span className="font-medium text-slate-700">Reference range</span>
                    <input value={param.referenceRange ?? ""} onChange={(e) => {
                      const next = [...form.parameters];
                      next[index] = { ...next[index], referenceRange: e.target.value };
                      setForm({ ...form, parameters: next });
                    }} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-violet-500" />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">Save result</button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
