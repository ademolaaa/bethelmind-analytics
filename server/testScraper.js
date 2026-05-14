const { scrapeJiji } = require('./jijiScraper');

async function testScraper() {
  console.log('Testing Jiji scraper...');
  const results = await scrapeJiji('academic writer');
  console.log('Results:', results);
  console.log('Number of results:', results.length);
}

testScraper();