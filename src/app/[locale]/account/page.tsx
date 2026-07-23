"use client";

import { useUser } from "@/lib/useUser";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function fmt(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default function AccountPage() {
  const { user, profile, loading, adsFree } = useUser();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <p className="text-text-muted text-sm">You are not signed in.</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-accent text-bg text-[11px] font-medium uppercase tracking-[0.12em] rounded-md"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 px-6 pb-16">
      <div className="glass-card p-10 rounded-2xl max-w-lg w-full space-y-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Account</h1>
          <p className="text-text-muted text-sm">{user.email}</p>
        </div>

        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.12em] text-text-muted">
              Mobile ad-free
            </span>
            <span
              className={`text-xs font-mono px-2 py-1 rounded ${
                adsFree ? "bg-accent/20 text-accent" : "bg-overlay-5 text-text-muted"
              }`}
            >
              {adsFree ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.12em] text-text-muted">
              Expires
            </span>
            <span className="text-xs font-mono text-text-dim">
              {fmt(profile?.ads_free_until ?? null)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.12em] text-text-muted">
              Desktop tier
            </span>
            <span className="text-xs font-mono text-text-dim uppercase">
              {profile?.tier ?? "free"}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col gap-3">
          <Link
            href="/download"
            className="w-full text-center py-3 bg-accent text-bg text-[11px] font-medium uppercase tracking-[0.12em] rounded-md"
          >
            Download apps
          </Link>
          <button
            onClick={signOut}
            className="w-full py-3 border border-border text-[11px] font-medium uppercase tracking-[0.12em] rounded-md hover:border-text-muted transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
