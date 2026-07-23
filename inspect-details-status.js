const cheerio = require('cheerio');

async function test() {
  try {
    const url = 'https://www.cricbuzz.com/live-cricket-scores/129458/eng-vs-ind-1st-odi-india-tour-of-england-2026';
    console.log('Fetching Details Page:', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log('--- HTML TITLE ---');
    console.log($('title').text().trim());

    console.log('\n--- Text Nodes with potential status ---');
    $('div, span, p').each((_, el) => {
       const text = $(el).clone().children().remove().end().text().trim();
       const cls = $(el).attr('class') || '';
       if (text.length > 5 && text.length < 100 && (text.includes('opt') || text.includes('begin') || text.includes('need') || text.includes('bat') || text.includes('won'))) {
          console.log(`${el.name} (class="${cls}"): "${text}"`);
       }
    });

  } catch(e) {
    console.error(e);
  }
}

test();
