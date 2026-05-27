import { evaluateCricketMatchState, RawCricketMatch, RawCricketDetails } from "./src/lib/cricketEngine";

interface TestCase {
  name: string;
  match: RawCricketMatch;
  details: RawCricketDetails | null;
  expectedResult: string;
  expectedState: string;
}

const testCases: TestCase[] = [
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
        { team: "Team A", score: "300/10", total: "300/10" }, // Innings 1
        { team: "Team B", score: "250/10", total: "250/10" }, // Innings 2
        { team: "Team A", score: "200/10", total: "200/10" }, // Innings 3
        { team: "Team B", score: "251/4", total: "251/4" }    // Innings 4
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
        { team: "Team A", score: "300/10", total: "300/10" }, // Innings 1
        { team: "Team B", score: "200/10", total: "200/10" }, // Innings 2
        { team: "Team A", score: "250/10", total: "250/10" }, // Innings 3
        { team: "Team B", score: "300/10", total: "300/10" }  // Innings 4
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
        { team: "Team A", score: "500/10", total: "500/10" }, // Innings 1
        { team: "Team B", score: "200/10", total: "200/10" }, // Innings 2
        { team: "Team B", score: "250/10", total: "250/10" }  // Innings 3 (Second batting turn)
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
