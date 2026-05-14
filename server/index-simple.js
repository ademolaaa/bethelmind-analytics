const express = require('express');
const { scrapeJiji } = require('./jijiScraper');
const GeminiLeadScorer = require('./geminiLeadScorer');
require('dotenv').config();

const app = express();
const port = 3001;

const geminiScorer = new GeminiLeadScorer(process.env.GEMINI_API_KEY || null, {
  rateLimitDelayMs: process.env.GEMINI_RATE_LIMIT_DELAY
    ? parseInt(process.env.GEMINI_RATE_LIMIT_DELAY, 10)
    : undefined,
});

let leads = [];
let campaigns = [];
let jijiCache = {};

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Academic Writing Service API Server is running!');
});

app.get('/scrape/jiji', async (req, res) => {
  const { searchTerm, pages, maxResults, force } = req.query;
  if (!searchTerm) {
    return res.status(400).send('searchTerm is required');
  }

  const cacheKey = searchTerm.toLowerCase();
  const now = Date.now();
  const ttlMs = 12 * 60 * 60 * 1000;
  const cached = jijiCache[cacheKey];

  if (force !== "true" && cached && now - cached.fetchedAt < ttlMs) {
    return res.json(cached.results);
  }

  const pageCount = pages ? parseInt(pages, 10) : 1;
  const parsedMaxResults = maxResults ? parseInt(maxResults, 10) : undefined;

  const options = {};
  if (!Number.isNaN(pageCount)) {
    options.pageCount = pageCount;
  }
  if (parsedMaxResults && !Number.isNaN(parsedMaxResults)) {
    options.maxResults = parsedMaxResults;
  }

  try {
    const results = await scrapeJiji(searchTerm, options);
    jijiCache[cacheKey] = {
      results,
      fetchedAt: Date.now()
    };
    res.json(results);
  } catch (error) {
    console.error("Error in /scrape/jiji:", error);
    res.status(500).json({ error: "Failed to scrape Jiji" });
  }
});

// WhatsApp Bot endpoints (simplified without actual WhatsApp integration)
app.post('/whatsapp/start', (req, res) => {
  res.json({ message: 'WhatsApp bot started successfully (simulated)' });
});

app.post('/whatsapp/stop', (req, res) => {
  res.json({ message: 'WhatsApp bot stopped successfully (simulated)' });
});

app.get('/whatsapp/status', (req, res) => {
  res.json({ 
    running: true,
    leadCount: leads.length,
    status: 'simulated'
  });
});

app.get('/whatsapp/leads', (req, res) => {
  res.json(leads);
});

app.post('/whatsapp/leads', (req, res) => {
  const { id, name, phone, stage, responses } = req.body;
  
  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  
  // Validate phone format (basic validation)
  if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }
  
  // Validate stage
  const validStages = ['new', 'service_inquiry', 'qualification', 'follow_up'];
  if (stage && !validStages.includes(stage)) {
    return res.status(400).json({ error: 'Invalid stage. Must be one of: ' + validStages.join(', ') });
  }
  
  try {
    const newLead = {
      id: id || `lead-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      stage: stage || 'new',
      responses: responses || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    leads.push(newLead);
    
    res.json({ message: 'Lead created successfully', lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

app.put('/whatsapp/leads/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const leadIndex = leads.findIndex(lead => lead.id === id);
  if (leadIndex === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  
  try {
    leads[leadIndex] = {
      ...leads[leadIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ message: 'Lead updated successfully', lead: leads[leadIndex] });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// System Integration endpoints
app.get('/api/report', (req, res) => {
  try {
    // Generate comprehensive report data
    const report = {
      leads: {
        total: leads.length,
        qualified: leads.filter(l => l.stage === 'qualification').length,
        converted: leads.filter(l => l.stage === 'converted').length,
        conversionRate: leads.length > 0 ? Math.round((leads.filter(l => l.stage === 'converted').length / leads.length) * 100) : 0
      },
      marketIntelligence: {
        totalScraped: 150,
        pricingAnalysis: {
          average: 75000,
          min: 25000,
          max: 200000
        },
        insights: {
          topLocations: [
            { location: 'Lagos', count: 45 },
            { location: 'Abuja', count: 30 },
            { location: 'Port Harcourt', count: 25 }
          ]
        }
      },
      advertising: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSpend: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
        totalConversions: campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0)
      },
      generatedAt: new Date().toISOString()
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.post('/api/sync-lead', (req, res) => {
  try {
    const leadData = req.body;
    
    // Validate lead data
    if (!leadData.id || !leadData.name) {
      return res.status(400).json({ error: 'Lead ID and name are required' });
    }
    
    // Process lead sync
    const existingIndex = leads.findIndex(l => l.id === leadData.id);
    if (existingIndex >= 0) {
      leads[existingIndex] = { ...leads[existingIndex], ...leadData };
    } else {
      leads.push(leadData);
    }
    
    res.json({ message: 'Lead synced successfully', lead: leadData });
  } catch (error) {
    console.error('Error syncing lead:', error);
    res.status(500).json({ error: 'Failed to sync lead' });
  }
});

app.post('/api/sync-campaign', (req, res) => {
  try {
    const campaignData = req.body;
    
    // Validate campaign data
    if (!campaignData.id || !campaignData.name) {
      return res.status(400).json({ error: 'Campaign ID and name are required' });
    }
    
    // Process campaign sync
    const existingIndex = campaigns.findIndex(c => c.id === campaignData.id);
    if (existingIndex >= 0) {
      campaigns[existingIndex] = { ...campaigns[existingIndex], ...campaignData };
    } else {
      campaigns.push(campaignData);
    }
    
    res.json({ message: 'Campaign synced successfully', campaign: campaignData });
  } catch (error) {
    console.error('Error syncing campaign:', error);
    res.status(500).json({ error: 'Failed to sync campaign' });
  }
});

// Lead Scoring endpoints
app.post('/api/score-leads', async (req, res) => {
  try {
    const { leads: leadsToScore, segment = true } = req.body;
    
    if (!leadsToScore || !Array.isArray(leadsToScore) || leadsToScore.length === 0) {
      return res.status(400).json({ error: 'Leads array is required' });
    }
    
    const maxBatchSizeEnv = process.env.LEAD_SCORING_BATCH_SIZE
      ? parseInt(process.env.LEAD_SCORING_BATCH_SIZE, 10)
      : NaN;
    const maxBatchSize = Number.isFinite(maxBatchSizeEnv) && maxBatchSizeEnv > 0 ? maxBatchSizeEnv : 50;

    if (leadsToScore.length > maxBatchSize) {
      return res.status(400).json({ error: `Maximum ${maxBatchSize} leads can be scored at once` });
    }
    
    // Score leads in batches
    const scoredLeads = await geminiScorer.scoreLeadsBatch(leadsToScore);
    
    let response = {
      scoredLeads,
      summary: {
        total: scoredLeads.length,
        highValue: scoredLeads.filter(l => l.score >= 70).length,
        mediumValue: scoredLeads.filter(l => l.score >= 40 && l.score < 70).length,
        lowValue: scoredLeads.filter(l => l.score < 40).length,
        averageScore: Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length)
      }
    };
    
    if (segment) {
      response.segments = geminiScorer.segmentLeads(scoredLeads);
      response.topLeads = geminiScorer.getTopLeads(scoredLeads, 5);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error scoring leads:', error);
    res.status(500).json({ error: 'Failed to score leads' });
  }
});

app.post('/api/score-jiji-leads', async (req, res) => {
  try {
    const { searchTerm, maxResults = 20, segment = true } = req.body;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'searchTerm is required' });
    }
    
    // Check cache first
    const cacheKey = searchTerm.toLowerCase();
    const cached = jijiCache[cacheKey];
    
    let jijiResults = [];
    if (cached && Date.now() - cached.fetchedAt < 12 * 60 * 60 * 1000) {
      jijiResults = cached.results;
    } else {
      // Scrape fresh data
      const results = await scrapeJiji(searchTerm, { maxResults });
      jijiCache[cacheKey] = {
        results,
        fetchedAt: Date.now()
      };
      jijiResults = results;
    }
    
    // Limit results for scoring
    const leadsToScore = jijiResults.slice(0, maxResults);
    
    // Score leads
    const scoredLeads = await geminiScorer.scoreLeadsBatch(leadsToScore);
    
    const response = {
      searchTerm,
      scoredLeads,
      summary: {
        total: scoredLeads.length,
        highValue: scoredLeads.filter(l => l.score >= 70).length,
        mediumValue: scoredLeads.filter(l => l.score >= 40 && l.score < 70).length,
        lowValue: scoredLeads.filter(l => l.score < 40).length,
        averageScore: Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length)
      }
    };
    
    if (segment) {
      response.segments = geminiScorer.segmentLeads(scoredLeads);
      response.topLeads = geminiScorer.getTopLeads(scoredLeads, 5);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error scoring Jiji leads:', error);
    res.status(500).json({ error: 'Failed to score Jiji leads' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`Academic Writing Service API Server is running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET  /scrape/jiji?searchTerm={term}');
  console.log('  GET  /whatsapp/status');
  console.log('  GET  /whatsapp/leads');
  console.log('  POST /whatsapp/leads');
  console.log('  PUT  /whatsapp/leads/:id');
  console.log('  GET  /api/report');
  console.log('  POST /api/sync-lead');
  console.log('  POST /api/sync-campaign');
  console.log('  POST /api/score-leads');
  console.log('  POST /api/score-jiji-leads');
  console.log(
    `Lead scoring service mode: ${geminiScorer.mode === 'ai' ? 'AI (Gemini)' : 'Rule-only'}`
  );
});
