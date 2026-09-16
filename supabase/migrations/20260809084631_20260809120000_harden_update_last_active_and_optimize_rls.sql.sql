/*
# Harden update_last_active RPC and optimize RLS policies

## Overview
Two safe, non-destructive changes:
1. Switch update_last_active() from SECURITY DEFINER to SECURITY INVOKER
   and grant UPDATE on only the profiles.last_active column to authenticated.
   This removes the unnecessary SECURITY DEFINER surface while preserving
   the existing client RPC call. The function body already scopes to
   `WHERE id = auth.uid()` so an invoker can only touch their own row.
2. Optimize all 8 tables' RLS policies by wrapping auth.uid() in a subselect:
   `auth.uid()` -> `(select auth.uid())`. This converts per-row evaluation
   into a single initialization plan, resolving the 33 performance advisor
   warnings. Authorization behavior is unchanged — same ownership check,
   same allowed rows.

## Security changes
- update_last_active: SECURITY DEFINER -> SECURITY INVOKER. EXECUTE revoked
  from anon/PUBLIC, granted to authenticated only.
- GRANT UPDATE (last_active) ON profiles TO authenticated — minimal column
  privilege so the invoker can update only last_active, nothing else.
- All RLS policies rewritten with (select auth.uid()) for performance.
  No policy logic changes; same predicates, same roles, same tables.

## Important notes
- No tables, columns, or data are deleted or renamed.
- No policy ownership logic changes.
- The client call `supabase.rpc('update_last_active')` continues to work.
*/

-- 1. Harden update_last_active: SECURITY INVOKER + minimal column grant
REVOKE EXECUTE ON FUNCTION update_last_active() FROM anon, authenticated, PUBLIC;

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE profiles SET last_active = now() WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION update_last_active() TO authenticated;
GRANT UPDATE (last_active) ON profiles TO authenticated;

-- 2. Optimize RLS policies: auth.uid() -> (select auth.uid()) for all 8 tables
--    Same ownership predicates, just wrapped in a subselect for init-plan caching.

-- PROFILES
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING ((select auth.uid()) = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING ((select auth.uid()) = id);

-- SETTINGS
DROP POLICY IF EXISTS "select_own_settings" ON settings;
CREATE POLICY "select_own_settings" ON settings FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON settings;
CREATE POLICY "insert_own_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON settings;
CREATE POLICY "update_own_settings" ON settings FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_settings" ON settings;
CREATE POLICY "delete_own_settings" ON settings FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);

-- SAVED_ITEMS
DROP POLICY IF EXISTS "select_own_saved_items" ON saved_items;
CREATE POLICY "select_own_saved_items" ON saved_items FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_saved_items" ON saved_items;
CREATE POLICY "insert_own_saved_items" ON saved_items FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_saved_items" ON saved_items;
CREATE POLICY "update_own_saved_items" ON saved_items FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_saved_items" ON saved_items;
CREATE POLICY "delete_own_saved_items" ON saved_items FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);

-- AI_HISTORY
DROP POLICY IF EXISTS "select_own_ai_history" ON ai_history;
CREATE POLICY "select_own_ai_history" ON ai_history FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_ai_history" ON ai_history;
CREATE POLICY "insert_own_ai_history" ON ai_history FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_ai_history" ON ai_history;
CREATE POLICY "update_own_ai_history" ON ai_history FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_ai_history" ON ai_history;
CREATE POLICY "delete_own_ai_history" ON ai_history FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);

-- ACTIVITY_LOGS
DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_activity_logs" ON activity_logs;
CREATE POLICY "update_own_activity_logs" ON activity_logs FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);

-- REPORTS
DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING ((select auth.uid()) = reporter_id);
DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = reporter_id);
DROP POLICY IF EXISTS "update_own_reports" ON reports;
CREATE POLICY "update_own_reports" ON reports FOR UPDATE
  TO authenticated USING ((select auth.uid()) = reporter_id) WITH CHECK ((select auth.uid()) = reporter_id);
DROP POLICY IF EXISTS "delete_own_reports" ON reports;
CREATE POLICY "delete_own_reports" ON reports FOR DELETE
  TO authenticated USING ((select auth.uid()) = reporter_id);

-- POSTS
DROP POLICY IF EXISTS "select_own_posts" ON posts;
CREATE POLICY "select_own_posts" ON posts FOR SELECT
  TO authenticated USING ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "insert_own_posts" ON posts;
CREATE POLICY "insert_own_posts" ON posts FOR INSERT
  TO authenticated WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "update_own_posts" ON posts;
CREATE POLICY "update_own_posts" ON posts FOR UPDATE
  TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
DROP POLICY IF EXISTS "delete_own_posts" ON posts;
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING ((select auth.uid()) = user_id);
