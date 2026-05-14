import { PropsWithChildren, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { pickVariant } from "@/lib/experiments";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getPreferredLocale } from "@/lib/i18n";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import WhatsAppFallbackModal from "@/components/WhatsAppFallbackModal";
import { cn } from "@/lib/utils";

type WhatsAppCTAProps = PropsWithChildren<{
  source: string;
  service?: string;
  timeline?: string;
  budget?: string;
  className?: string;
  experimentKey?: string;
  variants?: readonly string[];
  hrefOnly?: boolean;
  showFallbackLink?: boolean;
  onClick?: () => void;
}>;

export default function WhatsAppCTA(props: WhatsAppCTAProps) {
  const location = useLocation();
  const { content } = useContent();
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const leadId = useMemo(() => getLeadId(), []);
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);

  const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
  const phoneDigits = useMemo(() => normalizeWhatsAppPhone(phoneDisplay), [phoneDisplay]);

  const variant = useMemo(() => {
    const variants = props.variants ?? (["A", "B"] as const);
    const key = props.experimentKey ?? "wa_invite_copy_v1";
    return pickVariant({ experimentKey: key, subjectId: leadId, variants });
  }, [leadId, props.experimentKey, props.variants]);

  const message = useMemo(() => {
    const score = getLeadScore();
    const first = getFirstTouch();
    const last = getLastTouch();
    return buildWhatsAppMessage({
      locale,
      leadId,
      source: props.source,
      stage: score.stage,
      service: props.service,
      timeline: props.timeline,
      budget: props.budget,
      firstTouch: first,
      lastTouch: last,
      variant,
    });
  }, [leadId, locale, props.budget, props.service, props.source, props.timeline, variant]);

  const urls = useMemo(() => getWhatsAppUrls({ phoneDigits, text: message }), [message, phoneDigits]);

  const email = content?.contact?.info?.email || "support@bethelmind.com";

  if (props.hrefOnly) {
    return (
      <a href={urls.universal} className={props.className} rel="noopener noreferrer">
        {props.children}
      </a>
    );
  }

  return (
    <>
      <a
        href={urls.universal}
        className={cn(props.className)}
        aria-label="Chat on WhatsApp"
        rel="noopener noreferrer"
        onClick={() => {
          props.onClick?.();
          recordTouchpoint("whatsapp_click");
          trackEvent("whatsapp_click", {
            source: props.source,
            variant,
            locale,
            path: `${location.pathname}${location.search}`,
            service: props.service,
            timeline: props.timeline,
            budget: props.budget,
          });
        }}
      >
        {props.children}
      </a>

      {(props.showFallbackLink ?? true) && (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-luxury-champagne/70 hover:text-luxury-champagne underline underline-offset-4 decoration-luxury-gold/40 hover:decoration-luxury-gold"
          onClick={() => {
            trackEvent("whatsapp_fallback_opened", { source: props.source, path: `${location.pathname}${location.search}` });
            setFallbackOpen(true);
          }}
        >
          No WhatsApp? Use email/phone instead
        </button>
      )}

      <WhatsAppFallbackModal
        open={fallbackOpen}
        onClose={() => setFallbackOpen(false)}
        source={props.source}
        subjectLabel={props.service ?? "Project inquiry"}
        service={props.service}
        timeline={props.timeline}
        budget={props.budget}
        email={email}
        phoneDisplay={phoneDisplay}
        phoneDigits={phoneDigits}
        message={message}
      />
    </>
  );
}
