const axios = require('axios');

async function testEndpoints() {
  console.log('Testing API endpoints directly...');
  
  try {
    // Test WhatsApp status
    console.log('Testing /whatsapp/status...');
    const statusResponse = await axios.get('http://localhost:3001/whatsapp/status');
    console.log('✅ WhatsApp status:', statusResponse.data);
    
    // Test lead creation
    console.log('Testing /whatsapp/leads POST...');
    const leadResponse = await axios.post('http://localhost:3001/whatsapp/leads', {
      name: 'Test User',
      phone: '+2341234567890',
      stage: 'new'
    });
    console.log('✅ Lead creation:', leadResponse.data);
    
    // Test system integration
    console.log('Testing /api/sync-lead...');
    const syncResponse = await axios.post('http://localhost:3001/api/sync-lead', {
      id: 'test-lead-1',
      name: 'Test Lead',
      phone: '+2341234567890'
    });
    console.log('✅ Sync lead:', syncResponse.data);
    
    // Test report generation
    console.log('Testing /api/report...');
    const reportResponse = await axios.get('http://localhost:3001/api/report');
    console.log('✅ Report generation:', reportResponse.data);
    
    console.log('All endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testEndpoints();