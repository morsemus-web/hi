// Exact JS implementation of cricketEngine.ts for validation testing

function parseRunsWicketsOvers(scoreStr) {
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

function evaluateCricketMatchState(match, details) {
  const title = match.title || "";
  const statusText = match.status_text || "";
  const statusLower = statusText.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. Detect Format
  let matchFormat = "T20";
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
    const maxOvsMatch = title.match(/\b(20|50)\s*(overs|ovs)?\b/i);
    if (maxOvsMatch) {
      matchFormat = maxOvsMatch[1] === "50" ? "ODI" : "T20";
    }
  }

  const maxOvers = matchFormat === "ODI" ? 50 : 20;

  // 2. Parse basic teams
  const cleanTeams = statusText.split(" - ")[0];
  const teamsPart = cleanTeams.split(" vs ");
  
  const cleanSuffix = (s) => {
    if (!s) return "";
    return s
      .replace(/\s+\d+(st|nd|rd|th)\s+match.*$/i, "")
      .replace(/\s+(qualifier|group|final|semi).*$/i, "")
      .trim();
  };

  const team1 = cleanSuffix(teamsPart[0]?.trim() || "Team 1");
  const team2 = cleanSuffix(teamsPart[1]?.trim() || "Team 2");

  const t1Code = (team1.slice(0, 3).toUpperCase());
  const t2Code = (team2.slice(0, 3).toUpperCase());

  // 3. Early Completed status checks
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

  let currentState = "LIVE";
  if (statusLower.includes("preview") || statusLower.includes("starts at") || statusLower.includes("starts in") || statusLower.includes("yet to begin")) {
    currentState = "NOT_STARTED";
  } else if (statusLower.includes("abandoned")) {
    currentState = "COMPLETED";
  } else if (statusLower.includes("rain") || statusLower.includes("delay")) {
    currentState = "RAIN_DELAY";
  } else if (statusLower.includes("innings break") || statusLower.includes("break")) {
    currentState = "INNINGS_BREAK";
  } else if (statusLower.includes("stumps")) {
    currentState = "STUMPS";
  } else if (isDirectCompleted) {
    currentState = "COMPLETED";
  }

  let matchEnded = isDirectCompleted || false;
  let winningTeam = "";
  let resultType = null;
  let winMargin = "";
  let resultText = details?.statusText || statusText || "";

  if (details?.statusText && isDirectCompleted) {
    const winnerLower = details.statusText.toLowerCase();
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

  // Limited overs (T20/ODI)
  if (matchFormat !== "TEST") {
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
    }

    if (firstInningsCompleted && secondInningsRuns > 0) {
      if (secondInningsRuns > firstInningsRuns) {
        matchEnded = true;
        winningTeam = chasingTeam;
        resultType = "wickets";
        const remWickets = 10 - secondInningsWickets;
        winMargin = `${remWickets} wickets`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
      else if (secondInningsWickets >= 10 && secondInningsRuns < firstInningsRuns) {
        matchEnded = true;
        winningTeam = defendingTeam;
        resultType = "runs";
        const marginRuns = firstInningsRuns - secondInningsRuns;
        winMargin = `${marginRuns} runs`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
      else if (secondInningsOvers >= maxOvers && secondInningsRuns < firstInningsRuns) {
        matchEnded = true;
        winningTeam = defendingTeam;
        resultType = "runs";
        const marginRuns = firstInningsRuns - secondInningsRuns;
        winMargin = `${marginRuns} runs`;
        resultText = `${winningTeam} won by ${winMargin}`;
        currentState = "COMPLETED";
      }
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
  // Test Matches
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

      if (innCount >= 2) {
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

    if (!matchEnded && (statusLower.includes("draw") || statusLower.includes("match drawn"))) {
      matchEnded = true;
      resultType = "draw";
      resultText = "Match Drawn";
      currentState = "DRAW";
    }
  }

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

// Test cases
const testCases = [
  {
    name: "T20 - Scenario 1: Team Batting First Wins (Win by Runs)",
    match: {
      title: "Team A vs Team B",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team A won by 15 runs",
      innings: [
        { team: "Team A", score: "180/6 (20)", total: "180/6 (20)" },
        { team: "Team B", score: "165/10 (19.4)", total: "165/10 (19.4)" }
      ]
    },
    expectedResult: "Team A won by 15 runs",
    expectedState: "COMPLETED"
  },
  {
    name: "T20 - Scenario 2: Team Batting Second Wins (Win by Wickets)",
    match: {
      title: "Team A vs Team B",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team B won by 7 wickets",
      innings: [
        { team: "Team A", score: "100/10 (15.2)", total: "100/10 (15.2)" },
        { team: "Team B", score: "101/3 (12.4)", total: "101/3 (12.4)" }
      ]
    },
    expectedResult: "Team B won by 7 wickets",
    expectedState: "COMPLETED"
  },
  {
    name: "ODI - Scenario 1: Team Batting Second Wins (Win by Wickets)",
    match: {
      title: "Team A vs Team B 50 Overs",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team B won by 6 wickets",
      innings: [
        { team: "Team A", score: "180/10 (45.3)", total: "180/10 (45.3)" },
        { team: "Team B", score: "181/4 (42.1)", total: "181/4 (42.1)" }
      ]
    },
    expectedResult: "Team B won by 6 wickets",
    expectedState: "COMPLETED"
  },
  {
    name: "TEST - Scenario 1: Fourth Innings Chase Success (Win by Wickets)",
    match: {
      title: "Team A vs Team B - Test Match",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team B won by 6 wickets",
      innings: [
        { team: "Team A", score: "300/10", total: "300/10" },
        { team: "Team B", score: "250/10", total: "250/10" },
        { team: "Team A", score: "200/10", total: "200/10" },
        { team: "Team B", score: "251/4", total: "251/4" }
      ]
    },
    expectedResult: "Team B won by 6 wickets",
    expectedState: "COMPLETED"
  },
  {
    name: "TEST - Scenario 2: Fourth Innings Failure (Win by Runs)",
    match: {
      title: "Team A vs Team B - Test Match",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team A won by 50 runs",
      innings: [
        { team: "Team A", score: "300/10", total: "300/10" },
        { team: "Team B", score: "200/10", total: "200/10" },
        { team: "Team A", score: "250/10", total: "250/10" },
        { team: "Team B", score: "300/10", total: "300/10" }
      ]
    },
    expectedResult: "Team A won by 50 runs",
    expectedState: "COMPLETED"
  },
  {
    name: "TEST - Scenario 3: Innings Victory",
    match: {
      title: "Team A vs Team B - Test Match",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Team A won by an innings and 50 runs",
      innings: [
        { team: "Team A", score: "500/10", total: "500/10" },
        { team: "Team B", score: "200/10", total: "200/10" },
        { team: "Team B", score: "250/10", total: "250/10" }
      ]
    },
    expectedResult: "Team A won by an innings and 50 runs",
    expectedState: "COMPLETED"
  },
  {
    name: "TEST - Scenario 4: Draw",
    match: {
      title: "Team A vs Team B - Test Match",
      status_text: "Team A vs Team B - Match Drawn",
    },
    details: {
      statusText: "Match Drawn",
      innings: [
        { team: "Team A", score: "400/10", total: "400/10" },
        { team: "Team B", score: "350/10", total: "350/10" }
      ]
    },
    expectedResult: "Match Drawn",
    expectedState: "DRAW"
  },
  {
    name: "TEST - Scenario 5: Tie",
    match: {
      title: "Team A vs Team B - Test Match",
      status_text: "Team A vs Team B - Match Ended",
    },
    details: {
      statusText: "Match Tied",
      innings: [
        { team: "Team A", score: "200/10", total: "200/10" },
        { team: "Team B", score: "200/10", total: "200/10" },
        { team: "Team A", score: "200/10", total: "200/10" },
        { team: "Team B", score: "200/10", total: "200/10" }
      ]
    },
    expectedResult: "Match Tied",
    expectedState: "TIE"
  }
];

function runTests() {
  console.log("=== RUNNING UNIVERSAL CRICKET MATCH STATE ENGINE TESTS ===\n");
  let passed = 0;
  
  for (const tc of testCases) {
    const res = evaluateCricketMatchState(tc.match, tc.details);
    const resultOk = res.resultText === tc.expectedResult;
    const stateOk = res.currentState === tc.expectedState;
    
    if (resultOk && stateOk) {
      console.log(`[PASS] ${tc.name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${tc.name}`);
      console.log(`  Expected Result: "${tc.expectedResult}", Got: "${res.resultText}"`);
      console.log(`  Expected State: "${tc.expectedState}", Got: "${res.currentState}"`);
    }
  }
  
  console.log(`\n=== RESULTS: ${passed}/${testCases.length} TESTS PASSED ===`);
}

runTests();
