import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COMMON_SHORTS: Record<string, string> = {
  "west indies": "WI",
  "new zealand": "NZ",
  "england": "ENG",
  "india": "IND",
  "australia": "AUS",
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
  "canada": "CAN",
  "northern knights": "NK",
  "leinster lightning": "LL",
  "north west warriors": "NWW",
  "munster reds": "MR"
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

function getFilterHelpers(leagueName: string): string {
  const l = leagueName.toLowerCase();
  const tags: string[] = [];
  if (l.includes("one day international") || l.includes("odi")) tags.push("ODI");
  if (l.includes("twenty20") || l.includes("t20")) tags.push("T20");
  if (l.includes("test")) tags.push("Test");
  if (l.includes("county")) tags.push("County");
  if (l.includes("premier league") || l.includes("ipl")) tags.push("Premier League");
  return tags.length > 0 ? ` (${tags.join(", ")})` : "";
}

export async function GET() {
  try {
    const url = "https://www.bbc.com/sport/cricket/scores-fixtures";
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Upstream BBC Sport returned status ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    const containers = $(".ea54ukl1");
    const parsedMatches: any[] = [];

    containers.each((_, container) => {
      const $container = $(container);
      
      const leagueHeader = $container.find(".ejnn8gi5").first();
      const subHeader = $container.find(".ejnn8gi4").first();
      
      const leagueName = leagueHeader.length > 0 ? leagueHeader.text().trim() : "Cricket";
      const subName = subHeader.length > 0 ? subHeader.text().trim() : "";
      const fullLeague = subName ? `${leagueName} - ${subName}` : leagueName;
      
      const matchElements = $container.find(".e1dih4s32");
      
      matchElements.each((_, elem) => {
        const $elem = $(elem);
        
        const teamSpans = $elem.find(".ejt65fr2");
        if (teamSpans.length < 2) return;
        
        const homeTeam = $(teamSpans[0]).text().trim();
        const awayTeam = $(teamSpans[1]).text().trim();
        
        const homeShort = getShortName(homeTeam);
        const awayShort = getShortName(awayTeam);
        
        const homeScoreElem = $elem.find(".e487sn42").eq(0);
        const awayScoreElem = $elem.find(".e487sn42").eq(1);
        
        const homeScore = homeScoreElem.length > 0 ? homeScoreElem.text().trim() : "";
        const awayScore = awayScoreElem.length > 0 ? awayScoreElem.text().trim() : "";
        
        const statusLabel = $elem.find(".e1kogvdn0").first().text().trim();
        const progressText = $elem.find(".e1vyg4962").first().text().trim();
        
        const timeElem = $elem.find(".eli9aj90").first();
        const kickoffTime = timeElem.length > 0 ? timeElem.text().trim() : "";
        
        let statusDisplay = "";
        if (progressText) {
          statusDisplay = progressText;
        } else if (statusLabel) {
          statusDisplay = statusLabel;
        } else {
          statusDisplay = kickoffTime || "Preview";
        }
        
        // Ensure "LIVE" status display triggers isLive correctly on the client side
        if (statusLabel.toLowerCase() === "in play" && !statusDisplay.toLowerCase().includes("live")) {
           statusDisplay = `${statusDisplay} (ov)`;
        }
        
        let score = "score not found";
        if (homeScore || awayScore) {
           score = `${homeShort} ${homeScore || 'Yet to bat'} | ${awayShort} ${awayScore || 'Yet to bat'}`;
        }
        
        const detailPath = $elem.find("a").first().attr("href") || "";
        const id = detailPath.split('/').pop() || Math.random().toString();
        
        const statusText = `${homeShort} vs ${awayShort} - ${statusDisplay}`;
        
        // Formatted title to match Cricbuzz structure for client parsing:
        // Cricket | Live | Home Team vs Away Team, League Name (Tags)
        const filterHelper = getFilterHelpers(fullLeague);
        const title = `Cricket | Live | ${homeTeam} vs ${awayTeam}, ${fullLeague}${filterHelper}`;
        
        parsedMatches.push({
          id,
          title,
          status_text: statusText,
          score,
          current_batsmen: [],
          current_bowler: { name: "" }
        });
      });
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
    console.error("Vercel internal cricket scraper error:", err);
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
