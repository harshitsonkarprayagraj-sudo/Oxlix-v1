# OXLIX V1 Fix Batch

This batch keeps the existing UI, Supabase schema, auth and navigation intact.

Included fixes:
- Profile Edit now opens a working form and saves name/username/bio through the existing profile repository.
- News bookmarks now persist to the existing `saved_items` table and restore after reload.
- Dark Mode setting now controls an app-level light/dark presentation without changing the existing layout.

Intentionally NOT changed:
- Ox AI provider/integration (current chat responses remain the existing placeholder until a real provider is connected).
- News external API (current News feed remains the existing editorial/static feed).
- Supabase Storage/media upload (requires a confirmed storage bucket/configuration; no risky DB/storage change was added).
- Creator follow, voice AI, analytics and other post-V1 features.

Important: the original ZIP contained a `.env` pointing at a different Supabase project. It was removed from this fix ZIP so deployment continues to use the Cloudflare environment variables for the intended OXLIX Supabase project.
