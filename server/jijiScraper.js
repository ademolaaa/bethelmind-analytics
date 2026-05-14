const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeJiji(searchTerm, options = {}) {
  const pageCountRaw = options.pageCount || 1;
  const pageCount = Math.min(Math.max(pageCountRaw, 1), 3);
  const delayMs = typeof options.delayMs === "number" ? options.delayMs : 800;
  const maxResults = options.maxResults && options.maxResults > 0 ? options.maxResults : 60;

  const results = [];
  const seen = new Set();

  for (let page = 1; page <= pageCount; page++) {
    const pageResults = await scrapeJijiPage(searchTerm, page);
    for (const item of pageResults) {
      const key = `${item.title}|${item.price}|${item.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(item);
      }
      if (results.length >= maxResults) {
        break;
      }
    }
    if (results.length >= maxResults) {
      break;
    }
    if (page < pageCount && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

async function scrapeJijiPage(searchTerm, page) {
  try {
    const url = `https://jiji.ng/search?query=${encodeURIComponent(searchTerm)}&page=${page}`;
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    const $ = cheerio.load(data);

    const results = [];
    const items = $(".b-list-advert__gallery__item");

    items.each((i, el) => {
      const titleElement = $(el).find(".b-advert-title-inner");
      const priceElement = $(el).find(".qa-advert-price");
      const locationElement = $(el).find(".b-list-advert__region__text");
      const linkElement = $(el).find("a.b-list-advert-base");

      const title = titleElement.text().trim();
      const price = priceElement.text().trim();
      const location = locationElement.text().trim();
      const link = linkElement.attr("href");

      if (title) {
        results.push({
          title,
          price,
          location,
          link: link ? `https://jiji.ng${link}` : ""
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Error scraping Jiji:", error);
    return [];
  }
}

module.exports = { scrapeJiji };
