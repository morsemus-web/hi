async function test() {
  try {
    const url = 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Found ${data.events?.length || 0} NBA events`);
    if (data.events && data.events.length > 0) {
       const e = data.events[0];
       console.log(e.name, e.status.type.detail);
    }
  } catch (err) {
    console.error(err);
  }
}
test();
