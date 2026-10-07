import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { MAX_BACKERS } from "@/lib/backers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// GET — return current backer count
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("backers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      count: total,
      max: MAX_BACKERS,
      remaining: MAX_BACKERS - total,
    });
  } catch (err) {
    console.error("Backer count error:", err);
    return NextResponse.json({ error: "Count unavailable" }, { status: 503 });
  }
}

// Backers are recorded by the payment webhooks (src/lib/backers.ts), never
// by a public request.
