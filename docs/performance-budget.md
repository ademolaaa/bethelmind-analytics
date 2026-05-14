# Performance Budget (Target: Lighthouse >90)

## Budgets
- Lighthouse: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90
- JS (initial): keep route-level code-splitting enabled (already used via React lazy)
- Images: use responsive `srcSet` with 1x/2x/3x where available; always `loading="lazy"` below the fold
- Motion: respect `prefers-reduced-motion`; avoid scroll handlers without throttling

## How to Run a Local Audit
1. Build and preview:
   - `npm run build`
   - `npm run preview -- --host localhost --port 4173`
2. Run Lighthouse (requires Chrome installed):
   - `npx lighthouse http://localhost:4173 --preset=desktop --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo`

## Implementation Guardrails in This Repo
- Critical UI routes are lazy-loaded to reduce initial JS.
- Parallax and animations use Framer Motion and degrade to static when motion is reduced.
- Section rendering uses `content-visibility: auto` to reduce offscreen work on long pages.
