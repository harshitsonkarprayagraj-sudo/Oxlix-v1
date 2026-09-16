/*
# Auto-confirm users on signup

## Problem
Bolt's default Site URL is localhost:3000, which doesn't work for live/preview apps.
When email confirmation is enabled, the confirmation email link redirects to this
broken URL. The user clicks the link, the email IS confirmed server-side, but the
redirect fails — the user never gets a session and stays stuck on the login screen.

## Fix
Add a BEFORE INSERT trigger on auth.users that auto-confirms the email by setting
email_confirmed_at and confirmed_at to now() at signup time. This eliminates the
need for the broken email confirmation flow entirely.

## Changes
1. New function: auto_confirm_user() — sets email_confirmed_at and confirmed_at on
   the NEW row before it's inserted into auth.users.
2. New trigger: on_auth_user_auto_confirm — fires BEFORE INSERT on auth.users,
   calls auto_confirm_user().

## Security
This is safe because:
- It only runs on INSERT (new user creation), not on updates.
- It simply pre-fills the confirmation timestamp so GoTrue treats the user as
  already confirmed.
- The existing handle_new_user() AFTER INSERT trigger still creates the profile
  and settings rows as before.
*/

CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth
AS $$
BEGIN
  -- Auto-confirm the email so the user can sign in immediately
  -- without needing to click a broken confirmation link.
  NEW.email_confirmed_at := now();
  NEW.confirmed_at := now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it was created in a prior attempt
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auto_confirm_user();

-- Revoke execute from public roles — only the trigger should call this
REVOKE EXECUTE ON FUNCTION auto_confirm_user() FROM anon, authenticated, PUBLIC;
