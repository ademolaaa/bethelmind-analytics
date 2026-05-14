import React, { useState, useEffect } from 'react';
import { useContent } from '../context/useContent';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, LogOut, LayoutDashboard, Type, List, HelpCircle, CheckCircle, 
  AlertCircle, Info, CreditCard, Phone, Search, Users, Eye, Trash2, 
  Mail, MessageSquare, Download, Filter, RefreshCcw, Zap, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Seo from "@/components/Seo";
import SeoAuditPanel from "@/components/admin/SeoAuditPanel";
import { supabase } from "@/lib/supabase";
import GlassContainer from "@/components/luxury/GlassContainer";

export default function Admin() {
  const { content, updateContent, saveContent } = useContent();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('leads');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [leads, setLeads] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const expectedPassword = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_ADMIN_PASSWORD;
  const hasPasswordConfigured = typeof expectedPassword === "string" && expectedPassword.length > 0;

  useEffect(() => {
    if (isAuthenticated && activeTab === 'leads') {
      fetchLeads();
    }
  }, [isAuthenticated, activeTab]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setLeads(data);
    setLoadingLeads(false);
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) fetchLeads();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPasswordConfigured) {
      alert('Admin password is not configured');
      return;
    }
    if (password === expectedPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const success = await saveContent();
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    }
  };

  const handleInputChange = (section: string, field: string, value: unknown) => {
    updateContent({
      ...content,
      [section]: {
        ...content[section as keyof typeof content],
        [field]: value
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-navy mesh-gradient p-4">
        <Seo title="Admin | Bethelmind Analytics" description="Secure administration gateway for Bethelmind Analytics." robots="noindex,nofollow" />
        <GlassContainer className="w-full max-w-md p-10">
          <h1 className="text-3xl font-bold mb-8 text-center text-gradient-gold">Admin Gateway</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/40 ml-1">Access Key</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lux-input w-full"
                placeholder="Enter password"
                disabled={!hasPasswordConfigured}
              />
            </div>
            <button 
              type="submit"
              disabled={!hasPasswordConfigured}
              className="lux-button lux-button-primary w-full"
            >
              Authenticate
            </button>
            {!hasPasswordConfigured && (
              <p className="text-[10px] text-destructive text-center uppercase tracking-widest font-bold">
                Security Error: Password not configured
              </p>
            )}
          </form>
        </GlassContainer>
      </div>
    );
  }

  const tabs = [
    { id: 'leads', label: 'Leads (CRM)', icon: Users },
    { id: 'hero', label: 'Hero Content', icon: LayoutDashboard },
    { id: 'solutionsSection', label: 'Solutions', icon: Type },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'seoAudit', label: 'SEO Intelligence', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-primary-navy text-foreground flex overflow-hidden">
      <Seo title="Admin Panel | Bethelmind" description="Nexus Control Center for Bethelmind Analytics operations." robots="noindex,nofollow" />
      
      {/* Sidebar */}
      <aside className="w-72 bg-white/[0.02] border-r border-white/5 flex flex-col z-20">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-2xl font-bold text-gradient-gold flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary fill-current" />
            Nexus
          </h2>
          <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-2">Internal Operations</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 text-sm font-bold uppercase tracking-widest rounded-2xl transition-all",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-foreground/40 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-3 text-destructive hover:bg-destructive/10 w-full px-5 py-3 rounded-xl transition-all text-sm font-bold uppercase tracking-widest"
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-luxury-midnight/50">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Control Center</h1>
            <p className="text-foreground/40 font-medium">Managing your digital ecosystem and intelligence.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab !== 'leads' && activeTab !== 'seoAudit' && (
              <button 
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl",
                  saveStatus === 'success' ? "bg-emerald-500 text-white" :
                  saveStatus === 'error' ? "bg-destructive text-white" :
                  "bg-primary text-primary-navy hover:scale-105"
                )}
              >
                {saveStatus === 'saving' ? (
                  <>Syncing...</>
                ) : saveStatus === 'success' ? (
                  <><CheckCircle className="h-4 w-4" /> Finalized</>
                ) : saveStatus === 'error' ? (
                  <><AlertCircle className="h-4 w-4" /> Failure</>
                ) : (
                  <><RefreshCcw className="h-4 w-4" /> Deploy Changes</>
                )}
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'leads' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gradient-silver">Active Opportunities</h2>
                <div className="flex items-center gap-4">
                   <button onClick={fetchLeads} aria-label="Refresh leads" title="Refresh leads" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                     <RefreshCcw className={cn("w-4 h-4", loadingLeads && "animate-spin")} />
                   </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-8 py-6">Prospect</th>
                      <th className="px-8 py-6">Source</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6 text-foreground/50">{new Date(lead.created_at).toLocaleDateString()}</td>
                        <td className="px-8 py-6">
                          <div className="font-bold">{lead.full_name}</div>
                          <div className="text-xs text-foreground/40">{lead.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="font-bold text-xs uppercase tracking-widest">{lead.status || 'NEW'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedLead(lead)} aria-label="View lead details" title="View lead details" className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteLead(lead.id)} aria-label="Delete lead" title="Delete lead" className="p-2 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-destructive transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {leads.length === 0 && !loadingLeads && (
                  <div className="py-20 text-center text-foreground/30 font-bold uppercase tracking-widest">
                    No leads captured yet.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'hero' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl space-y-10"
            >
              <GlassContainer className="p-10 space-y-8">
                <h3 className="text-xl font-bold border-b border-white/5 pb-4">Hero Configuration</h3>
                <div className="grid gap-8">
                  <div className="space-y-3">
                    <label htmlFor="headline-prefix" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Headline Prefix</label>
                    <input 
                      id="headline-prefix"
                      type="text" 
                      value={content.hero.headlineStart}
                      onChange={(e) => handleInputChange('hero', 'headlineStart', e.target.value)}
                      className="lux-input w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="headline-gold" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Headline Emphasis (Gold)</label>
                    <input 
                      id="headline-gold"
                      type="text" 
                      value={content.hero.headlineEnd}
                      onChange={(e) => handleInputChange('hero', 'headlineEnd', e.target.value)}
                      className="lux-input w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="subheadline-narrative" className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-1">Subheadline Narrative</label>
                    <textarea 
                      id="subheadline-narrative"
                      value={content.hero.subheadline}
                      onChange={(e) => handleInputChange('hero', 'subheadline', e.target.value)}
                      rows={4}
                      className="lux-input w-full"
                    />
                  </div>
                </div>
              </GlassContainer>
            </motion.div>
          )}

          {activeTab === 'seoAudit' && <SeoAuditPanel />}
        </AnimatePresence>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-primary-navy/80 backdrop-blur-md">
            <GlassContainer className="w-full max-w-2xl p-10 overflow-hidden relative">
              <button onClick={() => setSelectedLead(null)} aria-label="Close details" title="Close details" className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-3xl font-bold mb-8 text-gradient-gold">Prospect Intelligence</h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Name</div>
                    <div className="text-lg font-medium">{selectedLead.full_name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Email</div>
                    <div className="text-lg font-medium">{selectedLead.email}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Phone</div>
                    <div className="text-lg font-medium">{selectedLead.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Captured</div>
                    <div className="text-lg font-medium">{new Date(selectedLead.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-4">Metadata / Form Data</div>
                  <pre className="p-6 rounded-2xl bg-white/5 border border-white/5 text-xs text-foreground/60 overflow-x-auto">
                    {JSON.stringify(selectedLead.data, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <a href={`mailto:${selectedLead.email}`} className="lux-button lux-button-primary flex-1">
                    <Mail className="w-4 h-4" /> Send Email
                  </a>
                  {selectedLead.phone && (
                    <a href={`https://wa.me/${selectedLead.phone.replace(/\D/g,'')}`} target="_blank" className="lux-button lux-button-secondary flex-1">
                      <MessageSquare className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </GlassContainer>
          </div>
        )}
      </main>
    </div>
  );
}
