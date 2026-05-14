import { useEffect, useState } from "react";
import { setConsent, getConsent } from "@/lib/consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    setVisible(!existing);

    const open = () => setVisible(true);
    window.addEventListener("bm_open_consent", open);
    return () => window.removeEventListener("bm_open_consent", open);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-2xl p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-700 leading-relaxed">
            <div className="font-display font-bold text-slate-900">Cookies & tracking preferences</div>
            <div className="mt-1 text-slate-600">
              We use essential cookies for core functionality. With your consent, we also use analytics and marketing
              tracking to measure funnel performance and improve results.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              onClick={() => {
                setConsent({ analytics: false, marketing: false });
                window.dispatchEvent(new Event("bm_consent_changed"));
                setVisible(false);
              }}
            >
              Essential only
            </button>
            <button
              type="button"
              className="rounded-2xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
              onClick={() => {
                setConsent({ analytics: true, marketing: false });
                window.dispatchEvent(new Event("bm_consent_changed"));
                setVisible(false);
              }}
            >
              Accept analytics
            </button>
            <button
              type="button"
              className="lux-button rounded-2xl"
              onClick={() => {
                setConsent({ analytics: true, marketing: true });
                window.dispatchEvent(new Event("bm_consent_changed"));
                setVisible(false);
              }}
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

