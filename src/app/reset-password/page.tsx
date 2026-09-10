"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Security</p>
        <h1 className="mt-3 text-3xl font-bold">Reset password</h1>

        <form className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">New password</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"
              type="password"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Confirm password</label>
            <input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white"
              type="password"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950">
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
