import { trackLeadGeneration, trackServiceInquiry, trackPurchase } from '@/components/FacebookPixel';

interface LeadData {
  userId: string;
  stage: string;
  service: string;
  timestamp: number;
  responses: Array<{ text: string; timestamp: number }>;
  contactInfo?: string;
  projectDetails?: string;
  priority?: string;
  value?: number;
}

interface ScrapingData {
  id: string;
  title: string;
  price: string;
  location: string;
  link: string;
  scrapedAt: string;
}

interface CampaignData {
  id: string;
  name: string;
  objective: string;
  budget: number;
  status: string;
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    costPerClick: number;
    totalSpent: number;
  };
}

class SystemIntegration {
  private serverUrl: string;
  private facebookPixelId: string;

  constructor(serverUrl = 'http://localhost:3001', facebookPixelId = 'YOUR_FACEBOOK_PIXEL_ID') {
    this.serverUrl = serverUrl;
    this.facebookPixelId = facebookPixelId;
  }

  // Lead Management Integration
  async processLeadUpdate(lead: LeadData) {
    try {
      // Update lead in WhatsApp bot system
      await this.updateWhatsAppLead(lead);
      
      // Track lead generation in Facebook Pixel
      if (lead.stage === 'new') {
        trackLeadGeneration(lead.value || 0);
      }
      
      // Track service inquiry for qualified leads
      if (lead.stage === 'qualified') {
        trackServiceInquiry(lead.service || 'academic-writing', lead.value || 50);
      }
      
      // Track purchase for converted leads
      if (lead.stage === 'converted') {
        trackPurchase(lead.value || 100, 'USD', lead.userId);
      }
      
      console.log('Lead update processed successfully:', lead.userId);
    } catch (error) {
      console.error('Error processing lead update:', error);
    }
  }

  async updateWhatsAppLead(lead: LeadData) {
    try {
      const response = await fetch(`${this.serverUrl}/whatsapp/update-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update WhatsApp lead');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating WhatsApp lead:', error);
      throw error;
    }
  }

  // Scraping Data Integration
  async processScrapingData(scrapingData: ScrapingData[]) {
    try {
      // Analyze competitive pricing
      const pricingAnalysis = this.analyzePricingData(scrapingData);
      
      // Update dashboard with new data
      await this.updateDashboardData(scrapingData, pricingAnalysis);
      
      // Generate market insights
      const insights = this.generateMarketInsights(scrapingData);
      
      return {
        pricingAnalysis,
        insights,
        totalItems: scrapingData.length
      };
    } catch (error) {
      console.error('Error processing scraping data:', error);
      throw error;
    }
  }

  analyzePricingData(scrapingData: ScrapingData[]) {
    const prices = scrapingData
      .map(item => this.extractPrice(item.price))
      .filter(price => price > 0)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) {
      return {
        average: 0,
        median: 0,
        min: 0,
        max: 0,
        count: 0
      };
    }
    
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)];
    const min = prices[0];
    const max = prices[prices.length - 1];
    
    return {
      average: Math.round(average),
      median,
      min,
      max,
      count: prices.length
    };
  }

  extractPrice(priceString: string): number {
    // Extract numeric value from price string (e.g., "₦5,000" -> 5000)
    const match = priceString.replace(/[₦,$]/g, '').replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  generateMarketInsights(scrapingData: ScrapingData[]) {
    const locations = scrapingData.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topLocations = Object.entries(locations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
    
    const keywords = scrapingData
      .map(item => item.title.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    const topKeywords = Object.entries(keywords)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));
    
    return {
      topLocations,
      topKeywords,
      totalCompetitors: scrapingData.length
    };
  }

  async updateDashboardData(scrapingData: ScrapingData[], pricingAnalysis: any) {
    // This would typically update a database or send to dashboard API
    console.log('Dashboard data updated:', {
      scrapingData: scrapingData.length,
      pricingAnalysis
    });
  }

  // Facebook Ads Integration
  async syncCampaignData(campaignData: CampaignData) {
    try {
      // Update Facebook Ads Manager with campaign performance
      await this.updateCampaignMetrics(campaignData);
      
      // Track high-performing campaigns
      if (campaignData.metrics && campaignData.metrics.ctr > 5) {
        console.log('High-performing campaign detected:', campaignData.name);
        // Could trigger automated budget increases or similar campaigns
      }
      
      return campaignData;
    } catch (error) {
      console.error('Error syncing campaign data:', error);
      throw error;
    }
  }

  async updateCampaignMetrics(campaignData: CampaignData) {
    // This would typically update Facebook Ads API
    console.log('Campaign metrics updated:', campaignData.name);
  }

  // Cross-system Analytics
  async generateComprehensiveReport() {
    try {
      const [leadsData, scrapingData, campaignData] = await Promise.all([
        this.getLeadsData(),
        this.getScrapingData(),
        this.getCampaignData()
      ]);
      
      const report = {
        timestamp: new Date().toISOString(),
        leads: {
          total: leadsData.length,
          qualified: leadsData.filter(l => l.stage === 'qualified').length,
          converted: leadsData.filter(l => l.stage === 'converted').length,
          conversionRate: leadsData.length > 0 ? 
            (leadsData.filter(l => l.stage === 'converted').length / leadsData.length * 100).toFixed(2) : '0'
        },
        marketIntelligence: {
          totalScraped: scrapingData.length,
          pricingAnalysis: this.analyzePricingData(scrapingData),
          insights: this.generateMarketInsights(scrapingData)
        },
        advertising: {
          totalCampaigns: campaignData.length,
          activeCampaigns: campaignData.filter(c => c.status === 'active').length,
          totalSpend: campaignData.reduce((sum, c) => sum + (c.metrics?.totalSpent || 0), 0),
          totalConversions: campaignData.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0)
        }
      };
      
      return report;
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      throw error;
    }
  }

  async getLeadsData(): Promise<LeadData[]> {
    try {
      const response = await fetch(`${this.serverUrl}/whatsapp/leads`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching leads data:', error);
      return [];
    }
  }

  async getScrapingData(): Promise<ScrapingData[]> {
    try {
      const response = await fetch(`${this.serverUrl}/scrape/jiji?searchTerm=academic%20writer`);
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Error fetching scraping data:', error);
      return [];
    }
  }

  async getCampaignData(): Promise<CampaignData[]> {
    // This would typically fetch from Facebook Ads API
    // For now, return mock data
    return [
      {
        id: '1',
        name: 'Academic Writing Services - Thesis Help',
        objective: 'Lead Generation',
        budget: 5000,
        status: 'active',
        metrics: {
          impressions: 15420,
          clicks: 892,
          ctr: 5.78,
          conversions: 67,
          costPerClick: 0.45,
          totalSpent: 401.40
        }
      }
    ];
  }

  // Automation Rules
  setupAutomationRules() {
    // Rule 1: Auto-qualify leads based on keywords
    const autoQualifyRule = {
      name: 'Auto-qualify high-intent leads',
      condition: (lead: LeadData) => {
        const highIntentKeywords = ['urgent', 'deadline', 'thesis', 'dissertation', 'phd'];
        const recentMessages = lead.responses.slice(-2).map(r => r.text.toLowerCase());
        return highIntentKeywords.some(keyword => 
          recentMessages.some(message => message.includes(keyword))
        );
      },
      action: async (lead: LeadData) => {
        lead.stage = 'qualified';
        lead.priority = 'urgent';
        await this.processLeadUpdate(lead);
      }
    };

    // Rule 2: Auto-increase budget for high-performing campaigns
    const budgetIncreaseRule = {
      name: 'Auto-increase budget for high-CTR campaigns',
      condition: (campaign: CampaignData) => {
        return campaign.metrics?.ctr > 5 && campaign.status === 'active';
      },
      action: async (campaign: CampaignData) => {
        campaign.budget = Math.round(campaign.budget * 1.2); // Increase by 20%
        await this.syncCampaignData(campaign);
      }
    };

    return [autoQualifyRule, budgetIncreaseRule];
  }
}

// Export singleton instance
export const systemIntegration = new SystemIntegration();

export default SystemIntegration;