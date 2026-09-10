"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowLeftRight, BarChart3, ClipboardCheck, FileText, FlaskConical, LayoutDashboard, Package2, ShieldCheck, Stethoscope, UserCog, Users, WalletCards } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/patients", icon: Users },
  { label: "Doctors", href: "/doctors", icon: Stethoscope },
  { label: "Orders", href: "/orders", icon: ClipboardCheck },
  { label: "Samples", href: "/samples", icon: Package2 },
  { label: "Sample History", href: "/samples/history", icon: Activity },
  { label: "Barcode Labels", href: "/samples/label", icon: Package2 },
  { label: "Results", href: "/results", icon: FileText },
  { label: "Result History", href: "/results/history", icon: FileText },
  { label: "Tests", href: "/tests", icon: FlaskConical },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Billing", href: "/billing", icon: WalletCards },
  { label: "Inventory", href: "/inventory", icon: Package2 },
  { label: "Audit Logs", href: "/audit", icon: ShieldCheck },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Security", href: "/security", icon: AlertTriangle },
  { label: "Roles", href: "/roles", icon: UserCog },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-slate-950 p-5 text-slate-100 lg:flex lg:flex-col">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">LabSoft</p>
          <h1 className="text-lg font-semibold">LMS Console</h1>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <div className="flex items-center justify-between text-sm text-cyan-100">
          <span>System status</span>
          <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-medium text-emerald-300">Online</span>
        </div>
        <p className="mt-2 text-xs text-slate-300">All critical modules operational and monitored.</p>
      </div>
    </aside>
  );
}
