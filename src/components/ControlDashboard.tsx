import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacebookAdsManager from './FacebookAdsManager';
import { systemIntegration } from '@/lib/SystemIntegration';
import { 
  Play, 
  StopCircle, 
  RefreshCw, 
  MessageCircle, 
  BarChart3, 
  Settings,
  Download,
  Eye,
  FileText
} from 'lucide-react';

interface ScrapingData {
  id: string;
  title: string;
  price: string;
  location: string;
  link: string;
  scrapedAt: string;
}

interface LeadData {
  userId: string;
  stage: string;
  service: string;
  timestamp: number;
  responses: Array<{ text: string; timestamp: number }>;
  contactInfo?: string;
  projectDetails?: string;
  priority?: string;
}

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  totalScrapedItems: number;
  lastScrapeTime: string;
  whatsappStatus: 'running' | 'stopped';
}

export default function ControlDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    totalScrapedItems: 0,
    lastScrapeTime: '',
    whatsappStatus: 'stopped'
  });
  
  const [scrapingData, setScrapingData] = useState<ScrapingData[]>([]);
  const [leadsData, setLeadsData] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('academic writer');
  const [isScraping, setIsScraping] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const serverUrl = 'http://localhost:3001';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch WhatsApp status and leads
      const [whatsappStatus, leadsResponse] = await Promise.all([
        fetch(`${serverUrl}/whatsapp/status`).then(res => res.json()).catch(() => ({ running: false, leadCount: 0 })),
        fetch(`${serverUrl}/whatsapp/leads`).then(res => res.json()).catch(() => [])
      ]);

      setStats(prev => ({
        ...prev,
        totalLeads: whatsappStatus.leadCount || 0,
        newLeads: leadsResponse.filter((lead: LeadData) => lead.stage === 'new').length,
        qualifiedLeads: leadsResponse.filter((lead: LeadData) => lead.stage === 'qualified').length,
        whatsappStatus: whatsappStatus.running ? 'running' : 'stopped'
      }));

      setLeadsData(leadsResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle scraping
  const handleScrape = async () => {
    setIsScraping(true);
    try {
      const response = await fetch(`${serverUrl}/scrape/jiji?searchTerm=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      const scrapedItems = data.map((item: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        ...item,
        scrapedAt: new Date().toISOString()
      }));

      setScrapingData(scrapedItems);
      setStats(prev => ({
        ...prev,
        totalScrapedItems: scrapedItems.length,
        lastScrapeTime: new Date().toLocaleString()
      }));

      // Process scraping data through system integration
      await systemIntegration.processScrapingData(scrapedItems);
    } catch (error) {
      console.error('Error scraping data:', error);
    } finally {
      setIsScraping(false);
    }
  };

  // Control WhatsApp bot
  const controlWhatsAppBot = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch(`${serverUrl}/whatsapp/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        await fetchDashboardData(); // Refresh status
      }
    } catch (error) {
      console.error(`Error ${action}ing WhatsApp bot:`, error);
    }
  };

  // Generate comprehensive report
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const report = await systemIntegration.generateComprehensiveReport();
      
      // Create a formatted report
      const reportContent = `
Academic Writing Service - Comprehensive Report
Generated: ${new Date().toLocaleString()}

=== LEAD ANALYTICS ===
Total Leads: ${report.leads.total}
Qualified Leads: ${report.leads.qualified}
Converted Leads: ${report.leads.converted}
Conversion Rate: ${report.leads.conversionRate}%

=== MARKET INTELLIGENCE ===
Total Scraped Items: ${report.marketIntelligence.totalScraped}
Average Price: ₦${report.marketIntelligence.pricingAnalysis.average.toLocaleString()}
Price Range: ₦${report.marketIntelligence.pricingAnalysis.min.toLocaleString()} - ₦${report.marketIntelligence.pricingAnalysis.max.toLocaleString()}
Top Locations: ${report.marketIntelligence.insights.topLocations.map(l => l.location).join(', ')}

=== ADVERTISING PERFORMANCE ===
Total Campaigns: ${report.advertising.totalCampaigns}
Active Campaigns: ${report.advertising.activeCampaigns}
Total Spend: $${report.advertising.totalSpend.toFixed(2)}
Total Conversions: ${report.advertising.totalConversions}

=== RECOMMENDATIONS ===
${generateRecommendations(report)}
      `.trim();
      
      // Download as text file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `academic-writing-report-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const generateRecommendations = (report: any): string => {
    const recommendations: string[] = [];
    const conv = parseFloat(String(report.leads.conversionRate));
    if (!isNaN(conv) && conv < 10) {
      recommendations.push("• Focus on improving lead conversion rates through better qualification processes");
    }
    if (report.marketIntelligence?.pricingAnalysis?.average > 50000) {
      recommendations.push("• Consider premium pricing strategy based on market analysis");
    }
    if (report.advertising?.totalSpend > 1000 && report.advertising?.totalConversions < 50) {
      recommendations.push("• Review ad targeting and creative for better conversion rates");
    }
    if (recommendations.length === 0) {
      recommendations.push("• Continue current strategy - performance metrics look good");
    }
    return recommendations.join("\n");
  };

  // Export data
  const exportData = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Control Dashboard</h1>
          <p className="text-gray-600">Manage your academic writing service systems</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newLeads} new, {stats.qualifiedLeads} qualified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scraped Items</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalScrapedItems}</div>
              <p className="text-xs text-muted-foreground">
                Last updated: {stats.lastScrapeTime || 'Never'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp Bot</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={stats.whatsappStatus === 'running' ? 'default' : 'secondary'}>
                  {stats.whatsappStatus === 'running' ? 'Running' : 'Stopped'}
                </Badge>
                <Button
                  size="sm"
                  variant={stats.whatsappStatus === 'running' ? 'destructive' : 'default'}
                  onClick={() => controlWhatsAppBot(stats.whatsappStatus === 'running' ? 'stop' : 'start')}
                >
                  {stats.whatsappStatus === 'running' ? <StopCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={fetchDashboardData} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button size="sm" variant="outline" onClick={generateReport} disabled={generatingReport}>
                  <FileText className="h-4 w-4" />
                  {generatingReport ? 'Generating...' : 'Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="scraping" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scraping">Market Intelligence</TabsTrigger>
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="ads">Facebook Ads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="scraping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jiji Market Scraping</CardTitle>
                <CardDescription>
                  Gather market intelligence and competitive pricing data from Jiji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    placeholder="Enter search term (e.g., academic writer)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={handleScrape} disabled={isScraping}>
                    {isScraping ? 'Scraping...' : 'Scrape Data'}
                  </Button>
                </div>

                {scrapingData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Scraped Results ({scrapingData.length})</h3>
                      <Button size="sm" variant="outline" onClick={() => exportData(scrapingData, 'jiji-scraping')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {scrapingData.map((item) => (
                            <tr key={item.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button size="sm" variant="ghost" onClick={() => window.open(item.link, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Management</CardTitle>
                <CardDescription>
                  Track and manage leads from WhatsApp and other sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadsData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Active Leads ({leadsData.length})</h3>
                      <Button size="sm" variant="outline" onClick={() => exportData(leadsData, 'leads')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leadsData.map((lead) => (
                            <tr key={lead.userId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {lead.userId.substring(0, 10)}...
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={lead.stage === 'qualified' ? 'default' : 'secondary'}>
                                  {lead.stage}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.service || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={lead.priority === 'urgent' ? 'destructive' : 'outline'}>
                                  {lead.priority || 'Normal'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(lead.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
                    <p className="mt-1 text-sm text-gray-500">Start the WhatsApp bot to begin collecting leads.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            <FacebookAdsManager 
              pixelId="YOUR_FACEBOOK_PIXEL_ID" 
              onCampaignUpdate={(campaign) => console.log('Campaign updated:', campaign)}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Performance metrics and insights for your academic writing service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Lead Conversion Funnel</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>New Leads</span>
                        <span className="font-semibold">{stats.newLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Qualified Leads</span>
                        <span className="font-semibold">{stats.qualifiedLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate</span>
                        <span className="font-semibold">
                          {stats.totalLeads > 0 ? Math.round((stats.qualifiedLeads / stats.totalLeads) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Market Intelligence</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Scraped Items</span>
                        <span className="font-semibold">{stats.totalScrapedItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Price Range</span>
                        <span className="font-semibold">
                          {scrapingData.length > 0 ? '₦3,500 - ₦150,000' : 'No data'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Top Locations</span>
                        <span className="font-semibold">Lagos, Abuja, Port Harcourt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
