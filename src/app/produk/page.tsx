"use client";
import { useEffect, useState, useCallback } from "react";

export default function ProdukPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("namaProduk");
  const [sortOrder, setSortOrder] = useState("asc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsFiltering(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const queryString = params.toString();
      const url = `/api/db-products${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal mengambil data produk");
      
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? data.data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
      setProducts([]);
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [searchTerm, sortBy, sortOrder, minPrice, maxPrice]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Format currency
  const formatPrice = (price) => {
    if (!price) return 'Harga tidak tersedia';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Create slug
  const toSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("namaProduk");
    setSortOrder("asc");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
        Daftar Produk
      </h1>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-brand-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">
              Cari Produk
            </label>
            <input
              type="text"
              placeholder="Nama produk, deskripsi, atau BPOM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">
              Urutkan Berdasarkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            >
              <option value="namaProduk">Nama Produk</option>
              <option value="hargaUmum">Harga</option>
              <option value="createdAt">Tanggal Ditambahkan</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">
              Urutan
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            >
              <option value="asc">A-Z / Rendah-Tinggi</option>
              <option value="desc">Z-A / Tinggi-Rendah</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">
              Harga Minimum
            </label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-2">
              Harga Maksimum
            </label>
            <input
              type="number"
              placeholder="999999999"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-4 py-2 border border-brand-200 rounded-lg focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
          </div>

          {/* Reset Button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm text-brand-600">
          {!loading && !isFiltering && (
            <span>Ditemukan {products.length} produk</span>
          )}
          {isFiltering && <span>Sedang memfilter...</span>}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center text-brand-700">Memuat produk...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-brand-700">
          {searchTerm || minPrice || maxPrice ? 
            "Tidak ada produk yang sesuai dengan filter." : 
            "Tidak ada produk ditemukan."}
        </div>
      ) : (        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product, index) => {
            // Prefer API-provided slug; fallback to generated
            const slug = product.slug || toSlug(product.namaProduk || '');

            return (
              <div key={product.idProduk || index} className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <div className="relative z-10 p-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {product.fotoProduk && (
                      <img 
                        src={product.fotoProduk.replace(/\\/g, "")} 
                        alt={product.namaProduk} 
                        className="w-32 h-32 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200" 
                      />
                    )}
                    <div className="text-center">
                      <h2 className="text-lg font-semibold text-brand-700 mb-2">
                        <a 
                          href={`/produk/${slug}`}
                          className="hover:text-brand-600 transition-colors"
                        >
                          {product.namaProduk}
                        </a>
                      </h2>
                      
                      {product.bpom && (
                        <p className="text-sm text-gray-600 mb-2">
                          BPOM: {product.bpom}
                        </p>
                      )}
                      
                      {product.hargaUmum && (
                        <p className="text-xl font-bold text-brand-600">
                          {formatPrice(product.hargaUmum)}
                        </p>
                      )}
                      
                      {product.deskripsi && (
                        <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                          {product.deskripsi}
                        </p>
                      )}
                      
                      {/* View Details Button */}
                      <div className="mt-4">
                        <a 
                          href={`/produk/${slug}`}
                          className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
                        >
                          Lihat Detail
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
