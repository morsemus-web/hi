import { createClient } from "@supabase/supabase-js";
import { sendBackerConfirmation } from "@/lib/resend";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_BACKERS = 1000;

// GET — return current backer count
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("backers")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const total = (count || 0) + 4; // 4 early backers before launch
    return NextResponse.json({
      count: total,
      max: MAX_BACKERS,
      remaining: MAX_BACKERS - total,
    });
  } catch (err) {
    console.error("Backer count error:", err);
    return NextResponse.json({ count: 4, max: MAX_BACKERS, remaining: MAX_BACKERS - 4 });
  }
}

// POST — record a new backer (called from Dodo webhook or thank-you page)
export async function POST(req: Request) {
  try {
    const { email, payment_id } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check capacity
    const { count } = await supabaseAdmin
      .from("backers")
      .select("*", { count: "exact", head: true });

    if ((count || 0) >= MAX_BACKERS) {
      return NextResponse.json({ error: "All spots are taken" }, { status: 410 });
    }

    const { error } = await supabaseAdmin
      .from("backers")
      .insert([{
        email: email.toLowerCase().trim(),
        payment_id: payment_id || null,
      }]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already a backer" }, { status: 409 });
      }
      throw error;
    }

    // Send confirmation email
    sendBackerConfirmation(email).catch((err) =>
      console.error("Failed to send backer email:", err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Backer error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
