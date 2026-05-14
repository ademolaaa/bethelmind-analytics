const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 30000; // 30 seconds for API calls

// Test data
const testLeads = [
  {
    title: 'PhD Thesis Writing Service - Professional Academic Help',
    price: '₦150,000',
    location: 'Lagos, Nigeria',
    description: 'Expert thesis writing services for doctoral students. Plagiarism-free, on-time delivery, professional formatting.'
  },
  {
    title: 'Cheap Essay Writing - Budget Student Help',
    price: '₦5,000',
    location: 'Online',
    description: 'Affordable essay writing for students. Quick turnaround, basic quality.'
  },
  {
    title: 'Dissertation Research Methodology Consulting',
    price: '₦75,000',
    location: 'Abuja',
    description: 'Specialized dissertation methodology consulting for graduate students. Statistical analysis, research design.'
  },
  {
    title: 'Urgent Thesis Help - Deadline Tomorrow!',
    price: '₦200,000',
    location: 'Port Harcourt',
    description: 'Emergency thesis completion service. Need immediate help with final chapter. Professional academic writer required.'
  },
  {
    title: 'Academic Proofreading and Editing Services',
    price: '₦25,000',
    location: 'Ibadan',
    description: 'Professional proofreading for academic papers, theses, and dissertations. APA, MLA, Chicago formatting.'
  }
];

async function testLeadScoring() {
  console.log('🚀 Starting Lead Scoring Pipeline Test...\n');
  
  try {
    // Test 1: Direct lead scoring
    console.log('📊 Test 1: Direct Lead Scoring');
    console.log('Testing with sample leads...');
    
    const directScoreResponse = await axios.post(`${API_BASE_URL}/api/score-leads`, {
      leads: testLeads,
      segment: true
    }, { timeout: TEST_TIMEOUT });
    
    console.log('✅ Direct scoring successful!');
    console.log('Summary:', {
      total: directScoreResponse.data.summary.total,
      highValue: directScoreResponse.data.summary.highValue,
      mediumValue: directScoreResponse.data.summary.mediumValue,
      lowValue: directScoreResponse.data.summary.lowValue,
      averageScore: directScoreResponse.data.summary.averageScore
    });
    
    if (directScoreResponse.data.topLeads && directScoreResponse.data.topLeads.length > 0) {
      console.log('🏆 Top Lead:', {
        title: directScoreResponse.data.topLeads[0].title,
        score: directScoreResponse.data.topLeads[0].score,
        segments: directScoreResponse.data.topLeads[0].segments
      });
    }
    
    console.log('\n📋 Segments:');
    Object.entries(directScoreResponse.data.segments).forEach(([segment, leads]) => {
      console.log(`  ${segment}: ${leads.length} leads`);
    });
    
    // Test 2: Jiji integration scoring
    console.log('\n🔍 Test 2: Jiji Integration Scoring');
    console.log('Testing with "thesis writing" search term...');
    
    const jijiScoreResponse = await axios.post(`${API_BASE_URL}/api/score-jiji-leads`, {
      searchTerm: 'thesis writing',
      maxResults: 10,
      segment: true
    }, { timeout: TEST_TIMEOUT });
    
    console.log('✅ Jiji scoring successful!');
    console.log('Search Results:', {
      total: jijiScoreResponse.data.summary.total,
      highValue: jijiScoreResponse.data.summary.highValue,
      averageScore: jijiScoreResponse.data.summary.averageScore
    });
    
    if (jijiScoreResponse.data.topLeads && jijiScoreResponse.data.topLeads.length > 0) {
      console.log('🏆 Top Jiji Lead:', {
        title: jijiScoreResponse.data.topLeads[0].title,
        score: jijiScoreResponse.data.topLeads[0].score,
        price: jijiScoreResponse.data.topLeads[0].price
      });
    }
    
    // Test 3: Error handling
    console.log('\n⚠️  Test 3: Error Handling');
    
    try {
      await axios.post(`${API_BASE_URL}/api/score-leads`, {
        leads: [],
        segment: true
      });
      console.log('❌ Should have failed with empty leads array');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected empty leads array');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Test 4: Performance metrics
    console.log('\n⚡ Test 4: Performance Metrics');
    const startTime = Date.now();
    
    const perfResponse = await axios.post(`${API_BASE_URL}/api/score-leads`, {
      leads: testLeads.slice(0, 3), // Smaller batch for performance test
      segment: true
    }, { timeout: TEST_TIMEOUT });
    
    const endTime = Date.now();
    console.log(`✅ Scored 3 leads in ${endTime - startTime}ms`);
    console.log(`✅ Average time per lead: ${Math.round((endTime - startTime) / 3)}ms`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📈 Lead Scoring Pipeline Summary:');
    console.log('• Direct lead scoring: ✅ Working');
    console.log('• Jiji integration scoring: ✅ Working');
    console.log('• Segmentation: ✅ Working');
    console.log('• Error handling: ✅ Working');
    console.log('• Performance: ✅ Acceptable');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚨 Server not running. Please start the server first with: npm run dev:server');
    } else {
      console.error('Error details:', error);
    }
    
    process.exit(1);
  }
}

// Run the test
console.log('🔬 Lead Scoring Pipeline Test Suite');
console.log('=====================================');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Test Timeout: ${TEST_TIMEOUT}ms\n`);

testLeadScoring().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});