"use client";
import { useEffect, useState } from "react";

export default function ResellerPage() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResellers() {
      try {
        const res = await fetch("/api/db-resellers");
        if (!res.ok) throw new Error("Gagal mengambil data reseller");
        const data = await res.json();
        setResellers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
    fetchResellers();
  }, []);

  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">Daftar Reseller DRW Skincare</h1>
      {loading ? (
        <div className="text-center text-brand-700">Memuat reseller...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-xl bg-white/60 backdrop-blur-md">            <thead>
              <tr className="bg-brand-100">
                <th className="px-4 py-2 text-left font-semibold text-brand-700">ID</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Nama</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Level</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Daerah</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {resellers.map((reseller, index) => (
                <tr key={reseller.idReseller || index} className="border-b hover:bg-brand-50/50">
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.idReseller}</td>
                  <td className="px-4 py-2 text-sm text-brand-800/80 font-medium">
                    <a 
                      href={`/reseller/${reseller.idReseller}`}
                      className="text-brand-700 hover:text-brand-600 transition-colors"
                    >
                      {reseller.namaReseller}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-sm text-brand-800/80">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                      {reseller.level}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.area}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex gap-2">
                      <a 
                        href={`/reseller/${reseller.idReseller}`}
                        className="inline-flex items-center px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded hover:bg-brand-600 transition-colors"
                      >
                        Lihat Profil
                      </a>
                      <a 
                        href={`https://wa.me/${reseller.nomorHp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo! Saya tertarik dengan produk DRW Skincare.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
