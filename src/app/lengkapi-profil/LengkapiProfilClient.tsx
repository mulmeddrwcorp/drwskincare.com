"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type ResellerData = {
  id?: string;
  namaReseller?: string;
  area?: string;
  [key: string]: any;
};

export default function LengkapiProfilClient() {
  const { user } = useUser();

  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [foundResellerData, setFoundResellerData] = useState<ResellerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'confirm'>('form');

  useEffect(() => {
    // If Clerk user has primary email, prefill
    try {
      if ((user as any)?.primaryEmailAddress?.emailAddress) {
        setEmail((user as any).primaryEmailAddress.emailAddress);
      }
    } catch (e) {
      // ignore
    }
  }, [user]);

  async function handleFindReseller(e?: React.FormEvent) {
    e?.preventDefault();
    if (!phoneNumber) {
      alert('Masukkan nomor HP terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/resellers/find-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await res.json();
      if (res.ok && data?.success && data?.data) {
        // API returns { id, namaReseller, area }
        setFoundResellerData({
          id: data.data.id,
          namaReseller: data.data.namaReseller ?? data.data.nama_reseller ?? null,
          area: data.data.area ?? null,
        });
        setCurrentStep('confirm');
      } else {
        alert(data?.error || 'Data reseller tidak ditemukan');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mencari data reseller');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLinkAccount() {
    if (!foundResellerData) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/resellers/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, email, resellerId: foundResellerData.id })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        // Redirect or show success
        window.location.href = '/dashboard';
      } else {
        alert(data?.error || 'Gagal mengaitkan akun');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengaitkan akun');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      {currentStep === 'form' && (
        <form onSubmit={handleFindReseller} className="space-y-4">
          <h2 className="text-xl font-semibold">Lengkapi Profil</h2>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!(user as any)?.primaryEmailAddress?.emailAddress}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nomor HP</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0812xxxx"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {isLoading ? 'Mencari...' : 'Cari Data'}
            </button>
          </div>
        </form>
      )}

      {currentStep === 'confirm' && foundResellerData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kami menemukan data berikut. Apakah ini Anda?</h2>

          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Nama:</strong> {foundResellerData.namaReseller || '-'}</p>
            <p><strong>Area:</strong> {foundResellerData.area || '-'}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleLinkAccount}
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {isLoading ? 'Menghubungkan...' : 'Ya, Benar Ini Saya'}
            </button>

            <button
              onClick={() => { setCurrentStep('form'); setFoundResellerData(null); }}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Bukan, Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
