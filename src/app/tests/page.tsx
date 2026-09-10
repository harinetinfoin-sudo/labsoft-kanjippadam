"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function TestsPage() {
  const [tests, setTests] = useState<Array<{ id: string; code: string; name: string; category: string; price: number; turnaroundHours: number }>>([]);

  useEffect(() => {
    fetch("/api/tests")
      .then((response) => response.json())
      .then((payload) => setTests(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Test master</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Laboratory tests</h1>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
            Add test
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Code</th>
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Category</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Turnaround</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{test.code}</td>
                    <td className="py-3 pr-4">{test.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{test.category}</td>
                    <td className="py-3 pr-4">${test.price}</td>
                    <td className="py-3 pr-4">{test.turnaroundHours} hrs</td>
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
