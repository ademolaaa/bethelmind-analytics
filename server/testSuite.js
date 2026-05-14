const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testLeads = [
  {
    id: 'test-lead-1',
    name: 'Test Student',
    phone: '+2348012345678',
    stage: 'new',
    responses: [
      {
        text: 'Hello, I need help with my thesis',
        timestamp: new Date().toISOString()
      }
    ]
  },
  {
    id: 'test-lead-2',
    name: 'Research Student',
    phone: '+2348098765432',
    stage: 'qualified',
    responses: [
      {
        text: 'I have an urgent deadline for my dissertation',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

const testCampaigns = [
  {
    id: 'test-campaign-1',
    name: 'Thesis Help Campaign',
    budget: 500,
    status: 'active',
    metrics: {
      impressions: 1000,
      clicks: 50,
      conversions: 5,
      ctr: 5.0,
      cpc: 2.5
    }
  }
];

// Test functions
async function testScrapingEndpoint() {
  console.log('🧪 Testing scraping endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/scrape/jiji?searchTerm=academic%20writer`);
    console.log('✅ Scraping endpoint working:', response.data.length, 'items found');
    return true;
  } catch (error) {
    console.error('❌ Scraping endpoint failed:', error.message);
    return false;
  }
}

async function testWhatsAppBotStatus() {
  console.log('🧪 Testing WhatsApp bot status...');
  try {
    const response = await axios.get(`${BASE_URL}/whatsapp/status`);
    console.log('✅ WhatsApp bot status:', response.data);
    return true;
  } catch (error) {
    console.error('❌ WhatsApp bot status failed:', error.message);
    return false;
  }
}

async function testWhatsAppLeads() {
  console.log('🧪 Testing WhatsApp leads endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/whatsapp/leads`);
    console.log('✅ WhatsApp leads endpoint working:', response.data.length, 'leads');
    return true;
  } catch (error) {
    console.error('❌ WhatsApp leads endpoint failed:', error.message);
    return false;
  }
}

async function testLeadProcessing() {
  console.log('🧪 Testing lead processing...');
  try {
    // Test lead creation
    const leadData = {
      id: 'test-lead-3',
      name: 'Test Processing Lead',
      phone: '+2348076543210',
      stage: 'new',
      responses: [{
        text: 'I need urgent thesis help',
        timestamp: new Date().toISOString()
      }]
    };

    const response = await axios.post(`${BASE_URL}/whatsapp/leads`, leadData);
    console.log('✅ Lead processing working:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Lead processing failed:', error.message);
    return false;
  }
}

async function testSystemIntegration() {
  console.log('🧪 Testing system integration...');
  try {
    // Test comprehensive report generation
    const response = await axios.get(`${BASE_URL}/api/report`);
    console.log('✅ System integration working:', Object.keys(response.data));
    return true;
  } catch (error) {
    console.error('❌ System integration failed:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('🧪 Testing performance...');
  try {
    const startTime = Date.now();
    const response = await axios.get(`${BASE_URL}/scrape/jiji?searchTerm=thesis`);
    const endTime = Date.now();
    
    console.log('✅ Performance test:', endTime - startTime, 'ms');
    console.log('✅ Data quality:', response.data.length, 'items');
    
    // Test data structure
    if (response.data.length > 0) {
      const firstItem = response.data[0];
      const requiredFields = ['title', 'price', 'location', 'url'];
      const hasAllFields = requiredFields.every(field => firstItem.hasOwnProperty(field));
      
      if (hasAllFields) {
        console.log('✅ Data structure is correct');
      } else {
        console.log('⚠️  Data structure may be incomplete');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

async function testErrorHandling() {
  console.log('🧪 Testing error handling...');
  
  // Test invalid endpoint
  try {
    await axios.get(`${BASE_URL}/invalid-endpoint`);
    console.log('⚠️  Error handling may be incomplete');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Error handling working correctly');
      return true;
    } else {
      console.log('⚠️  Unexpected error response');
      return false;
    }
  }
}

async function testDataValidation() {
  console.log('🧪 Testing data validation...');
  try {
    // Test with invalid data
    const invalidLead = {
      name: '',  // Empty name
      phone: 'invalid-phone',
      stage: 'invalid-stage'
    };

    await axios.post(`${BASE_URL}/whatsapp/leads`, invalidLead);
    console.log('⚠️  Data validation may be incomplete');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Data validation working correctly');
      return true;
    } else {
      console.log('⚠️  Unexpected validation response');
      return false;
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting comprehensive test suite...\n');
  
  const tests = [
    testScrapingEndpoint,
    testWhatsAppBotStatus,
    testWhatsAppLeads,
    testLeadProcessing,
    testSystemIntegration,
    testPerformance,
    testErrorHandling,
    testDataValidation
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    console.log(''); // Add spacing between tests
    
    // Small delay between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! System is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  return passed === total;
}

// Load testing function
async function runLoadTest() {
  console.log('🔥 Running load test...');
  
  const concurrentRequests = 10;
  const requests = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    requests.push(
      axios.get(`${BASE_URL}/scrape/jiji?searchTerm=academic%20writer`)
        .then(() => ({ success: true }))
        .catch(() => ({ success: false }))
    );
  }
  
  const results = await Promise.all(requests);
  const successful = results.filter(r => r.success).length;
  
  console.log(`📊 Load test results: ${successful}/${concurrentRequests} requests successful`);
  
  if (successful >= concurrentRequests * 0.8) {
    console.log('✅ Load test passed - system can handle concurrent requests');
  } else {
    console.log('⚠️  Load test failed - system may need optimization');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      if (success) {
        return runLoadTest();
      }
    })
    .then(() => {
      console.log('\n🏁 Test suite completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  runLoadTest,
  testScrapingEndpoint,
  testWhatsAppBotStatus,
  testWhatsAppLeads,
  testLeadProcessing,
  testSystemIntegration,
  testPerformance,
  testErrorHandling,
  testDataValidation
};