export type BlogBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "cta"; title: string; description: string; href: string; label: string }
  | { type: "links"; title: string; items: Array<{ label: string; href: string }> };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  ogImage?: string;
  blocks: BlogBlock[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "whatsapp-sales-automation-nigeria",
    title: "WhatsApp Sales Automation in Nigeria: A Practical Playbook for SMEs",
    description: "A step-by-step WhatsApp CRM workflow for Nigerian SMEs: shared inbox, templates, follow-ups, pipeline stages, and tracking to close more sales.",
    date: "2026-02-09",
    tags: ["WhatsApp", "Sales", "Automation", "Nigeria"],
    ogImage: "/images/lux-hero.svg",
    blocks: [
      { type: "p", text: "If your business sells on WhatsApp, your biggest growth blocker is rarely ads. It’s follow-up, speed, and consistency. This playbook shows a simple system Nigerian SMEs can run daily to reply faster, stop losing chats, and convert more leads." },
      { type: "h2", text: "What most WhatsApp-based businesses get wrong" },
      { type: "ul", items: [
        "One WhatsApp number = one staff member (no visibility when they’re offline).",
        "No pipeline stages (every chat looks the same).",
        "No follow-up rule (leads go cold silently).",
        "No templates (retyping prices and FAQs wastes time).",
      ]},
      { type: "h2", text: "The workflow that works (New → Interested → Paid → Delivered)" },
      { type: "p", text: "Start with 4 stages. You can add more later, but keep it simple so your team actually uses it. Every conversation must be in one stage at all times." },
      { type: "h3", text: "Stage 1: New" },
      { type: "p", text: "Goal: qualify fast. Reply within 5 minutes during working hours. Use a template that asks 2–3 questions (budget, timeline, location) so you don’t waste 30 messages." },
      { type: "h3", text: "Stage 2: Interested" },
      { type: "p", text: "Goal: move to payment. Send a quote range + proof (case studies, screenshots, testimonials). Add a follow-up rule: if no reply in 3 hours, send a quick nudge; if no reply in 24 hours, send a value message (FAQ, result story)." },
      { type: "h3", text: "Stage 3: Paid" },
      { type: "p", text: "Goal: confirm scope and set expectations. Collect key details in one message: deliverables, deadline, and next steps. Send a single onboarding checklist link if possible." },
      { type: "h3", text: "Stage 4: Delivered" },
      { type: "p", text: "Goal: reduce refunds and generate referrals. Send delivery confirmation + how-to-use + a review request. Tag the customer for upsell later." },
      { type: "h2", text: "Templates you should create today" },
      { type: "ul", items: [
        "Fast reply: “Hi! Thanks for reaching out. What are you trying to achieve, and when do you need it?”",
        "Pricing anchor: “Most projects fall into ₦X–₦Y depending on scope. If you answer 3 quick questions, I’ll send a clear quote range.”",
        "Proof: “Here are 2 recent outcomes + what we changed. Which one feels closest to your business?”",
        "Reminder: “Quick follow-up — do you want to proceed or should I close this for now?”",
      ]},
      { type: "h2", text: "Tracking: the only numbers that matter" },
      { type: "ul", items: [
        "Median first response time",
        "Follow-ups sent per lead",
        "Leads moved to Paid",
        "Drop-off reasons (price, timing, trust, not serious)",
      ]},
      { type: "links", title: "Related solutions", items: [
        { label: "WhatsApp CRM & Sales Automation", href: "/solutions/whatsapp-crm-sales-automation" },
        { label: "Invoice, Collections & Payment Automation", href: "/solutions/invoice-collections-payment-automation" },
      ]},
      { type: "cta", title: "Want this set up for your team?", description: "Chat on WhatsApp and we’ll recommend the fastest setup for your volume and budget.", href: "/whatsapp", label: "Chat on WhatsApp" },
    ],
  },
  {
    slug: "whatsapp-follow-up-templates",
    title: "WhatsApp Follow-Up Templates That Close Deals (Nigeria Examples)",
    description: "High-intent WhatsApp follow-up templates for Nigerian SMEs: 3-hour nudges, 24-hour value follow-ups, overdue invoice reminders, and reactivation scripts.",
    date: "2026-02-09",
    tags: ["WhatsApp", "Templates", "Nigeria"],
    ogImage: "/images/lux-hero.svg",
    blocks: [
      { type: "p", text: "Most leads don’t say “no”. They just disappear. Use follow-ups that feel helpful, not desperate. Below are templates you can copy, plus when to send each one." },
      { type: "h2", text: "3-hour follow-up (light nudge)" },
      { type: "p", text: "“Quick one — should I send the quote range now, or do you want to clarify your budget/timeline first?”" },
      { type: "h2", text: "24-hour follow-up (value)" },
      { type: "p", text: "“I drafted the fastest approach for your goal. If you want, I can share 3 options: Basic, Growth, and Premium — and what each includes.”" },
      { type: "h2", text: "48-hour follow-up (close the loop)" },
      { type: "p", text: "“Last follow-up from me. Should I close this request, or are you still interested?”" },
      { type: "h2", text: "Overdue invoice reminder (firm but polite)" },
      { type: "p", text: "“Hi! Friendly reminder that invoice #{NUMBER} is due. Here’s the payment link again. If you need a split payment plan, tell me and I’ll propose options.”" },
      { type: "links", title: "Related solutions", items: [
        { label: "WhatsApp CRM & Sales Automation", href: "/solutions/whatsapp-crm-sales-automation" },
        { label: "Invoice, Collections & Payment Automation", href: "/solutions/invoice-collections-payment-automation" },
      ]},
      { type: "cta", title: "Need a follow-up system (not just templates)?", description: "We can set up your pipeline, templates, and reminders so leads stop slipping through.", href: "/booking", label: "Book Free Strategy Call" },
    ],
  },
  {
    slug: "mobile-first-conversion-website-nigeria",
    title: "How to Build a Website That Converts Nigerian Mobile Visitors",
    description: "A mobile-first checklist to increase leads in Nigeria: speed, trust signals, WhatsApp CTAs, clear offers, and conversion-focused page structure.",
    date: "2026-02-09",
    tags: ["Websites", "Conversion", "Nigeria", "Performance"],
    ogImage: "/images/lux-hero.svg",
    blocks: [
      { type: "p", text: "In Nigeria, your site is judged on mobile, on a busy network, by a customer who wants proof fast. Conversion is mostly about clarity and trust." },
      { type: "h2", text: "Start with the page structure that sells" },
      { type: "ul", items: [
        "H1: one clear outcome (not your company name).",
        "Above-the-fold CTA: WhatsApp + secondary booking link.",
        "Proof: case studies, client stats, screenshots, guarantees.",
        "Offer: packages or clear “starting from” ranges.",
        "FAQ: answer objections (timeline, pricing, payments, support).",
      ]},
      { type: "h2", text: "Speed wins: what to fix first" },
      { type: "ul", items: [
        "Compress large images and lazy-load below the fold.",
        "Avoid heavy animations on mobile; keep transitions subtle.",
        "Preload only what’s needed for the first screen.",
        "Keep JavaScript bundles small by splitting routes.",
      ]},
      { type: "links", title: "Related solutions", items: [
        { label: "SME Business Website (Lead Gen + WhatsApp)", href: "/solutions/sme-website" },
      ]},
      { type: "cta", title: "Want a website that converts (not a brochure)?", description: "Chat on WhatsApp and we’ll recommend the fastest path to a high-converting site.", href: "/whatsapp", label: "Chat on WhatsApp" },
    ],
  },
  {
    slug: "invoice-payment-reminders-whatsapp",
    title: "Invoice Payment Reminders: 7 WhatsApp Sequences That Get Paid Faster",
    description: "Practical payment reminder sequences for Nigerian businesses: due-date, overdue, installment plans, and polite escalation scripts you can automate.",
    date: "2026-02-09",
    tags: ["Invoices", "Payments", "WhatsApp", "Nigeria"],
    ogImage: "/images/lux-hero.svg",
    blocks: [
      { type: "p", text: "Chasing payments manually kills productivity. Use sequences: clear due dates, simple payment links, and escalation rules. Here are seven sequences Nigerian businesses can run without sounding rude." },
      { type: "h2", text: "Sequence 1: Due tomorrow" },
      { type: "p", text: "“Hi {Name}, reminder that invoice #{Number} is due tomorrow. Here’s the link to pay: {Link}. Reply if you need installment options.”" },
      { type: "h2", text: "Sequence 2: Due today" },
      { type: "p", text: "“Hi {Name}, invoice #{Number} is due today. Here’s the link again: {Link}. Once paid, I’ll confirm immediately.”" },
      { type: "h2", text: "Sequence 3: 2 days overdue" },
      { type: "p", text: "“Hi {Name}, following up on invoice #{Number}. Should I resend the bank details/payment link, or propose a split payment plan?”" },
      { type: "links", title: "Related solutions", items: [
        { label: "Invoice, Collections & Payment Automation", href: "/solutions/invoice-collections-payment-automation" },
      ]},
      { type: "cta", title: "Want automated reminders + payment tracking?", description: "We can build an invoice and collections system that tracks paid vs pending in one view.", href: "/booking", label: "Book Free Strategy Call" },
    ],
  },
  {
    slug: "school-portal-checklist-results-fees-cbt",
    title: "School Portal Checklist: Results, Fees, Admissions & CBT Without Chaos",
    description: "A practical checklist for Nigerian schools: parent portal, online fees, receipts, arrears reminders, admissions forms, CBT exams, and secure roles.",
    date: "2026-02-09",
    tags: ["Education", "School Portal", "Nigeria"],
    ogImage: "/images/lux-hero.svg",
    blocks: [
      { type: "p", text: "A school portal should reduce stress for admins, teachers, and parents. Use this checklist to plan the right modules without overbuilding." },
      { type: "h2", text: "Core modules (must-have)" },
      { type: "ul", items: [
        "Parent login for results, attendance, and announcements",
        "Online school fees with instant receipts",
        "Arrears tracking + reminders (WhatsApp/SMS/email)",
        "Teacher score entry + broadsheet generation",
        "Role-based access (teacher vs accountant vs admin)",
      ]},
      { type: "h2", text: "Admissions & CBT (when you need it)" },
      { type: "ul", items: [
        "Online admissions form + document upload",
        "Applicant dashboard and status updates",
        "CBT timer, randomization, and auto-grading",
        "Audit logs and exam malpractice controls",
      ]},
      { type: "links", title: "Related solutions", items: [
        { label: "School Digitization System (Portal + Admissions & CBT)", href: "/solutions/school-digitization-system" },
        { label: "School Portal (Results + Fees)", href: "/solutions/school-portal" },
        { label: "Admissions + CBT System", href: "/solutions/admissions-cbt" },
      ]},
      { type: "cta", title: "Want a portal that works on Nigerian networks?", description: "Book a free strategy call and we’ll recommend a lean build that parents actually use.", href: "/booking", label: "Book Free Strategy Call" },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}

