import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Clock, Sparkles, Zap, Users, Loader2, ChevronLeft } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import Seo from "@/components/Seo";
import GlassContainer from "@/components/luxury/GlassContainer";
import { supabase } from "@/lib/supabase";

export default function BookingPage() {
  const location = useLocation();
  const { content, cmsMeta } = useContent();
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    service: '',
    timeline: '',
    budget: '',
    name: '',
    industry: '',
    revenue: '',
    phone: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const leadId = getLeadId();
    const stage = getLeadScore().stage;
    const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
    const phoneDigits = normalizeWhatsAppPhone(phoneDisplay);

    try {
      // 1. Store in Supabase
      await supabase.from('leads').insert([{
        email: `${formData.name.replace(/\s+/g, '.').toLowerCase()}@placeholder.com`, // Placeholder email if not provided
        full_name: formData.name || formData.industry,
        phone: formData.phone,
        source: 'booking_discovery',
        data: {
          ...formData,
          lead_id: leadId,
          stage,
          first_touch: getFirstTouch(),
          last_touch: getLastTouch()
        }
      }]);

      // 2. Preparation for WhatsApp
      const message = buildWhatsAppMessage({
        locale,
        leadId,
        source: "booking_discovery",
        stage,
        service: formData.service || undefined,
        timeline: formData.timeline || undefined,
        budget: formData.budget || undefined,
        extraLines: [
          formData.goal ? `Primary Goal: ${formData.goal}` : null,
          formData.industry ? `Business: ${formData.industry}` : null,
          formData.revenue ? `Monthly Revenue: ${formData.revenue}` : null,
          formData.phone ? `Phone: ${formData.phone}` : null,
        ].filter(Boolean) as string[],
        firstTouch: getFirstTouch(),
        lastTouch: getLastTouch(),
      });

      recordTouchpoint("booking_start");
      trackEvent("whatsapp_click", { source: "booking_discovery" });

      const urls = getWhatsAppUrls({ phoneDigits, text: message });
      window.location.assign(urls.universal);

    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary-navy text-foreground selection:bg-primary/30 min-h-screen mesh-gradient">
      <Seo
        title={cmsMeta["/booking"]?.title ?? "Strategy Session | Bethelmind Analytics"}
        description={cmsMeta["/booking"]?.description ?? "Apply for a private strategy session."}
        canonicalPath="/booking"
      />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-1/4 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="lux-badge mb-8 mx-auto">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Discovery</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6 text-gradient-gold">
                Apply for Your Roadmap
              </h1>
              <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-light">
                We deploy high-performance sales infrastructure. Complete this discovery to prepare for your session.
              </p>
            </motion.div>
          </div>

          <GlassContainer className="max-w-5xl mx-auto overflow-hidden !rounded-[2.5rem] border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
              {/* Sidebar Info */}
              <div className="lg:col-span-4 bg-white/[0.02] p-10 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="space-y-12">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    15-Min Discovery
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-6">Discovery Outcomes</h3>
                    <ul className="space-y-6">
                      {[
                        "Leakage Audit: Where revenue is escaping.",
                        "Funnel Blueprint: Architecture of your system.",
                        "ROI & Timeline Projection.",
                        "High-Ticket Execution Quote."
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-foreground/70 font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                    <div className="flex items-center gap-2 text-accent mb-3">
                      <Zap className="w-4 h-4 fill-current" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Priority Track</span>
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      Launching in 30 days? Our slots for this quarter are 85% committed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Area */}
              <div className="lg:col-span-8 p-10 sm:p-14">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <div>
                        <h2 className="text-3xl font-bold mb-3 text-gradient-silver">Step 1: Objectives</h2>
                        <p className="text-foreground/50">Identify the primary bottleneck in your current business operations.</p>
                      </div>

                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Primary Goal</label>
                          <select name="goal" required onChange={handleChange} value={formData.goal} className="lux-input w-full cursor-pointer">
                            <option value="">Select an objective...</option>
                            <option value="scale_leads">Scale Lead Generation (10x)</option>
                            <option value="automate_ops">Automate Operations & Reduce Cost</option>
                            <option value="leakage">Plug Revenue Leakage (Billing/POS)</option>
                            <option value="new_vertical">Launch a New Digital Product</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Solution Interest</label>
                          <select name="service" required onChange={handleChange} value={formData.service} className="lux-input w-full cursor-pointer">
                            <option value="">Select a system...</option>
                            <option value="whatsapp_sales">WhatsApp Sales Machine</option>
                            <option value="school_digitization">School Digitization System</option>
                            <option value="clinic_system">Clinic Billing & Queue System</option>
                            <option value="custom_saas">Custom Enterprise SaaS</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={nextStep}
                          disabled={!formData.goal || !formData.service}
                          className="lux-button lux-button-primary w-full sm:w-auto px-10"
                        >
                          Next: Qualification
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <button onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors">
                        <ChevronLeft className="w-3 h-3" /> Back
                      </button>
                      <div>
                        <h2 className="text-3xl font-bold mb-3 text-gradient-silver">Step 2: Business Maturity</h2>
                        <p className="text-foreground/50">Qualification helps ensure we can deliver significant ROI on your investment.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Monthly Revenue</label>
                          <select name="revenue" required onChange={handleChange} value={formData.revenue} className="lux-input w-full cursor-pointer">
                            <option value="">Select range...</option>
                            <option value="under_1m">Under ₦1M</option>
                            <option value="1m_5m">₦1M - ₦5M</option>
                            <option value="5m_20m">₦5M - ₦20M</option>
                            <option value="20m_plus">₦20M+</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Investment Budget</label>
                          <select name="budget" required onChange={handleChange} value={formData.budget} className="lux-input w-full cursor-pointer">
                            <option value="">Select budget...</option>
                            <option value="500k_1.5m">₦500k - ₦1.5M</option>
                            <option value="1.5m_5m">₦1.5M - ₦5M</option>
                            <option value="5m_plus">₦5M+</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Target Live Date</label>
                        <select name="timeline" required onChange={handleChange} value={formData.timeline} className="lux-input w-full cursor-pointer">
                          <option value="">When do we go live?</option>
                          <option value="immediate">Immediate (Ready now)</option>
                          <option value="next_month">Next 30 Days</option>
                          <option value="quarter">Within this Quarter</option>
                        </select>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={nextStep}
                          disabled={!formData.revenue || !formData.budget || !formData.timeline}
                          className="lux-button lux-button-primary w-full sm:w-auto px-10"
                        >
                          Next: Contact Details
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <button onClick={prevStep} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors">
                        <ChevronLeft className="w-3 h-3" /> Back
                      </button>
                      <div>
                        <h2 className="text-3xl font-bold mb-3 text-gradient-silver">Final Step: Secure Session</h2>
                        <p className="text-foreground/50">Provide your official contact details for the discovery call.</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">Business Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Lagos Logistics Ltd"
                            onChange={handleChange}
                            value={formData.name}
                            className="lux-input w-full"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-widest text-foreground/30 ml-1">WhatsApp Number</label>
                          <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="080..."
                            onChange={handleChange}
                            value={formData.phone}
                            className="lux-input w-full"
                          />
                        </div>

                        <div className="pt-6">
                          <button 
                            type="submit" 
                            disabled={loading}
                            className="lux-button lux-button-primary w-full py-4 h-auto shadow-[0_0_30px_rgba(212,175,55,0.15)]"
                          >
                            {loading ? (
                              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            ) : (
                              <>
                                Finalize via WhatsApp
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </GlassContainer>

          <div className="mt-20 text-center">
             <div className="inline-flex items-center gap-8 px-10 py-5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-primary-navy bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary/60" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-foreground/60">
                  Trusted by <span className="text-primary font-bold">50+ Visionaries</span> in Nigeria
                </p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
