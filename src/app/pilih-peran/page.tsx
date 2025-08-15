"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PilihPeranPage() {
  const router = useRouter();
  // On mount, check whether this user is already linked to a reseller
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/resellers/me');
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          const apiResellerId = data?.reseller?.apiResellerId ?? null;
          if (apiResellerId) {
            // redirect to reseller profile page
            router.replace(`/reseller/${apiResellerId}`);
          }
        }
      } catch (e) {
        // ignore — unauthenticated or not linked
      }
    })();
    return () => { mounted = false; };
  }, [router]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBeautyConsultant = () => {
    router.push('/lengkapi-profil-bc');
  };

  const isSubmitting = useRef(false);

  const handleNewUser = async () => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    setError(null);
    try {
      // API placeholder: server should set publicMetadata.role for the authenticated user
      const res = await fetch('/api/users/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user' }),
      });

      if (!res.ok) throw new Error('Gagal menandai peran');

      // On success redirect to dashboard
      router.push('/dashboard');
    } catch (e: any) {
      setError(e?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Pilih Peran Anda</h1>
        <p className="text-center text-gray-600 mb-8">Pilih peran untuk melanjutkan pengalaman Anda di DRW Skincare.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={handleBeautyConsultant}
            className="rounded-lg border p-6 text-left bg-white hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">Saya Beauty Consultant</h2>
            <p className="text-gray-600">Hubungkan akun Anda dengan data reseller yang sudah ada.</p>
          </button>

          <button
            type="button"
            onClick={handleNewUser}
            disabled={loading}
            className="rounded-lg border p-6 text-left bg-white hover:shadow-lg transition disabled:opacity-60"
          >
            <h2 className="text-xl font-semibold mb-2">Saya Pengguna Baru</h2>
            <p className="text-gray-600 mb-4">Buat akun baru untuk konsultasi dan fitur lainnya.</p>
            {loading ? <span className="text-sm text-gray-500">Mengupdate peran...</span> : null}
            {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
