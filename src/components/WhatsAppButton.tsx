import { MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getPreferredLocale } from "@/lib/i18n";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import WhatsAppFallbackModal from "@/components/WhatsAppFallbackModal";

export default function WhatsAppButton() {
  const { content } = useContent();
  const location = useLocation();
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
  const phoneDigits = useMemo(() => normalizeWhatsAppPhone(phoneDisplay), [phoneDisplay]);
  const leadId = useMemo(() => getLeadId(), []);
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);
  const score = useMemo(() => getLeadScore(), []);

  const message = useMemo(() => {
    return buildWhatsAppMessage({
      locale,
      leadId,
      source: "floating_button",
      stage: score.stage,
      firstTouch: getFirstTouch(),
      lastTouch: getLastTouch(),
    });
  }, [leadId, locale, score.stage]);

  const urls = useMemo(() => getWhatsAppUrls({ phoneDigits, text: message }), [message, phoneDigits]);
  const email = content?.contact?.info?.email || "support@bethelmind.com";

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <a
        href={urls.universal}
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="block"
        onClick={() => {
          recordTouchpoint("whatsapp_click");
          trackEvent("whatsapp_click", { source: "floating_button", path: `${location.pathname}${location.search}` });
        }}
      >
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-200/40 transition-transform duration-300 group-hover:scale-105 group-hover:bg-emerald-600">
          <MessageCircle className="h-6 w-6" />
        </div>
      </a>

      <div className="pointer-events-none absolute right-16 bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="pointer-events-auto rounded-2xl bg-slate-900 text-white text-sm font-semibold px-3 py-2 shadow-lg whitespace-nowrap">
          <div>Chat on WhatsApp</div>
          <button
            type="button"
            className="mt-2 block w-full text-left text-xs font-semibold text-white/80 hover:text-white underline underline-offset-4"
            onClick={() => {
              trackEvent("whatsapp_fallback_opened", { source: "floating_button", path: `${location.pathname}${location.search}` });
              setFallbackOpen(true);
            }}
          >
            No WhatsApp?
          </button>
        </div>
      </div>

      <WhatsAppFallbackModal
        open={fallbackOpen}
        onClose={() => setFallbackOpen(false)}
        email={email}
        phoneDisplay={phoneDisplay}
        phoneDigits={phoneDigits}
        message={message}
      />
    </div>
  );
}
