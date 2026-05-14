import { getOrCreateId } from "@/lib/id";
import { hasAnalyticsConsent, hasMarketingConsent } from "@/lib/consent";

export type AnalyticsEventName =
  | "funnel_view"
  | "lead_ready"
  | "landing_view"
  | "landing_option_select"
  | "whatsapp_click"
  | "whatsapp_fallback_opened"
  | "whatsapp_message_copied"
  | "phone_click"
  | "booking_click"
  | "lead_magnet_submit"
  | "contact_submit"
  | "email_lead_opened"
  | "email_lead_submit"
  | "email_lead_success"
  | "email_lead_error";

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  ts: number;
  event_id: string;
  lead_id: string;
  session_id: string;
  props?: Record<string, unknown>;
};

const EVENTS_KEY = "bm_events_v1";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getLeadId() {
  return getOrCreateId("bm_lead_id");
}

export function getSessionId() {
  const key = "bm_session_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  sessionStorage.setItem(key, id);
  return id;
}

export function getStoredEvents() {
  return safeJsonParse<AnalyticsEvent[]>(localStorage.getItem(EVENTS_KEY)) ?? [];
}

function storeEvent(event: AnalyticsEvent) {
  if (!hasAnalyticsConsent()) return;
  const existing = getStoredEvents();
  const next = [...existing, event].slice(-500);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
}

function sendEventToServer(event: AnalyticsEvent) {
  if (!hasAnalyticsConsent()) return;
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(event);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/events.php", blob);
      return;
    }
  } catch {
  }

  fetch("/api/events.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: payload,
  }).catch(() => undefined);
}

export function trackEvent(name: AnalyticsEventName, props?: Record<string, unknown>) {
  const event: AnalyticsEvent = {
    name,
    ts: Date.now(),
    event_id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    lead_id: getLeadId(),
    session_id: getSessionId(),
    props,
  };

  storeEvent(event);
  sendEventToServer(event);

  if (hasMarketingConsent() && typeof window !== "undefined" && window.fbq) {
    const fbqProps = { ...props, event_id: event.event_id, lead_id: event.lead_id, session_id: event.session_id };
    if (name === "whatsapp_click") {
      window.fbq("track", "Lead", fbqProps);
    } else {
      window.fbq("trackCustom", name, fbqProps);
    }
  }

  if (hasAnalyticsConsent() && typeof window !== "undefined") {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag("event", name, { ...props, event_id: event.event_id });
    }
  }

  return event;
}
