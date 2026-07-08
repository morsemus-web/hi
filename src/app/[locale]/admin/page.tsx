"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("scoredeck_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === "Admin" && password === "KakaKathal@123") {
      setIsAuthenticated(true);
      localStorage.setItem("scoredeck_admin_auth", "true");
      setError("");
    } else {
      setError("Invalid administrative credentials.");
    }
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={() => {
      setIsAuthenticated(false);
      localStorage.removeItem("scoredeck_admin_auth");
    }} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg text-text-primary">
      <div className="glass-card p-12 rounded-2xl max-w-md w-full relative overflow-hidden shadow-[0_0_50px_rgba(184,134,94,0.05)] border border-sport-football/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sport-cricket via-accent to-sport-football" />
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Scoredeck Admin</h1>
          <p className="text-text-muted text-[10px] uppercase tracking-widest font-mono">Restricted Network Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider font-mono">Admin ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-4 py-3 bg-overlay-5 border border-border rounded-lg focus:outline-none focus:border-sport-cricket/50 focus:ring-1 focus:ring-sport-cricket/50 transition-all font-mono text-sm"
              placeholder="Enter ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider font-mono">Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-overlay-5 border border-border rounded-lg focus:outline-none focus:border-sport-cricket/50 focus:ring-1 focus:ring-sport-cricket/50 transition-all font-mono text-sm tracking-widest"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-mono uppercase tracking-wide">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-overlay-2 hover:bg-overlay-5 border border-border rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:border-sport-cricket/50 hover:text-sport-cricket mt-4 group"
          >
            Authenticate <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
