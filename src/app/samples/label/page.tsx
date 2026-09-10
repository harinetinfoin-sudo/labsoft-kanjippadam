"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type BarcodeRow = {
  id: string;
  sampleId: string;
  barcode: string;
  patientName: string;
  sampleType: string;
};

export default function SampleLabelPage() {
  const [rows, setRows] = useState<BarcodeRow[]>([]);

  useEffect(() => {
    fetch("/api/samples")
      .then((response) => response.json())
      .then((payload) => setRows(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Label printing</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Barcode labels</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm">
              <div className="mb-4 h-20 rounded-xl border border-slate-200 bg-slate-100 p-2">
                <div className="flex h-full items-center justify-center bg-white text-center font-mono text-xl tracking-[0.32em] text-slate-800">
                  {row.barcode}
                </div>
              </div>
              <p className="text-lg font-semibold text-slate-900">{row.sampleId}</p>
              <p className="text-sm text-slate-500">{row.patientName}</p>
              <p className="mt-1 text-sm text-slate-600">{row.sampleType}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
