# Laporan Struktur Website drwskincare.com

## 1. Overview
Website drwskincare.com adalah platform manajemen produk dan reseller DRW Skincare berbasis Next.js, Neon (Postgres), Vercel Blob, dan Clerk untuk autentikasi. Website ini mendukung sinkronisasi data dari API eksternal ke database, serta menampilkan data produk dan reseller dari database Neon.

## 2. Struktur Folder
```
- prisma/
    schema.prisma         // Skema database Neon (Postgres)
    migrations/           // File migrasi Prisma
- public/
    drwskincare-logo.png  // Logo utama website
    drwskincare-square-logo.png // Logo square untuk mobile
    drwskincare-square-logo.ico // Favicon
- src/
    app/
        layout.tsx        // Layout utama, import Header & Footer
        globals.css       // Global CSS
        produk/page.tsx   // Halaman produk, fetch dari Neon
        reseller/page.tsx // Halaman reseller, fetch dari Neon
        admin/
            sync/page.tsx     // Halaman admin sync, tombol sync & tanggal terakhir
            database/page.tsx // Halaman admin view data database
        api/
            db-products/route.ts   // API produk dari Neon
            db-resellers/route.ts  // API reseller dari Neon
            sync-data/route.ts     // API sinkronisasi data dari API ke Neon
            upload-foto/route.ts   // API upload foto profil ke Blob
    components/
        Header.tsx        // Komponen header, logo responsive
        Footer.tsx        // Komponen footer
    lib/
    types/
```

## 3. Alur Data
- **Frontend**: Semua halaman utama (`/produk`, `/reseller`) mengambil data dari Neon melalui API internal (`/api/db-products`, `/api/db-resellers`).
- **Admin Sync**: Halaman `/admin/sync` untuk sinkronisasi data dari API eksternal ke Neon, menampilkan tanggal terakhir sync.
- **Upload Foto**: Foto profil reseller diupload ke Vercel Blob, URL disimpan di database.
- **Database**: Skema Prisma menyesuaikan field API produk dan reseller.

## 4. Fitur Utama
- List produk dan reseller dari database Neon
- Sinkronisasi data dari API eksternal ke Neon (manual via admin)
- Responsive logo (logo square di mobile)
- Upload foto profil ke Blob
- Tanggal terakhir sync ditampilkan di admin
- Otentikasi dengan Clerk

## 5. Environment
- `.env.local` dan `.env`: Konfigurasi Neon, Blob, Clerk

## 6. Dokumentasi API & Database
Lihat file `DATABASE_SYNC_DOCS.md` untuk detail endpoint, skema, dan environment.

## 7. Deployment
- Vercel (Next.js, Neon, Blob)

## 8. Catatan
- Semua data frontend diambil dari database Neon, bukan API langsung.
- Sinkronisasi data dilakukan manual via admin.
- Struktur dan relasi database sudah menyesuaikan field API produk dan reseller.

---

# Dokumentasi API & Database

Lihat file `DATABASE_SYNC_DOCS.md` untuk dokumentasi lengkap API, skema database, environment, dan alur sinkronisasi.
