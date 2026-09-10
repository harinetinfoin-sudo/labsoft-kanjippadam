"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type HistoryRow = {
  id: string;
  sampleId: string;
  patientName: string;
  status: string;
  history: Array<{ status: string; timestamp: string; note?: string }>;
};

export default function SampleHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useEffect(() => {
    fetch("/api/samples")
      .then((response) => response.json())
      .then((payload) => setRows((payload.data ?? []).map((sample: any) => ({ ...sample, history: sample.history ?? [] }))));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Sample timeline</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Sample history and tracking</h1>
        </div>

        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{row.sampleId}</p>
                  <p className="text-sm text-slate-500">{row.patientName}</p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">{row.status}</span>
              </div>

              <div className="space-y-3 border-l border-slate-200 pl-4">
                {row.history.map((event) => (
                  <div key={`${row.id}-${event.timestamp}`} className="relative">
                    <div className="absolute -left-[1.05rem] top-1.5 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    <div className="ml-2">
                      <p className="text-sm font-semibold text-slate-800">{event.status}</p>
                      <p className="text-xs text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                      {event.note && <p className="mt-1 text-sm text-slate-600">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
