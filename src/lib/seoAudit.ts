import { BlogBlock, BlogPost } from "@/data/blogPosts";
import { SolutionData } from "@/data/solutions";
import { clampMetaDescription } from "@/lib/seo";

export type AuditLevel = "high" | "medium" | "low";

export type AuditIssue = {
  level: AuditLevel;
  message: string;
};

export type AuditResult = {
  kind: "blog" | "solution";
  id: string;
  title: string;
  score: number;
  metaTitle: string;
  metaDescription: string;
  issues: AuditIssue[];
};

function penalty(level: AuditLevel) {
  if (level === "high") return 18;
  if (level === "medium") return 10;
  return 5;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countBlocks(blocks: BlogBlock[], type: BlogBlock["type"]) {
  return blocks.filter((b) => b.type === type).length;
}

function getLinksFromBlocks(blocks: BlogBlock[]) {
  const links: string[] = [];
  for (const b of blocks) {
    if (b.type === "links") links.push(...b.items.map((it) => it.href));
    if (b.type === "cta") links.push(b.href);
  }
  return links;
}

function hasConversionCta(links: string[]) {
  return links.some((href) => href === "/whatsapp" || href === "/booking" || href.startsWith("/whatsapp?") || href.startsWith("/booking?"));
}

function hasMoneyPageLink(links: string[]) {
  return links.some((href) => href.startsWith("/solutions/") || href === "/pricing" || href.startsWith("/pricing?"));
}

function metaTitleIssues(metaTitle: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const len = metaTitle.trim().length;
  if (len < 30) issues.push({ level: "medium", message: `Meta title is short (${len} chars). Aim for 35–60.` });
  if (len > 60) issues.push({ level: "high", message: `Meta title is long (${len} chars). Aim for ≤ 60.` });
  if (!metaTitle.includes("|")) issues.push({ level: "low", message: "Meta title does not include a brand separator (e.g., “| Bethelmind Analytics”)." });
  return issues;
}

function metaDescriptionIssues(metaDescription: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const normalized = clampMetaDescription(metaDescription, 9999);
  const len = normalized.length;
  if (len < 90) issues.push({ level: "medium", message: `Meta description is short (${len} chars). Aim for 110–155.` });
  if (len > 160) issues.push({ level: "high", message: `Meta description is long (${len} chars). Aim for ≤ 155.` });
  return issues;
}

export function auditBlogPost(post: BlogPost): AuditResult {
  const issues: AuditIssue[] = [];
  const links = getLinksFromBlocks(post.blocks);

  if (countBlocks(post.blocks, "h2") < 2) issues.push({ level: "medium", message: "Too few H2 sections. Aim for ≥ 2." });
  if (countBlocks(post.blocks, "p") < 2) issues.push({ level: "low", message: "Add more explanatory paragraphs to increase depth." });
  if (countBlocks(post.blocks, "ul") < 1) issues.push({ level: "low", message: "Add at least one bullet list to improve scanability." });

  if (!hasConversionCta(links)) issues.push({ level: "high", message: "Missing conversion CTA link to /whatsapp or /booking." });
  if (!hasMoneyPageLink(links)) issues.push({ level: "high", message: "Missing money-page link (e.g., /solutions/* or /pricing)." });
  if (countBlocks(post.blocks, "cta") < 1) issues.push({ level: "medium", message: "Add a dedicated CTA block near the end." });

  const metaTitle = `${post.title} | Bethelmind Analytics`;
  const metaDescription = clampMetaDescription(post.description);

  issues.push(...metaTitleIssues(metaTitle));
  issues.push(...metaDescriptionIssues(metaDescription));

  let score = 100;
  for (const issue of issues) score -= penalty(issue.level);

  return {
    kind: "blog",
    id: post.slug,
    title: post.title,
    score: clampScore(score),
    metaTitle,
    metaDescription,
    issues,
  };
}

export function auditSolution(solution: SolutionData, relatedBlogSlugs: string[]) : AuditResult {
  const issues: AuditIssue[] = [];

  if (solution.intro.trim().length < 140) issues.push({ level: "medium", message: "Intro is short. Add more context (outcome + audience + constraint)." });
  if (solution.painPoints.length < 4) issues.push({ level: "medium", message: "Pain points are thin. Aim for ≥ 4." });
  if (solution.whatWeBuild.length < 5) issues.push({ level: "medium", message: "What we build list is short. Aim for ≥ 5 deliverables." });
  if (solution.faq.length < 4) issues.push({ level: "high", message: "FAQ is thin. Aim for ≥ 4 (pricing, timeline, payments, support)." });

  if (relatedBlogSlugs.length === 0) issues.push({ level: "high", message: "No related blog posts linked. Add 1–2 implementation guides." });

  const metaTitle = `${solution.title} | Bethelmind Analytics`;
  const metaDescription = clampMetaDescription(`${solution.intro} Built for ${solution.targetAudience}.`);

  issues.push(...metaTitleIssues(metaTitle));
  issues.push(...metaDescriptionIssues(metaDescription));

  let score = 100;
  for (const issue of issues) score -= penalty(issue.level);

  return {
    kind: "solution",
    id: solution.id,
    title: solution.title,
    score: clampScore(score),
    metaTitle,
    metaDescription,
    issues,
  };
}

