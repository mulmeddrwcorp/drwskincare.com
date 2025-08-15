'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProfilPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // State untuk form fields
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    whatsappNumber: '',
    facebook: '',
    instagram: '',
  alamat: '',
  provinsi: '',
  kabupaten: '',
  kecamatan: '',
  bank: '',
  rekening: '',
  });

  // State untuk loading dan notifikasi
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // useEffect untuk mengambil data profil saat ini
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!isLoaded || !user) return;

      try {
        const response = await fetch('/api/resellers/me');
        
        if (response.ok) {
          const data = await response.json();
          const reseller = data.reseller;
          
          // Isi form dengan data yang ada (mapped profile fields)
          setFormData({
            name: reseller.namaReseller || (reseller.profile?.nama_reseller ?? reseller.profile?.displayName) || '',
            city: reseller.area || reseller.profile?.city || '',
            whatsappNumber: (reseller.profile?.whatsapp_number ?? reseller.profile?.whatsappNumber) || reseller.nomorHp || '',
            facebook: reseller.profile?.facebook || '',
            instagram: reseller.profile?.instagram || '',
              alamat: reseller.profile?.alamat || '',
              provinsi: reseller.profile?.provinsi || '',
              kabupaten: reseller.profile?.kabupaten || '',
              kecamatan: reseller.profile?.kecamatan || '',
              bank: reseller.profile?.bank || '',
              rekening: reseller.profile?.rekening || '',
          });
        } else {
          console.error('Failed to fetch profile data');
          showNotification('error', 'Gagal mengambil data profil');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('error', 'Terjadi kesalahan saat mengambil data');
      } finally {
        setFetchingData(false);
      }
    };

    fetchCurrentProfile();
  }, [isLoaded, user]);

  // Function untuk menampilkan notifikasi
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Hapus notifikasi setelah 5 detik
  };

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.city.trim()) {
      showNotification('error', 'Nama dan Kota wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const payload = {
  nama_reseller: formData.name,
        city: formData.city,
        whatsapp_number: formData.whatsappNumber || null,
        bio: null,
        photo_url: null,
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
  alamat: formData.alamat || null,
  provinsi: formData.provinsi || null,
  kabupaten: formData.kabupaten || null,
  kecamatan: formData.kecamatan || null,
  bank: formData.bank || null,
  rekening: formData.rekening || null,
      };

      const response = await fetch('/api/resellers/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Profil berhasil diperbarui!');
        // Redirect ke dashboard setelah 2 detik
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        showNotification('error', data.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  // Loading state saat mengambil data
  if (!isLoaded || fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profil</h1>
              <p className="mt-2 text-gray-600">
                Perbarui informasi profil reseller Anda
              </p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-800'
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Kota */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Kota/Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Masukkan kota atau area"
                required
              />
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Contoh: 081234567890"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nomor ini akan digunakan untuk kontak pelanggan
              </p>
            </div>

            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://facebook.com/username"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://instagram.com/username"
              />
            </div>

            {/* Alamat */}
            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap
              </label>
              <input
                type="text"
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Jalan, Nomor, RT/RW"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                <input
                  type="text"
                  id="provinsi"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Provinsi"
                />
              </div>

              <div>
                <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700 mb-2">Kabupaten/Kota</label>
                <input
                  type="text"
                  id="kabupaten"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Kabupaten atau Kota"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
                <input
                  type="text"
                  id="kecamatan"
                  name="kecamatan"
                  value={formData.kecamatan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Kecamatan"
                />
              </div>

              <div>
                <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">Bank</label>
                <input
                  type="text"
                  id="bank"
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Nama Bank"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rekening" className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening</label>
              <input
                type="text"
                id="rekening"
                name="rekening"
                value={formData.rekening}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nomor Rekening"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}