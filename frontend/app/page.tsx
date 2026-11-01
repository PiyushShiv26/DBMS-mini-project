// frontend/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, ArrowRight } from "lucide-react";
import { login } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const resetLoginState = () => setLoading(false);
    window.addEventListener("pageshow", resetLoginState);
    return () => window.removeEventListener("pageshow", resetLoginState);
  }, []);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await login(email, password);
      localStorage.setItem("idop_token", data.token);
      localStorage.setItem("idop_role", String(data.user.role).toLowerCase());
      router.push("/dashboard");
    } catch (err) { setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Cannot reach the backend. Start FastAPI on http://localhost:8000."); setLoading(false); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600 p-3 rounded-xl text-white font-bold mb-4 shadow-lg shadow-indigo-600/30">
            <Terminal className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">IDOP Console</h1>
          <p className="text-sm text-slate-400 mt-1">Database Discovery & Optimization Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <span>{loading ? "Signing in..." : "Launch Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-sm text-slate-400">
            New here? <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">Create a viewer account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
