"use client";
import { useEffect, useState } from "react";

export default function ResellerPage() {
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResellers() {
      try {
        const res = await fetch("/api/resellers");
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
          <table className="min-w-full border rounded-xl bg-white/60 backdrop-blur-md">
            <thead>
              <tr className="bg-brand-100">
                <th className="px-4 py-2 text-left font-semibold text-brand-700">ID</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Nama</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">WA</th>
                <th className="px-4 py-2 text-left font-semibold text-brand-700">Daerah</th>
              </tr>
            </thead>
            <tbody>
              {resellers.map((reseller, index) => (
                <tr key={reseller.id_reseller || index} className="border-b hover:bg-brand-50/50">
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.id_reseller}</td>
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.nama_reseller}</td>
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.nomor_hp}</td>
                  <td className="px-4 py-2 text-sm text-brand-800/80">{reseller.area}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
