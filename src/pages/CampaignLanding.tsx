import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkles, MessageSquare, CreditCard, Truck } from "lucide-react";
import Seo from "@/components/Seo";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import EmailLeadModal from "@/components/EmailLeadModal";
import { useContent } from "@/context/useContent";
import { trackEvent } from "@/lib/analytics";
import { solutions } from "@/data/solutions";
import { resolveCmsIcon } from "@/lib/iconMap";
import { FacebookPixel, trackLeadGeneration, trackServiceInquiry } from "@/components/FacebookPixel";

type CampaignKey = "education-suite" | "commerce-suite" | "healthcare-suite" | "real-estate-suite" | "logistics-suite" | "growth-suite" | "academic-writing-suite" | "beauty-suite" | "legal-suite" | "hospitality-suite";

type LandingPriority = "results" | "cost";

type Campaign = {
  key: CampaignKey;
  title: string;
  description: string;
  chip: string;
  bullets: string[];
  whatYouGet: string[];
  primaryCtaLabel: string;
  primaryCtaService: string;
  secondaryCtaLabel: string;
};

const suiteSolutionIds: Record<CampaignKey, string[]> = {
  "education-suite": ["school-digitization-system", "school-portal", "admissions-cbt"],
  "commerce-suite": ["ecommerce-website", "niche-pos-inventory-systems", "inventory-management"],
  "healthcare-suite": ["hospital-appointments", "hospital-billing", "booking-customer-portal-system"],
  "real-estate-suite": ["real-estate-website", "real-estate-crm"],
  "logistics-suite": ["logistics-dispatch"],
  "growth-suite": ["sme-website", "whatsapp-crm-sales-automation", "invoice-collections-payment-automation", "business-dashboards-growth-analytics"],
  "academic-writing-suite": ["academic-writing-services"],
  "beauty-suite": ["booking-customer-portal-system", "inventory-management"],
  "legal-suite": ["invoice-collections-payment-automation", "business-dashboards-growth-analytics"],
  "hospitality-suite": ["booking-customer-portal-system", "ecommerce-website"],
};

const campaigns: Record<CampaignKey, Campaign> = {
  "education-suite": {
    key: "education-suite",
    chip: "Education Suite",
    title: "The 30-Day School Digitization Blueprint",
    description:
      "Stop parent complaints, unpaid fees, and manual broadsheets. We deploy a complete system that automates results, fee collections, and admissions — built specifically for the Nigerian school cycle.",
    bullets: ["Zero-Error Result Processing (Broadsheets in 24 hours)", "Automated Fee Invoicing + Arrears Reminders on WhatsApp", "Online Admissions & CBT to eliminate paper stress", "Secure Parent Portal for results and announcements"],
    whatYouGet: ["Full Digital Audit of Results & Fee structure", "Teacher & Admin Onboarding (Hands-on training)", "Payment Gateway setup (Paystack/Flutterwave)", "1st Term Support: We guide you through your first digital broadsheet cycle"],
    primaryCtaLabel: "Launch Your Digital School",
    primaryCtaService: "School Digitization Blueprint",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "commerce-suite": {
    key: "commerce-suite",
    chip: "Commerce Suite",
    title: "The Retail Inventory Guard (POS + Stock Control)",
    description:
      "Stop stock leakage and missing cash. Our system gives Nigerian store owners total branch visibility, expiry tracking, and daily profit reports — even when you're not at the shop.",
    bullets: ["Staff Accountability: Track every Naira and every item", "Automatic Low-Stock & Expiry Alerts", "Branch-Link: Monitor multiple shops from your phone", "Ecommerce Sync: Sell in-store and online from one inventory"],
    whatYouGet: ["Retail Workflow Audit (Sales → Stock → Cash)", "Product/Stock Import from Excel/Paper records", "Cashier Training & Fraud Prevention SOPs", "Daily Owner Dashboard with automated profit alerts"],
    primaryCtaLabel: "Get Your Inventory Guard",
    primaryCtaService: "Retail Inventory Guard",
    secondaryCtaLabel: "See Platforms",
  },
  "healthcare-suite": {
    key: "healthcare-suite",
    chip: "Healthcare Suite",
    title: "The Clinic Queue & Billing Machine",
    description:
      "Reduce waiting time and stop revenue leakage. We deploy an integrated system for appointments, queue flow, billing, and pharmacy stock — designed for Nigerian clinics and hospitals.",
    bullets: ["Automated Appointment Reminders (Cut no-shows by 40%)", "Queue Management: No more crowded waiting rooms", "Leak-Proof Billing: Every test and drug is tracked and paid for", "Pharmacy Inventory with Expiry & Low-stock Alerts"],
    whatYouGet: ["Clinic Operations Audit (Front Desk → Billing → Pharmacy)", "Staff Roles & Access Control Setup", "Hands-on Training & Handover Documentation", "Daily Collection Reports sent to your email"],
    primaryCtaLabel: "Upgrade Your Clinic Ops",
    primaryCtaService: "Clinic Billing Machine",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "real-estate-suite": {
    key: "real-estate-suite",
    chip: "Real Estate Suite",
    title: "The Real Estate Lead-to-Close Pipeline",
    description:
      "Stop losing property leads to slow follow-up. We build a high-performance listings website connected to a CRM that assigns leads and automates follow-ups for Nigerian real estate teams.",
    bullets: ["Premium Listings Site that captures verified leads", "Automated Lead Assignment to your best agents", "Follow-up Sequences: Keep prospects warm automatically", "Pipeline Visibility: See exactly where every lead is in the deal"],
    whatYouGet: ["Sales Process Mapping & Pipeline Design", "Property Listings Site + CRM Setup", "Agent Team SOPs & Training", "Lead Tracking: See which ads are actually bringing buyers"],
    primaryCtaLabel: "Automate Your Real Estate Sales",
    primaryCtaService: "Real Estate Pipeline",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "logistics-suite": {
    key: "logistics-suite",
    chip: "Logistics Suite",
    title: "The Logistics Fleet Guard (Dispatch + POD)",
    description:
      "Stop parcel disputes and untracked riders. This system manages dispatch, rider assignment, and proof-of-delivery (signature/photo) for Nigerian delivery fleets and logistics teams.",
    bullets: ["Rider App: Real-time assignment and status updates", "Proof-of-Delivery (POD): Captured via photo or signature", "Automated Customer Updates: 'Your parcel is with Rider A'", "Cash Reconciliation for COD (Cash on Delivery) parcels"],
    whatYouGet: ["Rates & Zones configuration for your fleet", "Rider & Team Onboarding + Training", "Dispatch Reporting: Success rates, delays, and POD logs", "Launch Support for your first dispatch cycle"],
    primaryCtaLabel: "Secure Your Deliveries",
    primaryCtaService: "Logistics Fleet Guard",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "growth-suite": {
    key: "growth-suite",
    chip: "Growth Suite",
    title: "The WhatsApp Sales Machine (Website + Automation)",
    description:
      "Stop losing leads and chasing payments manually. We build a high-converting website paired with a WhatsApp CRM and automated collections system for Nigerian SMEs that want to scale.",
    bullets: ["High-Converting Site with direct-to-WhatsApp leads", "WhatsApp CRM: Share an inbox and follow up in seconds", "Automated Invoicing & Reminders: Get paid while you sleep", "Owner Dashboard: See your daily growth without spreadsheets"],
    whatYouGet: ["Audit of your Lead-to-Payment workflow", "Website + WhatsApp CRM Integration", "Follow-up Templates & Automation Sequences", "Weekly Growth Insights & Data Training"],
    primaryCtaLabel: "Build Your Sales Machine",
    primaryCtaService: "WhatsApp Sales Machine",
    secondaryCtaLabel: "See Platforms",
  },
  "academic-writing-suite": {
    key: "academic-writing-suite",
    chip: "Academic Writing Suite",
    title: "Premium Thesis & Dissertation Support",
    description:
      "Struggling with your BSc, MSc, or PhD thesis? Our expert academic team provides original research, professional writing, and plagiarism-free formatting for Nigerian and International candidates.",
    bullets: ["Original Research & Data Analysis (SPSS/Excel/STATA)", "100% Plagiarism-Free (Turnitin Report included)", "Professional Formatting (APA, Harvard, MLA, etc.)", "On-Time Delivery with Free Revisions until defense"],
    whatYouGet: ["Dedicated Academic Project Manager", "Regular Progress Updates & Drafts", "Fully-Formatted Thesis + Turnitin Report", "Consultation on defense preparation"],
    primaryCtaLabel: "Get Your Academic Quote",
    primaryCtaService: "Academic Writing Suite",
    secondaryCtaLabel: "Learn More",
  },
  "beauty-suite": {
    key: "beauty-suite",
    chip: "Beauty & Wellness Suite",
    title: "The Booked & Busy Engine (Salons & Spas)",
    description:
      "Stop no-shows and scattered bookings. We build a complete system for Nigerian salons, spas, and gyms to manage appointments, take deposits, and track inventory from one dashboard.",
    bullets: ["24/7 Online Booking Page for clients", "Automated WhatsApp Reminders to reduce no-shows", "Inventory Tracking for products and consumables", "Deposit Collection to secure high-value sessions"],
    whatYouGet: ["Booking Flow & Service List setup", "WhatsApp Reminder & Sequence configuration", "Staff Training & Onboarding", "Monthly Performance Dashboard view"],
    primaryCtaLabel: "Launch Your Booking Engine",
    primaryCtaService: "Beauty & Wellness Engine",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "legal-suite": {
    key: "legal-suite",
    chip: "Professional Services Suite",
    title: "The Client Portal & Billing Guard",
    description:
      "Modernize your law firm or consultancy. We deploy a professional portal for client onboarding, automated invoicing, and secure document sharing — reducing admin time by 50%.",
    bullets: ["Secure Client Portal for document exchange", "Automated Billing & Recurring Payment links", "Task Tracking: Keep clients updated automatically", "Lead Capture: Professional forms for high-value enquiries"],
    whatYouGet: ["Billing & Invoicing Workflow setup", "Client Portal Brand configuration", "Team Training & Documentation", "Payment Gateway Security Audit"],
    primaryCtaLabel: "Upgrade Your Firm's Ops",
    primaryCtaService: "Legal & Professional Suite",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
  "hospitality-suite": {
    key: "hospitality-suite",
    chip: "Hospitality Suite",
    title: "The Direct-Book Hospitality System",
    description:
      "Stop paying high OTA commissions. We build a direct booking website for Nigerian hotels and shortlets that manages availability, takes payments, and sends check-in instructions automatically.",
    bullets: ["Direct Booking Website (Mobile-First)", "Automated Check-in/out Instructions (WhatsApp/Email)", "Payment Integration: Collect card/transfer instantly", "Inventory/Room Management without conflicts"],
    whatYouGet: ["Property/Room listing configuration", "Booking Engine & Payment setup", "Staff Check-in SOPs & Training", "Weekly Occupancy & Revenue reports"],
    primaryCtaLabel: "Automate Your Bookings",
    primaryCtaService: "Hospitality System",
    secondaryCtaLabel: "Apply for Strategy Session",
  },
};


const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function isCampaignKey(value: string | undefined): value is CampaignKey {
  return (
    value === "education-suite" ||
    value === "commerce-suite" ||
    value === "healthcare-suite" ||
    value === "real-estate-suite" ||
    value === "logistics-suite" ||
    value === "growth-suite" ||
    value === "academic-writing-suite" ||
    value === "beauty-suite" ||
    value === "legal-suite" ||
    value === "hospitality-suite"
  );
}

export default function CampaignLanding() {
  const { slug } = useParams();
  const location = useLocation();
  const { cmsMeta, cmsSolutions } = useContent();
  const [priority, setPriority] = useState<LandingPriority>("results");
  const [emailOpen, setEmailOpen] = useState(false);

  const campaign = useMemo(() => {
    const key: CampaignKey = isCampaignKey(slug) ? slug : "growth-suite";
    return campaigns[key];
  }, [slug]);

  const source = `lp:${campaign.key}`;
  const priorityLabel = priority === "results" ? "Best result optimization" : "Best cost efficiency";

  useEffect(() => {
    trackEvent("landing_view", { source, path: `${location.pathname}${location.search}` });
  }, [location.pathname, location.search, source]);

  const metaKey = `/lp/${campaign.key}`;
  const bookingHref = `/booking${location.search}`;
  const freeAuditHref = `/free-audit${location.search}`;
  const pricingHref = `/pricing${location.search}`;
  const solutionsHref = `/solutions${location.search}`;

  const mergedSolutions = (Array.isArray(cmsSolutions) && cmsSolutions.length > 0
    ? cmsSolutions
        .filter((s) => s && typeof s === "object")
        .map((s) => {
          const anyS = s as Record<string, unknown>;
          const iconName = typeof anyS.iconName === "string" ? anyS.iconName : undefined;
          return { ...(anyS as unknown as typeof solutions[number]), icon: resolveCmsIcon(iconName) };
        })
    : solutions) as typeof solutions;

  const suiteModules = suiteSolutionIds[campaign.key]
    .map((id) => mergedSolutions.find((s) => s.id === id))
    .filter(Boolean) as typeof solutions;

  return (
    <div className="min-h-screen bg-luxury-midnight text-luxury-champagne">
      <Seo
        title={cmsMeta[metaKey]?.title ?? `${campaign.title} | Bethelmind Analytics`}
        description={cmsMeta[metaKey]?.description ?? campaign.description}
        canonicalPath={`/lp/${campaign.key}`}
        robots={cmsMeta[metaKey]?.robots || "noindex,nofollow"}
        og={{ type: "website", image: cmsMeta[metaKey]?.ogImage || "/images/lux-hero.svg" }}
      />

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none lux-hero-grid opacity-[0.03]" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.45] bg-[radial-gradient(circle_at_30%_10%,rgba(212,175,55,0.18),transparent_55%)]" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.35] bg-[radial-gradient(circle_at_70%_20%,rgba(79,70,229,0.18),transparent_60%)]" />

        <header className="relative lux-container pt-7">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-luxury-champagne/80">Bethelmind Analytics</div>
            <Link to={`/${location.search}`} className="text-sm font-semibold text-luxury-gold hover:underline">
              Main site
            </Link>
          </div>
        </header>

        <main className="relative lux-container pt-14 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="lg:col-span-7">
              <div className="lux-chip w-fit">
                <Sparkles className="h-4 w-4 text-luxury-gold" />
                {campaign.chip}
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-luxury-champagne leading-[1.1]">
                {campaign.title}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-luxury-platinum/80 leading-relaxed max-w-2xl">
                {campaign.description}
              </p>

              {/* Results Preview Bento */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="lux-card-dark p-5 border-l-2 border-l-luxury-gold/50">
                  <div className="text-3xl font-display font-bold text-luxury-gold">40%</div>
                  <div className="mt-1 text-sm text-luxury-platinum/70 uppercase tracking-wider font-semibold">Faster Collections</div>
                  <p className="mt-2 text-xs text-luxury-platinum/50 italic">Average improvement for our clients in the first 60 days.</p>
                </div>
                <div className="lux-card-dark p-5 border-l-2 border-l-luxury-sapphire/50">
                  <div className="text-3xl font-display font-bold text-luxury-sapphire">24/7</div>
                  <div className="mt-1 text-sm text-luxury-platinum/70 uppercase tracking-wider font-semibold">Sales Capture</div>
                  <p className="mt-2 text-xs text-luxury-platinum/50 italic">Your business stays open on WhatsApp even when you sleep.</p>
                </div>
              </div>

              <div className="mt-8 max-w-2xl">
                <div className="text-sm font-semibold text-luxury-champagne/85">Choose your priority</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPriority("results");
                      trackEvent("landing_option_select", {
                        source,
                        path: `${location.pathname}${location.search}`,
                        priority: "results",
                      });
                    }}
                    className={
                      priority === "results"
                        ? "rounded-2xl border border-luxury-sapphire/30 bg-white/5 shadow-sm px-5 py-4 text-left ring-1 ring-luxury-sapphire/40"
                        : "rounded-2xl border border-white/10 bg-white/5 shadow-sm px-5 py-4 text-left hover:bg-white/10 hover:border-luxury-gold/20 transition"
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-base font-bold text-luxury-champagne">Best result optimization</div>
                      <span className="inline-flex items-center rounded-full bg-luxury-sapphire/15 px-2.5 py-1 text-xs font-bold text-luxury-sapphire border border-luxury-sapphire/20">
                        Recommended
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-luxury-champagne/70">For faster growth: conversion + tracking + follow-up system.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPriority("cost");
                      trackEvent("landing_option_select", {
                        source,
                        path: `${location.pathname}${location.search}`,
                        priority: "cost",
                      });
                    }}
                    className={
                      priority === "cost"
                        ? "rounded-2xl border border-luxury-gold/30 bg-white/5 shadow-sm px-5 py-4 text-left ring-1 ring-luxury-gold/40"
                        : "rounded-2xl border border-white/10 bg-white/5 shadow-sm px-5 py-4 text-left hover:bg-white/10 hover:border-luxury-gold/20 transition"
                    }
                  >
                    <div className="text-base font-bold text-luxury-champagne">Best cost efficiency</div>
                    <div className="mt-2 text-sm text-luxury-champagne/70">For tight budgets: quick audit + highest-ROI fixes first.</div>
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                {campaign.bullets.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-luxury-emerald mt-0.5" />
                      <div className="text-sm font-semibold leading-snug text-luxury-champagne">{item}</div>
                    </div>
                  </div>
                ))}
              </div>

              {suiteModules.length > 0 && (
                <section className="mt-14 max-w-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
                    <div className="text-sm font-bold uppercase tracking-widest text-luxury-gold/60">Included Modules</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-luxury-gold/30 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suiteModules.map((module) => {
                      const Icon = module.icon;
                      return (
                        <Link
                          key={module.id}
                          to={`/solutions/${module.id}${location.search}`}
                          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.07] hover:border-luxury-gold/30 hover:shadow-2xl hover:shadow-luxury-gold/5"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                             <Icon className="h-12 w-12" />
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-bold text-luxury-champagne group-hover:text-luxury-gold transition-colors">{module.cardTitle}</div>
                              <div className="mt-0.5 text-[11px] uppercase tracking-wider text-luxury-platinum/40 font-bold">{module.targetAudience}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Smart Sales Engine Section */}
              <section className="mt-20 max-w-3xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-luxury-gold/60">Powered by the Zia Engine</div>
                  <div className="h-px flex-1 bg-gradient-to-r from-luxury-gold/30 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="lux-card-dark p-6 group">
                    <div className="h-12 w-12 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-luxury-champagne">Conversational AI</h3>
                    <p className="mt-2 text-sm text-luxury-platinum/60 leading-relaxed">
                      Zia understands Nigerian context and slang, handling customer enquiries 24/7.
                    </p>
                  </div>
                  <div className="lux-card-dark p-6 group">
                    <div className="h-12 w-12 rounded-2xl bg-luxury-sapphire/10 flex items-center justify-center text-luxury-sapphire mb-4 group-hover:scale-110 transition-transform">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-luxury-champagne">Paystack Ready</h3>
                    <p className="mt-2 text-sm text-luxury-platinum/60 leading-relaxed">
                      Seamless checkout with one-click payment links generated instantly.
                    </p>
                  </div>
                  <div className="lux-card-dark p-6 group">
                    <div className="h-12 w-12 rounded-2xl bg-luxury-emerald/10 flex items-center justify-center text-luxury-emerald mb-4 group-hover:scale-110 transition-transform">
                      <Truck className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-luxury-champagne">Logistics Logic</h3>
                    <p className="mt-2 text-sm text-luxury-platinum/60 leading-relaxed">
                      Auto-calculates delivery fees to Lagos, Abuja, and 50+ other cities.
                    </p>
                  </div>
                </div>
              </section>

              <div className="mt-16 pt-10 border-t border-white/5 flex flex-col sm:flex-row gap-4 max-w-2xl">
                <WhatsAppCTA
                  source={source}
                  service={`${campaign.primaryCtaService} — ${priorityLabel}`}
                  budget={priorityLabel}
                  className="lux-button rounded-2xl flex-1 justify-center py-5 text-lg"
                >
                  {campaign.primaryCtaLabel} <ArrowRight className="ml-2 h-5 w-5" />
                </WhatsAppCTA>
                <div className="flex flex-col flex-1">
                  <Link
                    to={bookingHref}
                    onClick={() => {
                      trackEvent("booking_click", { source, path: `${location.pathname}${location.search}`, target: "booking" });
                      trackServiceInquiry('free-strategy-call', 0);
                    }}
                    className="lux-button-secondary rounded-2xl flex justify-center py-5 text-lg border-white/10 bg-white/5 text-luxury-platinum hover:bg-white/10 transition-all"
                  >
                    {campaign.secondaryCtaLabel}
                  </Link>
                  <button
                    type="button"
                    className="mt-4 text-xs font-semibold text-luxury-platinum/40 hover:text-luxury-gold underline underline-offset-4 text-center transition-colors"
                    onClick={() => {
                      trackEvent("email_lead_opened", { source, path: `${location.pathname}${location.search}`, target: "email" });
                      trackLeadGeneration(0);
                      setEmailOpen(true);
                    }}
                  >
                    Prefer email? Get a reply by email
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-luxury-champagne/60">Quick reply on WhatsApp. No pushy sales.</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeInUp}
              className="lg:col-span-5 lux-cta-gradient rounded-lux-3xl p-8 text-white border border-white/10 shadow-2xl"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-white/65">What you get</div>
              <ul className="mt-5 space-y-4 text-sm text-white/85">
                {campaign.whatYouGet.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-luxury-emerald mt-0.5 flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-white/12 bg-white/8 p-5">
                <div className="text-xs text-white/60 uppercase tracking-wider font-semibold">Prefer to browse?</div>
                <Link
                  to={solutionsHref}
                  onClick={() => trackEvent("booking_click", { source, path: `${location.pathname}${location.search}`, target: "solutions" })}
                  className="mt-3 lux-button w-full"
                >
                  See all solutions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <EmailLeadModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        source={source}
        subjectLabel={campaign.title}
        service={`${campaign.primaryCtaService} — ${priorityLabel}`}
        budget={priorityLabel}
      />
      <FacebookPixel pixelId="YOUR_FACEBOOK_PIXEL_ID" />
    </div>
  );
}
