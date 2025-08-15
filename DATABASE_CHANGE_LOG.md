# Database Change Log — Reseller / ResellerProfile split

Date: 2025-08-15

Summary
- The `Reseller` model was refactored to move editable profile fields into a new `ResellerProfile` model.
 - Profile columns use snake_case in the DB: `nama_reseller`, `whatsapp_number`, `photo_url`, `city`, `bio`, `email_address`.
- Rationale: separate core identity/status (Reseller) from mutable profile metadata (ResellerProfile).

Compatibility and migration notes
- Short-term compatibility: server mapping functions (`src/lib/data.ts`) return objects shaped for the legacy UI (camelCase names like `namaReseller`, `profile.photoUrl`, `profile.whatsappNumber`) so the front-end can be migrated incrementally.
- API changes:
  - New endpoints: `/api/resellers/find-by-phone`, `/api/resellers/link-account`, and an updated `/api/resellers/me` (GET/PUT).
  - PUT `/api/resellers/me` expects snake_case payload keys (e.g., `nama_reseller`, `whatsapp_number`, `photo_url`).
- Sync job and migration:
  - The `sync-data` job and other upserts were updated to stop writing to removed/renamed columns (for example `apiData` was deprecated).
  - Migrations were applied; a destructive reset was used during development to resolve unique constraint conflicts. If you have production data, follow a non-destructive migration path and test carefully.

Developer checklist after pulling changes
- Run `npm install` and `npx prisma generate`.
- Run `npx prisma migrate deploy` against your test/dev DB (do NOT run destructive resets on production without a backup plan).
- Rebuild the app: `npm run build`.
- Update UI code progressively to read from `profile.*` snake_case fields — the mapping layer allows gradual migration.

Notes for maintainers
- Prefer the new snake_case field names when changing or adding server logic or API handlers.
- When changing front-end components, remove reliance on legacy camelCase tokens and update them to the mapped server responses (or directly to snake_case once mapping is removed).
- Double-check existing scheduled jobs or third-party integrations that may depend on the old schema.

Contact
- For questions about the migration, contact the engineering owner in the repo or open an issue with the `migration` label.
