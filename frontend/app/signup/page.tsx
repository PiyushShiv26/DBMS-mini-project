"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await register(name, email, password);
      localStorage.setItem("idop_token", data.token);
      localStorage.setItem("idop_role", String(data.user.role).toLowerCase());
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "Cannot reach the backend. Start FastAPI on http://localhost:8000.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5">
        <div><h1 className="text-2xl font-bold text-slate-100">Create account</h1><p className="text-sm text-slate-400 mt-1">Public accounts are created as Viewer.</p></div>
        <input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" />
        <input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl">{loading ? "Creating account..." : "Create account"}</button>
        <p className="text-center text-sm text-slate-400"><Link href="/" className="text-indigo-400 hover:text-indigo-300">Back to login</Link></p>
      </form>
    </main>
  );
}
