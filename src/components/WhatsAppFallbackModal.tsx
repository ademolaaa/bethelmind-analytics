import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Copy, Mail, Phone } from "lucide-react";
import EmailLeadModal from "@/components/EmailLeadModal";
import { trackEvent } from "@/lib/analytics";

export default function WhatsAppFallbackModal(props: {
  open: boolean;
  onClose: () => void;
  source?: string;
  subjectLabel?: string;
  service?: string;
  timeline?: string;
  budget?: string;
  email: string;
  phoneDisplay: string;
  phoneDigits: string;
  message: string;
}) {
  const { open, onClose, email, phoneDisplay, phoneDigits, message } = props;
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;

  useEffect(() => {
    if (!open) return;

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
  }, [open, onClose]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Project inquiry");
    const body = encodeURIComponent(message);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }, [email, message]);

  const telHref = useMemo(() => {
    const digits = phoneDisplay.replace(/[^\d+]/g, "");
    return `tel:${digits}`;
  }, [phoneDisplay]);

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
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 backdrop-blur shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200">
              <div>
                <div id={titleId} className="font-display font-bold text-slate-900">No WhatsApp?</div>
                <div id={descriptionId} className="mt-1 text-sm text-slate-600">Use email or phone, or copy the message.</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {props.source ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEmailOpen(true);
                      trackEvent("email_lead_opened", { source: props.source });
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </button>
                ) : (
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </a>
                )}
                <a
                  href={telHref}
                  onClick={() => {
                    if (props.source) trackEvent("phone_click", { source: props.source });
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                >
                  <Phone className="mr-2 h-4 w-4" /> Call
                </a>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Message</div>
                <pre className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800 font-sans leading-relaxed">
                  {message}
                </pre>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(message);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                        if (props.source) trackEvent("whatsapp_message_copied", { source: props.source });
                      } catch {
                        setCopied(false);
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? "Copied" : "Copy message"}
                  </button>
                  <a
                    href={`https://web.whatsapp.com/send?phone=${phoneDigits}&text=${encodeURIComponent(message)}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    Open WhatsApp Web
                  </a>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                We include non-personal attribution parameters (e.g., UTMs) to measure marketing performance.
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <EmailLeadModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        source={props.source ?? "fallback"}
        subjectLabel={props.subjectLabel ?? props.service ?? "Project inquiry"}
        service={props.service}
        timeline={props.timeline}
        budget={props.budget}
      />
    </AnimatePresence>
  );
}
