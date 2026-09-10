"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type ResultEntryRow = {
  id: string;
  sampleId: string;
  patientName: string;
  testName: string;
  status: string;
  technician: string;
  parameters: Array<{ parameterName: string; abnormalFlag: boolean; criticalFlag: boolean }>;
};

export default function ResultsPage() {
  const [results, setResults] = useState<ResultEntryRow[]>([]);

  useEffect(() => {
    fetch("/api/results")
      .then((response) => response.json())
      .then((payload) => setResults(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-600">Result entry</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Laboratory results</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/results/history" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700">
              View history
            </Link>
            <button className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">New result</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Pending queue</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{results.filter((r) => r.status !== "verified").length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Abnormal flags</p>
            <p className="mt-2 text-2xl font-bold text-amber-600">{results.filter((r) => r.parameters.some((p) => p.abnormalFlag)).length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Critical alerts</p>
            <p className="mt-2 text-2xl font-bold text-rose-600">{results.filter((r) => r.parameters.some((p) => p.criticalFlag)).length}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Sample</th>
                  <th className="py-3 pr-4 font-medium">Patient</th>
                  <th className="py-3 pr-4 font-medium">Test</th>
                  <th className="py-3 pr-4 font-medium">Technician</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{result.sampleId}</td>
                    <td className="py-3 pr-4">{result.patientName}</td>
                    <td className="py-3 pr-4">{result.testName}</td>
                    <td className="py-3 pr-4 text-slate-600">{result.technician}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                        {result.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {result.parameters.some((param) => param.abnormalFlag) && (
                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">Abnormal</span>
                        )}
                        {result.parameters.some((param) => param.criticalFlag) && (
                          <span className="rounded-full bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">Critical</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
