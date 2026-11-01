"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { provisionUser } from "@/lib/api";

export default function UserManagementPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "VIEWER" as "ANALYST" | "VIEWER" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentRole = (localStorage.getItem("idop_role") || "").toLowerCase();
    setRole(currentRole);
    if (currentRole !== "admin") router.replace("/dashboard");
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const data = await provisionUser(form.full_name, form.email, form.password, form.role);
      setMessage(`Created ${data.user.email} as ${data.user.role}.`);
      setForm({ full_name: "", email: "", password: "", role: "VIEWER" });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create user"); }
    finally { setLoading(false); }
  }

  if (role !== "admin") return null;
  return <div className="flex min-h-screen bg-slate-950"><Navbar role={role} onLogout={() => { localStorage.clear(); router.push("/"); }} /><main className="flex-1 p-8"><div className="max-w-2xl mx-auto"><h1 className="text-3xl font-bold text-slate-100">User Management</h1><p className="text-slate-400 mt-1 mb-8">Create Analyst and Viewer accounts. Provisioning is enforced by the backend.</p><form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"><input required minLength={2} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Full name" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" /><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" /><input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Temporary password" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100" /><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "ANALYST" | "VIEWER" })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100"><option value="VIEWER">VIEWER</option><option value="ANALYST">ANALYST</option></select>{error && <p className="text-red-400 text-sm">{error}</p>}{message && <p className="text-emerald-400 text-sm">{message}</p>}<button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl">{loading ? "Creating..." : "Create account"}</button></form></div></main></div>;
}
