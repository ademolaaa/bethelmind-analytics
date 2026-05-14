import { useState, useEffect, useMemo } from "react";
import { X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useContent } from "@/context/useContent";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getLeadScore, recordTouchpoint } from "@/lib/leadScore";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { buildWhatsAppMessage, getWhatsAppUrls, normalizeWhatsAppPhone } from "@/lib/whatsapp";

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState("");
  const location = useLocation();
  const { content } = useContent();
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !localStorage.getItem("exitPopupShown")) {
        setIsVisible(true);
        setHasShown(true);
        localStorage.setItem("exitPopupShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const closePopup = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closePopup}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-lg w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/85 backdrop-blur shadow-2xl p-8"
          >
            <button
              onClick={closePopup}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-2xl border border-brand-teal/15 bg-brand-teal/10 p-3 mb-4">
                <FileText className="h-8 w-8 text-brand-teal" />
              </div>
              
              <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">
                Wait! Before you go...
              </h3>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Get our free guide: <br />
                <span className="font-semibold text-slate-900">"10 Ways Nigerian Businesses Lose Money Online (And How to Fix Them)"</span>
              </p>

              <form
                className="w-full space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  closePopup();

                  const leadId = getLeadId();
                  const stage = getLeadScore().stage;
                  const phoneDisplay = content?.contact?.info?.phone || "+234 812 345 6789";
                  const phoneDigits = normalizeWhatsAppPhone(phoneDisplay);

                  const message = buildWhatsAppMessage({
                    locale,
                    leadId,
                    source: "exit_intent_popup",
                    stage,
                    extraLines: [
                      "Offer: 10 Ways Nigerian Businesses Lose Money Online",
                      email ? `Email: ${email}` : null,
                    ].filter(Boolean) as string[],
                    firstTouch: getFirstTouch(),
                    lastTouch: getLastTouch(),
                  });

                  recordTouchpoint("lead_magnet_submit");
                  trackEvent("lead_magnet_submit", { source: "exit_intent_popup", path: `${location.pathname}${location.search}` });
                  trackEvent("whatsapp_click", { source: "exit_intent_popup", path: `${location.pathname}${location.search}` });

                  const urls = getWhatsAppUrls({ phoneDigits, text: message });
                  window.location.assign(urls.universal);
                }}
              >
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="lux-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full lux-button"
                >
                  Send Me The Guide
                </button>
              </form>
              
              <p className="mt-4 text-xs text-slate-500">
                Used by 200+ business owners to grow revenue.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
