export interface RawCricketMatch {
  title: string;
  status_text: string;
  score?: string;
  current_batsmen?: { name: string; score: string }[];
  current_bowler?: { name: string };
  id?: string;
}

export interface RawCricketDetails {
  statusText?: string;
  innings?: {
    team: string;
    score: string;
    total: string;
  }[];
}

export interface MatchStateResult {
  matchFormat: "T20" | "ODI" | "TEST";
  matchEnded: boolean;
  winningTeam: string;
  resultType: "runs" | "wickets" | "innings" | "tie" | "draw" | null;
  resultText: string;
  winMargin: string;
  currentState: "NOT_STARTED" | "LIVE" | "INNINGS_BREAK" | "STUMPS" | "DAY_BREAK" | "RAIN_DELAY" | "COMPLETED" | "DRAW" | "TIE";
}

/**
 * Parses runs, wickets, and overs from score strings.
 * e.g., "135/5 (20 Overs)", "97-9 (19.4)", "150-10", "49"
 */
function parseRunsWicketsOvers(scoreStr: string) {
  if (!scoreStr) return { runs: 0, wickets: 0, overs: 0, isAllOut: false };
  
  const cleanScore = scoreStr.toLowerCase();
  
  const rwMatch = cleanScore.match(/^(\d+)[\/-](\d+)/) || cleanScore.match(/^(\d+)/);
  let runs = 0;
  let wickets = 0;
  
  if (rwMatch) {
    runs = parseInt(rwMatch[1]);
    if (rwMatch[2]) {
      wickets = parseInt(rwMatch[2]);
    } else {
      if (cleanScore.includes("all out") || cleanScore.includes("/10") || cleanScore.includes("-10")) {
        wickets = 10;
      }
    }
  }
  
  const ovMatch = cleanScore.match(/\(([0-9.]+)/);
  let overs = 0;
  if (ovMatch) {
    overs = parseFloat(ovMatch[1]);
  }
  
  const isAllOut = wickets >= 10 || cleanScore.includes("all out");
  
  return { runs, wickets, overs, isAllOut };
}

/**
 * Universal Cricket Match State Engine
 */
export function evaluateCricketMatchState(
  match: RawCricketMatch,
  details: RawCricketDetails | null
): MatchStateResult {
  const title = match.title || "";
  const statusText = match.status_text || "";
  const statusLower = statusText.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Detect Format
  let matchFormat: "T20" | "ODI" | "TEST" = "T20";
  if (
    titleLower.includes("test") || 
    statusLower.includes("test") || 
    titleLower.includes("county") || 
    titleLower.includes("championship") ||
    titleLower.includes("first-class") ||
    titleLower.includes("shield")
  ) {
    matchFormat = "TEST";
  } else if (
    titleLower.includes("odi") || 
    titleLower.includes("50 overs") || 
    statusLower.includes("odi") ||
    statusLower.includes("50 overs")
  ) {
    matchFormat = "ODI";
  } else {
    // Fallback based on overs in title
    const maxOvsMatch = title.match(/\b(20|50)\s*(overs|ovs)?\b/i);
    if (maxOvsMatch) {
      matchFormat = maxOvsMatch[1] === "50" ? "ODI" : "T20";
    }
  }

  const maxOvers = matchFormat === "ODI" ? 50 : 20;

  // 2. Parse basic teams from statusText: "Kenya vs Sierra Leone 11th Match"
  const cleanTeams = statusText.split(" - ")[0];
  const teamsPart = cleanTeams.split(" vs ");
  
  const cleanSuffix = (s: string) => {
    if (!s) return "";
    return s
      .replace(/\s+\d+(st|nd|rd|th)\s+match.*$/i, "")
      .replace(/\s+(qualifier|group|final|semi).*$/i, "")
      .trim();
  };

  const team1 = cleanSuffix(teamsPart[0]?.trim() || "Team 1");
  const team2 = cleanSuffix(teamsPart[1]?.trim() || "Team 2");

  // Determine uppercase short codes for scoring matches
  const t1Code = (team1.slice(0, 3).toUpperCase());
  const t2Code = (team2.slice(0, 3).toUpperCase());

  // 3. Early Completed status checks from raw status texts
  const isDirectCompleted = 
    statusLower.includes("won") || 
    statusLower.includes("beat") || 
    statusLower.includes("abandoned") || 
    statusLower.includes("no result") ||
    statusLower.includes("tied") || 
    statusLower.includes("draw") ||
    !!(details?.statusText && (
      details.statusText.toLowerCase().includes("won") ||
      details.statusText.toLowerCase().includes("beat") ||
      details.statusText.toLowerCase().includes("tied") ||
      details.statusText.toLowerCase().includes("draw") ||
      details.statusText.toLowerCase().includes("abandoned")
    ));

  // Determine currentState initial estimation
  const hasLiveIndicators = 
    statusLower.includes("need") || 
    statusLower.includes("opted to") || 
    statusLower.includes("trail") || 
    statusLower.includes("lead") || 
    statusLower.includes("chose to") || 
    statusLower.includes("innings break") || 
    statusLower.includes("break") || 
    statusLower.includes("ov") || 
    statusLower.includes("overs") || 
    statusLower.includes("stumps") ||
    /\d+[\-\/]\d+/.test(statusLower) || 
    /\b\d+\s*\(/.test(titleLower) || 
    /\b\d+[\/-]\d+\b/.test(titleLower) ||
    (match.score && match.score !== "score not found" && match.score.trim() !== "");

  let currentState: MatchStateResult["currentState"] = hasLiveIndicators ? "LIVE" : "NOT_STARTED";

  if (isDirectCompleted) {
    currentState = "COMPLETED";
  } else if (statusLower.includes("preview") || statusLower.includes("starts at") || statusLower.includes("starts in") || statusLower.includes("yet to begin")) {
    currentState = "NOT_STARTED";
  } else if (statusLower.includes("abandoned")) {
    currentState = "COMPLETED";
  } else if (statusLower.includes("rain") || statusLower.includes("delay")) {
    currentState = "RAIN_DELAY";
  } else if (statusLower.includes("innings break") || statusLower.includes("break")) {
    currentState = "INNINGS_BREAK";
  } else if (statusLower.includes("stumps")) {
    currentState = "STUMPS";
  }

  // Define fallback details
  let matchEnded = isDirectCompleted || false;
  let winningTeam = "";
  let resultType: MatchStateResult["resultType"] = null;
  let winMargin = "";
  let resultText = details?.statusText || statusText || "";

  // Parse details if we have them
  if (details?.statusText && isDirectCompleted) {
    const winnerLower = details.statusText.toLowerCase();
    
    // e.g. "Kenya won by 38 runs"
    const wonMatch = details.statusText.match(/^(.+?)\s+won/i) || details.statusText.match(/^(.+?)\s+beat/i);
    if (wonMatch) {
      winningTeam = wonMatch[1].trim();
    }
    
    if (winnerLower.includes("runs")) {
      resultType = "runs";
      const marginMatch = details.statusText.match(/(\d+)\s+runs/i);
      if (marginMatch) winMargin = `${marginMatch[1]} runs`;
    } else if (winnerLower.includes("wickets")) {
      resultType = "wickets";
      const marginMatch = details.statusText.match(/(\d+)\s+wickets/i);
      if (marginMatch) winMargin = `${marginMatch[1]} wickets`;
    } else if (winnerLower.includes("innings")) {
      resultType = "innings";
      const marginMatch = details.statusText.match(/innings\s+and\s+(\d+)\s+runs/i);
      if (marginMatch) winMargin = `an innings and ${marginMatch[1]} runs`;
    } else if (winnerLower.includes("tied")) {
      resultType = "tie";
      currentState = "TIE";
    } else if (winnerLower.includes("draw")) {
      resultType = "draw";
      currentState = "DRAW";
    }
  }

  // ==========================================
  // T20 & ODI STATE ENGINE
  // ==========================================
  if (matchFormat !== "TEST") {
    // Extract Innings 1 and Innings 2 scores
    let firstInningsRuns = 0;
    let firstInningsWickets = 0;
    let firstInningsOvers = 0;
    let firstInningsCompleted = false;

    let secondInningsRuns = 0;
    let secondInningsWickets = 0;
    let secondInningsOvers = 0;
    let secondInningsCompleted = false;

    let chasingTeam = "";
    let defendingTeam = "";

    // A) If we have rich details innings scorecard
    if (details && Array.isArray(details.innings) && details.innings.length > 0) {
      const inn1 = parseRunsWicketsOvers(details.innings[0].total || details.innings[0].score);
      firstInningsRuns = inn1.runs;
      firstInningsWickets = inn1.wickets;
      firstInningsOvers = inn1.overs;
      firstInningsCompleted = inn1.isAllOut || inn1.overs >= maxOvers || details.innings.length > 1;

      defendingTeam = details.innings[0].team;

      if (details.innings.length > 1) {
        const inn2 = parseRunsWicketsOvers(details.innings[1].total || details.innings[1].score);
        secondInningsRuns = inn2.runs;
        secondInningsWickets = inn2.wickets;
        secondInningsOvers = inn2.overs;
        secondInningsCompleted = inn2.isAllOut || inn2.overs >= maxOvers || isDirectCompleted;
        
        chasingTeam = details.innings[1].team;
      }
    } else {
      // B) Fallback to parsing from match title
      const titleParts = title.split(/\s+vs\s+/i);
      if (titleParts.length >= 2) {
        const t1Match = titleParts[0].match(/([A-Z]+)\s+(\d+[\/-]?\d*)\s*(?:\(([0-9.]+)\))?/i);
        const t2Match = titleParts[1].match(/([A-Z]+)\s+(\d+[\/-]?\d*)\s*(?:\(([0-9.]+)\))?/i);

        if (t1Match && t2Match) {
          const t1CodeTitle = t1Match[1].toUpperCase();
          const t2CodeTitle = t2Match[1].toUpperCase();

          const t1 = parseRunsWicketsOvers(t1Match[2] + (t1Match[3] ? ` (${t1Match[3]})` : ""));
          const t2 = parseRunsWicketsOvers(t2Match[2] + (t2Match[3] ? ` (${t2Match[3]})` : ""));

          // Decide who is batting first (innings 1) vs second (innings 2)
          let isT1First = true;
          if (t2.overs > 0 && t1.overs === 0) {
            isT1First = false;
          } else if (t1.overs >= maxOvers && t2.overs > 0) {
            isT1First = true;
          }

          if (isT1First) {
            firstInningsRuns = t1.runs;
            firstInningsWickets = t1.wickets;
            firstInningsOvers = t1.overs;
            firstInningsCompleted = t1.isAllOut || t1.overs >= maxOvers || t2.runs > 0;
            defendingTeam = t1CodeTitle === t1Code ? team1 : team2;

            secondInningsRuns = t2.runs;
            secondInningsWickets = t2.wickets;
            secondInningsOvers = t2.overs;
            secondInningsCompleted = t2.isAllOut || t2.overs >= maxOvers;
            chasingTeam = t2CodeTitle === t2Code ? team2 : team1;
          } else {
            firstInningsRuns = t2.runs;
            firstInningsWickets = t2.wickets;
            firstInningsOvers = t2.overs;
            firstInningsCompleted = t2.isAllOut || t2.overs >= maxOvers || t1.runs > 0;
            defendingTeam = t2CodeTitle === t2Code ? team2 : team1;

            secondInningsRuns = t1.runs;
            secondInningsWickets = t1.wickets;
            secondInningsOvers = t1.overs;
            secondInningsCompleted = t1.isAllOut || t1.overs >= maxOvers;
            chasingTeam = t1CodeTitle === t1Code ? team1 : team2;
          }
        }
      }
    }

    // Evaluate T20/ODI Match States (Order of Priority matters)
    if (firstInningsCompleted && secondInningsRuns > 0) {
      
      // 1. Chase Completed Check (Batting Second Wins)
      if (secondInningsRuns > firstInningsRuns) {
        matchEnded = true;
        winningTeam = chasingTeam;
        resultType = "wickets";
        const remWickets = 10 - secondInningsWickets;
        winMargin = `${remWickets} wickets`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
      
      // 2. All Out Check (Batting First Wins by Runs)
      else if (secondInningsWickets >= 10 && secondInningsRuns < firstInningsRuns) {
        matchEnded = true;
        winningTeam = defendingTeam;
        resultType = "runs";
        const marginRuns = firstInningsRuns - secondInningsRuns;
        winMargin = `${marginRuns} runs`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
      
      // 3. Overs Completed Check (Batting First Wins by Runs)
      else if (secondInningsOvers >= maxOvers && secondInningsRuns < firstInningsRuns) {
        matchEnded = true;
        winningTeam = defendingTeam;
        resultType = "runs";
        const marginRuns = firstInningsRuns - secondInningsRuns;
        winMargin = `${marginRuns} runs`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
      
      // 4. Tie Check
      else if (
        (secondInningsWickets >= 10 || secondInningsOvers >= maxOvers) && 
        secondInningsRuns === firstInningsRuns && 
        firstInningsRuns > 0
      ) {
        matchEnded = true;
        resultType = "tie";
        resultText = "Match Tied";
        currentState = "TIE";
      }
    }
  }

  // ==========================================
  // TEST MATCH STATE ENGINE
  // ==========================================
  else {
    if (details && Array.isArray(details.innings) && details.innings.length > 0) {
      const innList = details.innings.map((inn) => parseRunsWicketsOvers(inn.total || inn.score));
      
      const t1Innings = details.innings.filter((inn) => inn.team === team1);
      const t2Innings = details.innings.filter((inn) => inn.team === team2);

      const parsedT1 = t1Innings.map(inn => parseRunsWicketsOvers(inn.total || inn.score));
      const parsedT2 = t2Innings.map(inn => parseRunsWicketsOvers(inn.total || inn.score));

      const t1TotalRuns = parsedT1.reduce((sum, p) => sum + p.runs, 0);
      const t2TotalRuns = parsedT2.reduce((sum, p) => sum + p.runs, 0);

      const innCount = details.innings.length;

      // 1. Innings Victory check (Innings 3 or 4)
      if (innCount >= 2) {
        // If team 1 batted once and scored more than team 2's two completed innings
        if (t1Innings.length === 1 && t2Innings.length === 2) {
          const t2CompletedBoth = parsedT2.every(p => p.isAllOut) || isDirectCompleted;
          if (t2CompletedBoth && t2TotalRuns < t1TotalRuns) {
            matchEnded = true;
            winningTeam = team1;
            resultType = "innings";
            const runsDiff = t1TotalRuns - t2TotalRuns;
            winMargin = `an innings and ${runsDiff} runs`;
            resultText = `${winningTeam} won by ${winMargin}`;
            currentState = "COMPLETED";
          }
        }
        // If team 2 batted once and scored more than team 1's two completed innings
        else if (t2Innings.length === 1 && t1Innings.length === 2) {
          const t1CompletedBoth = parsedT1.every(p => p.isAllOut) || isDirectCompleted;
          if (t1CompletedBoth && t1TotalRuns < t2TotalRuns) {
            matchEnded = true;
            winningTeam = team2;
            resultType = "innings";
            const runsDiff = t2TotalRuns - t1TotalRuns;
            winMargin = `an innings and ${runsDiff} runs`;
            resultText = `${winningTeam} won by ${winMargin}`;
            currentState = "COMPLETED";
          }
        }
      }

      // 2. Chase Completed Check (4th innings chase success)
      if (!matchEnded && innCount === 4) {
        const chasingInn = details.innings[3];
        const chasingTeamName = chasingInn.team;
        const targetRuns = (chasingTeamName === team1 ? t2TotalRuns : t1TotalRuns) + 1;
        const inn4 = innList[3];

        if (inn4.runs >= targetRuns) {
          matchEnded = true;
          winningTeam = chasingTeamName;
          resultType = "wickets";
          const remWickets = 10 - inn4.wickets;
          winMargin = `${remWickets} wickets`;
          resultText = `${winningTeam} won by ${winMargin}`;
          currentState = "COMPLETED";
        }
        
        // 3. 4th Innings all out (failed chase)
        else if (inn4.isAllOut && inn4.runs < targetRuns) {
          matchEnded = true;
          winningTeam = chasingTeamName === team1 ? team2 : team1;
          resultType = "runs";
          const marginRuns = targetRuns - inn4.runs - 1;
          winMargin = `${marginRuns} runs`;
          resultText = `${winningTeam} won by ${marginRuns} runs`;
          currentState = "COMPLETED";
        }
      }

      // 4. Tie Check (rare fourth innings ends level)
      if (!matchEnded && innCount === 4) {
        const inn4 = innList[3];
        const chasingTeamName = details.innings[3].team;
        const targetRuns = (chasingTeamName === team1 ? t2TotalRuns : t1TotalRuns) + 1;
        
        if (inn4.isAllOut && inn4.runs === targetRuns - 1) {
          matchEnded = true;
          resultType = "tie";
          resultText = "Match Tied";
          currentState = "TIE";
        }
      }
    }

    // 5. Draw Check
    if (!matchEnded && (statusLower.includes("draw") || statusLower.includes("match drawn"))) {
      matchEnded = true;
      resultType = "draw";
      resultText = "Match Drawn";
      currentState = "DRAW";
    }
  }

  // Clean final output texts if missing or empty
  if (matchEnded && !resultText) {
    if (resultType === "tie") resultText = "Match Tied";
    else if (resultType === "draw") resultText = "Match Drawn";
    else if (winningTeam && winMargin) resultText = `${winningTeam} won by ${winMargin}`;
  }

  return {
    matchFormat,
    matchEnded,
    winningTeam,
    resultType,
    resultText: resultText || "Live",
    winMargin,
    currentState,
  };
}
