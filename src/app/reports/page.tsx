"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type ReportRow = {
  id: string;
  reportNumber: string;
  patientName: string;
  testName: string;
  status: string;
  doctorName: string;
  pathologistName: string;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((response) => response.json())
      .then((payload) => setReports(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-violet-600">Report generation</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Laboratory reports</h1>
          </div>
          <Link href="/reports/new" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">Generate report</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Verification pending</p><p className="mt-2 text-2xl font-bold text-slate-900">{reports.filter((r) => r.status === "Verification Pending").length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Released</p><p className="mt-2 text-2xl font-bold text-emerald-600">{reports.filter((r) => r.status === "Released").length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Amended</p><p className="mt-2 text-2xl font-bold text-amber-600">{reports.filter((r) => r.status === "Amended").length}</p></div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Report #</th>
                  <th className="py-3 pr-4 font-medium">Patient</th>
                  <th className="py-3 pr-4 font-medium">Test</th>
                  <th className="py-3 pr-4 font-medium">Doctor</th>
                  <th className="py-3 pr-4 font-medium">Pathologist</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{report.reportNumber}</td>
                    <td className="py-3 pr-4">{report.patientName}</td>
                    <td className="py-3 pr-4">{report.testName}</td>
                    <td className="py-3 pr-4 text-slate-600">{report.doctorName}</td>
                    <td className="py-3 pr-4 text-slate-600">{report.pathologistName}</td>
                    <td className="py-3 pr-4"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">{report.status}</span></td>
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
