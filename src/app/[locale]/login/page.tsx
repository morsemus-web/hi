"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "@/i18n/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-text-primary">
      <div className="glass-card p-12 rounded-2xl max-w-md w-full">
        <h1 className="text-3xl font-semibold mb-2 text-center">Welcome Back</h1>
        <p className="text-text-dim mb-8 text-center text-sm">
          Enter your email to sign in to Scoredeck
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-overlay-5 border border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-bg font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-sm text-accent font-medium">
            {message}
          </p>
        )}

        <div className="mt-8 pt-8 border-t border-border text-center">
          <Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
