// frontend/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutDashboard, Search, Terminal, Shield, LogOut } from "lucide-react";

export default function Navbar({ role, onLogout }: { role: string; onLogout: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schemas", href: "/schemas", icon: Database },
    { name: "Workloads", href: "/workloads", icon: Terminal },
    { name: "Semantic Search", href: "/search", icon: Search },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold">IDOP</div>
          <div>
            <h1 className="font-bold text-slate-100">IDOP Platform</h1>
            <p className="text-xs text-slate-400">Optimization Engine</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase">{role}</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 rounded-lg text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Switch Role / Logout</span>
        </button>
      </div>
    </aside>
  );
}