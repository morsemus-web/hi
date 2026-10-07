"use client";

import { useEffect } from "react";
import { track } from "@/lib/usage";

const HEARTBEAT_MS = 5 * 60 * 1000;

// One app_open per page load, then a heartbeat every 5 minutes while the tab
// is visible. Admin pages are not counted.
export default function UsageTracker() {
  useEffect(() => {
    if (window.location.pathname.includes("/admin")) return;
    track("app_open");
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") track("heartbeat");
    }, HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, []);
  return null;
}
