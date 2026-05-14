# Bethelmind Luxury Design System

## Principles
- Luxury aesthetic: deep blacks, rich golds, pristine whites, subtle accents
- Precision: sharp edges, clean lines, consistent spacing scale
- Performance: minimal layout shift, content-visibility, reduced motion
- Accessibility: WCAG 2.1 AA color contrast, keyboard focus, skip links

## Tokens (CSS Variables)
- Colors
  - --lux-bg: site background (pristine champagne)
  - --lux-surface / --lux-surface-strong: glass panels
  - --lux-ink / --lux-ink-muted: primary text and muted text
  - --lux-border: subtle hairline borders
  - Accents: --lux-accent, --lux-accent-2, --lux-accent-ink
- Radii
  - --lux-radius-lg, --lux-radius-md, --lux-radius-sm
- Motion
  - --lux-ease, --lux-ease-inout
  - --lux-dur-fast, --lux-dur, --lux-dur-slow
- Layout
  - --lux-max: container max-width (responsive via media queries)

See [tokens/_index.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/tokens/_index.scss) for source.

## Typography
- Heading family: Playfair Display (serif) for premium display
- Body family: Inter (sans-serif) for clarity
- Responsive heading sizes defined in [index.css](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/index.css#L94-L133)
- Base text rendering and smoothing in [base/_typography.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/base/_typography.scss)

## Components
- Buttons
  - .lux-button: gold gradient primary with sheen micro-interaction
  - .lux-button-secondary: outlined, subtle hover fill
  - Source: [components/_buttons.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/components/_buttons.scss)
- Cards
  - .lux-card: glassmorphism surface
  - .lux-card-dark: dark premium variant
  - .lux-card-interactive: hover elevation & accessible focus ring
  - .lux-card-hover: reusable hover transition
  - Source: [components/_cards.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/components/_cards.scss)
- Layout
  - .lux-container: responsive max-width
  - .lux-section: generous vertical rhythm + content-visibility
  - .lux-nav: premium, subtle glassmorphism
  - .lux-hairline: 1px gold hairline divider
  - .lux-hero-gradient / .lux-cta-gradient: premium sections
  - Source: [base/_layout.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/base/_layout.scss)
- A11y
  - :focus-visible outline, screen-reader utilities, skip link
  - Reduced motion safeguard globally
  - Source: [base/_a11y.scss](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/styles/base/_a11y.scss)

## Tailwind Configuration
- Color map includes luxury palette for runtime utilities
- Font families provide display/body pairing
- Shadows, radius, spacing extended for premium feel
- Source: [tailwind.config.js](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/tailwind.config.js)

## Implementation Guidelines
- Spacing
  - Use .lux-container and .lux-section for consistent rhythm
  - Prefer 4/8/12/16/24/32px multiples for padding/margins
- Motion
  - Keep transitions at 200–350ms; avoid excessive blur/shadows
  - Respect prefers-reduced-motion (Parallax already supports)
- Color & Contrast
  - Ensure contrast ≥ 4.5:1 for body text; ≥ 3:1 for large text
  - Use gold accents sparingly; keep sufficient contrast on dark surfaces
- Performance
  - Use content-visibility on below-the-fold sections
  - Lazy-load non-critical images (loading="lazy")
  - Avoid layout shifts; set image dimensions
- Accessibility
  - Maintain keyboard focus styles
  - Include skip link and landmark roles where applicable

## Examples
- Premium hero and CTA sections
  - See usage in [Home.tsx](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/pages/Home.tsx#L104-L171)
- Navigation glassmorphism and menu overlay
  - See [Navbar.tsx](file:///c:/Users/HomePC/Desktop/website%20Projects/Bethelmind_Analytics/src/components/Navbar.tsx#L76-L111)

## Lighthouse & WCAG
- Target performance ≥95
  - Minimize heavy shadows, reduce repaint areas
  - Use CSS transforms for hover; avoid large filters
- WCAG 2.1 AA
  - Contrast checked across primary combinations
  - Keyboard and reduced motion supported

