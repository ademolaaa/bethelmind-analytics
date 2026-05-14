import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { solutions } from "@/data/solutions";
import { useContent } from "@/context/useContent";
import { resolveCmsIcon } from "@/lib/iconMap";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const platforms = [
  {
    title: "Growth Suite (SME Growth Ops)",
    description:
      "Website + WhatsApp sales + invoices/collections + dashboards. For Nigerian SMEs losing leads, missing follow-ups, and chasing payments manually.",
    ids: ["sme-website", "whatsapp-crm-sales-automation", "invoice-collections-payment-automation", "business-dashboards-growth-analytics"],
    funnelKey: "growth-suite",
    badge: "Most Demanded",
  },
  {
    title: "Commerce Suite (Retail + Ecommerce)",
    description:
      "POS + inventory control + ecommerce + reporting. For pharmacies, mini-marts, and stores that want accurate stock, clean cashflow, and daily profit visibility.",
    ids: ["ecommerce-website", "niche-pos-inventory-systems", "inventory-management"],
    funnelKey: "commerce-suite",
  },
  {
    title: "Education Suite",
    description:
      "School portal software for Nigeria: results, fee payments, arrears reminders, admissions and CBT. Reduce parent complaints and collect fees on time.",
    ids: ["school-digitization-system", "school-portal", "admissions-cbt"],
    funnelKey: "education-suite",
    badge: "Bestseller",
    includedModules: ["Parent portal", "Results + broadsheets", "Fee invoices + receipts", "Arrears tracking + reminders", "Admissions", "CBT exams"],
  },
  {
    title: "Healthcare Suite",
    description:
      "Clinic software in Nigeria: appointments, queue management, billing/receipts and pharmacy stock with expiry tracking. Cut waiting time and stop revenue leakage.",
    ids: ["hospital-appointments", "hospital-billing", "booking-customer-portal-system"],
    funnelKey: "healthcare-suite",
  },
  {
    title: "Real Estate Suite",
    description:
      "Real estate CRM + listings website in Nigeria: capture enquiries, assign leads, follow up consistently, and track pipeline outcomes for agents and developers.",
    ids: ["real-estate-website", "real-estate-crm"],
    funnelKey: "real-estate-suite",
  },
  {
    title: "Logistics Suite",
    description:
      "Dispatch management software in Nigeria with proof of delivery (POD). Assign riders, track delivery status, reduce disputes, and improve accountability.",
    ids: ["logistics-dispatch"],
    funnelKey: "logistics-suite",
    includedModules: ["Proof of delivery (photo/signature)", "Customer tracking link", "Cash-on-delivery reconciliation (optional)", "Automated customer updates (optional)"],
  },
  {
    title: "Beauty & Wellness Suite",
    description:
      "Booking & inventory software for salons, spas, and gyms. Stop no-shows with automated WhatsApp reminders and take deposits for high-value services.",
    ids: ["booking-customer-portal-system", "inventory-management"],
    funnelKey: "beauty-suite",
  },
  {
    title: "Professional Services Suite",
    description:
      "Portal & billing software for law firms and consultancies. Secure document exchange, automated invoicing, and professional onboarding forms.",
    ids: ["invoice-collections-payment-automation", "business-dashboards-growth-analytics"],
    funnelKey: "legal-suite",
  },
  {
    title: "Hospitality Suite",
    description:
      "Direct booking software for hotels and shortlets. Avoid OTA commissions with a direct-book site that handles payments and automated check-in instructions.",
    ids: ["booking-customer-portal-system", "ecommerce-website"],
    funnelKey: "hospitality-suite",
  },
  {
    title: "Academic Writing Services",
    description:
      "Professional thesis and dissertation writing service for BSc, MSc, and PhD candidates. Original research, plagiarism-free guarantee, and professional formatting.",
    ids: ["academic-writing-services"],
    funnelKey: "academic-writing-suite",
  },
] as const;

export default function SolutionsIndex() {
  const { cmsMeta, cmsSolutions } = useContent();
  const meta = cmsMeta["/solutions"];

  const mergedSolutions = (Array.isArray(cmsSolutions) && cmsSolutions.length > 0
    ? cmsSolutions
        .filter((s) => s && typeof s === "object")
        .map((s) => {
          const anyS = s as Record<string, unknown>;
          const iconName = typeof anyS.iconName === "string" ? anyS.iconName : undefined;
          return { ...(anyS as unknown as typeof solutions[number]), icon: resolveCmsIcon(iconName) };
        })
    : solutions) as typeof solutions;

  function byIdMerged(id: string) {
    return mergedSolutions.find((s) => s.id === id);
  }

  return (
    <div className="lux-hero-gradient min-h-screen">
      <Seo
        title={meta?.title ?? "Business Software in Nigeria | Bethelmind SaaS Platforms"}
        description={
          meta?.description ??
          "Explore productized business software for Nigeria: school portals, clinic systems, POS & inventory, real estate CRM, dispatch with proof of delivery, and SME growth systems."
        }
        canonicalPath="/solutions"
        robots={meta?.robots || undefined}
        og={{ type: "website", image: meta?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Platforms", path: "/solutions" },
        ]}
      />

      <div className="lux-container lux-section">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto">
          <div className="lux-pill mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            Platforms for Nigerian SMEs
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">Pick a platform. Start with the highest ROI module.</h1>
          <p className="mt-4 text-lg sm:text-xl text-luxury-platinum/80 leading-relaxed">
            Each platform bundles the core modules you need for one outcome: more leads, faster collections, cleaner operations, and better visibility.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <WhatsAppCTA source="solutions_hub_hero" className="lux-button" experimentKey="wa_invite_copy_v1" variants={["A", "B"] as const}>
              Chat on WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
            </WhatsAppCTA>
            <div className="flex flex-col">
              <Link to="/booking" className="lux-button-secondary">
                Apply for Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="mt-2 text-sm text-luxury-platinum/70 leading-relaxed">
                In 20 minutes, we show you where you’re losing leads or payments and outline a 60-day improvement plan.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 max-w-3xl mx-auto text-center text-sm sm:text-base text-luxury-champagne/75 leading-relaxed">
          <p>
            Growth Systems: websites, WhatsApp automation and dashboards that help any Nigerian SME sell more and get paid faster.
          </p>
          <p className="mt-2">
            Specialized SaaS: ready-made platforms for schools, clinics &amp; hospitals, pharmacies, logistics and more, tailored to your workflow.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {platforms.map((platform) => {
            const items = platform.ids.map(byIdMerged).filter(Boolean) as Array<NonNullable<ReturnType<typeof byIdMerged>>>;
            if (items.length === 0) return null;
            return (
              <section key={platform.title} className="lux-card-dark p-7 sm:p-10">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-luxury-champagne">{platform.title}</h2>
                      {"badge" in platform && (
                        <span className="inline-flex items-center rounded-full bg-luxury-gold/20 px-3 py-0.5 text-xs font-bold text-luxury-gold border border-luxury-gold/30 uppercase tracking-wider animate-pulse">
                          {platform.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-luxury-platinum/80 max-w-3xl">{platform.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {"funnelKey" in platform && typeof platform.funnelKey === "string" && (
                      <Link to={`/lp/${platform.funnelKey}`} className="text-sm font-semibold text-luxury-gold hover:underline">
                        See funnel
                      </Link>
                    )}
                    <Link to="/whatsapp" className="text-sm font-semibold text-luxury-gold hover:underline">
                      Get recommendations
                    </Link>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((solution) => {
                    const Icon = solution.icon;
                    return (
                      <motion.article
                        key={solution.id}
                        whileHover={{ y: -5, scale: 1.02, boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.1), 0 8px 10px -6px rgba(212, 175, 55, 0.1)" }}
                        className="lux-card-interactive rounded-lux-2xl border border-luxury-gold/20 bg-luxury-midnight/70 backdrop-blur-xl shadow-lg p-6 flex flex-col transition-colors duration-300 hover:bg-luxury-gold/10 hover:border-luxury-gold/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-11 w-11 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-display font-bold text-luxury-champagne leading-snug">
                              <Link to={`/solutions/${solution.id}`} className="hover:underline">
                                {solution.cardTitle}
                              </Link>
                            </h3>
                            <div className="mt-1 text-xs text-luxury-platinum/60">{solution.targetAudience}</div>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-luxury-platinum/80 leading-relaxed flex-1">{solution.cardBenefit}</p>
                        <div className="mt-6 flex flex-col gap-3">
                          <Link to={`/solutions/${solution.id}`} className="lux-button-secondary text-sm py-3">
                            View module <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                          <Link to="/booking" className="lux-button text-sm py-3">
                            Apply for Strategy Session <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                {"includedModules" in platform && Array.isArray(platform.includedModules) && platform.includedModules.length > 0 && (
                  <div className="mt-7 rounded-lux-2xl border border-luxury-gold/20 bg-luxury-midnight/70 px-6 py-6">
                    <div className="text-sm font-semibold text-luxury-champagne">Included modules</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {platform.includedModules.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full border border-luxury-gold/20 bg-luxury-gold/10 px-3 py-1 text-xs font-semibold text-luxury-gold/90"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <section className="mt-12 lux-cta-gradient rounded-lux-3xl p-8 text-white border border-white/10 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-luxury-champagne">Not sure what you need?</h2>
          <p className="mt-3 text-luxury-platinum/80 leading-relaxed max-w-3xl">
            Chat on WhatsApp and we’ll ask 3 quick questions to recommend the best package and the fastest delivery timeline.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-4">
            <WhatsAppCTA source="solutions_hub_bottom" className="lux-button">
              Chat on WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
            </WhatsAppCTA>
            <div className="flex flex-col">
              <Link to="/booking" className="lux-button-secondary">
                Apply for Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <p className="mt-2 text-sm text-luxury-platinum/70 leading-relaxed">
                In 20 minutes, we show you where you’re losing leads or payments and outline a 60-day improvement plan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

