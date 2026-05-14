import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Play,
  Pause
} from 'lucide-react';

interface AdCampaign {
  id: string;
  name: string;
  objective: string;
  budget: number;
  audience: {
    ageMin: number;
    ageMax: number;
    locations: string[];
    interests: string[];
  };
  status: 'active' | 'paused' | 'draft';
  metrics?: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    costPerClick: number;
    totalSpent: number;
  };
}

interface FacebookAdsManagerProps {
  pixelId: string;
  onCampaignUpdate: (campaign: AdCampaign) => void;
}

export default function FacebookAdsManager({ pixelId, onCampaignUpdate }: FacebookAdsManagerProps) {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: '1',
      name: 'Academic Writing Services - Thesis Help',
      objective: 'Lead Generation',
      budget: 5000,
      audience: {
        ageMin: 18,
        ageMax: 35,
        locations: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan'],
        interests: ['Academic writing', 'Thesis', 'Dissertation', 'Research', 'Higher education']
      },
      status: 'active',
      metrics: {
        impressions: 15420,
        clicks: 892,
        ctr: 5.78,
        conversions: 67,
        costPerClick: 0.45,
        totalSpent: 401.40
      }
    },
    {
      id: '2',
      name: 'PhD Dissertation Services',
      objective: 'Conversions',
      budget: 3000,
      audience: {
        ageMin: 25,
        ageMax: 45,
        locations: ['Lagos', 'Abuja', 'UK', 'US', 'Canada'],
        interests: ['PhD studies', 'Academic research', 'Graduate school', 'Dissertation writing']
      },
      status: 'paused',
      metrics: {
        impressions: 8930,
        clicks: 445,
        ctr: 4.98,
        conversions: 23,
        costPerClick: 0.52,
        totalSpent: 231.40
      }
    }
  ]);

  const [newCampaign, setNewCampaign] = useState<Partial<AdCampaign>>({
    name: '',
    objective: 'Lead Generation',
    budget: 1000,
    audience: {
      ageMin: 18,
      ageMax: 35,
      locations: ['Lagos', 'Abuja'],
      interests: ['Academic writing', 'Thesis']
    },
    status: 'draft'
  });

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateCampaign = () => {
    const campaign: AdCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name || 'New Campaign',
      objective: newCampaign.objective || 'Lead Generation',
      budget: newCampaign.budget || 1000,
      audience: newCampaign.audience || {
        ageMin: 18,
        ageMax: 35,
        locations: ['Lagos', 'Abuja'],
        interests: ['Academic writing']
      },
      status: 'paused'
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      objective: 'Lead Generation',
      budget: 1000,
      audience: {
        ageMin: 18,
        ageMax: 35,
        locations: ['Lagos', 'Abuja'],
        interests: ['Academic writing']
      },
      status: 'draft'
    });
    setShowCreateForm(false);
    onCampaignUpdate(campaign);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: campaign.status === 'active' ? 'paused' : 'active' }
        : campaign
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Facebook Ads Manager</h2>
          <p className="text-gray-600">Manage your Facebook ad campaigns for academic writing services</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Play className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaign Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spend</p>
                <p className="text-2xl font-bold">${campaigns.reduce((sum, c) => sum + (c.metrics?.totalSpent || 0), 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0).toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0).toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Conversions</p>
                <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
          <CardDescription>Your active and paused Facebook ad campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      <span className="text-sm text-gray-600">{campaign.objective}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">${campaign.budget}</span>
                    <Button
                      size="sm"
                      variant={campaign.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleCampaignStatus(campaign.id)}
                    >
                      {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {campaign.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Impressions</p>
                      <p className="font-semibold">{campaign.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Clicks</p>
                      <p className="font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CTR</p>
                      <p className="font-semibold">{campaign.metrics.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">CPC</p>
                      <p className="font-semibold">${campaign.metrics.costPerClick}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conversions</p>
                      <p className="font-semibold">{campaign.metrics.conversions}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>Ages {campaign.audience.ageMin}-{campaign.audience.ageMax}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign.audience.locations.length} locations</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
            <CardDescription>Set up a new Facebook ad campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name || ''}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g., Thesis Writing Services"
                />
              </div>

              <div>
                <Label htmlFor="campaign-objective">Campaign Objective</Label>
                <select
                  id="campaign-objective"
                  value={newCampaign.objective || 'Lead Generation'}
                  onChange={(e) => setNewCampaign({ ...newCampaign, objective: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="Conversions">Conversions</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Brand Awareness">Brand Awareness</option>
                </select>
              </div>

              <div>
                <Label htmlFor="campaign-budget">Daily Budget ($)</Label>
                <Input
                  id="campaign-budget"
                  type="number"
                  value={newCampaign.budget || 1000}
                  onChange={(e) => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) })}
                  min="100"
                />
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience Description</Label>
                <Textarea
                  id="target-audience"
                  value={newCampaign.audience?.interests?.join(', ') || ''}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign,
                    audience: {
                      ...newCampaign.audience,
                      interests: e.target.value.split(',').map(s => s.trim())
                    }
                  })}
                  placeholder="e.g., Academic writing, Thesis, Dissertation, Research"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleCreateCampaign}>Create Campaign</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}