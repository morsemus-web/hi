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
    
    console.log('--- Date elements on Recent Page ---');
    $('div, span').each((_, el) => {
       const text = $(el).text().trim();
       const cls = $(el).attr('class') || '';
       
       // Match date patterns like "Jul 13", "July 13", "13 July"
       if (/^((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2})/i.test(text) && text.length < 25 && !text.includes('\n')) {
          console.log(`${el.name} (class="${cls}"): "${text}"`);
       }
    });

  } catch(e) {
    console.error(e);
  }
}

test();
