# Database Sync & Reseller System

## Overview
Sistem ini mengelola data resellers dan products dengan sinkronisasi dari API eksternal ke database Neon (PostgreSQL) dan upload gambar ke Vercel Blob storage.

## Database Schema

### Tables
1. **resellers** - Data reseller dari API
2. **products** - Data produk dari API  
3. **harga_custom** - Harga custom yang diset reseller per produk

### Relasi
- Reseller → HargaCustom (1:many)
- Product → HargaCustom (1:many)
- HargaCustom → Reseller & Product (many:1)

## API Endpoints

### Sync Data
- **POST** `/api/sync-data`
- Sinkronisasi data dari API eksternal ke database
- Upload gambar ke Blob storage
- Upsert data (update jika ada, create jika baru)

### Database Queries
- **GET** `/api/db-resellers` - Data resellers dari database
- **GET** `/api/db-products` - Data products dari database

### Upload Foto
- **POST** `/api/upload-foto` - Upload foto profil reseller

## Frontend Pages

### Admin Panel
- `/admin/sync` - Halaman sinkronisasi data
- Trigger sync manual
- Monitor hasil sync

### User Pages
- `/produk` - List produk (dari API)
- `/reseller` - List reseller (dari API)
- `/user-profile` - Profil user dengan Clerk

## Environment Variables

### Database (Neon)
```env
DATABASE_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
```

### Blob Storage (Vercel)
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Authentication (Clerk)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Data Flow

1. **API → Database**: Sync eksternal API ke Neon DB
2. **Images → Blob**: Upload gambar dari API ke Vercel Blob
3. **Database → Frontend**: Query data untuk tampilan
4. **User Upload → Blob**: Upload foto profil user

## Usage Instructions

### 1. Setup Database
```bash
npx prisma migrate dev --name init-tables
npx prisma generate
```

### 2. Sync Data
- Akses `/admin/sync`
- Klik "Start Data Sync"
- Tunggu proses selesai

### 3. View Data
- `/produk` - Produk dari API
- `/reseller` - Reseller dari API
- API endpoints untuk data dari database

## Features

### Current
- ✅ Database schema dengan relasi
- ✅ API sync dari eksternal ke database
- ✅ Upload gambar ke Blob storage
- ✅ Admin panel untuk monitoring
- ✅ Authentication dengan Clerk

### Planned
- 🔄 Halaman edit harga custom per reseller
- 🔄 Halaman toko individual per reseller
- 🔄 Scheduled sync (cron job)
- 🔄 Dashboard analytics
- 🔄 Notification system

## Technical Stack
- **Frontend**: Next.js 15, Tailwind CSS, TypeScript
- **Database**: Neon (PostgreSQL), Prisma ORM
- **Storage**: Vercel Blob
- **Auth**: Clerk
- **Deployment**: Vercel
