# Database Sync & Reseller System

## Overview
Sistem ini mengelola data resellers dan products dengan sinkronisasi dari API eksternal ke database Neon (PostgreSQL) dan upload gambar ke Vercel Blob storage.

## Database Schema (Prisma)
- `Reseller`: idReseller, namaReseller, nomorHp, area, level, facebook/instagram, fotoProfil, apiData
- `Product`: idProduk, namaProduk, slug (unique), bpom, level price fields, fotoProduk, gambar, deskripsi, categoryId?, apiData
- `Category`: name, slug (unique), description
- `HargaCustom`: relasi reseller↔product + hargaCustom (unique composite key)

Migrations menambahkan `slug` ke Product dan tabel `categories` beserta relasinya.

## API Endpoints
- `POST /api/sync-data`: Sinkronisasi API eksternal → DB + upload gambar → Blob
- `GET /api/db-resellers`: Baca reseller dari DB
- `GET /api/db-products`: Baca produk dari DB (dengan filter, sort, dan pagination)
- `POST /api/upload-foto`: Upload foto profil reseller

Proxy (untuk debug):
- `GET /api/products`, `GET /api/resellers`

## Frontend Pages
- `/admin/sync`: Panel sinkronisasi manual
- `/produk`: Server Component; daftar produk dengan pagination via `/api/db-products?page=...&limit=...`
- `/produk/[slug]`: Detail produk (menampilkan kategori jika tersedia)
- `/reseller`: Daftar reseller
- `/reseller/[username]`: Toko reseller; harga sesuai custom price bila ada, tombol “Beli via WA” ke nomor reseller

## Env Vars
```
DATABASE_URL=postgres://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Setup
1. Install deps: `npm install`
2. Prisma: `npx prisma migrate deploy && npx prisma generate`
3. Jalankan dev: `npm run dev`

## Notes & Tips
- Domain gambar diizinkan via `next.config.js` (drwgroup.id dan umum seperti Cloudinary, Google, serta Vercel Blob subdomains)
- Detail produk memakai pencarian `slug` dengan fallback ke slug dari `namaProduk` bila Prisma Client belum regenerate
- ProductCard pada halaman reseller menerima `displayPrice` dan `resellerWhatsappNumber` untuk render harga dan tombol WA
- Produk page sekarang Server Component dengan `PaginationControls`

## Troubleshooting
- Error Prisma arg `slug` unknown: jalankan `npx prisma generate` setelah migrasi
- Gambar tidak muncul (Next Image): pastikan domain gambar terdaftar di `next.config.js` dan restart dev server
- WA link minus simbol: nomor akan disanitasi menjadi digit-only secara otomatis
