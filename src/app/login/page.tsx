"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Email or Password തെറ്റാണ്! വീണ്ടും ശ്രമിക്കൂ.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden grid lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Side - Design */}
        <div className="p-10 flex flex-col justify-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-400">LABSOFT</p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white leading-tight">
            Laboratory Management System
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Secure patient intake, test coordination, sample tracking & automated reports.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-slate-400 list-disc list-inside">
            <li>Role based access - Admin, Lab Tech, Doctor</li>
            <li>Fast patient & sample registration</li>
            <li>Professional PDF reports</li>
          </ul>
          <Link href="/" className="mt-8 inline-block w-fit rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800">
            ← Back to Home
          </Link>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-slate-900">LabSoft Login</h2>
          <p className="mt-2 text-sm text-slate-500">Enter your credentials to continue</p>
          
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input 
                type="email" 
                placeholder="admin@labsoft.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20" 
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">Demo: admin@labsoft.com / admin123</p>
          </form>
        </div>

      </div>
    </main>
  );
}