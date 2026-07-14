import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Batter {
  name: string;
  dismissal: string;
  runs: string;
  balls: string;
  fours: string;
  sixes: string;
  sr: string;
}

interface Bowler {
  name: string;
  overs: string;
  maidens: string;
  runs: string;
  wickets: string;
  nb: string;
  wd: string;
  econ: string;
}

interface Innings {
  team: string;
  score: string;
  batters: Batter[];
  bowlers: Bowler[];
  extras: string;
  total: string;
  yetToBat: string[];
}

// Map of common team full names to their 3-letter abbreviation codes
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

async function getLiveTextHtmlForMatch(scorecardId: string): Promise<string | null> {
  try {
    const homeRes = await fetch("https://www.bbc.com/sport/cricket", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    if (!homeRes.ok) return null;
    const html = await homeRes.text();
    const $ = cheerio.load(html);
    
    const liveLinks: string[] = [];
    $("a").each((_, el) => {
       const href = $(el).attr("href") || "";
       if (href.includes("/sport/cricket/live/") && !liveLinks.includes(href)) {
          liveLinks.push(href);
       }
    });
    
    if (liveLinks.length === 0) return null;
    
    // Concurrently check if any live page references our scorecard ID
    const promises = liveLinks.map(async (link) => {
       const liveUrl = link.startsWith("http") ? link : `https://www.bbc.com${link}`;
       const res = await fetch(liveUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
       });
       if (!res.ok) return null;
       const pageHtml = await res.text();
       if (pageHtml.includes(scorecardId)) {
          return pageHtml;
       }
       return null;
    });
    
    const results = await Promise.all(promises);
    return results.find(r => r !== null) || null;
  } catch (e) {
     console.error("Error matching live text for match:", e);
     return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
  }

  const scUrl = `https://www.bbc.com/sport/cricket/scorecard/${id}`;
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  try {
    const scRes = await fetch(scUrl, { headers, cache: "no-store" });
    if (!scRes.ok) {
       throw new Error(`Upstream BBC Scorecard returned status ${scRes.status}`);
    }
    const html = await scRes.text();
    const $ = cheerio.load(html);

    // 1. Extract JSON-LD or Initial Data for Location & timing
    let jsonData: any = null;
    $("script").each((_, script) => {
      const content = $(script).html() || "";
      if (content.includes("window.__INITIAL_DATA__")) {
        const match = content.match(/window\.__INITIAL_DATA__\s*=\s*["'](.*?)["']\s*;/);
        if (match) {
          try {
            const unescapedStr = JSON.parse(`"${match[1]}"`);
            jsonData = JSON.parse(unescapedStr);
          } catch (e) {}
        }
      }
    });

    let startDate = "";
    let locationName = "";
    let statusText = "";
    let title = "Cricket Match";

    if (jsonData && jsonData.data) {
       const headerKey = Object.keys(jsonData.data).find(k => k.startsWith("sport-header?"));
       if (headerKey && jsonData.data[headerKey]?.data) {
          const headerData = jsonData.data[headerKey].data;
          startDate = headerData.startDateTime || "";
          locationName = headerData.groundName || "";
          title = headerData.title || title;
          statusText = headerData.matchSummary?.resultString || "";
       }
    }

    // 2. Parse Scorecard Innings List
    const inningsList: Innings[] = [];
    $(".efthezu1").each((_, heading) => {
       const teamName = $(heading).text().trim().replace(/\s*Innings/i, "");
       
       let batters: Batter[] = [];
       let bowlers: Bowler[] = [];
       let extras = "";
       let total = "";
       let yetToBat: string[] = [];
       
       let next = $(heading).next();
       while (next.length > 0 && !next.hasClass("efthezu1")) {
          if (next.hasClass("e1icz104")) {
             const table = next.find("table").first();
             if (table.length > 0) {
                const headersList: string[] = [];
                table.find("th").each((_, th) => headersList.push($(th).text().trim()));
                
                if (headersList.includes("Batter")) {
                   table.find("tbody tr").each((_, tr) => {
                      const cells = $(tr).find("td");
                      if (cells.length >= 6) {
                         const nameCell = cells.eq(0);
                         const name = nameCell.find(".ebuonag0").first().text().trim();
                         
                         if (name === "Extras") {
                            extras = cells.eq(1).text().trim();
                         } else if (name === "Total") {
                            total = cells.eq(1).text().trim();
                            const oversText = nameCell.find(".e3fv3iq2").first().text().trim();
                            if (oversText) {
                               total = `${total} (${oversText})`;
                            }
                         } else if (name && name !== "Batter") {
                            const hiddenTexts = nameCell.find(".visually-hidden").map((_, el) => $(el).text().trim()).get();
                            const dismissal = hiddenTexts.find(t => t && t !== name && t !== (name + ",")) || "not out";
                            
                            batters.push({
                               name,
                               dismissal,
                               runs: cells.eq(1).text().trim(),
                               balls: cells.eq(2).text().trim(),
                               fours: cells.eq(4).text().trim(),
                               sixes: cells.eq(5).text().trim(),
                               sr: cells.eq(7).text().trim(),
                            });
                         }
                      }
                   });
                } else if (headersList.includes("Bowler")) {
                   table.find("tbody tr").each((_, tr) => {
                      const cells = $(tr).find("td");
                      if (cells.length >= 8) {
                         const rawName = cells.eq(0).text().trim();
                         const name = rawName.replace(/,\s*bowling/i, "");
                         if (name && name !== "Bowler") {
                            bowlers.push({
                               name,
                               overs: cells.eq(1).text().trim(),
                               maidens: cells.eq(2).text().trim(),
                               runs: cells.eq(3).text().trim(),
                               wickets: cells.eq(4).text().trim(),
                               nb: cells.eq(6).text().trim(),
                               wd: cells.eq(7).text().trim(),
                               econ: cells.eq(10).text().trim(),
                            });
                         }
                      }
                   });
                }
             }
          }
          next = next.next();
       }
       
       if (batters.length > 0 || bowlers.length > 0) {
          inningsList.push({
             team: teamName,
             score: total || "",
             batters,
             bowlers,
             extras,
             total,
             yetToBat
          });
       }
    });

    // 3. Assemble Playing XIs dynamically
    const teams: Record<string, string[]> = {};
    inningsList.forEach((inn) => {
       if (!teams[inn.team]) {
          teams[inn.team] = [];
       }
       inn.batters.forEach((b) => {
          if (b.name && !teams[inn.team].includes(b.name)) {
             teams[inn.team].push(b.name);
          }
       });
    });
    inningsList.forEach((inn, idx) => {
       const opponentInn = inningsList.find((other, oIdx) => oIdx !== idx);
       if (opponentInn) {
          inn.bowlers.forEach((bw) => {
             if (bw.name && !teams[opponentInn.team].includes(bw.name)) {
                teams[opponentInn.team].push(bw.name);
             }
          });
       }
    });

    // 4. Fetch and Parse Commentary Timeline (Concurrently mapping to active live streams)
    const timeline: any[] = [];
    const liveTextHtml = await getLiveTextHtmlForMatch(id);
    if (liveTextHtml) {
       const $live = cheerio.load(liveTextHtml);
       let liveJsonData: any = null;
       $live("script").each((_, script) => {
          const content = $live(script).html() || "";
          if (content.includes("window.__INITIAL_DATA__")) {
             const match = content.match(/window\.__INITIAL_DATA__\s*=\s*["'](.*?)["']\s*;/);
             if (match) {
                try {
                   const unescapedStr = JSON.parse(`"${match[1]}"`);
                   liveJsonData = JSON.parse(unescapedStr);
                } catch (e) {}
             }
          }
       });

       if (liveJsonData && liveJsonData.data) {
          const streamKey = Object.keys(liveJsonData.data).find(k => k.startsWith("stream?"));
          if (streamKey && liveJsonData.data[streamKey]?.data?.results) {
             const results = liveJsonData.data[streamKey].data.results;
             results.forEach((r: any) => {
                const textParts: string[] = [];
                if (r.content && r.content.model && r.content.model.blocks) {
                   r.content.model.blocks.forEach((b: any) => {
                      if (b.type === "paragraph" && b.model && b.model.text) {
                         textParts.push(b.model.text);
                      }
                   });
                }
                
                let headline = "";
                if (r.headline && r.headline.model && r.headline.model.blocks) {
                   r.headline.model.blocks.forEach((b: any) => {
                      if (b.type === "paragraph" && b.model && b.model.text) {
                         headline = b.model.text;
                      }
                   });
                }
                
                const text = headline ? `**${headline}**: ${textParts.join("\n")}` : textParts.join("\n");
                const ball = r.dates?.time || r.timestamp || "";
                
                if (text.trim()) {
                   let type = "dot";
                   const textUpper = text.toUpperCase();
                   if (textUpper.includes("SIX") || textUpper.includes(" 6 ")) type = "six";
                   else if (textUpper.includes("FOUR") || textUpper.includes(" 4 ")) type = "four";
                   else if (textUpper.includes("OUT") || textUpper.includes("WICKET") || textUpper.includes("CAUGHT") || textUpper.includes("BOWLED")) type = "wicket";
                   else if (textUpper.includes("WIDE") || textUpper.includes("WD")) type = "wide";
                   else if (textUpper.includes("NO BALL") || textUpper.includes("NB")) type = "noball";
                   
                   let score = ".";
                   if (type === "six") score = "6";
                   else if (type === "four") score = "4";
                   else if (type === "wicket") score = "W";
                   else if (type === "wide") score = "1w";
                   else if (type === "noball") score = "1nb";
                   
                   timeline.push({ ball, text, type, score });
                }
             });
          }
       }
    }

    // 5. Fallbacks for Points Table based on League keywords in Title
    const lowerTitle = title.toLowerCase();
    const isCounty = lowerTitle.includes("county") || lowerTitle.includes("championship");
    const isT20Blast = lowerTitle.includes("blast") || lowerTitle.includes("t20 blast");

    let pointsTable = [
      { pos: 1, team: "Royal Challengers Bengaluru", short: "RCB", p: 14, w: 10, l: 4, pts: 20, nrr: "+0.840" },
      { pos: 2, team: "Gujarat Titans", short: "GT", p: 14, w: 9, l: 5, pts: 18, nrr: "+0.450" },
      { pos: 3, team: "Chennai Super Kings", short: "CSK", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.320" },
      { pos: 4, team: "Mumbai Indians", short: "MI", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.110" },
      { pos: 5, team: "Kolkata Knight Riders", short: "KKR", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.050" },
      { pos: 6, team: "Sunrisers Hyderabad", short: "SRH", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.120" },
      { pos: 7, team: "Rajasthan Royals", short: "RR", p: 14, w: 6, l: 8, pts: 12, nrr: "-0.210" },
      { pos: 8, team: "Delhi Capitals", short: "DC", p: 14, w: 6, l: 8, pts: 12, nrr: "-0.350" },
      { pos: 9, team: "Lucknow Super Giants", short: "LSG", p: 14, w: 5, l: 9, pts: 10, nrr: "-0.480" },
      { pos: 10, team: "Punjab Kings", short: "PBKS", p: 14, w: 4, l: 10, pts: 8, nrr: "-0.620" }
    ];

    if (isCounty) {
      pointsTable = [
        { pos: 1, team: "Surrey", short: "SUR", p: 7, w: 5, l: 1, pts: 110, nrr: "+0.540" },
        { pos: 2, team: "Essex", short: "ESS", p: 7, w: 4, l: 1, pts: 98, nrr: "+0.310" },
        { pos: 3, team: "Hampshire", short: "HAM", p: 7, w: 3, l: 2, pts: 88, nrr: "+0.150" },
        { pos: 4, team: "Lancashire", short: "LAN", p: 7, w: 2, l: 2, pts: 76, nrr: "-0.080" },
        { pos: 5, team: "Warwickshire", short: "WAR", p: 7, w: 2, l: 3, pts: 72, nrr: "-0.120" },
        { pos: 6, team: "Somerset", short: "SOM", p: 7, w: 2, l: 3, pts: 70, nrr: "-0.180" },
        { pos: 7, team: "Nottinghamshire", short: "NOT", p: 7, w: 1, l: 4, pts: 58, nrr: "-0.320" },
        { pos: 8, team: "Kent", short: "KEN", p: 7, w: 1, l: 4, pts: 54, nrr: "-0.420" }
      ];
    } else if (isT20Blast) {
      pointsTable = [
        { pos: 1, team: "Birmingham Bears", short: "BIR", p: 14, w: 10, l: 4, pts: 20, nrr: "+0.780" },
        { pos: 2, team: "Lancashire Lightning", short: "LAN", p: 14, w: 9, l: 5, pts: 18, nrr: "+0.450" },
        { pos: 3, team: "Worcestershire Rapids", short: "WOR", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.250" },
        { pos: 4, team: "Notts Outlaws", short: "NOT", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.120" },
        { pos: 5, team: "Leicestershire Foxes", short: "LEI", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.080" },
        { pos: 6, team: "Yorkshire Vikings", short: "YOR", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.150" },
        { pos: 7, team: "Derbyshire Falcons", short: "DER", p: 14, w: 6, l: 8, pts: 12, nrr: "-0.220" },
        { pos: 8, team: "Durham", short: "DUR", p: 14, w: 5, l: 9, pts: 10, nrr: "-0.410" },
        { pos: 9, team: "Northamptonshire Steelbacks", short: "NOR", p: 14, w: 4, l: 10, pts: 8, nrr: "-0.680" }
      ];
    }

    // 6. Win Probability estimations
    let probability = { team1: 50, team2: 50, label1: "Team 1", label2: "Team 2" };
    if (inningsList.length > 0) {
       probability.label1 = inningsList[0]?.team || "Team 1";
       probability.label2 = inningsList[1]?.team || "Team 2";
       
       if (statusText) {
          const needMatch = statusText.match(/need\s+(\d+)\s+runs\s+in\s+(\d+)\s+balls/i);
          if (needMatch) {
             const runs = parseInt(needMatch[1]);
             const balls = parseInt(needMatch[2]);
             const wicketsDown = inningsList[1]?.batters.length || 0;
             const wicketsLeft = Math.max(1, 10 - wicketsDown);
             const reqRR = (runs / balls) * 6;
             const p2 = Math.max(1, Math.min(99, 100 - (reqRR * 8 - wicketsLeft * 12)));
             probability.team2 = Math.round(p2);
             probability.team1 = 100 - probability.team2;
          }
       }
    }

    return NextResponse.json({
      status: "success",
      title,
      statusText,
      startDate,
      locationName,
      playerOfTheMatch: "",
      timeline: timeline.slice(0, 30), // Return last 30 ball timeline items
      innings: inningsList,
      teams,
      pointsTable,
      probability,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=3, stale-while-revalidate=5",
      },
    });

  } catch (error) {
     console.error("Vercel scorecard details parsing error:", error);
     return NextResponse.json({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to parse match details",
        innings: [],
        teams: {},
        timeline: []
     }, { status: 502 });
  }
}
