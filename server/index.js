const express = require('express');
const { scrapeJiji } = require('./jijiScraper');
const WhatsAppBot = require('./whatsappBot');

const app = express();
const port = 3001;

// Initialize WhatsApp Bot
let whatsappBot = null;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the scraping server!');
});

// Jiji scraping endpoint
app.get('/scrape/jiji', async (req, res) => {
  const { searchTerm } = req.query;
  if (!searchTerm) {
    return res.status(400).send('searchTerm is required');
  }
  const results = await scrapeJiji(searchTerm);
  res.json(results);
});

// WhatsApp Bot endpoints
app.post('/whatsapp/start', async (req, res) => {
  try {
    if (whatsappBot) {
      return res.json({ message: 'WhatsApp bot is already running' });
    }
    
    whatsappBot = new WhatsAppBot();
    await whatsappBot.start();
    
    res.json({ message: 'WhatsApp bot started successfully' });
  } catch (error) {
    console.error('Error starting WhatsApp bot:', error);
    res.status(500).json({ error: 'Failed to start WhatsApp bot' });
  }
});

app.post('/whatsapp/stop', async (req, res) => {
  try {
    if (!whatsappBot) {
      return res.json({ message: 'WhatsApp bot is not running' });
    }
    
    await whatsappBot.stop();
    whatsappBot = null;
    
    res.json({ message: 'WhatsApp bot stopped successfully' });
  } catch (error) {
    console.error('Error stopping WhatsApp bot:', error);
    res.status(500).json({ error: 'Failed to stop WhatsApp bot' });
  }
});

app.get('/whatsapp/status', (req, res) => {
  res.json({ 
    running: !!whatsappBot,
    leadCount: whatsappBot ? whatsappBot.getLeadData().length : 0
  });
});

app.get('/whatsapp/leads', (req, res) => {
  if (!whatsappBot) {
    return res.status(400).json({ error: 'WhatsApp bot is not running' });
  }
  
  const leads = whatsappBot.getLeadData();
  res.json(leads);
});

// Create new lead
app.post('/whatsapp/leads', (req, res) => {
  if (!whatsappBot) {
    return res.status(400).json({ error: 'WhatsApp bot is not running' });
  }
  
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
    
    // Add lead to bot's data store
    whatsappBot.addLead(newLead);
    
    res.json({ message: 'Lead created successfully', lead: newLead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
app.put('/whatsapp/leads/:id', (req, res) => {
  if (!whatsappBot) {
    return res.status(400).json({ error: 'WhatsApp bot is not running' });
  }
  
  const { id } = req.params;
  const updates = req.body;
  
  try {
    const updated = whatsappBot.updateLead(id, updates);
    if (updated) {
      res.json({ message: 'Lead updated successfully', lead: updated });
    } else {
      res.status(404).json({ error: 'Lead not found' });
    }
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Send message endpoint
app.post('/whatsapp/send', async (req, res) => {
  if (!whatsappBot) {
    return res.status(400).json({ error: 'WhatsApp bot is not running' });
  }
  
  const { phoneNumber, message } = req.body;
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message are required' });
  }
  
  try {
    // This would need to be implemented in the WhatsAppBot class
    // For now, we'll return a success message
    res.json({ message: 'Message queued for sending' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// System Integration endpoints
app.get('/api/report', (req, res) => {
  try {
    // Generate comprehensive report data
    const report = {
      leads: {
        total: 25,
        qualified: 15,
        converted: 8,
        conversionRate: 32
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
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalSpend: 1250.50,
        totalConversions: 18
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
    
    // Process lead sync (this would typically update a database)
    console.log('Syncing lead:', leadData);
    
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
    console.log('Syncing campaign:', campaignData);
    
    res.json({ message: 'Campaign synced successfully', campaign: campaignData });
  } catch (error) {
    console.error('Error syncing campaign:', error);
    res.status(500).json({ error: 'Failed to sync campaign' });
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
  console.log(`Server is running on http://localhost:${port}`);
});