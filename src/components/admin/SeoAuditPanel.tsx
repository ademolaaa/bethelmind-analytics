import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Copy, Search } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { solutions } from "@/data/solutions";
import { AuditResult, auditBlogPost, auditSolution } from "@/lib/seoAudit";
import { cn } from "@/lib/utils";

type FilterKind = "all" | "blog" | "solution";

function badgeColor(score: number) {
  if (score >= 85) return "bg-emerald-600 text-white";
  if (score >= 70) return "bg-amber-500 text-white";
  return "bg-rose-600 text-white";
}

function levelColor(level: "high" | "medium" | "low") {
  if (level === "high") return "text-rose-700 bg-rose-50 border-rose-200";
  if (level === "medium") return "text-amber-800 bg-amber-50 border-amber-200";
  return "text-slate-700 bg-slate-50 border-slate-200";
}

function priorityCount(items: AuditResult[]) {
  let high = 0;
  let medium = 0;
  for (const item of items) {
    for (const issue of item.issues) {
      if (issue.level === "high") high += 1;
      if (issue.level === "medium") medium += 1;
    }
  }
  return { high, medium };
}

function copy(text: string) {
  if (!navigator?.clipboard?.writeText) return;
  navigator.clipboard.writeText(text).catch(() => undefined);
}

const relatedBlogBySolutionId: Record<string, string[]> = {
  "whatsapp-crm-sales-automation": ["whatsapp-sales-automation-nigeria", "whatsapp-follow-up-templates"],
  "invoice-collections-payment-automation": ["invoice-payment-reminders-whatsapp", "whatsapp-follow-up-templates"],
  "sme-website": ["mobile-first-conversion-website-nigeria"],
  "school-digitization-system": ["school-portal-checklist-results-fees-cbt"],
  "school-portal": ["school-portal-checklist-results-fees-cbt"],
  "admissions-cbt": ["school-portal-checklist-results-fees-cbt"],
};

export default function SeoAuditPanel() {
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");
  const [minScore, setMinScore] = useState(0);

  const results = useMemo(() => {
    const blog = blogPosts.map(auditBlogPost);
    const sol = solutions.map((s) => auditSolution(s, relatedBlogBySolutionId[s.id] ?? []));
    const all = [...blog, ...sol].sort((a, b) => a.score - b.score);
    return all;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return results.filter((r) => {
      if (filter !== "all" && r.kind !== filter) return false;
      if (r.score < minScore) return false;
      if (!q) return true;
      if (r.title.toLowerCase().includes(q)) return true;
      if (r.id.toLowerCase().includes(q)) return true;
      return r.issues.some((i) => i.message.toLowerCase().includes(q));
    });
  }, [filter, minScore, query, results]);

  const summary = useMemo(() => {
    const avg = results.length ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0;
    const priorities = priorityCount(results);
    return { avg, ...priorities };
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-sm font-semibold text-gray-900">SEO Audit</div>
          <div className="mt-1 text-sm text-gray-600">
            Scores are heuristic checks for meta length, CTAs, internal linking, and content structure.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-gray-500">Avg score</div>
            <div className="mt-1 text-xl font-bold text-gray-900">{summary.avg}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-gray-500">High issues</div>
            <div className="mt-1 text-xl font-bold text-rose-700">{summary.high}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="text-xs font-semibold text-gray-500">Medium issues</div>
            <div className="mt-1 text-xl font-bold text-amber-700">{summary.medium}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {(["all", "blog", "solution"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={cn(
                  "px-3 py-2 text-sm font-semibold transition-colors",
                  filter === k ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                {k === "all" ? "All" : k === "blog" ? "Blog" : "Solutions"}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Search title, slug, or issue…"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-700">Min score</div>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={`${r.kind}:${r.id}`} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-[240px] flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold", badgeColor(r.score))}>
                    {r.score}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700">
                    {r.kind === "blog" ? "Blog" : "Solution"}
                  </span>
                  <span className="text-xs text-gray-500">{r.id}</span>
                </div>
                <div className="mt-2 text-base font-semibold text-gray-900">{r.title}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700"
                  onClick={() => copy(`${r.metaTitle}\n${r.metaDescription}`)}
                  title="Copy meta title + description"
                >
                  <Copy className="h-4 w-4" />
                  Copy meta
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs font-semibold text-gray-500">Meta title</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{r.metaTitle}</div>
                <div className="mt-3 text-xs font-semibold text-gray-500">Meta description</div>
                <div className="mt-1 text-sm text-gray-800">{r.metaDescription}</div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold text-gray-500">Issues</div>
                {r.issues.length === 0 ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle className="h-4 w-4" />
                    No issues found.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {r.issues.slice(0, 8).map((issue, idx) => (
                      <div key={idx} className={cn("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", levelColor(issue.level))}>
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">{issue.message}</div>
                      </div>
                    ))}
                    {r.issues.length > 8 && (
                      <div className="text-xs text-gray-500">+{r.issues.length - 8} more</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
            No results match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

