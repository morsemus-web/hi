import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const url = "https://www.cricbuzz.com/cricket-match/live-scores";
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Upstream Cricbuzz returned status ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    const parsedMatches: any[] = [];
    
    $('a[href*="/live-cricket-scores/"]').each((_, el) => {
       const $card = $(el);
       const href = $card.attr("href") || "";
       const text = $card.text().trim();
       
       // Filter links that represent score cards (they are longer and contain match details)
       if (text.length > 50 && text.includes("•")) {
          const idMatch = href.match(/\/live-cricket-scores\/(\d+)\//);
          if (!idMatch) return;
          const id = idMatch[1];
          
          const description = $card.find(".text-cbTxtSec.dark\\:text-cbTxtSec").first().text().trim() || "Live Match";
          
          const teamRows = $card.find(".flex.flex-col.gap-3.my-2 > .flex.items-center.gap-4.justify-between");
          if (teamRows.length < 2) return;
          
          const row1 = teamRows.eq(0);
          const row2 = teamRows.eq(1);
          
          const team1Full = row1.find(".hidden.wb\\:block").text().trim();
          const team1Short = row1.find(".block.wb\\:hidden").text().trim();
          const team1Score = row1.find(".font-medium").text().trim();
          
          const team2Full = row2.find(".hidden.wb\\:block").text().trim();
          const team2Short = row2.find(".block.wb\\:hidden").text().trim();
          const team2Score = row2.find(".font-medium").text().trim();
          
          const statusDisplay = $card.find(".text-cbLive, .cb-text-live, .cb-text-complete, .cb-text-preview").text().trim() || 
                                $card.children().last().text().trim();
          
          const statusText = `${team1Short} vs ${team2Short} - ${statusDisplay}`;
          
          // Formatted title to match Cricbuzz structure for client parsing:
          // Cricket | Live | Team 1 vs Team 2, Description
          const title = `Cricket | Live | ${team1Full} vs ${team2Full}, ${description}`;
          
          let score = "score not found";
          if (team1Score || team2Score) {
             score = `${team1Short} ${team1Score || "Yet to bat"} | ${team2Short} ${team2Score || "Yet to bat"}`;
          }
          
          parsedMatches.push({
             id,
             title,
             status_text: statusText,
             score,
             current_batsmen: [],
             current_bowler: { name: "" }
          });
       }
    });

    return NextResponse.json(
      { status: "success", matches: parsedMatches },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10",
        },
      }
    );
  } catch (err) {
    console.error("Vercel internal Cricbuzz scraper error:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Failed to scrape cricket scores",
        matches: []
      },
      { status: 502 }
    );
  }
}
