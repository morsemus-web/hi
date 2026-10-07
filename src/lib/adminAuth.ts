import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Admin access is decided on the server only. The caller sends their
// Supabase access token; we verify it and check the email against
// ADMIN_EMAILS (comma-separated). The browser never holds a password.

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service credentials are not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403 | 500; error: string };

export async function requireAdmin(req: Request): Promise<AdminCheck> {
  const allowed = adminEmails();
  if (allowed.length === 0) {
    return { ok: false, status: 500, error: "ADMIN_EMAILS is not configured" };
  }

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Not signed in" };

  const { data, error } = await serviceClient().auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return { ok: false, status: 401, error: "Invalid session" };
  if (!data.user.email_confirmed_at) return { ok: false, status: 403, error: "Email not verified" };
  if (!allowed.includes(email)) return { ok: false, status: 403, error: "Not an admin" };

  return { ok: true, email };
}
