"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function NewSamplePage() {
  const [form, setForm] = useState({
    orderId: "ORD-3010",
    patientId: "PT-1010",
    patientName: "Ada Okoye",
    sampleType: "Whole Blood",
    collectionDateTime: new Date().toISOString().slice(0, 16),
    collector: "N. Adebayo",
    collectionLocation: "Ward A",
    status: "Sample Pending",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json();
    setMessage(response.ok ? `Sample registered: ${payload.data.sampleId}` : payload.error?.message ?? "Unable to register sample");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Sample collection</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Register new sample</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Order ID</span>
              <input value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Patient ID</span>
              <input value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-medium text-slate-700">Patient name</span>
              <input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Sample type</span>
              <input value={form.sampleType} onChange={(e) => setForm({ ...form, sampleType: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Collection date/time</span>
              <input type="datetime-local" value={form.collectionDateTime} onChange={(e) => setForm({ ...form, collectionDateTime: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Collector</span>
              <input value={form.collector} onChange={(e) => setForm({ ...form, collector: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Collection location</span>
              <input value={form.collectionLocation} onChange={(e) => setForm({ ...form, collectionLocation: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium text-slate-700">Initial status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-0 focus:border-cyan-500">
                <option>Sample Pending</option>
                <option>Collected</option>
                <option>Received in Laboratory</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button type="submit" className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white">Register sample</button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
