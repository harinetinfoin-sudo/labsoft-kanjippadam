"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  actorName?: string | null;
  actorId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
};

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("q", search);
    if (entityType !== "all") params.set("entityType", entityType);

    fetch(`/api/audit?${params.toString()}`)
      .then((response) => response.json())
      .then((payload) => setEntries(payload.data ?? []));
  }, [search, entityType, page]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Audit log</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Medical system audit trail</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search action, entity, user, or value"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-0"
            />
            <select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              <option value="all">All entities</option>
              <option value="patient">Patient</option>
              <option value="order">Order</option>
              <option value="sample">Sample</option>
              <option value="result">Result</option>
              <option value="report">Report</option>
              <option value="inventory">Inventory</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Time</th>
                <th className="py-3 pr-4 font-medium">Action</th>
                <th className="py-3 pr-4 font-medium">Actor</th>
                <th className="py-3 pr-4 font-medium">Entity</th>
                <th className="py-3 pr-4 font-medium">Entity ID</th>
                <th className="py-3 pr-4 font-medium">Previous</th>
                <th className="py-3 pr-4 font-medium">New</th>
                <th className="py-3 pr-4 font-medium">IP / Device</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-100 last:border-b-0 align-top">
                  <td className="py-3 pr-4 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-medium text-slate-800">{entry.action}</td>
                  <td className="py-3 pr-4 text-slate-600">{entry.actorName ?? entry.actorId ?? "System"}</td>
                  <td className="py-3 pr-4 uppercase text-slate-500">{entry.entityType}</td>
                  <td className="py-3 pr-4 text-slate-600">{entry.entityId ?? "-"}</td>
                  <td className="py-3 pr-4 text-slate-600">{entry.details?.previousValue ? JSON.stringify(entry.details.previousValue) : "-"}</td>
                  <td className="py-3 pr-4 text-slate-600">{entry.details?.newValue ? JSON.stringify(entry.details.newValue) : "-"}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    <div>{entry.ipAddress ?? "-"}</div>
                    <div className="text-xs text-slate-500">{entry.userAgent ?? "-"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page}</span>
          <button type="button" onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
            Next
          </button>
        </div>
      </div>
    </AppShell>
  );
}
