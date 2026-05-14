import React, { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { CheckCircle, Download, FileText, Lock, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import Seo from "@/components/Seo";

export default function LeadMagnetPage() {
  const location = useLocation();
  const { content, cmsMeta } = useContent();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
      },
    }),
    []
  );

  const itemVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
    }),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const leadId = getLeadId();
    const locale = getPreferredLocale(location.search);
    const stage = getLeadScore().stage;
    const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
    const phoneDigits = normalizeWhatsAppPhone(phoneDisplay);

    const message = buildWhatsAppMessage({
      locale,
      leadId,
      source: "lead_magnet:/free-audit",
      stage,
      extraLines: [
        "Offer: 10-Point Website Audit Checklist",
        name ? `Name: ${name}` : null,
        email ? `Email: ${email}` : null,
        phone ? `WhatsApp: ${phone}` : null,
      ].filter(Boolean) as string[],
      firstTouch: getFirstTouch(),
      lastTouch: getLastTouch(),
    });

    recordTouchpoint("lead_magnet_submit");
    trackEvent("lead_magnet_submit", { source: "lead_magnet:/free-audit", path: `${location.pathname}${location.search}` });
    trackEvent("whatsapp_click", { source: "lead_magnet:/free-audit", path: `${location.pathname}${location.search}` });

    const urls = getWhatsAppUrls({ phoneDigits, text: message });
    window.location.assign(urls.universal);
  };

  return (
    <div className="relative overflow-hidden">
      <Seo
        title={cmsMeta["/free-audit"]?.title ?? "Free Website Audit Checklist (Nigeria) | Bethelmind Analytics"}
        description={
          cmsMeta["/free-audit"]?.description ??
          "Download a practical 10-point website audit checklist for Nigerian businesses. Find speed, trust, and conversion issues in minutes."
        }
        canonicalPath="/free-audit"
        robots={cmsMeta["/free-audit"]?.robots || undefined}
        og={{ type: "website", image: cmsMeta["/free-audit"]?.ogImage || "/images/lux-audit.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Free Audit", path: "/free-audit" },
        ]}
      />
      <div className="absolute inset-0 bg-luxury-midnight" />
      <div className="absolute inset-0 pointer-events-none lux-hero-grid" />
      <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.28),transparent_60%)]" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.26),transparent_55%)]" />

      <main className="relative pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <motion.div
              className="lg:col-span-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur"
              >
                <Sparkles className="h-4 w-4 text-luxury-gold" />
                Free Resource for Business Owners
                <span className="ml-1 inline-flex items-center rounded-full bg-luxury-gold/15 px-2 py-0.5 text-xs font-semibold text-luxury-midnight border border-luxury-gold/20">
                  10-Point Checklist
                </span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                Is Your Website Losing You Money?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-sapphire to-luxury-emerald bg-[length:200%_200%] animate-shimmer">
                  Find Out in 5 Minutes.
                </span>
              </motion.h1>

              <motion.p variants={itemVariants} className="mt-5 text-lg text-white/75 leading-relaxed">
                Most business websites in Nigeria are just “digital flyers” that don’t bring in sales. Download our{" "}
                <span className="font-semibold text-white">10-Point Website Audit Checklist</span> to see exactly what’s
                missing from your site.
              </motion.p>

              <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Simple English, no technical jargon",
                  "Identify hidden speed & security issues",
                  "Learn the 3 changes that double conversions",
                  "Mobile-friendly test included",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/85 backdrop-blur"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-luxury-emerald mt-0.5" />
                      <div className="text-sm font-semibold leading-snug">{item}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-sm font-bold text-luxury-gold animate-glow">
                  200+
                </div>
                <div className="text-sm font-semibold text-white/75">
                  Downloaded by Nigerian Founders
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:col-span-6 relative"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-luxury-sapphire/40 via-luxury-gold/35 to-luxury-emerald/40 blur-xl opacity-60" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80">
                    <FileText className="h-4 w-4 text-luxury-gold" />
                    Get the Checklist Free
                  </div>
                  <img
                    src="/images/lux-audit.svg"
                    alt=""
                    aria-hidden="true"
                    className="h-10 w-auto opacity-90"
                    decoding="async"
                  />
                </div>

                <div className="mt-5 text-xl font-bold text-white">Send it to your email instantly</div>
                <div className="mt-2 text-sm text-white/70">No fluff. Just a clean checklist you can use today.</div>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  <div>
                    <label htmlFor="name" className="lux-label">First Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="lux-input mt-2"
                      placeholder="e.g. Tunde"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="lux-label">Work Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="lux-input mt-2"
                      placeholder="tunde@business.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="lux-label">WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      id="whatsapp"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="lux-input mt-2"
                      placeholder="080..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full lux-button disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Me The Checklist"}
                    <Download className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-[-1px]" />
                  </button>

                  <div className="pt-2 text-xs text-white/60 flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 mr-1.5" /> No spam. Unsubscribe anytime.
                  </div>
                </form>
              </div>

              <div className="mt-8 hidden lg:block">
                <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">
                  <img
                    src="/images/lux-hero.svg"
                    alt=""
                    aria-hidden="true"
                    className="w-full h-auto rounded-2xl opacity-95 animate-float"
                    decoding="async"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
