import { useEffect } from "react";
import { initMetaPixel, trackPageView } from "@/lib/metaPixel";
import { hasMarketingConsent } from "@/lib/consent";

function boot() {
  if (!hasMarketingConsent()) return;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;
  if (!pixelId) return;
  initMetaPixel(pixelId);
  trackPageView();
}

export default function TrackingBootstrap() {
  useEffect(() => {
    boot();
    const handler = () => boot();
    window.addEventListener("bm_consent_changed", handler);
    return () => window.removeEventListener("bm_consent_changed", handler);
  }, []);

  return null;
}

