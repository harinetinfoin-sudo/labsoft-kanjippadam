"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowUpRight, Clock3, CreditCard, FlaskConical, PackageCheck, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const rangeOptions = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "custom", label: "Custom" },
] as const;

type DashboardMetric = {
  label: string;
  value: string;
  change: string;
  tone: "cyan" | "amber" | "emerald" | "violet";
};

type DashboardRow = {
  key: string;
  title: string;
  meta?: string;
  value?: string | number;
  badge?: string;
};

type DashboardSection = {
  title: string;
  rows: DashboardRow[];
};

type DashboardPayload = {
  role: string;
  range: string;
  metrics: DashboardMetric[];
  sections: DashboardSection[];
  alerts: Array<{ id: string; itemName: string; itemCode: string; message: string; type: string; severity: string }>;
  auditEntries: Array<{ id: string; action: string; actor: string; entity: string; type: string; timestamp: string; details?: string }>;
};

const toneIconMap = {
  cyan: Users,
  amber: Activity,
  emerald: FlaskConical,
  violet: CreditCard,
} as const;

export default function DashboardPage() {
  const [role, setRole] = useState<string>("Super Admin");
  const [range, setRange] = useState<(typeof rangeOptions)[number]["key"]>("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((payload) => {
        const nextRole = payload?.data?.roles?.[0] ?? "Super Admin";
        setRole(nextRole);
      })
      .catch(() => setRole("Super Admin"));
  }, []);

  useEffect(() => {
    const search = new URLSearchParams({ range });
    if (range === "custom" && customStart) search.set("customStart", customStart);
    if (range === "custom" && customEnd) search.set("customEnd", customEnd);

   fetch(`/api/dashboard/summary?${search.toString()}`)
.then(async (response) => {
  if (!response.ok) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
})
.then((payload) => {
  if (payload) setDashboard(payload.data ?? null);
});
  }, [range, customStart, customEnd]);

  const effectiveRole = useMemo(() => dashboard?.role ?? role, [dashboard, role]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">Operations</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{effectiveRole} dashboard</h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {rangeOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRange(option.key)}
                  className={[
                    "rounded-lg px-3 py-2 text-sm font-medium transition",
                    range === option.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {range === "custom" && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                <span className="text-slate-400">to</span>
                <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
              </div>
            )}
          </div>
        </div>

        {dashboard && (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboard.metrics.map((metric) => {
                const Icon = toneIconMap[metric.tone] ?? Users;
                return (
                  <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{metric.label}</p>
                        <p className="mt-3 text-3xl font-bold text-slate-900">{metric.value}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-emerald-600">{metric.change}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
              <div className="space-y-6">
                {dashboard.sections.map((section) => (
                  <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="space-y-3">
                      {section.rows.map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                          <div>
                            <p className="font-medium text-slate-800">{row.title}</p>
                            {row.meta && <p className="text-xs text-slate-500">{row.meta}</p>}
                          </div>
                          <div className="text-right">
                            {row.value !== undefined && <p className="font-semibold text-slate-900">{row.value}</p>}
                            {row.badge && <span className="mt-1 inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-700">{row.badge}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Inventory alerts</h3>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="space-y-3">
                    {dashboard.alerts.length === 0 ? (
                      <p className="text-sm text-slate-500">No active alerts in this range.</p>
                    ) : (
                      dashboard.alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{alert.type}</p>
                          <p className="mt-2 font-medium text-slate-800">{alert.itemName}</p>
                          <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">System activity</h3>
                    <ShieldCheck className="h-5 w-5 text-cyan-500" />
                  </div>
                  <div className="space-y-3">
                    {dashboard.auditEntries.slice(0, 6).map((entry) => (
                      <div key={entry.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                          <span>{entry.actor}</span>
                        </div>
                        <p className="mt-2 font-medium text-slate-700">{entry.action}</p>
                        <p className="text-xs text-slate-500">{entry.entity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
