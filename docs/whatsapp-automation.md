# WhatsApp Automation (Meta Cloud API)

This project supports WhatsApp automation for lead handling and follow-ups:

1) **Admin notifications**: when a lead is submitted on the website, notify your team on WhatsApp.
2) **Inbound webhook + auto-reply** (optional): store inbound messages and auto-reply with a short prompt.
3) **CRM inbox (CMS)**: assign conversations to agents, reply with text or templates, and schedule follow-ups.
4) **Follow-up sender (cron)**: process scheduled follow-ups with a Hostinger cron job.

## 1) Configure WhatsApp Cloud API

Create a WhatsApp app in Meta Developers and get:
- Permanent access token
- Phone Number ID
- Webhook Verify Token (you choose this string)

Set these in `public/config/generated.php`:

```php
'whatsapp' => [
  'provider' => 'meta_cloud',
  'access_token' => 'YOUR_PERMANENT_TOKEN',
  'phone_number_id' => 'YOUR_PHONE_NUMBER_ID',
  'verify_token' => 'YOUR_VERIFY_TOKEN',
  'admin_numbers' => ['+2348012345678'],
  'auto_reply_enabled' => true,
  'auto_reply_text' => 'Thanks for contacting Bethelmind. Please share your business name and what you need help with (Growth/Commerce/Education/Healthcare/Real Estate/Logistics).',
],
'cron' => [
  'token' => 'YOUR_CRON_TOKEN',
],
```

## 2) Webhook URL (Inbound messages)

Set your WhatsApp webhook callback URL to:

`https://YOUR_DOMAIN.com/api/whatsapp_webhook.php`

Use the same `verify_token` you configured above.

## 3) CRM Inbox (Assign + Reply + Templates)

Open the CMS inbox:

`https://YOUR_DOMAIN.com/cms/whatsapp.php`

What you can do:
- Assign a contact to an agent (CMS user)
- Reply with **Text** (only within the 24-hour window)
- Reply with **Templates** (recommended outside the 24-hour window)
- Schedule follow-ups (saved in DB)

## 4) Follow-up sending (Hostinger cron)

Create a Hostinger cron job to hit:

`https://YOUR_DOMAIN.com/api/cron_whatsapp_followups.php?token=YOUR_CRON_TOKEN`

Recommended schedule: every 5 minutes.

## 5) What happens after setup

- Every inbound message is stored in `bm_whatsapp_messages`.
- Contacts are tracked in `bm_whatsapp_contacts` (last inbound/outbound timestamps).
- Templates are stored in `bm_whatsapp_templates`.
- Scheduled follow-ups are stored in `bm_whatsapp_followups`.
- If `auto_reply_enabled=true`, the system replies with `auto_reply_text`.
- Every new email lead submission triggers WhatsApp notifications to your `admin_numbers`.

## Notes

- WhatsApp rules apply: to message customers outside the 24-hour window you must use approved templates.
- For best results, use the auto-reply to push leads into your funnel quickly (suite selection + 3 questions).

