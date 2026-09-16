/*
# Oxlix V4 — Full Backend Schema

## Overview
Creates the complete production database for Oxlix V4: user profiles, settings,
notifications, saved items, AI history, activity logs, reports, and a future-ready
posts table. Every table is owner-scoped with Row Level Security.

## 1. New Tables

### profiles
Stores the cloud user profile. One row per user, keyed to auth.users(id).
- id (uuid, PK, FK → auth.users.id, ON DELETE CASCADE)
- name (text, not null)
- username (text, unique, not null)
- bio (text, nullable)
- avatar_url (text, nullable)
- cover_url (text, nullable)
- email (text, not null)
- preferences (jsonb, default '{}')
- theme (text, default 'dark')
- language (text, default 'en')
- privacy_settings (jsonb, default '{"profile_public": true, "show_activity": true}')
- join_date (timestamptz, default now())
- last_active (timestamptz, default now())
- updated_at (timestamptz, default now())

### settings
Per-user application settings.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- push_notifications (boolean, default true)
- haptic_feedback (boolean, default true)
- dark_mode (boolean, default true)
- email_notifications (boolean, default true)
- language (text, default 'en')
- created_at, updated_at (timestamptz)

### notifications
User notifications/alerts.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- type (text: intelligence|trust|trend|follow|like)
- title (text, not null)
- body (text, not null)
- read (boolean, default false)
- created_at (timestamptz)

### saved_items
Bookmarked posts/articles.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- item_type (text: post|article)
- item_id (text, not null)
- title (text, not null)
- metadata (jsonb, default '{}')
- created_at (timestamptz)

### ai_history
Ox AI conversation history.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- role (text: user|assistant)
- content (text, not null)
- metadata (jsonb, default '{}')
- created_at (timestamptz)

### activity_logs
Audit trail of user actions.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- action (text, not null)
- entity_type (text, nullable)
- entity_id (text, nullable)
- metadata (jsonb, default '{}')
- created_at (timestamptz)

### reports
User-submitted reports (content/behavior).
- id (uuid, PK)
- reporter_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- reason (text, not null)
- target_type (text, not null)
- target_id (text, not null)
- status (text: pending|reviewing|resolved, default 'pending')
- created_at (timestamptz)

### posts
Future-ready posts table for creator publishing.
- id (uuid, PK)
- user_id (uuid, FK → auth.users.id, ON DELETE CASCADE, DEFAULT auth.uid())
- caption (text, not null)
- media_urls (jsonb, default '[]')
- tags (text[], default '{}')
- visibility (text: public|private|followers, default 'public')
- trust_score (integer, default 0)
- fact_review_status (text: pending|verified|flagged, default 'pending')
- created_at, updated_at (timestamptz)

## 2. Security
- RLS enabled on ALL tables.
- Owner-scoped CRUD policies (SELECT/INSERT/UPDATE/DELETE) using auth.uid() = user_id.
- profiles: SELECT on own profile, INSERT/UPDATE on own profile (id = auth.uid()).
- All owner columns default to auth.uid() so client inserts omitting user_id succeed.

## 3. Automation
- Trigger: auto-create a profile row when a new auth.users record is inserted.
  Derives name/email from auth metadata, generates a unique username from email.
- Trigger: auto-create a settings row for new users.
- Function: update_last_active() — callable by authenticated users to refresh last_active.

## 4. Indexes
- profiles.username (unique)
- All user_id foreign keys indexed.
- notifications(user_id, created_at desc) for feed queries.
- posts(user_id, created_at desc) for feed queries.
*/

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  username text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  cover_url text,
  email text NOT NULL DEFAULT '',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme text NOT NULL DEFAULT 'dark',
  language text NOT NULL DEFAULT 'en',
  privacy_settings jsonb NOT NULL DEFAULT '{"profile_public": true, "show_activity": true}'::jsonb,
  join_date timestamptz NOT NULL DEFAULT now(),
  last_active timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- =========================================================
-- SETTINGS
-- =========================================================
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  push_notifications boolean NOT NULL DEFAULT true,
  haptic_feedback boolean NOT NULL DEFAULT true,
  dark_mode boolean NOT NULL DEFAULT true,
  email_notifications boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_settings" ON settings;
CREATE POLICY "select_own_settings" ON settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_settings" ON settings;
CREATE POLICY "insert_own_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_settings" ON settings;
CREATE POLICY "update_own_settings" ON settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_settings" ON settings;
CREATE POLICY "delete_own_settings" ON settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'intelligence',
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- =========================================================
-- SAVED_ITEMS
-- =========================================================
CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL DEFAULT 'post',
  item_id text NOT NULL,
  title text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_items" ON saved_items;
CREATE POLICY "select_own_saved_items" ON saved_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_items" ON saved_items;
CREATE POLICY "insert_own_saved_items" ON saved_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_saved_items" ON saved_items;
CREATE POLICY "update_own_saved_items" ON saved_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_items" ON saved_items;
CREATE POLICY "delete_own_saved_items" ON saved_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);

-- =========================================================
-- AI_HISTORY
-- =========================================================
CREATE TABLE IF NOT EXISTS ai_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_ai_history" ON ai_history;
CREATE POLICY "select_own_ai_history" ON ai_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_ai_history" ON ai_history;
CREATE POLICY "insert_own_ai_history" ON ai_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ai_history" ON ai_history;
CREATE POLICY "update_own_ai_history" ON ai_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ai_history" ON ai_history;
CREATE POLICY "delete_own_ai_history" ON ai_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_history(user_id);

-- =========================================================
-- ACTIVITY_LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity_logs" ON activity_logs;
CREATE POLICY "select_own_activity_logs" ON activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activity_logs" ON activity_logs;
CREATE POLICY "insert_own_activity_logs" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_activity_logs" ON activity_logs;
CREATE POLICY "update_own_activity_logs" ON activity_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activity_logs" ON activity_logs;
CREATE POLICY "delete_own_activity_logs" ON activity_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- =========================================================
-- REPORTS
-- =========================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "update_own_reports" ON reports;
CREATE POLICY "update_own_reports" ON reports FOR UPDATE
  TO authenticated USING (auth.uid() = reporter_id) WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "delete_own_reports" ON reports;
CREATE POLICY "delete_own_reports" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = reporter_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);

-- =========================================================
-- POSTS
-- =========================================================
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  caption text NOT NULL,
  media_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  visibility text NOT NULL DEFAULT 'public',
  trust_score integer NOT NULL DEFAULT 0,
  fact_review_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_posts" ON posts;
CREATE POLICY "select_own_posts" ON posts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_posts" ON posts;
CREATE POLICY "insert_own_posts" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_posts" ON posts;
CREATE POLICY "update_own_posts" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_posts" ON posts;
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);

-- =========================================================
-- AUTOMATION: auto-create profile + settings on signup
-- =========================================================

CREATE OR REPLACE FUNCTION generate_unique_username(base text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  candidate text;
  suffix integer := 0;
BEGIN
  candidate := lower(regexp_replace(base, '[^a-zA-Z0-9]', '', 'g'));
  IF candidate = '' THEN candidate := 'user'; END IF;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE username = candidate) THEN
      RETURN candidate;
    END IF;
    suffix := suffix + 1;
    candidate := lower(regexp_replace(base, '[^a-zA-Z0-9]', '', 'g')) || suffix::text;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    generate_unique_username(COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles SET last_active = now() WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_settings_updated ON settings;
CREATE TRIGGER trg_settings_updated
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated ON posts;
CREATE TRIGGER trg_posts_updated
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
