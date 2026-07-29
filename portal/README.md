# Manifest Mailbox Studio

Admin portal for reviewing, approving, and shaping the daily manifestation
emails. Next.js app backed by the Manifest Mailbox Supabase project.

## Vercel setup

1. In the Vercel project (connected to this repo), set
   **Settings → Build & Deployment → Root Directory** to `portal`.
   Framework preset: Next.js (auto-detected).
2. Add environment variables (Settings → Environment Variables):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://qpzxcbnsnrcxfijrdkmo.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's anon key (Supabase dashboard → Settings → API) |
   | `SUPABASE_SERVICE_ROLE_KEY` | the project's service role key (same page — keep secret) |
   | `CRON_SECRET` | same value as the `CRON_SECRET` edge function secret |

3. Redeploy.

## Logins

Users are managed in the Supabase dashboard: **Authentication → Users →
Add user** (email + password, confirm email automatically). Anyone with a
user account can access the whole portal, so only add Christine and John.

## Screens

- **Today's Queue** — one card per active subscriber per day: manifestation
  beside Claude's draft. Approve / Edit & approve / Regenerate / Reject.
  Approved emails are delivered by the hourly `send-approved` cron.
- **Subscribers** — roster with status, streak, and the per-person
  auto-send toggle (Automatic skips the review queue).
- **History** — every email with status, prompt version, expandable full
  body, and original-vs-edited comparison.
- **Prompts** — versioned editor for the system prompt and daily template.
  Saving creates a new active version; old versions are never overwritten.
