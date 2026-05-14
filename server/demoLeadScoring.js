const GeminiLeadScorer = require('./geminiLeadScorer');

// Demo data - realistic Jiji leads for academic writing services
const demoLeads = [
  {
    title: 'PhD Thesis Writing & Research Consultation',
    price: '₦180,000',
    location: 'Lagos, Ikeja',
    description: 'Professional thesis writing services for doctoral candidates. Complete research methodology, data analysis, and chapter-by-chapter guidance. Plagiarism-free guarantee with Turnitin report.'
  },
  {
    title: 'Master\'s Dissertation Help - 2 Weeks Delivery',
    price: '₦95,000',
    location: 'Abuja, Wuse',
    description: 'Urgent dissertation assistance for master\'s students. Expert writers, proper APA formatting, unlimited revisions. Contact for immediate help with your thesis deadline.'
  },
  {
    title: 'Cheap Essay Writing Services for Students',
    price: '₦3,500 per page',
    location: 'Online Service',
    description: 'Budget-friendly essay writing for college students. Quick turnaround, basic research, affordable rates. Perfect for undergraduates on tight budget.'
  },
  {
    title: 'Research Proposal Writing - PhD/Masters',
    price: '₦45,000',
    location: 'Port Harcourt',
    description: 'Specialized research proposal writing for graduate students. Comprehensive literature review, methodology design, and statistical planning. University-approved format.'
  },
  {
    title: 'URGENT: Need Thesis Writer ASAP - Deadline Tomorrow!',
    price: '₦250,000',
    location: 'Lagos, Victoria Island',
    description: 'Emergency thesis completion needed! Professional academic writer required immediately for final chapter and conclusion. Will pay premium for overnight delivery.'
  },
  {
    title: 'Academic Proofreading & Editing Services',
    price: '₦15,000',
    location: 'Ibadan',
    description: 'Professional proofreading for academic papers, theses, and dissertations. Grammar correction, APA/MLA formatting, reference checking. Fast turnaround available.'
  },
  {
    title: 'Statistical Analysis for Thesis - SPSS, R, Python',
    price: '₦60,000',
    location: 'Enugu',
    description: 'Expert statistical analysis services for thesis and dissertation research. SPSS, R, Python implementations. Data interpretation and report writing included.'
  },
  {
    title: 'Literature Review Writing Service',
    price: '₦40,000',
    location: 'Kano',
    description: 'Comprehensive literature review writing for academic research. Systematic review methodology, proper citations, critical analysis. Peer-reviewed sources only.'
  }
];

async function runDemo() {
  console.log('🎯 Gemini Lead Scoring Demo - Fallback Mode\n');
  console.log('This demo uses rule-based scoring (no API key required).');
  console.log('To enable AI scoring, set GEMINI_API_KEY in your .env file.\n');
  
  // Create scorer instance without API key to demonstrate fallback
  const scorer = new GeminiLeadScorer('demo-key');
  
  console.log('📊 Analyzing', demoLeads.length, 'demo leads...\n');
  
  // Score all leads
  const scoredLeads = [];
  for (const lead of demoLeads) {
    const score = await scorer.scoreLead(lead);
    scoredLeads.push({
      ...lead,
      score: score.score,
      segments: score.segments,
      reasoning: score.reasoning,
      confidence: score.confidence
    });
  }
  
  // Sort by score (highest first)
  scoredLeads.sort((a, b) => b.score - a.score);
  
  console.log('🏆 TOP 5 LEADS (Highest Score First):');
  console.log('=' .repeat(60));
  
  scoredLeads.slice(0, 5).forEach((lead, index) => {
    console.log(`\n${index + 1}. ${lead.title}`);
    console.log(`   💰 Price: ${lead.price}`);
    console.log(`   📍 Location: ${lead.location}`);
    console.log(`   ⭐ Score: ${lead.score}/100`);
    console.log(`   🏷️  Segments: ${lead.segments.join(', ')}`);
    console.log(`   💭 Reasoning: ${lead.reasoning}`);
    console.log(`   🔍 Confidence: ${lead.confidence}%`);
  });
  
  // Segment analysis
  console.log('\n\n📈 SEGMENT ANALYSIS:');
  console.log('=' .repeat(40));
  
  const segments = scorer.segmentLeads(scoredLeads);
  
  Object.entries(segments).forEach(([segment, leads]) => {
    if (leads.length > 0) {
      const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length);
      console.log(`\n${segment.toUpperCase().replace('-', ' ')}:`);
      console.log(`  📊 Count: ${leads.length} leads`);
      console.log(`  📈 Average Score: ${avgScore}/100`);
      console.log(`  💰 Price Range: ${leads[leads.length - 1].price} - ${leads[0].price}`);
      
      if (leads.length > 0) {
        console.log(`  🏆 Top Lead: ${leads[0].title} (${leads[0].score}/100)`);
      }
    }
  });
  
  // Business insights
  console.log('\n\n💡 BUSINESS INSIGHTS:');
  console.log('=' .repeat(40));
  
  const highValueLeads = scoredLeads.filter(l => l.score >= 70);
  const urgentLeads = scoredLeads.filter(l => l.segments.includes('academic-emergency'));
  
  console.log(`\n🎯 High-Value Opportunities: ${highValueLeads.length}`);
  if (highValueLeads.length > 0) {
    console.log(`   💰 Average Price: ${Math.round(highValueLeads.reduce((sum, l) => {
      const priceMatch = l.price.match(/[\d,]+/);
      return sum + (priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0);
    }, 0) / highValueLeads.length).toLocaleString()}`);
  }
  
  console.log(`\n🚨 Urgent/Emergency Leads: ${urgentLeads.length}`);
  urgentLeads.forEach(lead => {
    console.log(`   • ${lead.title} (${lead.score}/100)`);
  });
  
  console.log(`\n📊 Overall Statistics:`);
  console.log(`   • Total Leads Analyzed: ${scoredLeads.length}`);
  console.log(`   • Average Score: ${Math.round(scoredLeads.reduce((sum, l) => sum + l.score, 0) / scoredLeads.length)}/100`);
  console.log(`   • High-Value Rate: ${Math.round((highValueLeads.length / scoredLeads.length) * 100)}%`);
  
  console.log('\n✅ Demo completed successfully!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Set GEMINI_API_KEY in your .env file for AI-powered scoring');
  console.log('   2. Use /api/score-leads endpoint for custom lead batches');
  console.log('   3. Use /api/score-jiji-leads endpoint for Jiji scraping + scoring');
  console.log('   4. Integrate with your CRM for automated lead qualification');
}

// Run the demo
runDemo().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});