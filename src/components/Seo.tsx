import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeo, buildBreadcrumbSchema, buildFaqSchema, buildOrganizationSchema, buildWebsiteSchema, JsonLdObject, SeoOpenGraph } from "@/lib/seo";

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  robots?: string;
  og?: SeoOpenGraph;
  breadcrumbs?: Array<{ name: string; path: string }>;
  faq?: Array<{ question: string; answer: string }>;
  additionalSchema?: JsonLdObject[];
};

export default function Seo(props: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const origin = window.location.origin;
    const canonicalPath = props.canonicalPath ?? location.pathname;
    const canonicalUrl = new URL(canonicalPath, origin).href;

    const schema: JsonLdObject[] = [buildOrganizationSchema(origin), buildWebsiteSchema(origin)];
    if (props.breadcrumbs?.length) schema.push(buildBreadcrumbSchema(origin, props.breadcrumbs));
    if (props.faq?.length) schema.push(buildFaqSchema(props.faq));
    if (props.additionalSchema?.length) schema.push(...props.additionalSchema);

    applySeo({
      title: props.title,
      description: props.description,
      canonicalUrl,
      robots: props.robots,
      og: props.og,
      schema,
    });
  }, [location.pathname, props.additionalSchema, props.breadcrumbs, props.canonicalPath, props.description, props.faq, props.og, props.robots, props.title]);

  return null;
}

