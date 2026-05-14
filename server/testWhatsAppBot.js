const axios = require('axios');

async function testWhatsAppBot() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test WhatsApp bot status
    console.log('Testing WhatsApp bot status...');
    const statusResponse = await axios.get(`${baseUrl}/whatsapp/status`);
    console.log('Status:', statusResponse.data);
    
    // Test starting the bot (commented out as it requires QR code scanning)
    // console.log('Starting WhatsApp bot...');
    // const startResponse = await axios.post(`${baseUrl}/whatsapp/start`);
    // console.log('Start response:', startResponse.data);
    
    // Test getting leads (will be empty if bot not running)
    console.log('Getting leads...');
    try {
      const leadsResponse = await axios.get(`${baseUrl}/whatsapp/leads`);
      console.log('Leads:', leadsResponse.data);
    } catch (error) {
      console.log('Leads error (expected if bot not running):', error.response.data);
    }
    
  } catch (error) {
    console.error('Error testing WhatsApp bot:', error.message);
  }
}

testWhatsAppBot();