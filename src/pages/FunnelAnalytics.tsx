import { useMemo } from "react";
import { getStoredEvents } from "@/lib/analytics";
import { getConsent } from "@/lib/consent";
import Seo from "@/components/Seo";

function countByName(events: ReturnType<typeof getStoredEvents>) {
  const counts: Record<string, number> = {};
  for (const ev of events) counts[ev.name] = (counts[ev.name] ?? 0) + 1;
  return counts;
}

export default function FunnelAnalytics() {
  const consent = getConsent();
  const events = useMemo(() => getStoredEvents(), []);
  const counts = useMemo(() => countByName(events), [events]);

  const views = counts.funnel_view ?? 0;
  const whatsappClicks = counts.whatsapp_click ?? 0;
  const leadMagnet = counts.lead_magnet_submit ?? 0;
  const contact = counts.contact_submit ?? 0;
  const leadReady = counts.lead_ready ?? 0;

  const rate = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 1000) / 10}%` : "—");

  if (!consent?.analytics) {
    return (
      <section className="min-h-screen bg-brand-cream px-4 sm:px-6 lg:px-8 py-20">
        <Seo
          title="Funnel Analytics | Bethelmind Analytics"
          description="Internal analytics dashboard for tracking funnel events on this device."
          canonicalPath="/funnel-analytics"
          robots="noindex,nofollow"
        />
        <div className="mx-auto max-w-3xl lux-card p-8">
          <h1 className="text-3xl font-display font-bold text-slate-900">Funnel Analytics</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Analytics storage is disabled. Enable analytics in Cookie Preferences to measure funnel-to-WhatsApp performance.
          </p>
          <button
            type="button"
            className="mt-6 lux-button"
            onClick={() => window.dispatchEvent(new Event("bm_open_consent"))}
          >
            Open Cookie Preferences
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-brand-cream px-4 sm:px-6 lg:px-8 py-20">
      <Seo
        title="Funnel Analytics | Bethelmind Analytics"
        description="Internal analytics dashboard for tracking funnel events on this device."
        canonicalPath="/funnel-analytics"
        robots="noindex,nofollow"
      />
      <div className="mx-auto max-w-5xl">
        <div className="lux-card p-8 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Funnel Analytics</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Local device metrics (last 500 events). Use this to validate tracking and compute funnel-to-chat conversion.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Page views", value: views },
              { label: "WhatsApp clicks", value: whatsappClicks },
              { label: "Lead magnet submits", value: leadMagnet },
              { label: "Contact submits", value: contact },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5">
                <div className="text-sm font-semibold text-slate-600">{kpi.label}</div>
                <div className="mt-2 text-3xl font-display font-bold text-slate-900">{kpi.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6">
              <div className="text-lg font-display font-bold text-slate-900">Conversion rates</div>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Views → WhatsApp click</span>
                  <span className="font-semibold">{rate(whatsappClicks, views)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Views → Lead magnet submit</span>
                  <span className="font-semibold">{rate(leadMagnet, views)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lead-ready signal</span>
                  <span className="font-semibold">{leadReady}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6">
              <div className="text-lg font-display font-bold text-slate-900">Event breakdown</div>
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {Object.entries(counts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between">
                      <span className="font-medium">{name}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-6">
            <div className="text-sm font-semibold text-slate-900">Notes</div>
            <div className="mt-2 text-sm text-slate-600 leading-relaxed">
              For production reporting, forward these events to your analytics backend (GA4, Segment, PostHog, or your own API).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
