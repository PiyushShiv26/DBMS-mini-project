// frontend/app/workloads/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getWorkloads, SQLWorkload } from "@/lib/api";
import { Terminal, ArrowRight, Activity, Clock } from "lucide-react";

export default function WorkloadsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("admin");
  const [workloads, setWorkloads] = useState<SQLWorkload[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("idop_role") || "admin";
    setRole(storedRole);
    getWorkloads().then(setWorkloads);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idop_role");
    localStorage.removeItem("idop_token");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar role={role} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">SQL Workload Explorer</h1>
            <p className="text-slate-400 text-sm mt-1">Review captured query workloads, execution frequencies, and performance metrics.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="font-semibold text-slate-100">Captured Workloads</h2>
              </div>
              <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full font-medium">
                {workloads.length} Workloads Logged
              </span>
            </div>

            <div className="divide-y divide-slate-800">
              {workloads.map((wl) => (
                <div key={wl.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{wl.id}</span>
                      <span className="text-xs font-medium text-indigo-400">{wl.source}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        wl.status === "Flagged" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {wl.status}
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
                      {wl.query_text}
                    </pre>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-slate-400">
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>{wl.execution_count} runs</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{wl.avg_latency_ms}ms avg</span>
                      </div>
                    </div>

                    <Link
                      href={`/queries/${wl.id}`}
                      className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
