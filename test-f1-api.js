async function test() {
  try {
    const standingsUrl = 'https://api.jolpi.ca/ergast/f1/current/driverStandings.json';
    const res = await fetch(standingsUrl);
    const data = await res.json();
    console.log("Standings:", data.MRData.StandingsTable.StandingsLists[0].DriverStandings[0].Driver.familyName);

    const resultsUrl = 'https://api.jolpi.ca/ergast/f1/current/last/results.json';
    const res2 = await fetch(resultsUrl);
    const data2 = await res2.json();
    console.log("Last Race:", data2.MRData.RaceTable.Races[0].raceName);
  } catch(e) {
    console.error(e);
  }
}
test();
