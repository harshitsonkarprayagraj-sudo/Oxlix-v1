/*
# Revoke PUBLIC execute on SECURITY DEFINER functions

## Overview
Previous revokes removed anon/authenticated grants, but the default PUBLIC
grant remained. This removes PUBLIC execute from all four internal functions.

## Security Changes
- REVOKE EXECUTE ON all SECURITY DEFINER functions FROM PUBLIC.
- GRANT EXECUTE ON update_last_active TO authenticated (needed by the app).
*/

REVOKE EXECUTE ON FUNCTION generate_unique_username(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION update_last_active() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION set_updated_at() FROM PUBLIC;

-- update_last_active needs to be callable by signed-in users
GRANT EXECUTE ON FUNCTION update_last_active() TO authenticated;
