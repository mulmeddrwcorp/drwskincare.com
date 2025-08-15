"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function LengkapiProfilBC() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [foundResellerData, setFoundResellerData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'confirm'>('form');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      setEmail(user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '');
    }
  }, [isLoaded, user]);

  const handleFindReseller = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    setFoundResellerData(null);

    try {
      const res = await fetch('/api/resellers/find-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Reseller tidak ditemukan');
      }

      const data = await res.json();
      setFoundResellerData(data.data || data);
      setCurrentStep('confirm');
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat mencari reseller');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    if (!foundResellerData) return;
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        resellerId: foundResellerData.id,
  nama_reseller: foundResellerData.namaReseller ?? foundResellerData.nama_reseller ?? null,
        whatsapp_number: phoneNumber || null,
        photo_url: null,
      };

      const res = await fetch('/api/resellers/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data?.existingResellerId) {
          // Redirect to existing linked reseller profile and mark as linked
          router.push(`/reseller/${data.existingResellerId}?linked=true`);
          return;
        }
        throw new Error(data?.error || 'Gagal mengaitkan akun');
      }

      // success -> redirect to reseller storefront (use apiResellerId when available)
      const storefrontId = foundResellerData?.apiResellerId ?? foundResellerData?.api_reseller_id ?? foundResellerData?.id;
      if (storefrontId) {
        router.push(`/reseller/${storefrontId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan saat mengaitkan akun');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Lengkapi Profil Beauty Consultant</h1>

        {currentStep === 'form' && (
          <form onSubmit={handleFindReseller} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nomor HP</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 081234567890"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
              >
                {isLoading ? 'Mencari...' : 'Cari Reseller'}
              </button>
            </div>
          </form>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Reseller Ditemukan</h2>
            <div className="border rounded p-4">
              <p><strong>Nama:</strong> {foundResellerData?.namaReseller ?? foundResellerData?.nama_reseller}</p>
              <p><strong>Area:</strong> {foundResellerData?.area ?? '-'}</p>
              <p><strong>API ID:</strong> {foundResellerData?.apiResellerId ?? foundResellerData?.api_reseller_id ?? foundResellerData?.id}</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCurrentStep('form'); setFoundResellerData(null); setError(null); }}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Bukan, Coba Lagi
              </button>

              <button
                onClick={handleLinkAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
              >
                {isLoading ? 'Mengaitkan...' : 'Ya, Benar Ini Saya'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
