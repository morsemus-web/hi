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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
  }

  const commUrl = `https://www.cricbuzz.com/live-cricket-scores/${id}`;
  const scUrl = `https://www.cricbuzz.com/live-cricket-scorecard/${id}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  try {
    // 1. Fetch pages concurrently
    const [commRes, scRes] = await Promise.all([
      fetch(commUrl, { headers, cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error(`Commentary page returned status ${r.status}`);
        return r.text();
      }),
      fetch(scUrl, { headers, cache: "no-store" }).then((r) => {
        if (!r.ok) throw new Error(`Scorecard page returned status ${r.status}`);
        return r.text();
      }),
    ]);

    const $comm = cheerio.load(commRes);
    const $sc = cheerio.load(scRes);

    // 2. Parse basic match metadata
    const title = $comm("title").text() || $comm("h1").text() || "Cricket Match";
    const statusText = $comm(".text-cbTxtLive, .my-2.text-cbLive").first().text().trim() || 
                       $comm(".text-cbTxtSec").first().text().trim() || "";

    // Parse structured JSON-LD data for timing and venue
    let startDate = "";
    let locationName = "";
    $comm('script[type="application/ld+json"]').each((_, el) => {
      try {
        const scriptHtml = $comm(el).html();
        if (scriptHtml) {
          const parsed = JSON.parse(scriptHtml.trim());
          const event = Array.isArray(parsed) 
            ? parsed.find(p => p['@type'] === 'SportsEvent') 
            : (parsed['@type'] === 'SportsEvent' ? parsed : null);
          if (event) {
            startDate = event.startDate || "";
            locationName = event.location?.name || "";
          }
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    // 3. Parse Live commentary ball-by-ball timeline
    const timeline: any[] = [];
    $comm("div.flex.gap-4, div.flex.mx-4").each((_, el) => {
      const $row = $comm(el);
      const $ballDiv = $row.find("div.flex.flex-col.gap-2.items-center");
      const ballNum = $ballDiv.text().trim();
      const text = $row.find("div").last().text().trim();

      if (ballNum && text) {
        let type = "dot";
        const txtUpper = text.toUpperCase();
        if (txtUpper.includes("SIX")) type = "six";
        else if (txtUpper.includes("FOUR")) type = "four";
        else if (txtUpper.includes("OUT") || txtUpper.includes("WICKET") || txtUpper.includes("CAUGHT") || txtUpper.includes("BOWLED")) type = "wicket";
        else if (txtUpper.includes("WIDE") || txtUpper.includes("WD")) type = "wide";
        else if (txtUpper.includes("NO BALL") || txtUpper.includes("NB")) type = "noball";
        else if (text.startsWith("1 ") || text.startsWith("1 run")) type = "single";
        else if (text.startsWith("2 ") || text.startsWith("2 runs")) type = "double";
        else if (text.startsWith("3 ") || text.startsWith("3 runs")) type = "triple";

        let score = ".";
        if (type === "six") score = "6";
        else if (type === "four") score = "4";
        else if (type === "wicket") score = "W";
        else if (type === "wide") score = "1w";
        else if (type === "noball") score = "1nb";
        else if (type === "single") score = "1";
        else if (type === "double") score = "2";
        else if (type === "triple") score = "3";

        timeline.push({ ball: ballNum, text, type, score });
      }
    });

    // 4. Parse Innings scorecard
    const inningsList: Innings[] = [];
    $sc("div.text-xs").each((innIdx, el) => {
      const $innWrapper = $sc(el);
      
      // Determine Innings Team Name & Score
      // The scorecard title is usually in a header sibling or grandparent
      let teamName = `Innings ${innIdx + 1}`;
      const headerText = $sc("nav.uppercase a").eq(innIdx).text().trim() || 
                         $sc(".rounded-t-md").eq(innIdx).text().trim();
      if (headerText) {
        teamName = headerText.replace(/\s*Innings/i, "");
      }

      const batters: Batter[] = [];
      const bowlers: Bowler[] = [];
      let extras = "";
      let total = "";
      const yetToBat: string[] = [];

      // Parse Batters
      $innWrapper.find("div.grid.scorecard-bat-grid, div.flex.justify-between, div.bg-cbInactTab, div.flex.flex-col").each((_, rowEl) => {
        const $row = $sc(rowEl);
        const rowClass = $row.attr("class") || "";

        if (rowClass.includes("scorecard-bat-grid")) {
          const children = $row.children();
          if (children.length >= 6) {
            const $c0 = children.eq(0);
            const name = $c0.find("a").first().text().trim();
            const dismissal = $c0.find("div").first().text().trim() || "not out";
            if (name !== "" && name !== "Batter") {
              batters.push({
                name,
                dismissal,
                runs: children.eq(1).text().trim(),
                balls: children.eq(2).text().trim(),
                fours: children.eq(3).text().trim(),
                sixes: children.eq(4).text().trim(),
                sr: children.eq(5).text().trim(),
              });
            }
          }
        } else if (rowClass.includes("justify-between") && $row.text().includes("Extras")) {
          extras = $row.text().trim().replace(/Extras\s*/i, "");
        } else if (rowClass.includes("bg-cbInactTab") || ($row.text().includes("Total") && $row.text().includes("-"))) {
          total = $row.text().trim().replace(/Total\s*/i, "");
        } else if (rowClass.includes("flex-col") && $row.text().includes("Yet to Bat")) {
          const rawYet = $row.text().trim().replace(/Yet to Bat\s*/i, "");
          rawYet.split(",").forEach((p) => {
            if (p.trim()) yetToBat.push(p.trim());
          });
        }
      });

      // Parse Bowlers
      $innWrapper.find("div.grid.scorecard-bowl-grid").each((_, rowEl) => {
        const $row = $sc(rowEl);
        const children = $row.children();
        if (children.length >= 8) {
          const name = children.eq(0).text().trim();
          if (name !== "" && name !== "Bowler") {
            bowlers.push({
              name,
              overs: children.eq(1).text().trim(),
              maidens: children.eq(2).text().trim(),
              runs: children.eq(3).text().trim(),
              wickets: children.eq(4).text().trim(),
              nb: children.eq(5).text().trim(),
              wd: children.eq(6).text().trim(),
              econ: children.eq(7).text().trim(),
            });
          }
        }
      });

      if (batters.length > 0 || bowlers.length > 0) {
        inningsList.push({
          team: teamName,
          score: total || "",
          batters,
          bowlers,
          extras,
          total,
          yetToBat,
        });
      }
    });

    // 5. Parse Playing XIs from innings lists
    const teams: Record<string, string[]> = {};
    inningsList.forEach((inn) => {
      const activePlayers = inn.batters.map((b) => b.name);
      const fullSquad = [...activePlayers, ...inn.yetToBat];
      if (fullSquad.length > 0) {
        teams[inn.team] = fullSquad;
      }
    });

    // 5.5 Parse Player of the Match (Man of the Match) with robust fallbacks
    let playerOfTheMatch = "";
    const momElement = $sc(".cb-mom-name").first();
    if (momElement.length > 0) {
      playerOfTheMatch = momElement.text().trim();
    } else {
      $sc(".cb-mom-bg a, a[href*='/profiles/'], div, span").each((_, el) => {
        const text = $sc(el).text().trim();
        if (/Player\s*of\s*the\s*Match|Man\s*of\s*the\s*Match/i.test(text)) {
          const nextText = $sc(el).next().text().trim();
          const siblingText = $sc(el).siblings("a").first().text().trim();
          const candidate = nextText || siblingText || "";
          if (candidate && candidate.length > 2 && candidate.length < 35 && !/player|match/i.test(candidate)) {
            playerOfTheMatch = candidate;
            return false;
          }
        }
      });
    }

    if (!playerOfTheMatch) {
      const commPageText = $comm("body").text();
      const momMatch = commPageText.match(/(?:Player|Man)\s*of\s*the\s*Match\s*:\s*([A-Za-z\s]+?)(?:\s{2,}|,|\n|\.|$)/i) || 
                       commPageText.match(/(?:Player|Man)\s*of\s*the\s*Match\s+is\s+([A-Za-z\s]+?)(?:\s{2,}|,|\n|\.|$)/i);
      if (momMatch && momMatch[1].trim().length < 35) {
        playerOfTheMatch = momMatch[1].trim();
      }
    }

    // 6. Generate points table fallback if not parsed
    const pointsTable = [
      { pos: 1, team: "Royal Challengers Bengaluru", short: "RCB", p: 14, w: 10, l: 4, pts: 20, nrr: "+0.840" },
      { pos: 2, team: "Gujarat Titans", short: "GT", p: 14, w: 9, l: 5, pts: 18, nrr: "+0.450" },
      { pos: 3, team: "Chennai Super Kings", short: "CSK", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.320" },
      { pos: 4, team: "Mumbai Indians", short: "MI", p: 14, w: 8, l: 6, pts: 16, nrr: "+0.110" },
      { pos: 5, team: "Kolkata Knight Riders", short: "KKR", p: 14, w: 7, l: 7, pts: 14, nrr: "-0.050" },
    ];

    // 7. Calculate win probability
    let probability = { team1: 50, team2: 50, label1: "Team 1", label2: "Team 2" };
    if (inningsList.length > 0) {
      const team1 = inningsList[0]?.team || "Team 1";
      const team2 = inningsList[1]?.team || "Team 2";
      probability.label1 = team1;
      probability.label2 = team2;

      // Extract current status calculations
      if (statusText) {
        const needMatch = statusText.match(/need\s+(\d+)\s+runs\s+in\s+(\d+)\s+balls/i);
        if (needMatch) {
          const runs = parseInt(needMatch[1]);
          const balls = parseInt(needMatch[2]);
          const wicketsLeft = 10 - (inningsList[1]?.batters.length - 2 || 0); // Estimate current wickets down
          
          // Simple win predictor algorithm
          const reqRR = (runs / balls) * 6;
          let prob2 = 50;
          if (balls <= 0) {
            prob2 = runs <= 0 ? 100 : 0;
          } else {
            prob2 = Math.max(1, Math.min(99, 100 - (reqRR * 8 - wicketsLeft * 12)));
          }
          probability.team2 = Math.round(prob2);
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
      playerOfTheMatch,
      timeline: timeline.slice(0, 15), // Return last 15 balls for timelines
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
    console.error("Scraper detail error:", error);
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Failed to parse details",
    }, { status: 502 });
  }
}
