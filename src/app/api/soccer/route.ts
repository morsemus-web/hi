import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get date from query param or default to today's date in UK time (London)
    // To match BBC timezone, we can format current date in Europe/London timezone
    let defaultDate = "";
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      defaultDate = formatter.format(new Date());
    } catch {
      defaultDate = new Date().toISOString().split("T")[0];
    }
    
    const date = searchParams.get("date") || defaultDate;
    const url = `https://www.bbc.com/sport/football/scores-fixtures/${date}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Upstream BBC API returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // BBC Sport containers have class 'ea54ukl1'
    const containers = $(".ea54ukl1");
    const results: any[] = [];

    containers.each((_, container) => {
      const $container = $(container);
      
      // League header h2 has class 'ejnn8gi5'
      const leagueHeader = $container.find(".ejnn8gi5").first();
      if (leagueHeader.length === 0) return;
      
      const leagueName = leagueHeader.text().trim();
      
      // Sub-heading has class 'ejnn8gi4'
      const subHeader = $container.find(".ejnn8gi4").first();
      const subName = subHeader.length > 0 ? subHeader.text().trim() : "";
      
      const fullLeague = subName ? `${leagueName} - ${subName}` : leagueName;
      
      // Matches are in list items with class 'e1dih4s32'
      const matchElements = $container.find(".e1dih4s32");
      const matches: any[] = [];
      
      matchElements.each((_, elem) => {
        const $elem = $(elem);
        
        // Team names (desktop values) have class 'emlpoi30'
        const teamSpans = $elem.find(".emlpoi30");
        if (teamSpans.length < 2) return;
        
        const homeTeam = $(teamSpans[0]).text().trim();
        const awayTeam = $(teamSpans[1]).text().trim();
        
        // Scores: home is class 'e56kr2l2', away is class 'e56kr2l1'
        const homeScoreElem = $elem.find(".e56kr2l2").first();
        const awayScoreElem = $elem.find(".e56kr2l1").first();
        
        const homeScore = homeScoreElem.length > 0 ? homeScoreElem.text().trim() : "";
        const awayScore = awayScoreElem.length > 0 ? awayScoreElem.text().trim() : "";
        
        // Kickoff time details are in class 'eli9aj90'
        const timeElem = $elem.find(".eli9aj90").first();
        const kickoffTime = timeElem.length > 0 ? timeElem.text().trim() : "";
        
        // Progress/time details are in class 'e1efi6g50'
        const progressElem = $elem.find(".e1efi6g50").first();
        const rawProgress = progressElem.length > 0 ? progressElem.text().trim() : "";
        
        let status = "Upcoming";
        let timeStr = kickoffTime;
        
        if (homeScore !== "" && awayScore !== "") {
          if (rawProgress.includes("Full time") || rawProgress.includes("FT")) {
            status = "Finished";
            timeStr = "FT";
          } else if (rawProgress.includes("After extra time") || rawProgress.includes("AET")) {
            status = "Finished";
            timeStr = "AET";
          } else if (rawProgress.includes("Penalties")) {
            status = "Finished";
            timeStr = "Pens";
          } else if (rawProgress.includes("Cancelled") || rawProgress.includes("Postponed")) {
            status = "Postponed";
            timeStr = "PPD";
          } else if (rawProgress.includes("in progress")) {
            status = "Live";
            const matchMin = rawProgress.match(/(\d+)'/);
            if (matchMin) {
              timeStr = `${matchMin[1]}'`;
            } else if (rawProgress.includes("Half time") || rawProgress.includes("HT")) {
              timeStr = "HT";
            } else {
              timeStr = "Live";
            }
          } else {
            status = "Finished";
            timeStr = "FT";
          }
        } else {
          status = "Upcoming";
          timeStr = kickoffTime || "TBD";
        }
        
        const detailPath = $elem.find("a").first().attr("href") || "";
        
        const imgs = $elem.find("img");
        let homeBadge = "";
        let awayBadge = "";
        if (imgs.length >= 2) {
          const src1 = $(imgs[0]).attr("src") || "";
          const src2 = $(imgs[1]).attr("src") || "";
          if (src1 && !src1.includes("placeholder-badge")) homeBadge = src1;
          if (src2 && !src2.includes("placeholder-badge")) awayBadge = src2;
        }

        matches.push({
          home_team: homeTeam,
          away_team: awayTeam,
          home_score: homeScore,
          away_score: awayScore,
          status,
          time: timeStr,
          detail_path: detailPath,
          home_badge: homeBadge,
          away_badge: awayBadge,
        });
      });
      
      if (matches.length > 0) {
        results.push({
          league: fullLeague,
          matches,
        });
      }
    });

    return NextResponse.json(
      { status: "success", date, leagues: results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Failed to fetch soccer scores",
      },
      { status: 502 }
    );
  }
}
