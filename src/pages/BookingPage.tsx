import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Clock, Briefcase, MessageCircle, Sparkles, Target, Zap, Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import Seo from "@/components/Seo";

export default function BookingPage() {
  const location = useLocation();
  const { content, cmsMeta } = useContent();
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);

  const [step, setStep] = useState(1);
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const leadId = getLeadId();
    const stage = getLeadScore().stage;
    const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
    const phoneDigits = normalizeWhatsAppPhone(phoneDisplay);

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
    recordTouchpoint("whatsapp_click");
    trackEvent("whatsapp_click", { source: "booking_discovery", path: `${location.pathname}${location.search}` });

    const urls = getWhatsAppUrls({ phoneDigits, text: message });
    window.location.assign(urls.universal);
  };

  return (
    <section className="relative overflow-hidden bg-luxury-midnight pt-24 pb-14 px-4 sm:px-6 lg:px-8">
      <Seo
        title={cmsMeta["/booking"]?.title ?? "High-Ticket Strategy Session | Bethelmind Analytics"}
        description={
          cmsMeta["/booking"]?.description ??
          "Apply for a private strategy session. We only work with businesses ready for 10x scale. Get your roadmap today."
        }
        canonicalPath="/booking"
        robots={cmsMeta["/booking"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/booking"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Booking", path: "/booking" },
        ]}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="lux-hero-grid opacity-[0.05]" />
        <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_at_30%_10%,rgba(212,175,55,0.15),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_70%_20%,rgba(79,70,229,0.15),transparent_55%)]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="lux-pill mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            Executive Discovery
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">
            Apply for your{" "}
            <span className="lux-text-gradient">
              60-Day Scale Roadmap
            </span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-luxury-platinum/80 max-w-3xl mx-auto">
            We don't just 'build apps'. We deploy sales infrastructure. Please complete this brief discovery so we can prepare for your session.
          </p>
        </motion.div>

        <div className="lux-card-dark overflow-hidden border border-luxury-gold/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            <div className="relative md:col-span-4 bg-luxury-charcoal/50 p-8 text-luxury-champagne border-r border-luxury-gold/10">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/20 bg-luxury-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-luxury-gold">
                  <Clock className="h-3 w-3" />
                  15-Min Discovery
                </div>

                <h3 className="mt-8 text-xl font-display font-bold text-luxury-champagne">Your Outcomes:</h3>
                <ul className="mt-6 space-y-5">
                  {[
                    "Leakage Audit: Where you're losing money.",
                    "Funnel Blueprint: Exactly what we'll build.",
                    "Timeline & ROI projection.",
                    "High-Ticket Execution Quote.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center">
                         <CheckCircle className="h-3 w-3 text-luxury-gold" />
                      </div>
                      <span className="text-luxury-platinum/90 text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-12 p-5 rounded-2xl bg-luxury-gold/5 border border-luxury-gold/10">
                  <div className="flex items-center gap-2 text-luxury-gold">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Fast Track</span>
                  </div>
                  <p className="mt-2 text-xs text-luxury-platinum/60 leading-relaxed">
                    Ready to launch in 30 days? Our slots for June are filling up fast.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 p-8 sm:p-12 bg-luxury-midnight/40 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="text-2xl font-display font-bold text-luxury-champagne">Step 1: Your Goals</h2>
                      <p className="mt-2 text-sm text-luxury-platinum/70">What is the single biggest bottleneck in your business right now?</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Primary Objective</label>
                        <select name="goal" title="Primary Goal" required onChange={handleChange} value={formData.goal} className="lux-select w-full">
                          <option value="">Select a goal...</option>
                          <option value="scale_leads">Scale Lead Generation (10x)</option>
                          <option value="automate_ops">Automate Operations & Reduce Staff Cost</option>
                          <option value="leakage">Plug Revenue Leakage (Billing/Inventory)</option>
                          <option value="new_vertical">Launch a New SaaS/Product Vertical</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Solution Interest</label>
                        <select name="service" title="Solution Interest" required onChange={handleChange} value={formData.service} className="lux-select w-full">
                          <option value="">Select a funnel...</option>
                          <option value="whatsapp_sales">WhatsApp Sales Machine</option>
                          <option value="school_digitization">School Digitization System</option>
                          <option value="retail_pos">Retail/Commerce Guard</option>
                          <option value="clinic_system">Clinic Billing & Queue System</option>
                          <option value="logistics_dispatch">Logistics & Fleet Guard</option>
                          <option value="custom_saas">Custom Enterprise SaaS</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={nextStep}
                        disabled={!formData.goal || !formData.service}
                        className="lux-button w-full sm:w-auto"
                      >
                        Next: Business Qualification <ArrowRight className="ml-2 h-5 w-5" />
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
                    className="space-y-8"
                  >
                    <div>
                      <button onClick={prevStep} className="text-xs font-bold text-luxury-gold/60 hover:text-luxury-gold uppercase tracking-widest mb-4">← Back to Goals</button>
                      <h2 className="text-2xl font-display font-bold text-luxury-champagne">Step 2: Qualification</h2>
                      <p className="mt-2 text-sm text-luxury-platinum/70">This helps us ensure our systems can deliver a 10x ROI for you.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Current Monthly Revenue</label>
                        <select name="revenue" title="Current Monthly Revenue" required onChange={handleChange} value={formData.revenue} className="lux-select w-full">
                          <option value="">Select range...</option>
                          <option value="under_1m">Under ₦1M</option>
                          <option value="1m_5m">₦1M - ₦5M</option>
                          <option value="5m_20m">₦5M - ₦20M</option>
                          <option value="20m_plus">₦20M+</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Investment Budget</label>
                        <select name="budget" title="Investment Budget" required onChange={handleChange} value={formData.budget} className="lux-select w-full">
                          <option value="">Select range...</option>
                          <option value="500k_1.5m">₦500k - ₦1.5M</option>
                          <option value="1.5m_5m">₦1.5M - ₦5M</option>
                          <option value="5m_plus">₦5M+</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Target Implementation Timeline</label>
                      <select name="timeline" title="Target Implementation Timeline" required onChange={handleChange} value={formData.timeline} className="lux-select w-full">
                        <option value="">When do we go live?</option>
                        <option value="immediate">Immediate (Ready now)</option>
                        <option value="next_month">Next 30 Days</option>
                        <option value="quarter">Within this Quarter</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={nextStep}
                        disabled={!formData.revenue || !formData.budget || !formData.timeline}
                        className="lux-button w-full sm:w-auto"
                      >
                        Next: Contact Details <ArrowRight className="ml-2 h-5 w-5" />
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
                    className="space-y-8"
                  >
                    <div>
                      <button onClick={prevStep} className="text-xs font-bold text-luxury-gold/60 hover:text-luxury-gold uppercase tracking-widest mb-4">← Back to Qualification</button>
                      <h2 className="text-2xl font-display font-bold text-luxury-champagne">Final Step: Secure Your Session</h2>
                      <p className="mt-2 text-sm text-luxury-platinum/70">Who will be joining the call? We recommend the primary decision maker.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">Business Name & Industry</label>
                        <input
                          type="text"
                          name="industry"
                          required
                          placeholder="e.g. Lagos Logistics Ltd"
                          onChange={handleChange}
                          value={formData.industry}
                          className="lux-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-luxury-gold/80">WhatsApp Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          placeholder="080..."
                          onChange={handleChange}
                          value={formData.phone}
                          className="lux-input"
                        />
                      </div>

                      <div className="pt-6">
                        <button type="submit" className="lux-button w-full shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                          <MessageCircle className="mr-2 h-5 w-5" />
                          Finalize Application via WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-luxury-platinum/40">
                          By clicking, you agree to share these details for the purpose of this discovery session.
                        </p>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
           <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-luxury-charcoal/30 border border-luxury-gold/10 backdrop-blur-xl">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-luxury-midnight bg-luxury-charcoal flex items-center justify-center">
                    <Users className="h-4 w-4 text-luxury-gold/60" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-luxury-platinum/80">
                Join <span className="text-luxury-gold font-bold">50+ Nigerian Visionaries</span> scaling their operations.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}
