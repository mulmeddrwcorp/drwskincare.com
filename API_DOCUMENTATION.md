# DRW Skincare API Documentation

## Endpoints

### 1. Produk (External Proxy)
- **URL:** `/api/products`
- **Method:** GET
- **Description:** Proxy ke API produk DRW Skincare (tanpa filter). Berguna untuk debug/sinkronisasi awal.
- **Notes:** Data dikembalikan sesuai API eksternal, bisa berbeda struktur dari DB.

### 2. Reseller (External Proxy)
- **URL:** `/api/resellers`
- **Method:** GET
- **Description:** Proxy ke API reseller DRW Skincare.

### 3. Produk (Database)
- **URL:** `/api/db-products`
- **Method:** GET
- **Description:** Mengambil produk dari database dengan dukungan filter, sort, dan pagination.
- **Query Params:**
  - `search`: cari di `namaProduk`, `deskripsi`, `bpom`
  - `sortBy`: `namaProduk` | `hargaUmum` | `createdAt` (default: `namaProduk`)
  - `sortOrder`: `asc` | `desc` (default: `asc`)
  - `minPrice`: number (filter hargaUmum >=)
  - `maxPrice`: number (filter hargaUmum <=)
  - `page`: number (default: 1)
  - `limit`: number (default: 12)
- **Response:**
```
{
  data: Product[],
  pagination: {
    totalProducts: number,
    totalPages: number,
    currentPage: number,
    limit: number
  }
}
```

### 4. Reseller (Database)
- **URL:** `/api/db-resellers`
- **Method:** GET
- **Description:** Mengambil reseller dari database.

### 5. Sync Data
- **URL:** `/api/sync-data`
- **Method:** POST
- **Description:** Sinkronisasi data dari API eksternal ke DB (upsert + upload gambar ke Blob).

### 6. Upload Foto
- **URL:** `/api/upload-foto`
- **Method:** POST
- **Description:** Upload foto profil reseller ke Vercel Blob.

## Halaman & Perilaku Terkait API
- `/produk`: Server Component, konsumsi `/api/db-products` dengan pagination (`page`, `limit`).
- `/produk/[slug]`: ambil detail produk dari DB berdasarkan `slug`.
- `/reseller`: list reseller dari DB.
- `/reseller/[username]`: storefront reseller. Harga yang ditampilkan menggunakan harga custom jika ada, jika tidak fallback ke `hargaUmum`. Tombol “Beli via WA” mengarah ke nomor WA reseller dengan pesan prefilled.

## Cara Penggunaan di Frontend

### Fetch Produk (Server Component contoh)
```ts
const res = await fetch(`${base}/api/db-products?page=${page}&limit=12`, { cache: 'no-store' });
const { data, pagination } = await res.json();
```

### Fetch Reseller
```js
const res = await fetch('/api/resellers');
const data = await res.json();
console.log(data.data); // array reseller
```

## Catatan
- Endpoint proxy tidak di-filter dan dipakai terutama untuk sinkronisasi dan debugging.
- Field pada response API eksternal dapat berubah. Gunakan endpoint DB untuk konsistensi pada frontend.
- Domain gambar Next/Image perlu ditambahkan ke `next.config.js` (termasuk Vercel Blob public storage).
- Jalankan ulang dev server setelah mengubah `next.config.js`.
