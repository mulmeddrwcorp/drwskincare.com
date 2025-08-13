
'use client';

import React, { useState } from 'react';

export default function AdminSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>("");

  // Ambil tanggal terakhir sync saat halaman dibuka
  React.useEffect(() => {
    async function fetchLastSync() {
      try {
        const res = await fetch('/api/sync-status');
        const data = await res.json();
        if (data.lastSync) setLastSync(data.lastSync);
      } catch {}
    }
    fetchLastSync();
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        if (data.lastSync) setLastSync(data.lastSync);
      } else {
        setError(data.error || 'Sync gagal');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Admin Panel - Data Sync
          </h1>
          <p className="text-gray-600">
            Sinkronisasi data resellers dan products dari API ke database Neon
          </p>
          <div className="mt-2 text-sm text-brand-700">
            Terakhir sync: {lastSync ? new Date(lastSync).toLocaleString() : 'Belum pernah'}
          </div>
        </div>

        {/* Sync Button */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <button
              onClick={handleSync}
              disabled={isLoading}
              className={`px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              {isLoading ? 'Syncing...' : 'Start Data Sync'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-green-50/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              ✅ Sync Berhasil!
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-700">Resellers</h3>
                <p className="text-2xl font-bold text-pink-600">{result.resellers}</p>
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-700">Products</h3>
                <p className="text-2xl font-bold text-purple-600">{result.products}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-red-800 mb-4">
              ❌ Sync Gagal
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            ℹ️ Informasi Sync
          </h2>
          <ul className="space-y-2 text-blue-700">
            <li>• Data resellers dan products akan disinkronisasi dari API</li>
            <li>• Gambar akan diupload ke Vercel Blob storage</li>
            <li>• Data existing akan diupdate, data baru akan ditambahkan</li>
            <li>• Proses ini mungkin memerlukan beberapa menit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
