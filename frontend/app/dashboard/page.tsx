// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import { Database, Terminal, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("idop_role") || "admin";
    setRole(storedRole);
    getDashboardStats().then(setStats);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idop_role");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar role={role} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">System Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Overview of database workloads, health, and recommendations.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Total Workloads</span>
                <Terminal className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-slate-100">{stats?.total_workloads || 0}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Active Databases</span>
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-slate-100">{stats?.active_databases || 0}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">Pending Recommendations</span>
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-slate-100">{stats?.pending_recommendations || 0}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">System Health</span>
                <Activity className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6" />
                <span>{stats?.system_health || "Healthy"}</span>
              </div>
            </div>
          </div>

          {role === "admin" && (
            <div className="bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl">
              <h2 className="text-lg font-semibold text-indigo-300 mb-2">Admin Notice</h2>
              <p className="text-sm text-slate-300">
                You are logged in with administrative privileges. You have access to raw database configurations and global optimization rule overrides.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}