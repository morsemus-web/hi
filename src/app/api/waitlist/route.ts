import { createClient } from "@supabase/supabase-js";
import { sendWaitlistWelcome } from "@/lib/resend";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — return current waitlist count
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    const total = (count || 0) + 200; // 200 early signups before site launch
    return NextResponse.json({ count: total });
  } catch (err) {
    console.error("Waitlist count error:", err);
    return NextResponse.json({ count: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Insert into waitlist table
    const { error } = await supabaseAdmin
      .from("waitlist")
      .insert([{ email: email.toLowerCase().trim() }]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You're already on the waitlist!" },
          { status: 409 }
        );
      }
      throw error;
    }

    // Send welcome email via Resend (non-blocking)
    sendWaitlistWelcome(email).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
