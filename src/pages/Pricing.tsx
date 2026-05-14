import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../context/useContent";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Seo from "@/components/Seo";
import RichText from "@/components/RichText";

export default function Pricing() {
  const { content, cmsMeta } = useContent();
  const { pricing } = content;

  // Fallback
  const hero = pricing?.hero || { title: "Simple pricing", subtitle: "No hidden fees." };
  const plans = pricing?.plans || [];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  return (
    <div className="bg-transparent">
      <Seo
        title={cmsMeta["/pricing"]?.title ?? "Pricing | Bethelmind Analytics"}
        description={
          cmsMeta["/pricing"]?.description ??
          "Transparent project packages for Nigerian businesses: website sprint, growth system, and custom platforms. Get a clear quote range fast."
        }
        canonicalPath="/pricing"
        robots={cmsMeta["/pricing"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/pricing"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />

      <section className="lux-cta-gradient text-white lux-section overflow-hidden">
        <div className="absolute inset-0 z-0 lux-hero-grid opacity-[0.03]" />
        <div className="lux-container text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold leading-7 text-luxury-gold uppercase tracking-wide"
          >
            Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-4xl font-display font-bold text-luxury-champagne sm:text-5xl tracking-tight"
          >
            {hero.title}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <RichText html={hero.subtitle} className="mt-5 text-lg sm:text-xl text-luxury-champagne/80 leading-relaxed" />
          </motion.div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container">
          <motion.div
            className="grid gap-8 lg:grid-cols-3 lg:gap-x-8 items-start"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {plans.map((plan, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={cn(
                  "relative p-8 rounded-lux-2xl border flex flex-col h-full transition-all duration-300 lux-card lux-card-dark",
                  plan.highlighted
                    ? "border-luxury-gold/40 ring-1 ring-luxury-gold/50 scale-[1.01]"
                    : "border-white/10 hover:border-luxury-gold/30"
                )}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 bg-luxury-gold text-luxury-midnight text-xs font-bold rounded-full uppercase tracking-wide shadow-md">
                    Best Value
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-luxury-champagne">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline text-luxury-champagne">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                  </p>
                  <RichText html={plan.description} className="mt-5 text-luxury-champagne/75 text-sm leading-relaxed" />

                  <ul role="list" className="mt-8 space-y-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start">
                        <div className="flex-shrink-0">
                          <Check className="w-5 h-5 text-luxury-emerald" />
                        </div>
                        <span className="ml-3 text-luxury-champagne/75 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <WhatsAppCTA
                  source={`pricing:${plan.name}`}
                  service={plan.name}
                  budget={String(plan.price)}
                  className={cn(
                    "mt-8 block w-full",
                    plan.highlighted ? "lux-button" : "lux-button-secondary"
                  )}
                  showFallbackLink={false}
                >
                  {plan.cta}
                </WhatsAppCTA>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-luxury-champagne/75">
              Not sure what you need?{" "}
              <Link to="/whatsapp" className="text-luxury-gold font-semibold hover:underline">
                Chat on WhatsApp
              </Link>{" "}
              and get a clear roadmap.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
