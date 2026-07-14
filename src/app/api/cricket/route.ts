import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COMMON_SHORTS: Record<string, string> = {
  "west indies": "WI",
  "new zealand": "NZ",
  "england": "ENG",
  "india": "IND",
  "south africa": "RSA",
  "pakistan": "PAK",
  "sri lanka": "SL",
  "bangladesh": "BAN",
  "afghanistan": "AFG",
  "ireland": "IRE",
  "zimbabwe": "ZIM",
  "scotland": "SCO",
  "nepal": "NEP",
  "netherlands": "NED",
  "namibia": "NAM",
  "oman": "OMA",
  "united arab emirates": "UAE",
  "usa": "USA",
  "canada": "CAN"
};

function getShortName(teamName: string): string {
  const clean = teamName.toLowerCase().trim();
  if (COMMON_SHORTS[clean]) return COMMON_SHORTS[clean];
  
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return words.map(w => w[0].toUpperCase()).join('').slice(0, 3);
  }
  return teamName.slice(0, 3).toUpperCase();
}

async function fetchAndParseFeed(urlPath: string, seenIds: Set<string>, parsedMatches: any[]) {
  const url = `https://www.cricbuzz.com/${urlPath}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!res.ok) return;

  const html = await res.text();
  const $ = cheerio.load(html);

  // First Loop: Parse all detailed match cards in the body
  $('a[href*="/live-cricket-scores/"]').each((_, el) => {
     const $card = $(el);
     const href = $card.attr("href") || "";
     const idMatch = href.match(/\/live-cricket-scores\/(\d+)\//);
     if (!idMatch) return;
     const id = idMatch[1];
     
     if (seenIds.has(id)) return;
     
     const teamRows = $card.find(".flex.flex-col.gap-3.my-2 > .flex.items-center.gap-4.justify-between");
     if (teamRows.length >= 2) {
        seenIds.add(id);
        const description = $card.find(".text-cbTxtSec.dark\\:text-cbTxtSec").first().text().trim() || "Live Match";
        
        // Climb to gap-px container to find the preceding tournament link
        const seriesLink = $card.closest(".gap-px").prevAll('a[href*="/cricket-series/"]').first();
        const seriesName = seriesLink.text().trim() || "International";

        const row1 = teamRows.eq(0);
        const row2 = teamRows.eq(1);
        
        const team1Full = row1.find(".hidden.wb\\:block").text().trim();
        const team1Short = row1.find(".block.wb\\:hidden").text().trim();
        const team1Score = row1.find(".font-medium").text().trim();
        
        const team2Full = row2.find(".hidden.wb\\:block").text().trim();
        const team2Short = row2.find(".block.wb\\:hidden").text().trim();
        const team2Score = row2.find(".font-medium").text().trim();
        
        let statusDisplay = $card.find(".text-cbLive, .cb-text-live, .cb-text-complete, .cb-text-preview").text().trim() || 
                            $card.children().last().text().trim();
        
        // Clean statusDisplay if it has helper links text or is empty (upcoming games fallback)
        if (!statusDisplay || /match\s*facts|news/i.test(statusDisplay)) {
           statusDisplay = "Upcoming";
        }
        
        const statusText = `${team1Short} vs ${team2Short} - ${statusDisplay}`;
        
        // Format title to match Cricbuzz structure with correct series header for client grouping:
        // Series Name | Live | Team 1 vs Team 2, Description
        const title = `${seriesName} | Live | ${team1Full} vs ${team2Full}, ${description}`;
        
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

  // Second Loop: Parse smaller ticker/sidebar links for other matches
  $('a[href*="/live-cricket-scores/"]').each((_, el) => {
     const $card = $(el);
     const href = $card.attr("href") || "";
     const idMatch = href.match(/\/live-cricket-scores\/(\d+)\//);
     if (!idMatch) return;
     const id = idMatch[1];
     
     if (seenIds.has(id)) return;
     
     const text = $card.text().trim();
     if (text.length > 10 && text.includes("vs")) {
        seenIds.add(id);
        
        const parts = text.split(" - ");
        const teamsPart = parts[0]?.trim() || "";
        const statusDisplay = parts[1]?.trim() || "In Progress";
        
        const teamParts = teamsPart.split(" vs ");
        const team1 = teamParts[0]?.trim() || "Team 1";
        const team2 = teamParts[1]?.trim() || "Team 2";
        
        const team1Short = getShortName(team1);
        const team2Short = getShortName(team2);
        
        const statusText = `${team1Short} vs ${team2Short} - ${statusDisplay}`;
        const title = `International | Live | ${team1} vs ${team2}, Live Match`;
        
        parsedMatches.push({
           id,
           title,
           status_text: statusText,
           score: "score not found",
           current_batsmen: [],
           current_bowler: { name: "" }
        });
     }
  });
}

export async function GET() {
  try {
    const parsedMatches: any[] = [];
    const seenIds = new Set<string>();

    // Concurrently fetch and parse Live matches, Yesterday's matches, and Upcoming Matches (3 days schedule)
    await Promise.all([
      fetchAndParseFeed("cricket-match/live-scores", seenIds, parsedMatches),
      fetchAndParseFeed("cricket-match/live-scores/recent-matches", seenIds, parsedMatches),
      fetchAndParseFeed("cricket-schedule/upcoming-series/all", seenIds, parsedMatches)
    ]);

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
    console.error("Vercel internal Cricbuzz consolidated scraper error:", err);
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
