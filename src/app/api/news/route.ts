import { NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { passcode, article } = await req.json();

    if (passcode !== process.env.NEWS_PASSCODE) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!article?.title || !article?.content || !article?.slug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("news_articles").insert({
      slug: article.slug,
      title: article.title,
      description: article.description || "",
      content: article.content,
      category: article.category || "general",
      author: article.author || "ScoreDeck Sports Desk",
      tags: article.tags || [],
      images: article.images || null,
      published_at: article.publishedAt || new Date().toISOString(),
    });

    if (error) {
      console.error("News insert error:", error);
      return NextResponse.json(
        { error: "Failed to save article" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("News API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
