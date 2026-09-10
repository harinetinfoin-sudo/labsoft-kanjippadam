import { AppShell } from "@/components/app-shell";
import { roles } from "@/lib/mock-data";

export default function RolesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-600">Access control</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Role-based access model</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div key={role.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 inline-flex rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                {role.name}
              </div>
              <p className="text-sm text-slate-600">{role.description}</p>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Permissions</span>
                  <span className="font-semibold text-slate-800">Scoped</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Read access</span>
                  <span className="font-semibold text-slate-800">Yes</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span>Write access</span>
                  <span className="font-semibold text-slate-800">Conditional</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
