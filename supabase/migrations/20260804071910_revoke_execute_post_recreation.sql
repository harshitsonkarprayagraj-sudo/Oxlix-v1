/*
# Revoke EXECUTE on SECURITY DEFINER functions (post-recreation fix)

## Overview
The previous migration recreated functions with CREATE OR REPLACE, which reset
their EXECUTE grants to default (public). This migration revokes EXECUTE from
anon and authenticated AFTER the functions already exist with their final
definitions.

## Security Changes
1. generate_unique_username — revoke from anon + authenticated (trigger-only).
2. handle_new_user — revoke from anon + authenticated (trigger-only).
3. update_last_active — revoke from anon only (authenticated needs it).
4. set_updated_at — revoke from anon + authenticated (trigger-only).
*/

REVOKE EXECUTE ON FUNCTION generate_unique_username(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION update_last_active() FROM anon;
REVOKE EXECUTE ON FUNCTION set_updated_at() FROM anon, authenticated;
