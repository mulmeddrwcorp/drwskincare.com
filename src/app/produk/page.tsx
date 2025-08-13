import React from "react";

function getApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return "/api/db-products";
  }
  return "http://localhost:3000/api/db-products";
}

export default async function ProdukPage() {
  const apiUrl = getApiUrl();
  const res = await fetch(apiUrl, { next: { revalidate: 3600 } });
  const data = await res.json();
  const products = Array.isArray(data.data) ? data.data : [];

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">Daftar Produk</h1>
      {products.length === 0 ? (
        <div className="text-center text-brand-700">Tidak ada produk ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={product.id_produk || index} className="card group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="flex flex-col items-center justify-center gap-3">
                {product.foto_produk && (
                  <img src={product.foto_produk.replace(/\\/g, "")} alt={product.nama_produk} className="w-32 h-32 object-cover rounded-xl shadow" />
                )}
                <h2 className="text-lg font-semibold text-brand-700 text-center">{product.nama_produk}</h2>
                {/* ...tambahkan detail produk lain di sini... */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
