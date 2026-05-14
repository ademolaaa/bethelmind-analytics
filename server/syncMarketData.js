const { scrapeJiji } = require('./jijiScraper');
const { supabase } = require('./lib/db');

/**
 * Automates the synchronization of market data from local platforms (e.g. Jiji) 
 * into the Supabase market_data table for analytics visualization.
 */
async function syncMarketData() {
  const categories = [
    'iPhone 13', 
    'Toyota Corolla', 
    'Laptops', 
    'Luxury Furniture',
    'Real Estate Lagos'
  ];
  
  console.log('--- Starting Market Intelligence Sync ---');
  
  for (const category of categories) {
    try {
      console.log(`Scraping Category: ${category}...`);
      const results = await scrapeJiji(category, { maxResults: 20 });
      
      if (results.length === 0) {
        console.log(`No results found for ${category}.`);
        continue;
      }
      
      const marketDataItems = results.map(item => ({
        source_platform: 'Jiji',
        category: category,
        raw_title: item.title,
        price_text: item.price,
        location_text: item.location,
        item_link: item.link,
        metadata: {
          scraped_at: new Date().toISOString(),
          currency: 'NGN'
        }
      }));
      
      console.log(`Inserting ${marketDataItems.length} records into Supabase...`);
      
      const { error } = await supabase
        .from('market_data')
        .insert(marketDataItems);
        
      if (error) {
        console.error(`Supabase Insert Error [${category}]:`, error.message);
      } else {
        console.log(`Success: Synced ${category}.`);
      }
      
    } catch (err) {
      console.error(`Sync Process Error [${category}]:`, err.message);
    }
    
    // Safety delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('--- Sync Completed ---');
}

// Allow manual execution
if (require.main === module) {
  syncMarketData();
}

module.exports = { syncMarketData };
