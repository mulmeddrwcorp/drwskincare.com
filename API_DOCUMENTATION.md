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
- **Description:** Mengambil produk dari database dengan dukungan filter dan sort.
- **Query Params:**
  - `search`: cari di `namaProduk`, `deskripsi`, `bpom`
  - `sortBy`: `namaProduk` | `hargaUmum` | `createdAt` (default: `namaProduk`)
  - `sortOrder`: `asc` | `desc` (default: `asc`)
  - `minPrice`: number (filter hargaUmum >=)
  - `maxPrice`: number (filter hargaUmum <=)
- **Response:** `{ success, data, count, filters }`

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
- `/produk`: konsumsikan `/api/db-products` dengan filter live (search/sort/range).
- `/produk/[slug]`: ambil detail produk dari DB berdasarkan `slug`.
- `/reseller`: list reseller dari DB.
- `/reseller/[username]`: storefront reseller. Harga yang ditampilkan menggunakan harga custom jika ada, jika tidak fallback ke `hargaUmum`. Tombol “Beli via WA” mengarah ke nomor WA reseller dengan pesan prefilled.

## Cara Penggunaan di Frontend

### Fetch Produk
```js
const res = await fetch('/api/products');
const data = await res.json();
console.log(data.data); // array produk
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
- Semua endpoint di atas adalah proxy dari API DRW Skincare, sehingga tidak terkena masalah CORS.
- Data dapat langsung digunakan di React/Next.js dengan `useEffect` dan `useState`.
- Field pada response dapat berubah sesuai update dari API pusat.
