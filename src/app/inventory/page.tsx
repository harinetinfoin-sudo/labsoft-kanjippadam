"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

type InventoryDashboard = {
  summary: { totalItems: number; lowStock: number; expiringSoon: number; stockValue: number };
  alerts: Array<{ id: string; itemCode: string; itemName: string; type: string; severity: string; message: string }>;
  items: Array<{ id: string; itemCode: string; name: string; stock: number; minimumStockLevel: number; supplier: string; storageLocation: string; expiryDate?: string; stockStatus: string }>;
};

export default function InventoryPage() {
  const [dashboard, setDashboard] = useState<InventoryDashboard | null>(null);

  useEffect(() => {
    fetch("/api/inventory")
      .then((response) => response.json())
      .then((payload) => setDashboard(payload.data ?? null));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-emerald-600">Inventory management</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Inventory dashboard</h1>
          </div>
          <button className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white">Add stock item</button>
        </div>

        {dashboard && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Items</p><p className="mt-2 text-2xl font-bold text-slate-900">{dashboard.summary.totalItems}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Low stock</p><p className="mt-2 text-2xl font-bold text-amber-600">{dashboard.summary.lowStock}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Expiring soon</p><p className="mt-2 text-2xl font-bold text-rose-600">{dashboard.summary.expiringSoon}</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Stock value</p><p className="mt-2 text-2xl font-bold text-emerald-600">${dashboard.summary.stockValue.toFixed(2)}</p></div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Current stock</h2>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Code</th>
                        <th className="py-3 pr-4 font-medium">Item</th>
                        <th className="py-3 pr-4 font-medium">Stock</th>
                        <th className="py-3 pr-4 font-medium">Min</th>
                        <th className="py-3 pr-4 font-medium">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="py-3 pr-4 font-medium text-slate-800">{item.itemCode}</td>
                          <td className="py-3 pr-4">{item.name}</td>
                          <td className="py-3 pr-4">{item.stock}</td>
                          <td className="py-3 pr-4 text-slate-600">{item.minimumStockLevel}</td>
                          <td className="py-3 pr-4 text-slate-600">{item.storageLocation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Alerts</h2>
                <div className="mt-4 space-y-3">
                  {dashboard.alerts.length === 0 ? (
                    <p className="text-sm text-slate-500">No active stock alerts.</p>
                  ) : (
                    dashboard.alerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{alert.type}</p>
                        <p className="mt-1 font-medium text-slate-800">{alert.itemName}</p>
                        <p className="mt-1 text-sm text-slate-600">{alert.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
