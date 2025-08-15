-- Drop clerk name columns migration
-- Generated: 2025-08-15

BEGIN;

ALTER TABLE IF EXISTS "resellers" DROP COLUMN IF EXISTS first_name;
ALTER TABLE IF EXISTS "resellers" DROP COLUMN IF EXISTS last_name;

ALTER TABLE IF EXISTS "reseller_profiles" DROP COLUMN IF EXISTS first_name;
ALTER TABLE IF EXISTS "reseller_profiles" DROP COLUMN IF EXISTS last_name;

COMMIT;
