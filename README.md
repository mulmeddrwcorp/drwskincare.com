# DRW Skincare Website

A Next.js 15 + TypeScript app for browsing DRW Skincare products and reseller catalogs, backed by a PostgreSQL (Neon) database via Prisma and Vercel Blob for images.

## Features
- Product listing with search, sort, price filtering, and server-side pagination (`/produk`)
- Product detail by slug (`/produk/[slug]`)
- Reseller directory (`/reseller`) and reseller storefront (`/reseller/[username]`)
- Custom pricing per reseller with proper display and WhatsApp CTA
- Admin sync tools and database-backed API endpoints

## Tech Stack
- Next.js 15, React 19, TypeScript
- Tailwind CSS
- Prisma ORM, Neon (PostgreSQL)
- Vercel Blob (images)
- Clerk (auth)

## Getting Started
1. Install dependencies
   - npm install
2. Setup environment variables
   - Copy `.env.example` to `.env` (if exists) and fill values
   - Required:
     - DATABASE_URL
     - BLOB_READ_WRITE_TOKEN
     - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
3. Database
   - npx prisma migrate deploy
   - npx prisma generate
   - Note: the schema was recently refactored: `Reseller` data has been split into `Reseller` (core) and `ResellerProfile` (editable metadata). See `DATABASE_CHANGE_LOG.md` for migration notes and backwards compatibility details.
4. Run dev server
   - npm run dev

Notes:
- If you change `next.config.js` (e.g., image domains), restart the dev server.
- Image domains include DRW sources and Vercel Blob public storage subdomains.

## Useful Scripts
- dev: start Next dev server
- build: build for production
- start: start production server

## API Endpoints
- /api/db-products: Products from DB with filters and pagination
- /api/db-resellers: Resellers from DB
- /api/sync-data: Sync from external API to DB
- /api/upload-foto: Upload profile photo to Blob
- /api/resellers/find-by-phone: POST — find reseller by phone (used in onboarding/link flow)
- /api/resellers/link-account: POST — link a reseller record to the authenticated Clerk user and upsert ResellerProfile
- /api/resellers/me: GET/PUT — get or update the current user's ResellerProfile (PUT expects snake_case payload like `nama_reseller`, `whatsapp_number`, `photo_url`)
   - New behavior: `ResellerProfile` now includes `last_user_update` (timestamp). When a user updates their profile via `/api/resellers/me` this timestamp is set. The external sync (`scripts/manual-sync.js`) will avoid overwriting user-managed fields if `last_user_update` exists.

## Middleware and Onboarding Flow
- A middleware redirects authenticated users who haven't completed their profile to `/lengkapi-profil` to complete the ResellerProfile onboarding. This is implemented in `src/middleware.ts` and uses Clerk `auth()` to detect linked accounts.

More details in `API_DOCUMENTATION.md` and `DATABASE_SYNC_DOCS.md`.

## Development Notes
- Schema highlights:
   - Product has `slug`, optional `categoryId`, price levels, and `fotoProduk`
      - Reseller (core) contains identity and status fields; editable profile fields were moved to `ResellerProfile` (snake_case columns: `nama_reseller`, `whatsapp_number`, `photo_url`, `city`, `bio`, `email_address`)
   - HargaCustom links reseller↔product with unique composite key
   - Short-term compatibility: server-side mapping functions in `src/lib/data.ts` translate DB snake_case profile fields into the legacy camelCase shape expected by many UI components. When updating UI code prefer the new snake_case names.
- Image domains configured in `next.config.js` (drwgroup.id, Cloudinary, Google, Vercel Blob, etc.)
- Product detail attempts Prisma `findUnique({ where: { slug } })` with fallback matching
- Produk page is a Server Component that fetches from internal API with pagination and renders `PaginationControls`

## Recent Updates
- ProductCard accepts `displayPrice` and `resellerWhatsappNumber` to render correct price and “Beli via WA” button linking to the reseller’s WhatsApp
- Reseller profile `generateMetadata` simplified to only return required title and description based on reseller’s name and area
- Product detail page shows category in breadcrumb/badge when available
- Produk page migrated to Server Component with pagination and `PaginationControls`

## License
Proprietary. All rights reserved.