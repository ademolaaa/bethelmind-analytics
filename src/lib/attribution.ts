import { hasAnalyticsConsent } from "@/lib/consent";

export type AttributionParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
};

export type AttributionSnapshot = AttributionParams & {
  path?: string;
  referrer?: string;
  ts: number;
};

const FIRST_TOUCH_KEY = "bm_attribution_first";
const LAST_TOUCH_KEY = "bm_attribution_last";

const TRACK_KEYS: (keyof AttributionParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ttclid",
];

export function pickAttribution(searchParams: URLSearchParams): AttributionParams {
  const out: AttributionParams = {};
  for (const key of TRACK_KEYS) {
    const value = searchParams.get(key);
    if (value) out[key] = value;
  }
  return out;
}

function hasAnyAttribution(value: AttributionParams) {
  return Object.values(value).some(Boolean);
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getFirstTouch(): AttributionSnapshot | null {
  return safeJsonParse<AttributionSnapshot>(localStorage.getItem(FIRST_TOUCH_KEY));
}

export function getLastTouch(): AttributionSnapshot | null {
  return safeJsonParse<AttributionSnapshot>(sessionStorage.getItem(LAST_TOUCH_KEY));
}

export function captureAttribution(args: {
  pathname: string;
  search: string;
  referrer?: string;
}) {
  const searchParams = new URLSearchParams(args.search);
  const params = pickAttribution(searchParams);
  if (!hasAnyAttribution(params)) return;

  const snapshot: AttributionSnapshot = {
    ...params,
    path: `${args.pathname}${args.search || ""}`,
    referrer: args.referrer,
    ts: Date.now(),
  };

  const first = getFirstTouch();
  if (!first && hasAnalyticsConsent()) localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(snapshot));
  sessionStorage.setItem(LAST_TOUCH_KEY, JSON.stringify(snapshot));
}

export function toAttributionLine(prefix: string, snapshot: AttributionSnapshot | null) {
  if (!snapshot) return null;
  const entries = TRACK_KEYS.map((k) => [k, snapshot[k]] as const).filter(([, v]) => Boolean(v));
  if (entries.length === 0) return null;
  const text = entries.map(([k, v]) => `${k}=${v}`).join(", ");
  return `${prefix}: ${text}`;
}

