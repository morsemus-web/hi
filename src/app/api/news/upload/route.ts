import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const passcode = formData.get("passcode") as string;
    const file = formData.get("file") as File;
    const ref = formData.get("ref") as string; // e.g. "image-1"

    if (passcode !== process.env.NEWS_PASSCODE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file || !ref) {
      return NextResponse.json({ error: "Missing file or ref" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const path = `articles/${timestamp}-${ref}.${ext}`;

    const buffer = await file.arrayBuffer();

    const { error } = await supabaseAdmin.storage
      .from("news-images")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("news-images")
      .getPublicUrl(path);

    return NextResponse.json({
      success: true,
      ref,
      url: urlData.publicUrl,
      path,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
