import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import Seo from "@/components/Seo";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { solutions } from "@/data/solutions";
import { useContent } from "@/context/useContent";
import { resolveCmsIcon } from "@/lib/iconMap";
import GlassContainer from "@/components/luxury/GlassContainer";
import LuxBentoCard from "@/components/luxury/LuxBentoCard";
import { cn } from "@/lib/utils";

const platforms = [
  {
    title: "Growth Suite (SME Growth Ops)",
    description: "Website + WhatsApp sales + invoices/collections + dashboards. For Nigerian SMEs losing leads.",
    ids: ["sme-website", "whatsapp-crm-sales-automation", "invoice-collections-payment-automation"],
    funnelKey: "growth-suite",
    badge: "Most Demanded",
  },
  {
    title: "Commerce Suite (Retail + Ecommerce)",
    description: "POS + inventory control + ecommerce + reporting. For pharmacies and stores.",
    ids: ["ecommerce-website", "niche-pos-inventory-systems", "inventory-management"],
    funnelKey: "commerce-suite",
  },
  {
    title: "Education Suite",
    description: "School portal software for Nigeria: results, fee payments, and admissions.",
    ids: ["school-digitization-system", "school-portal", "admissions-cbt"],
    funnelKey: "education-suite",
    badge: "Bestseller",
  },
  {
    title: "Healthcare Suite",
    description: "Clinic software in Nigeria: appointments, billing/receipts and pharmacy stock.",
    ids: ["hospital-appointments", "hospital-billing", "booking-customer-portal-system"],
    funnelKey: "healthcare-suite",
  }
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
    <div className="bg-primary-navy text-foreground selection:bg-primary/30 min-h-screen mesh-gradient">
      <Seo
        title={meta?.title ?? "Business Software in Nigeria | Bethelmind SaaS Platforms"}
        description={meta?.description ?? "Explore productized business software for Nigeria."}
        canonicalPath="/solutions"
      />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 left-1/4 w-[60%] h-[60%] bg-accent/10 rounded-full blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="lux-badge mb-8 mx-auto">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SME Growth Frameworks</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6 text-gradient-gold">
              Engineered for ROI
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-light">
              Pick a platform. Start with the highest ROI module. We bundle the core modules you need for one outcome: more growth.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <WhatsAppCTA source="solutions_hub_hero">
                <button className="lux-button lux-button-primary px-10 group">
                  Chat on WhatsApp
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </WhatsAppCTA>
              <Link to="/booking">
                <button className="lux-button lux-button-secondary px-10">
                  Apply for Strategy Session
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-32 px-4 relative z-10">
        <div className="max-w-6xl mx-auto space-y-24">
          {platforms.map((platform, pIdx) => {
            const items = platform.ids.map(byIdMerged).filter(Boolean) as Array<NonNullable<ReturnType<typeof byIdMerged>>>;
            if (items.length === 0) return null;
            
            return (
              <motion.div 
                key={platform.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: pIdx * 0.1 }}
              >
                <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-3xl font-bold text-gradient-silver">{platform.title}</h2>
                      {platform.badge && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest animate-pulse">
                          {platform.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/50 max-w-2xl">{platform.description}</p>
                  </div>
                  <Link to={`/lp/${platform.funnelKey}`} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
                    View Blueprint →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((solution, sIdx) => {
                    const Icon = solution.icon || Sparkles;
                    return (
                      <LuxBentoCard
                        key={solution.id}
                        title={solution.cardTitle}
                        description={solution.cardBenefit}
                        tag={solution.targetAudience}
                        href={`/solutions/${solution.id}`}
                        variant="default"
                        className="h-full"
                        icon={<Icon className="w-5 h-5" />}
                        image="/images/lux-hero.svg"
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-32 max-w-4xl mx-auto">
          <GlassContainer className="p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10 blur-3xl transform translate-y-1/2" />
            <h2 className="text-4xl font-bold mb-6">Need a Custom Blueprint?</h2>
            <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
              Our architects can design a tailored digital ecosystem for your specific business requirements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <WhatsAppCTA source="solutions_bottom">
                <button className="lux-button lux-button-primary px-12 group">
                  <MessageCircle className="w-5 h-5" />
                  Instant Architect Chat
                </button>
              </WhatsAppCTA>
            </div>
          </GlassContainer>
        </div>
      </section>
    </div>
  );
}
