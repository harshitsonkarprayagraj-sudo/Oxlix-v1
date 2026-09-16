/*
# Harden OXLIX Data API privileges

1. Purpose
- Preserve the existing signed-in OXLIX experience while making database permissions least-privilege.
- Prevent anonymous callers from reaching application tables through the public Data API.

2. Modified tables
- `profiles`: authenticated users can read their own profile, update editable profile fields, and delete their own profile. Email, ownership, timestamps, and account dates are not client-writable.
- `settings`: authenticated users can read, update preference fields, and delete their own settings. Ownership, identifiers, and timestamps are not client-writable.
- `notifications`: authenticated users can read and delete their own notifications and update only the `read` flag. Clients cannot create or rewrite notification content.
- `saved_items`: authenticated users retain read, insert, and delete access for their own saved items. Ownership and identifiers remain restricted during updates.
- `ai_history`: authenticated users retain read, insert, and delete access for their own history. Ownership and identifiers remain restricted during updates.
- `activity_logs`: authenticated users retain read and insert access for their own activity records. Audit records cannot be edited or deleted through the Data API.
- `reports`: authenticated users retain read, insert, and delete access for their own reports. Report status cannot be changed by the reporter.
- `posts`: authenticated users retain read, insert, update, and delete access for their own posts, but cannot write ownership, trust, review, or timestamp fields.

3. Security changes
- Revoke all table privileges from `anon`.
- Replace broad authenticated table grants with column-level grants where protected values exist.
- Existing RLS policies remain in place and continue to enforce row ownership.
- No rows, columns, tables, policies, or user data are deleted or renamed.

4. Important notes
- The public browser key remains intentionally public; authorization is enforced by Supabase roles, column privileges, and RLS.
- Database-generated owner and timestamp defaults remain authoritative for new rows.
*/

REVOKE ALL ON TABLE profiles, settings, notifications, saved_items, ai_history, activity_logs, reports, posts FROM anon;
REVOKE ALL ON TABLE profiles, settings, notifications, saved_items, ai_history, activity_logs, reports, posts FROM authenticated;

GRANT SELECT ON TABLE profiles TO authenticated;
GRANT INSERT (id, name, username, bio, avatar_url, cover_url, preferences, theme, language, privacy_settings) ON TABLE profiles TO authenticated;
GRANT UPDATE (name, username, bio, avatar_url, cover_url, preferences, theme, language, privacy_settings) ON TABLE profiles TO authenticated;
GRANT DELETE ON TABLE profiles TO authenticated;

GRANT SELECT ON TABLE settings TO authenticated;
GRANT INSERT (user_id, push_notifications, haptic_feedback, dark_mode, email_notifications, language) ON TABLE settings TO authenticated;
GRANT UPDATE (push_notifications, haptic_feedback, dark_mode, email_notifications, language) ON TABLE settings TO authenticated;
GRANT DELETE ON TABLE settings TO authenticated;

GRANT SELECT ON TABLE notifications TO authenticated;
GRANT UPDATE (read) ON TABLE notifications TO authenticated;
GRANT DELETE ON TABLE notifications TO authenticated;

GRANT SELECT ON TABLE saved_items TO authenticated;
GRANT INSERT (user_id, item_type, item_id, title, metadata) ON TABLE saved_items TO authenticated;
GRANT DELETE ON TABLE saved_items TO authenticated;

GRANT SELECT ON TABLE ai_history TO authenticated;
GRANT INSERT (user_id, role, content, metadata) ON TABLE ai_history TO authenticated;
GRANT DELETE ON TABLE ai_history TO authenticated;

GRANT SELECT ON TABLE activity_logs TO authenticated;
GRANT INSERT (user_id, action, entity_type, entity_id, metadata) ON TABLE activity_logs TO authenticated;

GRANT SELECT ON TABLE reports TO authenticated;
GRANT INSERT (reporter_id, reason, target_type, target_id) ON TABLE reports TO authenticated;
GRANT DELETE ON TABLE reports TO authenticated;

GRANT SELECT ON TABLE posts TO authenticated;
GRANT INSERT (user_id, caption, media_urls, tags, visibility) ON TABLE posts TO authenticated;
GRANT UPDATE (caption, media_urls, tags, visibility) ON TABLE posts TO authenticated;
GRANT DELETE ON TABLE posts TO authenticated;