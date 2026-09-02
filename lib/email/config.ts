// Central email configuration.
//
// The verified Resend sending domain is mail.wanderlusttravels.fyi. Customer
// mail and internal alerts use different identities so admins can filter
// alerts away from real correspondence.
export const EMAIL_FROM = {
  customer: "Wonderlust <hello@mail.wanderlusttravels.fyi>",
  alerts: "Wonderlust Alerts <alerts@mail.wanderlusttravels.fyi>",
} as const;

// Replies go to the apex inbox, which is forwarded by Cloudflare Email
// Routing. Optional on purpose: the app must work before that inbox exists.
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO?.trim() || undefined;

// Reused for links and CTAs inside emails. Set per environment in Vercel.
export const SITE_URL = (
  process.env.KINDE_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

// Optional override for who receives internal enquiry alerts.
//
// Admin-panel access and alert delivery are separate concerns: every panel
// user must exist in AdminUser, but that doesn't mean each of them wants an
// email per enquiry. Set this to route alerts at a dedicated address instead.
// Comma-separated. Unset falls back to querying AdminUser.
export const ADMIN_ALERT_TO = (process.env.ADMIN_ALERT_TO ?? "")
  .split(",")
  .map((address) => address.trim().toLowerCase())
  .filter(Boolean);
