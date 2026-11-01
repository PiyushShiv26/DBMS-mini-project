// frontend/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Terminal, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"admin" | "analyst">("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("idop_role", selectedRole);
    router.push("/dashboard");
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
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Access Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedRole === "admin"
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="font-semibold text-sm">Admin</div>
                <div className="text-xs text-slate-500 mt-0.5">Full control & config</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("analyst")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedRole === "analyst"
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-sm"
                    : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <div className="font-semibold text-sm">Analyst</div>
                <div className="text-xs text-slate-500 mt-0.5">Queries & reports</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  );
}