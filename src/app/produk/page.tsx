"use client";
import { useEffect, useState } from "react";

export default function ProdukPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/db-products");
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        const data = await res.json();
        setProducts(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">Daftar Produk</h1>
      {loading ? (
        <div className="text-center text-brand-700">Memuat produk...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
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
                <p className="text-sm text-brand-800/70 text-center">{product.deskripsi}</p>
                {product.harga_umum && (
                  <div className="mt-2 text-brand-600 font-bold text-lg">Rp {Number(product.harga_umum).toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
