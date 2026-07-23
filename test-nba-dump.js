const fs = require('fs');

async function test() {
  try {
    const url = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    const res = await fetch(url);
    const data = await res.json();
    if (data.events && data.events.length > 0) {
       fs.writeFileSync('nba-sample.json', JSON.stringify(data.events[0], null, 2));
       console.log('Saved to nba-sample.json');
    } else {
       console.log('No events found.');
    }
  } catch (err) {
    console.error(err);
  }
}
test();
