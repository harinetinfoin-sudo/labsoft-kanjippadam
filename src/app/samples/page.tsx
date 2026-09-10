"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type SampleRow = {
  id: string;
  sampleId: string;
  barcode: string;
  patientName: string;
  sampleType: string;
  collectionDateTime: string;
  collector: string;
  status: string;
  rejectionReason?: string;
};

export default function SamplesPage() {
  const [samples, setSamples] = useState<SampleRow[]>([]);

  useEffect(() => {
    fetch("/api/samples")
      .then((response) => response.json())
      .then((payload) => setSamples(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Sample tracking</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Sample management</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/samples/history" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
              View history
            </Link>
            <Link href="/samples/label" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
              Print labels
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Sample queue</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{samples.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Sample ID</th>
                    <th className="py-3 pr-4 font-medium">Barcode</th>
                    <th className="py-3 pr-4 font-medium">Patient</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Collector</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((sample) => (
                    <tr key={sample.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{sample.sampleId}</td>
                      <td className="py-3 pr-4 text-slate-600">{sample.barcode}</td>
                      <td className="py-3 pr-4">{sample.patientName}</td>
                      <td className="py-3 pr-4 text-slate-600">{sample.sampleType}</td>
                      <td className="py-3 pr-4 text-slate-600">{sample.collector}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                          {sample.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Collection workflow</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">1. Registration</p>
                <p className="mt-1">Assign unique sample ID and barcode for every collection.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">2. Collection</p>
                <p className="mt-1">Capture collector, location, and date-time before transport.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-800">3. Rejection/Recollection</p>
                <p className="mt-1">Reject unsuitable specimens and create a controlled recollection workflow.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
