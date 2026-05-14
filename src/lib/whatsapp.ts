import type { Locale } from "@/lib/i18n";
import type { AttributionSnapshot } from "@/lib/attribution";

export function normalizeWhatsAppPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "") || "2348123456789";
}

export function getWhatsAppUrls(args: { phoneDigits: string; text: string }) {
  const encoded = encodeURIComponent(args.text);
  return {
    universal: `https://wa.me/${args.phoneDigits}?text=${encoded}`,
    web: `https://web.whatsapp.com/send?phone=${args.phoneDigits}&text=${encoded}`,
    api: `https://api.whatsapp.com/send?phone=${args.phoneDigits}&text=${encoded}`,
  };
}

function baseGreeting(locale: Locale) {
  switch (locale) {
    case "fr":
      return "Bonjour Bethelmind, je veux commencer.";
    case "yo":
      return "Báwo ni Bethelmind, mo fẹ́ bẹ̀rẹ̀.";
    case "ha":
      return "Sannu Bethelmind, ina son farawa.";
    default:
      return "Hi Bethelmind, I want to get started.";
  }
}

function label(locale: Locale, key: "service" | "timeline" | "budget" | "stage" | "source" | "lead_id") {
  const map: Record<Locale, Record<typeof key, string>> = {
    en: { service: "Service", timeline: "Timeline", budget: "Budget", stage: "Stage", source: "Source", lead_id: "Lead ID" },
    fr: { service: "Service", timeline: "Délai", budget: "Budget", stage: "Niveau", source: "Source", lead_id: "ID" },
    yo: { service: "Iṣẹ́", timeline: "Àkókò", budget: "Owó", stage: "Ipele", source: "Orísun", lead_id: "ID" },
    ha: { service: "Aiki", timeline: "Lokaci", budget: "Kasafi", stage: "Mataki", source: "Tushe", lead_id: "ID" },
  };
  return map[locale][key];
}

function attributionLine(prefix: string, snapshot: AttributionSnapshot | null) {
  if (!snapshot) return null;
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid", "ttclid"] as const;
  const entries = keys.map((k) => [k, snapshot[k]] as const).filter(([, v]) => Boolean(v));
  if (entries.length === 0) return null;
  return `${prefix}: ${entries.map(([k, v]) => `${k}=${v}`).join(", ")}`;
}

export function buildWhatsAppMessage(args: {
  locale: Locale;
  leadId: string;
  source: string;
  stage: string;
  service?: string;
  timeline?: string;
  budget?: string;
  firstTouch?: AttributionSnapshot | null;
  lastTouch?: AttributionSnapshot | null;
  variant?: string;
  extraLines?: string[];
}) {
  const lines: string[] = [baseGreeting(args.locale)];

  lines.push(`${label(args.locale, "source")}: ${args.source}${args.variant ? ` (${args.variant})` : ""}`);
  lines.push(`${label(args.locale, "stage")}: ${args.stage}`);
  if (args.service) lines.push(`${label(args.locale, "service")}: ${args.service}`);
  if (args.timeline) lines.push(`${label(args.locale, "timeline")}: ${args.timeline}`);
  if (args.budget) lines.push(`${label(args.locale, "budget")}: ${args.budget}`);
  lines.push(`${label(args.locale, "lead_id")}: ${args.leadId}`);
  if (args.extraLines && args.extraLines.length > 0) lines.push(...args.extraLines);

  const first = attributionLine("First touch", args.firstTouch ?? null);
  const last = attributionLine("Last touch", args.lastTouch ?? null);
  if (first) lines.push(first);
  if (last) lines.push(last);

  return lines.join("\n");
}
