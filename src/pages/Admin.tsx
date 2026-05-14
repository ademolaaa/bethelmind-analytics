import { useState } from 'react';
import { useContent } from '../context/useContent';
import { motion } from 'framer-motion';
import { Save, LogOut, LayoutDashboard, Type, List, HelpCircle, CheckCircle, AlertCircle, Info, CreditCard, Phone, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Seo from "@/components/Seo";
import SeoAuditPanel from "@/components/admin/SeoAuditPanel";

export default function Admin() {
  const { content, updateContent, saveContent } = useContent();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('hero');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const expectedPassword = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_ADMIN_PASSWORD;
  const hasPasswordConfigured = typeof expectedPassword === "string" && expectedPassword.length > 0;

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
    // Deep update helper
    updateContent({
      ...content,
      [section]: {
        ...content[section as keyof typeof content],
        [field]: value
      }
    });
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: unknown) => {
    const sectionContent = content[section as keyof typeof content] as unknown as Record<string, unknown>;
    const subsectionContent = (sectionContent[subsection] ?? {}) as Record<string, unknown>;

    updateContent({
      ...content,
      [section]: {
        ...sectionContent,
        [subsection]: {
          ...subsectionContent,
          [field]: value
        }
      }
    } as typeof content);
  };

  // Nested update for array items or deeper objects could be complex, 
  // for now we'll handle specific sections manually in the UI
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Seo
          title="Admin | Bethelmind Analytics"
          description="Admin content editor."
          canonicalPath="/admin"
          robots="noindex,nofollow"
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
        >
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Admin Login</h1>
          {!hasPasswordConfigured && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Admin password not configured. Set VITE_ADMIN_PASSWORD in your environment and rebuild.
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
                disabled={!hasPasswordConfigured}
              />
            </div>
            <button 
              type="submit"
              disabled={!hasPasswordConfigured}
              className={cn(
                "w-full py-2 rounded-lg transition-colors font-medium",
                hasPasswordConfigured
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
            >
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: LayoutDashboard },
    { id: 'socialProof', label: 'Social Proof', icon: List },
    { id: 'solutionsSection', label: 'Solutions', icon: Type },
    { id: 'ctaSection', label: 'CTA Section', icon: HelpCircle },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'pricing', label: 'Pricing Page', icon: CreditCard },
    { id: 'contact', label: 'Contact Page', icon: Phone },
    { id: 'footer', label: 'Footer', icon: List },
    { id: 'seoAudit', label: 'SEO Audit', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Seo
        title="Admin | Bethelmind Analytics"
        description="Admin content editor."
        canonicalPath="/admin"
        robots="noindex,nofollow"
      />
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            Admin Panel
          </h2>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm",
              saveStatus === 'success' ? "bg-green-600 text-white" :
              saveStatus === 'error' ? "bg-red-600 text-white" :
              "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {saveStatus === 'saving' ? (
              <>Saving...</>
            ) : saveStatus === 'success' ? (
              <><CheckCircle className="h-4 w-4" /> Saved!</>
            ) : saveStatus === 'error' ? (
              <><AlertCircle className="h-4 w-4" /> Failed</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl">
          {activeTab === 'seoAudit' && <SeoAuditPanel />}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Hero Section</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline Start</label>
                  <input 
                    type="text" 
                    value={content.hero.headlineStart}
                    onChange={(e) => handleInputChange('hero', 'headlineStart', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline End (Colored)</label>
                  <input 
                    type="text" 
                    value={content.hero.headlineEnd}
                    onChange={(e) => handleInputChange('hero', 'headlineEnd', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                  <textarea 
                    value={content.hero.subheadline}
                    onChange={(e) => handleInputChange('hero', 'subheadline', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary CTA</label>
                    <input 
                      type="text" 
                      value={content.hero.ctaPrimary}
                      onChange={(e) => handleInputChange('hero', 'ctaPrimary', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary CTA</label>
                    <input 
                      type="text" 
                      value={content.hero.ctaSecondary}
                      onChange={(e) => handleInputChange('hero', 'ctaSecondary', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'socialProof' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Social Proof</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Text</label>
                <input 
                  type="text" 
                  value={content.socialProof.text}
                  onChange={(e) => handleInputChange('socialProof', 'text', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Stats</label>
                {content.socialProof.stats.map((stat, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-xs text-gray-500">Value</label>
                      <input 
                        type="text" 
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...content.socialProof.stats];
                          newStats[idx].value = e.target.value;
                          handleInputChange('socialProof', 'stats', newStats);
                        }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Label</label>
                      <input 
                        type="text" 
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...content.socialProof.stats];
                          newStats[idx].label = e.target.value;
                          handleInputChange('socialProof', 'stats', newStats);
                        }}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'about' && content.about && (
             <div className="space-y-6">
               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">About Page</h3>
               
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Hero Section</h4>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     value={content.about.hero.title}
                     onChange={(e) => handleNestedInputChange('about', 'hero', 'title', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                   <textarea 
                     value={content.about.hero.subtitle}
                     onChange={(e) => handleNestedInputChange('about', 'hero', 'subtitle', e.target.value)}
                     rows={2}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100">
                 <h4 className="font-medium text-gray-900">Mission Section</h4>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     value={content.about.mission.title}
                     onChange={(e) => handleNestedInputChange('about', 'mission', 'title', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                   <textarea 
                     value={content.about.mission.description}
                     onChange={(e) => handleNestedInputChange('about', 'mission', 'description', e.target.value)}
                     rows={3}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 
                 <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Mission Values</label>
                    {content.about.mission.values.map((val, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div>
                          <label className="text-xs text-gray-500">Value Title</label>
                          <input 
                            type="text" 
                            value={val.title}
                            onChange={(e) => {
                               const newValues = [...content.about!.mission.values];
                               newValues[idx] = { ...newValues[idx], title: e.target.value };
                               updateContent({
                                 ...content,
                                 about: {
                                   ...content.about!,
                                   mission: {
                                     ...content.about!.mission,
                                     values: newValues
                                   }
                                 }
                               });
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Value Description</label>
                          <textarea 
                            value={val.description}
                            onChange={(e) => {
                               const newValues = [...content.about!.mission.values];
                               newValues[idx] = { ...newValues[idx], description: e.target.value };
                               updateContent({
                                 ...content,
                                 about: {
                                   ...content.about!,
                                   mission: {
                                     ...content.about!.mission,
                                     values: newValues
                                   }
                                 }
                               });
                            }}
                            rows={2}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'pricing' && content.pricing && (
             <div className="space-y-6">
               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing Page</h3>
               
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Hero Section</h4>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     value={content.pricing.hero.title}
                     onChange={(e) => handleNestedInputChange('pricing', 'hero', 'title', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                   <textarea 
                     value={content.pricing.hero.subtitle}
                     onChange={(e) => handleNestedInputChange('pricing', 'hero', 'subtitle', e.target.value)}
                     rows={2}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900">Plans</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {content.pricing.plans.map((plan, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-blue-600">{plan.name} Plan</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500">Name</label>
                            <input 
                              type="text" 
                              value={plan.name}
                              onChange={(e) => {
                                const newPlans = [...content.pricing!.plans];
                                newPlans[idx] = { ...newPlans[idx], name: e.target.value };
                                updateContent({
                                  ...content,
                                  pricing: { ...content.pricing!, plans: newPlans }
                                });
                              }}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Price</label>
                            <input 
                              type="text" 
                              value={plan.price}
                              onChange={(e) => {
                                const newPlans = [...content.pricing!.plans];
                                newPlans[idx] = { ...newPlans[idx], price: e.target.value };
                                updateContent({
                                  ...content,
                                  pricing: { ...content.pricing!, plans: newPlans }
                                });
                              }}
                              className="w-full px-3 py-1.5 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Description</label>
                          <input 
                            type="text" 
                            value={plan.description}
                            onChange={(e) => {
                              const newPlans = [...content.pricing!.plans];
                              newPlans[idx] = { ...newPlans[idx], description: e.target.value };
                              updateContent({
                                ...content,
                                pricing: { ...content.pricing!, plans: newPlans }
                              });
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                           <label className="text-xs text-gray-500">CTA Button</label>
                           <input 
                             type="text" 
                             value={plan.cta}
                             onChange={(e) => {
                               const newPlans = [...content.pricing!.plans];
                               newPlans[idx] = { ...newPlans[idx], cta: e.target.value };
                               updateContent({
                                 ...content,
                                 pricing: { ...content.pricing!, plans: newPlans }
                               });
                             }}
                             className="w-full px-3 py-1.5 border border-gray-300 rounded"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'contact' && content.contact && (
             <div className="space-y-6">
               <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Page</h3>
               
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Hero Section</h4>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     value={content.contact.hero.title}
                     onChange={(e) => handleNestedInputChange('contact', 'hero', 'title', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                   <textarea 
                     value={content.contact.hero.subtitle}
                     onChange={(e) => handleNestedInputChange('contact', 'hero', 'subtitle', e.target.value)}
                     rows={2}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
               </div>

               <div className="space-y-4 pt-4 border-t border-gray-100">
                 <h4 className="font-medium text-gray-900">Contact Info</h4>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                   <input 
                     type="text" 
                     value={content.contact.info.email}
                     onChange={(e) => handleNestedInputChange('contact', 'info', 'email', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                   <input 
                     type="text" 
                     value={content.contact.info.phone}
                     onChange={(e) => handleNestedInputChange('contact', 'info', 'phone', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                   <input 
                     type="text" 
                     value={content.contact.info.address}
                     onChange={(e) => handleNestedInputChange('contact', 'info', 'address', e.target.value)}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                   />
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'footer' && content.footer && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Footer</h3>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                 <input 
                   type="text" 
                   value={content.footer.companyName}
                   onChange={(e) => {
                      updateContent({
                        ...content,
                        footer: { ...content.footer!, companyName: e.target.value }
                      });
                   }}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <textarea 
                   value={content.footer.description}
                   onChange={(e) => {
                      updateContent({
                        ...content,
                        footer: { ...content.footer!, description: e.target.value }
                      });
                   }}
                   rows={2}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                 />
              </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                 <input 
                   type="text" 
                   value={content.footer.copyright}
                   onChange={(e) => {
                      updateContent({
                        ...content,
                        footer: { ...content.footer!, copyright: e.target.value }
                      });
                   }}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                 />
              </div>
            </div>
          )}

          {/* Add other sections as needed */}
          {activeTab === 'ctaSection' && (
             <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">CTA Section</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                  <input 
                    type="text" 
                    value={content.ctaSection.headline}
                    onChange={(e) => handleInputChange('ctaSection', 'headline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                  <textarea 
                    value={content.ctaSection.subheadline}
                    onChange={(e) => handleInputChange('ctaSection', 'subheadline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
