export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: number;
};

const KEY = "bm_consent_v1";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentState | null {
  return safeJsonParse<ConsentState>(localStorage.getItem(KEY));
}

export function setConsent(next: Omit<ConsentState, "updatedAt" | "necessary"> & { updatedAt?: number }) {
  const state: ConsentState = {
    necessary: true,
    analytics: next.analytics,
    marketing: next.marketing,
    updatedAt: next.updatedAt ?? Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function hasMarketingConsent() {
  return getConsent()?.marketing === true;
}

export function hasAnalyticsConsent() {
  return getConsent()?.analytics === true;
}

