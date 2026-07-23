const cheerio = require('cheerio');

async function test() {
  try {
    const url = 'https://www.cricbuzz.com/cricket-match/live-scores/recent-matches';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const pageText = $('body').text().replace(/\s+/g, ' ');
    console.log('--- Page Text Sample (2000 to 6000 chars) ---');
    console.log(pageText.slice(2000, 6000));

  } catch(e) {
    console.error(e);
  }
}

test();
