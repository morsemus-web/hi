const fs = require('fs');

async function test() {
  const apiKey = 'a2f7acf4-1a64-46c3-a77d-c0726df92e35';
  const today = new Date().toISOString().split('T')[0]; // e.g., '2026-07-23'
  
  // Try fetching games for today
  try {
    const res = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${today}`, {
      headers: {
        'Authorization': apiKey
      }
    });
    const data = await res.json();
    
    // If no games today, try without dates to just get something
    if (!data.data || data.data.length === 0) {
      const fallbackRes = await fetch(`https://api.balldontlie.io/v1/games`, {
        headers: {
          'Authorization': apiKey
        }
      });
      const fallbackData = await fallbackRes.json();
      fs.writeFileSync('balldontlie-sample.json', JSON.stringify(fallbackData.data[0], null, 2));
      console.log('Saved fallback game to balldontlie-sample.json');
    } else {
      fs.writeFileSync('balldontlie-sample.json', JSON.stringify(data.data[0], null, 2));
      console.log('Saved today game to balldontlie-sample.json');
    }
  } catch(e) {
    console.error(e);
  }
}
test();
