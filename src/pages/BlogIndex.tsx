import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import { blogPosts } from "@/data/blogPosts";
import { useContent } from "@/context/useContent";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function BlogIndex() {
  const { cmsMeta, cmsBlogPosts } = useContent();
  const meta = cmsMeta["/blog"];
  const posts = (Array.isArray(cmsBlogPosts) && cmsBlogPosts.length > 0 ? (cmsBlogPosts as typeof blogPosts) : blogPosts) as typeof blogPosts;

  return (
    <section className="relative overflow-hidden bg-luxury-midnight text-luxury-platinum min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <Seo
        title={meta?.title ?? "Blog | Bethelmind Analytics"}
        description={
          meta?.description ??
          "Practical guides for Nigerian SMEs: WhatsApp sales automation, conversion-focused websites, payments, dashboards, and operations."
        }
        canonicalPath="/blog"
        robots={meta?.robots || undefined}
        og={{ type: "website", image: meta?.ogImage || "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="lux-hero-grid" />
        <div className="absolute -top-48 right-0 h-[34rem] w-[34rem] rounded-full bg-luxury-gold/10 blur-3xl" />
        <div className="absolute top-24 -left-24 h-[34rem] w-[34rem] rounded-full bg-luxury-sapphire/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center max-w-3xl mx-auto">
          <div className="lux-pill w-fit mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            Practical growth guides
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">The Bethelmind Blog</h1>
          <p className="mt-4 text-lg sm:text-xl text-luxury-platinum/80 leading-relaxed">
            Short, actionable playbooks that solve real problems Nigerian businesses face: slow websites, missed follow-ups, unpaid invoices, and unclear numbers.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lux-card-dark p-6 flex flex-col"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-luxury-gold/80">{post.date}</div>
              <h2 className="mt-3 text-xl font-display font-bold text-luxury-champagne leading-snug">
                <Link to={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 text-sm text-luxury-platinum/70 leading-relaxed flex-1">{post.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="lux-pill-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/blog/${post.slug}`}
                className="mt-6 lux-button-secondary"
              >
                Read article <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

