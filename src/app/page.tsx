import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a1220] p-4">
      <div className="w-full max-w-4xl rounded-[32px] border border-slate-800 bg-[#101b2e]/80 p-10 lg:p-14 shadow-2xl">

        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">LABSOFT</p>

        <h1 className="mt-6 text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[0.95] drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Laboratory<br/> Management<br/> System
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Secure patient intake, test coordination, sample tracking, verification, billing, and reporting in one modern diagnostic operations platform.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/login" className="rounded-2xl bg-cyan-300 px-7 py-3.5 text-sm font-semibold text-slate-900 hover:bg-cyan-200 transition">
            Open dashboard
          </Link>
          <Link href="/roles" className="rounded-2xl border border-slate-600 bg-slate-800/50 px-7 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
            View RBAC model
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-3xl font-bold text-cyan-200">7</p>
            <p className="mt-1 text-sm text-slate-400">User roles</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-3xl font-bold text-green-300">24/7</p>
            <p className="mt-1 text-sm text-slate-400">Operations coverage</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <p className="text-3xl font-bold text-violet-300">99.9%</p>
            <p className="mt-1 text-sm text-slate-400">Audit reliability</p>
          </div>
        </div>

      </div>
    </main>
  );
}