import { Bell, ChevronDown, Search, ShieldCheck } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 shadow-sm">
        <Search className="h-4 w-4" />
        <input
          aria-label="Search"
          placeholder="Search patients, orders, reports..."
          className="w-72 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 font-semibold text-white">
            SA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">S. Admin</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 md:flex">
          <ShieldCheck className="h-4 w-4" />
          Secure session
        </div>
      </div>
    </header>
  );
}
