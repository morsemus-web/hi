const cheerio = require('cheerio');

async function test() {
  try {
    const url = 'https://www.bbc.com/sport/formula1';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    let jsonData = null;
    $("script").each((_, script) => {
      const content = $(script).html() || "";
      if (content.includes("window.__INITIAL_DATA__")) {
        const match = content.match(/window\.__INITIAL_DATA__\s*=\s*["'](.*?)["']\s*;/);
        if (match) {
          try {
            const unescapedStr = JSON.parse(`"${match[1]}"`);
            jsonData = JSON.parse(unescapedStr);
          } catch (e) {}
        }
      }
    });

    if (jsonData && jsonData.data) {
      console.log("Keys in data:", Object.keys(jsonData.data));
    } else {
      console.log("No jsonData found.");
    }
  } catch(e) {
    console.error(e);
  }
}
test();
