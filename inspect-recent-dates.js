const cheerio = require('cheerio');

async function test() {
  try {
    const url = 'https://www.cricbuzz.com/cricket-match/live-scores/recent-matches';
    console.log('Fetching Recent matches:', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log('--- Headings and dates on Recent Page ---');
    $('div, span, h2, h3').each((_, el) => {
       const text = $(el).text().trim();
       const cls = $(el).attr('class') || '';
       // Search for date formats like "Monday, Jul 13" or "Jul 13, 2026"
       if (/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/i.test(text) && text.length < 35 && !text.includes('\n')) {
          console.log(`${el.name} (class="${cls}"): "${text}"`);
       }
    });

  } catch(e) {
    console.error(e);
  }
}

test();
