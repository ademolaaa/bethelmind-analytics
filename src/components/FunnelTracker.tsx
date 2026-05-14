import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { captureAttribution } from "@/lib/attribution";
import { recordTouchpoint } from "@/lib/leadScore";
import { trackEvent } from "@/lib/analytics";

function touchpointFromPath(pathname: string) {
  if (pathname === "/") return "view_home" as const;
  if (pathname === "/pricing") return "view_pricing" as const;
  if (pathname === "/booking") return "booking_start" as const;
  if (pathname === "/free-audit") return "view_solution" as const;
  if (pathname === "/whatsapp") return "view_whatsapp_landing" as const;
  if (pathname.startsWith("/solutions/")) return "view_solution" as const;
  return null;
}

export default function FunnelTracker() {
  const location = useLocation();

  useEffect(() => {
    captureAttribution({
      pathname: location.pathname,
      search: location.search,
      referrer: document.referrer || undefined,
    });

    const tp = touchpointFromPath(location.pathname);
    const score = tp ? recordTouchpoint(tp) : null;
    trackEvent("funnel_view", { path: `${location.pathname}${location.search}` });

    if (score?.stage === "hot") {
      const key = "bm_lead_ready_sent";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "true");
        trackEvent("lead_ready", { path: `${location.pathname}${location.search}`, score: score.score });
      }
    }
  }, [location.pathname, location.search]);

  return null;
}

