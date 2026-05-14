import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import { BlogBlock, BlogPost as BlogPostType, blogPosts, getBlogPost } from "@/data/blogPosts";
import { JsonLdObject } from "@/lib/seo";
import { useContent } from "@/context/useContent";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Blocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-a:text-luxury-gold prose-a:font-semibold">
      {blocks.map((b, idx) => {
        if (b.type === "h2") return <h2 key={idx}>{b.text}</h2>;
        if (b.type === "h3") return <h3 key={idx}>{b.text}</h3>;
        if (b.type === "p") return <p key={idx}>{b.text}</p>;
        if (b.type === "ul") return <ul key={idx}>{b.items.map((it) => <li key={it}>{it}</li>)}</ul>;
        if (b.type === "links")
          return (
            <div key={idx} className="not-prose mt-8 rounded-3xl border border-luxury-gold/20 bg-white/5 backdrop-blur p-6">
              <div className="text-sm font-display font-bold text-luxury-champagne">{b.title}</div>
              <div className="mt-4 flex flex-col gap-2">
                {b.items.map((it) => (
                  <Link key={it.href} to={it.href} className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-luxury-champagne hover:bg-white/10 transition">
                    <span>{it.label}</span>
                    <ArrowRight className="h-4 w-4 text-luxury-champagne/70" />
                  </Link>
                ))}
              </div>
            </div>
          );
        return (
          <div key={idx} className="not-prose mt-8 rounded-3xl lux-cta-gradient p-7 text-white border border-white/10 shadow-2xl">
            <div className="text-xl font-display font-bold text-luxury-champagne">{b.title}</div>
            <div className="mt-2 text-sm text-luxury-champagne/80 leading-relaxed">{b.description}</div>
            <Link to={b.href} className="mt-5 lux-button w-full sm:w-auto">
              {b.label} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function BlogPost() {
  const params = useParams();
  const { cmsMeta, cmsBlogPosts } = useContent();
  const posts = (Array.isArray(cmsBlogPosts) && cmsBlogPosts.length > 0 ? (cmsBlogPosts as BlogPostType[]) : blogPosts) as BlogPostType[];
  const post = params.slug ? posts.find((p) => p.slug === params.slug) ?? getBlogPost(params.slug) : undefined;

  const articleSchema = useMemo(() => {
    if (!post) return undefined;
    const origin = window.location.origin;
    const url = new URL(`/blog/${post.slug}`, origin).href;
    const image = post.ogImage ? new URL(post.ogImage, origin).href : undefined;

    const schema: JsonLdObject = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.date,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Bethelmind Analytics" },
      publisher: { "@type": "Organization", name: "Bethelmind Analytics" },
    };
    if (image) schema.image = [image];
    return schema;
  }, [post]);

  if (!post) {
    return (
      <section className="relative overflow-hidden bg-luxury-midnight min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <Seo
          title="Article Not Found | Bethelmind Analytics"
          description="The article you requested doesn’t exist."
          canonicalPath="/blog"
          robots="noindex,follow"
          breadcrumbs={[
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]}
        />
        <div className="mx-auto max-w-3xl lux-card lux-card-dark p-8 text-center">
          <h1 className="text-3xl font-display font-bold text-luxury-champagne">Article not found</h1>
          <p className="mt-3 text-luxury-champagne/75">Head back to the blog and pick another guide.</p>
          <Link to="/blog" className="mt-7 lux-button">
            Browse the blog <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    );
  }

  const pageMeta = cmsMeta[`/blog/${post.slug}`];

  return (
    <section className="relative overflow-hidden bg-luxury-midnight min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <Seo
        title={pageMeta?.title ?? `${post.title} | Bethelmind Analytics`}
        description={pageMeta?.description ?? post.description}
        canonicalPath={`/blog/${post.slug}`}
        robots={pageMeta?.robots || undefined}
        og={{ type: "article", image: pageMeta?.ogImage ?? post.ogImage ?? "/images/lux-hero.svg" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
        additionalSchema={articleSchema ? [articleSchema] : undefined}
      />

      <img
        src="/images/lux-hero.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.03]"
        decoding="async"
      />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.22),transparent_60%)]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.18),transparent_55%)]" />
      <div className="absolute inset-0 pointer-events-none lux-hero-grid opacity-[0.03]" />

      <div className="relative mx-auto max-w-3xl">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
          <div className="lux-pill w-fit mx-auto">
            <Sparkles className="h-4 w-4 text-luxury-gold" />
            {post.tags[0] ?? "Guide"}
          </div>
          <h1 className="mt-6 text-4xl sm:text-5xl font-display font-bold tracking-tight text-luxury-champagne">{post.title}</h1>
          <p className="mt-4 text-lg text-luxury-champagne/75 leading-relaxed">{post.description}</p>
          <div className="mt-5 text-sm text-luxury-champagne/60">{post.date}</div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/whatsapp" className="lux-button">
              Chat on WhatsApp <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/blog" className="lux-button-secondary">
              Back to blog
            </Link>
          </div>
        </motion.div>

        <div className="mt-12 lux-card lux-card-dark p-7 sm:p-10">
          <Blocks blocks={post.blocks} />
        </div>
      </div>
    </section>
  );
}

