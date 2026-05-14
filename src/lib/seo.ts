export type JsonLdObject = Record<string, unknown>;

export type SeoOpenGraph = {
  type?: "website" | "article";
  image?: string;
};

export type SeoInput = {
  title: string;
  description: string;
  canonicalUrl: string;
  robots?: string;
  og?: SeoOpenGraph;
  schema?: JsonLdObject[];
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function clampMetaDescription(value: string, max = 155) {
  const normalized = normalizeText(value);
  if (normalized.length <= max) return normalized;
  const truncated = normalized.slice(0, Math.max(0, max - 3)).trimEnd();
  return `${truncated}...`;
}

function upsertMeta(attr: "name" | "property", key: string, content?: string) {
  const selector = `meta[${attr}="${CSS.escape(key)}"]`;
  const existing = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!content) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("content", content);
  el.dataset.bmSeo = "1";
  if (!existing) document.head.appendChild(el);
}

function upsertLink(rel: string, href?: string) {
  const selector = `link[rel="${CSS.escape(rel)}"]`;
  const existing = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!href) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement("link");
  el.setAttribute("rel", rel);
  el.setAttribute("href", href);
  el.dataset.bmSeo = "1";
  if (!existing) document.head.appendChild(el);
}

function setJsonLd(schema: JsonLdObject[]) {
  const nodes = document.head.querySelectorAll('script[type="application/ld+json"][data-bm-seo="1"]');
  for (const node of nodes) node.remove();
  for (const item of schema) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(item);
    script.dataset.bmSeo = "1";
    document.head.appendChild(script);
  }
}

export function applySeo(input: SeoInput) {
  document.title = input.title;

  upsertLink("canonical", input.canonicalUrl);

  upsertMeta("name", "description", clampMetaDescription(input.description));
  upsertMeta("name", "robots", input.robots);

  upsertMeta("property", "og:title", input.title);
  upsertMeta("property", "og:description", clampMetaDescription(input.description));
  upsertMeta("property", "og:url", input.canonicalUrl);
  upsertMeta("property", "og:type", input.og?.type ?? "website");
  const ogImage = input.og?.image ? (input.og.image.startsWith("/") ? new URL(input.og.image, input.canonicalUrl).href : input.og.image) : undefined;
  if (ogImage) upsertMeta("property", "og:image", ogImage);

  upsertMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
  upsertMeta("name", "twitter:title", input.title);
  upsertMeta("name", "twitter:description", clampMetaDescription(input.description));
  if (ogImage) upsertMeta("name", "twitter:image", ogImage);

  const schema = input.schema ?? [];
  setJsonLd(schema);
}

export function buildOrganizationSchema(origin: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bethelmind Analytics",
    url: origin,
    sameAs: [],
  };
}

export function buildWebsiteSchema(origin: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bethelmind Analytics",
    url: origin,
  };
}

export function buildBreadcrumbSchema(origin: string, crumbs: Array<{ name: string; path: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: c.name,
      item: new URL(c.path, origin).href,
    })),
  };
}

export function buildFaqSchema(items: Array<{ question: string; answer: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: normalizeText(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: normalizeText(item.answer),
      },
    })),
  };
}

