type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: unknown[];
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

export function initMetaPixel(pixelId?: string) {
  if (!pixelId) return;
  if (typeof window === "undefined") return;
  if (window.fbq) return;

  const fbq: Fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue = fbq.queue || [];
      fbq.queue.push(args);
    }
  } as Fbq;

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";

  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", pixelId);
}

export function trackPageView() {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  window.fbq("track", "PageView");
}

export function trackLead(params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  if (params) {
    window.fbq("track", "Lead", params);
    return;
  }
  window.fbq("track", "Lead");
}

export function trackMetaEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  if (params) {
    window.fbq("trackCustom", event, params);
    return;
  }
  window.fbq("trackCustom", event);
}

