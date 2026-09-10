import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  change,
  icon,
  tone = "cyan",
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
  tone?: "cyan" | "amber" | "emerald" | "violet";
}) {
  const toneMap = {
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    violet: "bg-violet-500/10 text-violet-600 border-violet-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", toneMap[tone])}>{icon}</div>
      </div>
      <p className="mt-4 text-sm font-medium text-emerald-600">{change} vs last week</p>
    </div>
  );
}
