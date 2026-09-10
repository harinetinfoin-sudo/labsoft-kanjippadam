"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Array<{ id: string; orderNumber: string; patientName: string; doctorName: string; totalAmount: number; status: string }>>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.json())
      .then((payload) => setOrders(payload.data ?? []));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-600">Order management</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Laboratory orders</h1>
          </div>
          <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">
            Create order
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Order #</th>
                  <th className="py-3 pr-4 font-medium">Patient</th>
                  <th className="py-3 pr-4 font-medium">Doctor</th>
                  <th className="py-3 pr-4 font-medium">Total</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{order.orderNumber}</td>
                    <td className="py-3 pr-4">{order.patientName}</td>
                    <td className="py-3 pr-4 text-slate-600">{order.doctorName}</td>
                    <td className="py-3 pr-4">${order.totalAmount}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
                        {order.status}
                      </span>
                    </td>
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
