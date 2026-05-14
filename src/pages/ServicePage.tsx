import { useParams, Link } from "react-router-dom";
import { solutions } from "@/data/solutions";
import { blogPosts } from "@/data/blogPosts";
import { ArrowRight, CheckCircle, MessageCircle, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";
import WhatsAppCTA from "@/components/WhatsAppCTA";
import Seo from "@/components/Seo";
import { useContent } from "@/context/useContent";
import { resolveCmsIcon } from "@/lib/iconMap";

export default function ServicePage() {
  const { slug } = useParams();
  const { cmsMeta, cmsSolutions } = useContent();

  const mergedSolutions = (Array.isArray(cmsSolutions) && cmsSolutions.length > 0
    ? cmsSolutions
        .filter((s) => s && typeof s === "object")
        .map((s) => {
          const anyS = s as Record<string, unknown>;
          const iconName = typeof anyS.iconName === "string" ? anyS.iconName : undefined;
          return { ...(anyS as unknown as typeof solutions[number]), icon: resolveCmsIcon(iconName) };
        })
    : solutions) as typeof solutions;

  const solution = mergedSolutions.find((s) => s.id === slug);
  const relatedPosts =
    slug === "whatsapp-crm-sales-automation"
      ? ["whatsapp-sales-automation-nigeria", "whatsapp-follow-up-templates"]
      : slug === "invoice-collections-payment-automation"
        ? ["invoice-payment-reminders-whatsapp", "whatsapp-follow-up-templates"]
        : slug === "sme-website"
          ? ["mobile-first-conversion-website-nigeria"]
          : slug === "school-digitization-system" || slug === "school-portal" || slug === "admissions-cbt"
            ? ["school-portal-checklist-results-fees-cbt"]
            : [];
  const related = relatedPosts.map((s) => blogPosts.find((p) => p.slug === s)).filter(Boolean);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (!solution) {
    return (
      <section className="relative overflow-hidden bg-luxury-midnight py-24">
        <Seo
          title="Solution Not Found | Bethelmind Analytics"
          description="The page you requested doesn’t exist. Explore our solutions for websites, automation, and analytics."
          canonicalPath="/solutions"
          robots="noindex,follow"
        />
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/lux-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
            decoding="async"
          />
          <div className="lux-hero-grid" />
          <div className="absolute -top-48 right-0 h-[38rem] w-[38rem] rounded-full bg-luxury-gold/10 blur-3xl" />
          <div className="absolute top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">
            Solution Not Found
          </h1>
          <p className="mt-4 text-lg text-luxury-champagne/75">
            The page you requested doesn’t exist. Head back to explore our solutions.
          </p>
          <Link to="/" className="mt-8 lux-button">
            Go Home <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-transparent">
      {(() => {
        const pageMeta = cmsMeta[`/solutions/${solution.id}`];
        return (
      <Seo
        title={pageMeta?.title ?? `${solution.title} | Bethelmind Analytics`}
        description={pageMeta?.description ?? `${solution.intro} Built for ${solution.targetAudience}.`}
        canonicalPath={`/solutions/${solution.id}`}
        robots={pageMeta?.robots || undefined}
        og={{ type: "website", image: pageMeta?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: solution.title, path: `/solutions/${solution.id}` },
        ]}
        faq={solution.faq.map((item) => ({ question: item.question, answer: item.answer }))}
      />
        );
      })()}
      <section className="relative overflow-hidden pt-20 pb-14 px-4 sm:px-6 lg:px-8 lux-hero-gradient">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/lux-hero.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
            decoding="async"
          />
          <div className="lux-hero-grid" />
          <div className="absolute -top-48 right-0 h-[38rem] w-[38rem] rounded-full bg-luxury-gold/10 blur-3xl" />
          <div className="absolute top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto">
            <div className="lux-chip w-fit mx-auto">
              <Sparkles className="h-4 w-4 text-luxury-gold" />
              Solution
            </div>
            <div className="mt-8 flex justify-center">
              <motion.div layoutId={`showcase-media:${solution.id}`} className="w-full max-w-[640px]">
                <div className="rounded-[28px] border border-white/10 bg-luxury-midnight/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="relative aspect-[16/11]">
                    <img
                      src="/images/lux-hero.svg"
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover opacity-[0.85]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                      Cinematic
                    </div>
                    <div className="absolute right-5 top-5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">
                      360° + Zoom
                    </div>
                    <div className="absolute bottom-5 left-5 flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-sm">
                        <solution.icon className="h-10 w-10 text-luxury-gold" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.h1 layoutId={`showcase-title:${solution.id}`} className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">
              {solution.title}
            </motion.h1>
            <p className="mt-4 text-lg sm:text-xl text-luxury-champagne/75 leading-relaxed">
              {solution.intro}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <WhatsAppCTA
                source={`solution:${solution.id}`}
                service={solution.title}
                className="w-full sm:w-auto lux-button"
                experimentKey="wa_invite_copy_v1"
                variants={["A", "B"] as const}
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
              </WhatsAppCTA>
              <div className="w-full sm:w-auto flex flex-col">
                <Link
                  to="/booking"
                  className="w-full sm:w-auto lux-button-secondary"
                >
                  Apply for Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <p className="mt-2 text-sm text-luxury-champagne/70 leading-relaxed">
                  In 20 minutes, we show you where you’re losing leads or payments and outline a 60-day improvement plan.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-luxury-champagne">
              Common Pain Points
            </motion.h2>
            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="mt-4 text-luxury-champagne/75 leading-relaxed">
              Here are the issues we typically fix first to unlock performance and reduce operational stress.
            </motion.p>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="lg:col-span-7 lux-card lux-card-dark p-7 sm:p-9">
            <ul className="space-y-4">
              {solution.painPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/20 font-bold">
                    !
                  </span>
                  <p className="text-luxury-champagne/75 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-luxury-champagne">
              What We Build For You
            </h2>
            <p className="mt-4 text-luxury-champagne/75 leading-relaxed">
              A complete solution tailored to your operations, customers, and growth targets.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solution.whatWeBuild.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInUp}
                className="lux-card lux-card-dark p-6"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-luxury-emerald flex-shrink-0 mt-0.5" />
                  <span className="text-luxury-champagne font-semibold leading-relaxed">{item}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-luxury-champagne">
              How It Works
            </h2>
            <p className="mt-4 text-luxury-champagne/75 leading-relaxed">
              A simple delivery process designed for speed, clarity, and measurable outcomes.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solution.howItWorks.map((step) => (
              <motion.div
                key={step.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInUp}
                className="lux-card lux-card-dark p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-luxury-gold/15 border border-luxury-gold/20 text-luxury-gold font-extrabold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-luxury-champagne">{step.title}</h3>
                <p className="mt-2 text-sm text-luxury-champagne/75 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="lux-card lux-card-dark p-7 sm:p-9">
            <h3 className="text-2xl font-display font-bold text-luxury-champagne">Timeline & Pricing</h3>
            <p className="mt-4 text-luxury-champagne/75 leading-relaxed">{solution.timelineAndPricing}</p>
            <p className="mt-5 text-sm text-luxury-champagne/60">
              Pricing depends on scope, integrations, and delivery timeline.
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="lux-card lux-card-dark p-7 sm:p-9">
            <h3 className="text-2xl font-display font-bold text-luxury-champagne">What You Get</h3>
            <ul className="mt-6 space-y-4">
              {solution.whatYouGet.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-luxury-emerald flex-shrink-0 mt-0.5" />
                  <span className="text-luxury-champagne/75 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="lux-section">
        <div className="lux-container max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeInUp} className="text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-luxury-champagne">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-luxury-champagne/75 leading-relaxed">
              Fast answers to the most common questions we get about delivery and scope.
            </p>
          </motion.div>

          <div className="mt-10 space-y-4">
            {solution.faq.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeInUp}
                className="lux-card lux-card-dark p-6"
              >
                <h4 className="text-lg font-bold text-luxury-champagne">{item.question}</h4>
                <p className="mt-2 text-luxury-champagne/75 leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>

          {related.length > 0 && (
            <div className="mt-10 lux-card lux-card-dark p-6">
              <h3 className="text-xl font-display font-bold text-luxury-champagne">Read next</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {related.slice(0, 2).map((post) => (
                  <Link
                    key={post!.slug}
                    to={`/blog/${post!.slug}`}
                    className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 hover:bg-white/10 transition"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-luxury-champagne/60">{post!.date}</div>
                    <div className="mt-2 font-semibold text-luxury-champagne">{post!.title}</div>
                    <div className="mt-2 text-sm text-luxury-champagne/75">{post!.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeInUp} className="mt-10 lux-cta-gradient rounded-lux-3xl p-8 text-white border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-display font-bold">Ready to get started?</h3>
            <p className="mt-3 text-white/80 leading-relaxed">
              Book a strategy call and we’ll recommend the fastest path to results for your business.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col">
                <Link
                  to="/booking"
                  className="lux-button"
                >
                  Apply for Strategy Session <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">
                  In 20 minutes, we show you where you’re losing leads or payments and outline a 60-day improvement plan.
                </p>
              </div>
              <WhatsAppCTA
                hrefOnly
                source={`solution:${solution.id}:cta_bottom`}
                service={solution.title}
                className="lux-button-secondary"
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
              </WhatsAppCTA>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
