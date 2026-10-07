// Anonymous usage tracking for the website (see docs/REPORTING.md).
// A random install ID in localStorage identifies the browser; no account,
// email or IP is sent. Respects Do Not Track and, in the EU/UK/CH, the
// visitor's consent choice (src/lib/consent.ts).

import { analyticsAllowed } from "@/lib/consent";

type UsageEvent = "app_open" | "heartbeat" | "match_view";

const KEY = "sd_install_id";

function installId(): string | null {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export async function track(event: UsageEvent, extra: { sport?: string; league?: string } = {}) {
  if (!(await analyticsAllowed())) return;
  const id = installId();
  if (!id) return;
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ installId: id, platform: "web", event, ...extra }),
    keepalive: true,
  }).catch(() => {});
}
