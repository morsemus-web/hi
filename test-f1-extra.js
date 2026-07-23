async function test() {
  try {
    const nextUrl = 'https://api.jolpi.ca/ergast/f1/current/next.json';
    const resNext = await fetch(nextUrl);
    const dataNext = await resNext.json();
    console.log("Next Race:", dataNext.MRData.RaceTable.Races[0].raceName);
    console.log("Next Date:", dataNext.MRData.RaceTable.Races[0].date);

    const winnersUrl = 'https://api.jolpi.ca/ergast/f1/current/results/1.json';
    const resWin = await fetch(winnersUrl);
    const dataWin = await resWin.json();
    const winners = dataWin.MRData.RaceTable.Races.map(r => `${r.raceName}: ${r.Results[0].Driver.familyName}`);
    console.log("Winners:", winners);
  } catch(e) {
    console.error(e);
  }
}
test();
