# DRW Skincare API Documentation

## Endpoints

### 1. Produk
- **URL:** `/api/products`
- **Method:** GET
- **Description:** Mengambil daftar seluruh produk DRW Skincare.
- **Response Example:**
```json
{
  "data": [
    {
      "id_produk": "1754870117",
      "nama_produk": "DRW Goats Milk Body Scrub",
      "harga_umum": "95000",
      "foto_produk": "https://drwgroup.id/com.drw.skincare/1.0.0/produk/1754870117/foto",
      "deskripsi": "Diformulasikan dengan goats milk extract..."
      // ...field lain
    }
  ]
}
```

### 2. Reseller
- **URL:** `/api/resellers`
- **Method:** GET
- **Description:** Mengambil daftar seluruh reseller DRW Skincare di Indonesia.
- **Response Example:**
```json
{
  "data": [
    {
      "id_reseller": "288-009-1025-1026",
      "nama_reseller": "Maria Zulva ",
      "nomor_hp": "082228380312",
      "area": "Tayu",
      "level": "Supervisor",
      "foto_reseller": "https://drwgroup.id/com.drw.skincare/1.0.0/user/new657460de55f342.97141164/foto"
      // ...field lain
    }
  ]
}
```

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
- Semua endpoint di atas adalah proxy dari API DRW Skincare, sehingga tidak terkena masalah CORS.
- Data dapat langsung digunakan di React/Next.js dengan `useEffect` dan `useState`.
- Field pada response dapat berubah sesuai update dari API pusat.
