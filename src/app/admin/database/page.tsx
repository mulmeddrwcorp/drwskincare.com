'use client';

import { useState, useEffect } from 'react';

interface Reseller {
  id: string;
  apiResellerId?: string;
  idReseller?: string;
  namaReseller?: string;
  nomorHp?: string;
  area?: string;
  level?: string;
  fotoProfil?: string; // legacy
  profile?: any; // include profile object
}

interface Product {
  id: string;
  idProduk: string;
  namaProduk: string;
  bpom?: string;
  hargaDirector?: number;
  hargaManager?: number;
  hargaSupervisor?: number;
  hargaConsultant?: number;
  hargaUmum?: number;
  gambar?: string;
  deskripsi?: string;
}

export default function DatabaseView() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'resellers' | 'products'>('resellers');
  const [loading, setLoading] = useState(false);

  const fetchResellers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-resellers');
      const data = await response.json();
      if (data.success) {
        setResellers(data.data);
      }
    } catch (error) {
      console.error('Error fetching resellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/db-products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'resellers') {
      fetchResellers();
    } else {
      fetchProducts();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Database View
          </h1>
          <p className="text-gray-600">
            Data resellers dan products dari database Neon
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('resellers')}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === 'resellers'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resellers ({resellers.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Products ({products.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* Resellers Table */}
              {activeTab === 'resellers' && (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl overflow-hidden shadow-lg">
                    <thead className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">ID Reseller</th>
                        <th className="px-6 py-4 text-left">Nama</th>
                        <th className="px-6 py-4 text-left">No HP</th>
                        <th className="px-6 py-4 text-left">Area</th>
                        <th className="px-6 py-4 text-left">Level</th>
                        <th className="px-6 py-4 text-left">Foto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resellers.map((reseller, index) => (
                        <tr key={reseller.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 font-mono text-sm">{reseller.apiResellerId ?? reseller.idReseller}</td>
                          <td className="px-6 py-4 font-semibold">{reseller.namaReseller ?? reseller.profile?.nama_reseller ?? reseller.apiResellerId}</td>
                          <td className="px-6 py-4">{reseller.nomorHp ?? reseller.profile?.whatsapp_number}</td>
                          <td className="px-6 py-4">{reseller.area ?? reseller.profile?.city}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {reseller.level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            { (reseller.fotoProfil || reseller.profile?.photo_url) ? (
                              <img 
                                src={String(reseller.fotoProfil ?? reseller.profile?.photo_url)} 
                                alt={String(reseller.namaReseller ?? reseller.profile?.nama_reseller ?? reseller.apiResellerId)} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Products Table */}
              {activeTab === 'products' && (
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-2xl overflow-hidden shadow-lg">
                    <thead className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left">ID Produk</th>
                        <th className="px-6 py-4 text-left">Nama Produk</th>
                        <th className="px-6 py-4 text-left">BPOM</th>
                        <th className="px-6 py-4 text-left">Harga Director</th>
                        <th className="px-6 py-4 text-left">Harga Umum</th>
                        <th className="px-6 py-4 text-left">Gambar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => (
                        <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-6 py-4 font-mono text-sm">{product.idProduk}</td>
                          <td className="px-6 py-4 font-semibold">{product.namaProduk}</td>
                          <td className="px-6 py-4 text-sm">{product.bpom}</td>
                          <td className="px-6 py-4 text-green-600 font-semibold">
                            {product.hargaDirector ? `Rp ${product.hargaDirector.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-blue-600 font-semibold">
                            {product.hargaUmum ? `Rp ${product.hargaUmum.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            {product.gambar ? (
                              <img 
                                src={product.gambar} 
                                alt="Produk" 
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
