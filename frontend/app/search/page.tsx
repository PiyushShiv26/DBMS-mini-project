// frontend/app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { searchWorkloads, SearchResult } from "@/lib/api";
import { Search, Terminal, ArrowRight, Sparkles } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [role, setRole] = useState<string>("admin");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("idop_role") || "admin";
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idop_role");
    router.push("/");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await searchWorkloads(query);
    setResults(res);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Navbar role={role} onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Semantic Search</h1>
            <p className="text-slate-400 text-sm mt-1">Discover relevant SQL workloads using natural language queries powered by vector embeddings.</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Find queries involving customer orders..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Searching..." : "Search"}</span>
            </button>
          </form>

          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Search Results</h2>
              <div className="space-y-4">
                {results.map((res) => (
                  <div key={res.workload_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded">{res.workload_id}</span>
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                          Similarity: {(res.similarity_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Link
                        href={`/queries/${res.workload_id}`}
                        className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                      >
                        <span>Inspect Query</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <pre className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
                      {res.query_text}
                    </pre>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">Matched Tags:</span>
                      {res.matched_tags.map((tag) => (
                        <span key={tag} className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}