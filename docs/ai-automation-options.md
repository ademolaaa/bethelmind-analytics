# AI Automation Options (Cost-Effective)

## What we can automate on this site today

- Lead triage: classify each lead into one of the 6 suites and estimate urgency.
- Reply drafts: generate a short email reply template with 3 qualifying questions.
- Follow-up sequences: generate 2–3 follow-up variations for WhatsApp/email.
- Ad quality checks: flag mismatched landing page vs ad promise (reduce wasted spend).

## Gemini (Google) — recommended starting point

- Best for: lead classification, reply drafting, summarization, high-volume low-latency tasks.
- Pricing examples (Google pricing page):
  - Gemini 2.5 Flash-Lite: $0.10 / 1M input tokens and $0.40 / 1M output tokens (paid tier).
  - Gemini 1.5 Flash: $0.075 / 1M input tokens and $0.30 / 1M output tokens (paid tier).
- Notes:
  - There is a free tier for many models, good for testing.
  - Batch API can reduce costs for offline processing.

References:
- https://ai.google.dev/gemini-api/docs/pricing
- https://developers.googleblog.com/gemini-15-flash-updates-google-ai-studio-gemini-api/

## Cloudflare Workers AI — very cheap + easy to deploy

- Best for: lightweight classification and routing, serverless automations close to users.
- Pricing (Cloudflare docs): $0.011 per 1,000 Neurons with 10,000 Neurons/day free allocation.
- Includes low-cost model options (Llama, Mistral, Gemma, etc.) priced per token in their docs.

Reference:
- https://developers.cloudflare.com/workers-ai/platform/pricing/

## “Cheap” non-LLM automations (often the best ROI)

- n8n (self-host): low monthly cost; connect leads → Google Sheets/CRM → email sequences.
- Google Apps Script: send emails, write to Sheets, notify Slack/WhatsApp gateway.
- Make.com / Pabbly Connect: fast to ship, minimal engineering, good for early-stage funnels.

## Practical recommendation

- Start with Gemini Flash-Lite for triage + email drafts.
- Add Cloudflare Workers AI later if you need very high volume at low cost.
- Use n8n/Apps Script for orchestration (routing, sequences, reporting) even if Gemini does the text generation.

