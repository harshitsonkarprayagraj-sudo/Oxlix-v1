/*
# Lock down SECURITY DEFINER functions

## Overview
Revoke EXECUTE from anon and authenticated roles for internal trigger functions
(generate_unique_username, handle_new_user) and restrict update_last_active
to authenticated users only. Also set explicit search_path on all functions
to clear the mutable search_path warnings.

## Security Changes
1. generate_unique_username — revoke EXECUTE from anon + authenticated.
   Only callable by the trigger / service role.
2. handle_new_user — revoke EXECUTE from anon + authenticated.
   Only callable by the trigger / service role.
3. update_last_active — revoke EXECUTE from anon, keep for authenticated.
4. set_updated_at — revoke EXECUTE from anon + authenticated (trigger-only).
5. All functions get explicit search_path = public.
*/

-- Revoke public execute on internal functions
REVOKE EXECUTE ON FUNCTION generate_unique_username(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION set_updated_at() FROM anon, authenticated;

-- update_last_active: only authenticated users should call this
REVOKE EXECUTE ON FUNCTION update_last_active() FROM anon;

-- Recreate functions with explicit search_path to clear warnings
CREATE OR REPLACE FUNCTION generate_unique_username(base text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION update_last_active()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE profiles SET last_active = now() WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
