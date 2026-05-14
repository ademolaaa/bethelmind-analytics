import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, X } from "lucide-react";
import { getLeadId, trackEvent } from "@/lib/analytics";
import { getFirstTouch, getLastTouch } from "@/lib/attribution";
import { getPreferredLocale } from "@/lib/i18n";
import { getLeadScore } from "@/lib/leadScore";
import { buildWhatsAppMessage } from "@/lib/whatsapp";

type Props = {
  open: boolean;
  onClose: () => void;
  source: string;
  subjectLabel: string;
  service?: string;
  timeline?: string;
  budget?: string;
};

export default function EmailLeadModal(props: Props) {
  const { open, onClose, source, subjectLabel, service, timeline, budget } = props;
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;

  const leadId = useMemo(() => getLeadId(), []);
  const locale = useMemo(() => getPreferredLocale(location.search), [location.search]);

  const message = useMemo(() => {
    const score = getLeadScore();
    const first = getFirstTouch();
    const last = getLastTouch();
    return buildWhatsAppMessage({
      locale,
      leadId,
      source,
      stage: score.stage,
      service,
      timeline,
      budget,
      firstTouch: first,
      lastTouch: last,
      variant: "email",
    });
  }, [budget, leadId, locale, service, source, timeline]);

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setErrorText(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previousActive = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      const focusables = dialog?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousActive?.focus?.();
    };
  }, [onClose, open]);

  async function submit() {
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorText(null);
    trackEvent("email_lead_submit", { source, subjectLabel, path: `${location.pathname}${location.search}` });

    try {
      const firstTouch = getFirstTouch();
      const lastTouch = getLastTouch();
      const res = await fetch("/api/leads.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          lead_id: leadId,
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
          channel: "email",
          source,
          subject: subjectLabel,
          message,
          path: `${location.pathname}${location.search}`,
          first_touch: firstTouch,
          last_touch: lastTouch,
        }),
      });

      const data = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit lead");
      }

      setStatus("success");
      trackEvent("email_lead_success", { source, subjectLabel, path: `${location.pathname}${location.search}` });
    } catch (e) {
      setStatus("error");
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setErrorText(msg);
      trackEvent("email_lead_error", { source, subjectLabel, error: msg, path: `${location.pathname}${location.search}` });
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
          />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200">
              <div>
                <div id={titleId} className="font-display font-bold text-slate-900">Get a reply by email</div>
                <div id={descriptionId} className="mt-1 text-sm text-slate-600">
                  Share your details. We’ll reply with next steps and a quote range.
                </div>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {status === "success" ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                  <div className="text-lg font-display font-bold text-emerald-900">Submitted</div>
                  <div className="mt-2 text-sm text-emerald-800">
                    Thanks. We’ll reach out shortly. If you prefer WhatsApp, you can still message us from this page.
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Full name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                        placeholder="name@company.com"
                        autoComplete="email"
                        inputMode="email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Phone / WhatsApp (optional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/25"
                      placeholder="+234..."
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message preview</div>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800 font-sans leading-relaxed">
                      {message}
                    </pre>
                  </div>

                  {status === "error" && errorText && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                      {errorText}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!email || status === "submitting"}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {status === "submitting" ? "Sending..." : "Send via email"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              <div className="text-xs text-slate-500">
                We include attribution parameters (UTMs/click IDs) to measure ad performance.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
