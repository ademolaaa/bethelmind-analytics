import { useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import { getPreferredLocale, t } from "@/lib/i18n";
import { useContent } from "@/context/useContent";
import Seo from "@/components/Seo";

type Option = { label: string; value: string };

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const serviceOptions: Option[] = [
  { label: "Growth Suite (SME Growth Ops)", value: "growth_suite" },
  { label: "Commerce Suite (Retail + Ecommerce)", value: "commerce_suite" },
  { label: "Education Suite", value: "education_suite" },
  { label: "Healthcare Suite", value: "healthcare_suite" },
  { label: "Real Estate Suite", value: "real_estate_suite" },
  { label: "Logistics Suite", value: "logistics_suite" },
  { label: "Not sure yet", value: "not_sure" },
];

const timelineOptions: Option[] = [
  { label: "ASAP (1–2 weeks)", value: "asap" },
  { label: "2–4 weeks", value: "2_4_weeks" },
  { label: "1–2 months", value: "1_2_months" },
  { label: "Just exploring", value: "exploring" },
];

const budgetOptions: Option[] = [
  { label: "₦100k–₦300k", value: "100_300" },
  { label: "₦300k–₦1m", value: "300_1000" },
  { label: "₦1m+", value: "1m_plus" },
  { label: "Not sure", value: "not_sure" },
];

export default function WhatsAppLanding() {
  const location = useLocation();
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);
  const { content, cmsMeta } = useContent();
  const phone = content?.contact?.info?.phone || "+234 812 345 6789";

  const [service, setService] = useState<Option>(serviceOptions[0]);
  const [timeline, setTimeline] = useState<Option>(timelineOptions[1]);
  const [budget, setBudget] = useState<Option>(budgetOptions[1]);

  return (
    <section className="relative overflow-hidden bg-luxury-midnight min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <Seo
        title={cmsMeta["/whatsapp"]?.title ?? "Chat on WhatsApp | Bethelmind Analytics"}
        description={
          cmsMeta["/whatsapp"]?.description ??
          "Pick what you need and continue to WhatsApp. Get a fast response, clear quote range, and next steps for your project."
        }
        canonicalPath="/whatsapp"
        robots={cmsMeta["/whatsapp"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/whatsapp"]?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "WhatsApp", path: "/whatsapp" },
        ]}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 lux-mesh-gradient opacity-40" />
        <div className="lux-hero-grid opacity-[0.05]" />
        
        {/* Dynamic Depth Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -right-24 h-[45rem] w-[45rem] rounded-full bg-luxury-gold/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 -left-32 h-[40rem] w-[40rem] rounded-full bg-luxury-sapphire/15 blur-[100px]"
        />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto">
          <div className="lux-chip w-fit mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            {t(locale, "chip")}
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">
            {t(locale, "title")}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-luxury-champagne/75 leading-relaxed">
            {t(locale, "subtitle")}
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="lg:col-span-7 lux-card lux-card-dark p-7 sm:p-9">
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-display font-bold text-luxury-champagne">{t(locale, "step_service")}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {serviceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setService(opt)}
                      className={
                        opt.value === service.value
                          ? "inline-flex items-center rounded-2xl bg-luxury-sapphire/20 border border-luxury-sapphire/40 text-luxury-champagne px-5 py-3 text-sm font-bold shadow-lg shadow-luxury-sapphire/10 transition-all scale-[1.02]"
                          : "inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-luxury-champagne/60 hover:bg-white/10 hover:border-white/20 transition-all"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-display font-bold text-luxury-champagne">{t(locale, "step_timeline")}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {timelineOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTimeline(opt)}
                      className={
                        opt.value === timeline.value
                          ? "inline-flex items-center rounded-full bg-luxury-emerald/15 border border-luxury-emerald/30 text-luxury-champagne px-4 py-2 text-sm font-semibold transition"
                          : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-luxury-champagne/80 hover:bg-white/10 transition"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-display font-bold text-luxury-champagne">{t(locale, "step_budget")}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {budgetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBudget(opt)}
                      className={
                        opt.value === budget.value
                          ? "inline-flex items-center rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-champagne px-4 py-2 text-sm font-semibold transition"
                          : "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-luxury-champagne/80 hover:bg-white/10 transition"
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <WhatsAppCTA
                  source="landing:/whatsapp"
                  service={service.label}
                  timeline={timeline.label}
                  budget={budget.label}
                  className="w-full sm:w-auto lux-button"
                  experimentKey="wa_invite_copy_v1"
                  variants={["A", "B"] as const}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t(locale, "cta_continue")} <ArrowRight className="ml-2 h-5 w-5" />
                </WhatsAppCTA>
                <p className="mt-3 text-sm text-luxury-champagne/60">
                  Your selections are included in the WhatsApp message so we can qualify fast.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="lg:col-span-5 lux-cta-gradient rounded-lux-3xl p-8 text-white border border-white/10 shadow-2xl">
            <h3 className="text-xl font-display font-bold">{t(locale, "next_title")}</h3>
            <ul className="mt-6 space-y-4 text-sm text-white/85">
              {[
                t(locale, "next_1"),
                t(locale, "next_2"),
                t(locale, "next_3"),
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-luxury-emerald mt-0.5 flex-shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-white/12 bg-white/8 p-5">
              <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">WhatsApp number</p>
              <p className="mt-2 font-display font-bold text-white text-lg">{phone}</p>
            </div>

            <div className="mt-8">
              <Link to="/booking" className="lux-button w-full">
                {t(locale, "cta_prefer_call")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
