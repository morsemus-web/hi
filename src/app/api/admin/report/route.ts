import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/admin/report?from=YYYY-MM-DD&to=YYYY-MM-DD
// Runs admin_report() (reporting-setup.sql). Dates are inclusive, Dubai time.
export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  if (!DATE.test(from) || !DATE.test(to)) {
    return NextResponse.json({ error: "from and to must be YYYY-MM-DD" }, { status: 400 });
  }
  if (to < from) {
    return NextResponse.json({ error: "'to' is before 'from'" }, { status: 400 });
  }

  const { data, error } = await serviceClient().rpc("admin_report", {
    p_from: from,
    p_to: to,
    p_tz: "Asia/Dubai",
  });
  if (error) {
    console.error("admin_report failed:", error.message);
    const hint = /admin_report|does not exist/i.test(error.message)
      ? "Reporting is not set up. Run reporting-setup.sql in Supabase."
      : error.message;
    return NextResponse.json({ error: hint }, { status: 500 });
  }

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
