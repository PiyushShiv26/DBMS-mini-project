// frontend/app/queries/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getQueryDetails, QueryDetails } from "@/lib/api";
import { Terminal, ShieldAlert, Table, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function QueryDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [role, setRole] = useState<string>("admin");
  const [details, setDetails] = useState<QueryDetails | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("idop_role") || "admin";
    setRole(storedRole);
    if (id) {
      getQueryDetails(id).then(setDetails);
    }
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("idop_role");
    localStorage.removeItem("idop_token");
    router.push("/");
  };

  if (!details) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center text-slate-400">
        Loading query details...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar role={role} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <Link href="/workloads" className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workloads</span>
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-100">Query Inspector</h1>
            <p className="text-slate-400 text-sm mt-1">Detailed rule recommendations and MySQL EXPLAIN execution plan.</p>
          </div>

          {/* Query Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm">
              <Terminal className="w-4 h-4" />
              <span>SQL Statement</span>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-sm font-mono text-slate-200 border border-slate-800">
              {details.query_text}
            </pre>
          </div>

          {/* Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>Optimization Recommendations</span>
            </div>

            <div className="space-y-3">
              {details.recommendations.map((rec) => (
                <div key={rec.rule_code} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded">
                      {rec.rule_code}
                    </span>
                    <span className="text-xs font-medium text-slate-400">Severity: {rec.severity}</span>
                  </div>
                  <div className="font-medium text-slate-200 text-sm">{rec.recommendation}</div>
                  <div className="text-xs text-slate-400">{rec.rationale}</div>
                </div>
              ))}
            </div>
          </div>

          {/* EXPLAIN Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
              <Table className="w-4 h-4" />
              <span>MySQL EXPLAIN Execution Plan</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500">
                    <th className="pb-3 px-3">ID</th>
                    <th className="pb-3 px-3">Select Type</th>
                    <th className="pb-3 px-3">Table</th>
                    <th className="pb-3 px-3">Type</th>
                    <th className="pb-3 px-3">Rows</th>
                    <th className="pb-3 px-3">Extra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {details.explain_plan.map((step) => (
                    <tr key={step.id}>
                      <td className="py-3 px-3">{step.id}</td>
                      <td className="py-3 px-3 text-indigo-400">{step.select_type}</td>
                      <td className="py-3 px-3 font-semibold">{step.table}</td>
                      <td className="py-3 px-3 text-amber-400">{step.type}</td>
                      <td className="py-3 px-3">{step.rows}</td>
                      <td className="py-3 px-3 text-slate-400">{step.extra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QueryDetailsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading query details...</div>}><QueryDetailsContent /></Suspense>;
}
