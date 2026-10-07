"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "@/components/admin/AdminDashboard";

// The page only handles sign-in. Whether the signed-in user is an admin is
// decided by /api/admin/stats on the server (ADMIN_EMAILS); without that,
// the dashboard receives no data.
export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        shouldCreateUser: false,
      },
    });
    setMessage(error ? `Error: ${error.message}` : "Check your email for the sign-in link.");
    setSending(false);
  };

  if (!ready) return null;

  if (session) {
    return (
      <AdminDashboard
        accessToken={session.access_token}
        email={session.user.email ?? ""}
        onLogout={() => supabase.auth.signOut()}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c] text-zinc-100">
      <div className="w-full max-w-sm p-8 rounded-xl border border-zinc-800 bg-[#111114]">
        <h1 className="text-lg font-semibold text-white">ScoreDeck Admin</h1>
        <p className="text-xs text-zinc-400 mt-1 mb-6">
          Sign in with an authorised company email.
        </p>
        <form onSubmit={sendLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@tryscoredeck.pro"
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full py-2.5 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
        {message && <p className="text-xs text-zinc-400 mt-4">{message}</p>}
      </div>
    </div>
  );
}
