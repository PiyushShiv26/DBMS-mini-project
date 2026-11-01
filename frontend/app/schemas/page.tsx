// frontend/app/schemas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getDatabaseSchemas, DatabaseSchema } from "@/lib/api";
import { Database, Table, Key } from "lucide-react";

export default function SchemasPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("admin");
  const [schemas, setSchemas] = useState<DatabaseSchema[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("idop_role") || "admin";
    setRole(storedRole);
    getDatabaseSchemas().then(setSchemas);
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
            <h1 className="text-3xl font-bold text-slate-100">Database & Schema Explorer</h1>
            <p className="text-slate-400 text-sm mt-1">Inspect connected databases, tables, and column structures.</p>
          </div>

          <div className="space-y-6">
            {schemas.map((db) => (
              <div key={db.database_name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
                  <Database className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-xl font-bold text-slate-100">{db.database_name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {db.tables.map((table) => (
                    <div key={table.table_name} className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Table className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-slate-200">{table.table_name}</span>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">
                          {table.row_count} rows
                        </span>
                      </div>

                      <div className="space-y-2 mt-4">
                        {table.columns.map((col) => (
                          <div key={col.name} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/50">
                            <span className="font-mono text-slate-300">{col.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-slate-500">{col.type}</span>
                              {col.key && (
                                <span className="flex items-center text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                  <Key className="w-3 h-3 mr-1" />
                                  {col.key}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
