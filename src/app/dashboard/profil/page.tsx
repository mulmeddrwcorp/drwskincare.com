'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileData {
  nama_reseller: string;
  whatsapp_number: string;
  city: string;
  bio: string;
  photo_url: string | null;
  facebook: string;
  instagram: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  bank: string;
  rekening: string;
  level: string;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State untuk form fields berdasarkan snake_case dari database
  const [formData, setFormData] = useState<ProfileData>({
    nama_reseller: '',
    whatsapp_number: '',
    city: '',
    bio: '',
    photo_url: null,
    facebook: '',
    instagram: '',
    alamat: '',
    provinsi: '',
    kabupaten: '',
    kecamatan: '',
    bank: '',
    rekening: '',
    level: '',
  });

  // State untuk loading dan notifikasi
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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
          
          // Map dari response ke formData dengan snake_case fields
          setFormData({
            nama_reseller: reseller.profile?.nama_reseller || '',
            whatsapp_number: reseller.profile?.whatsapp_number || reseller.nomorHp || '',
            city: reseller.profile?.city || '',
            bio: reseller.profile?.bio || '',
            photo_url: reseller.profile?.photo_url || null,
            facebook: reseller.profile?.facebook || '',
            instagram: reseller.profile?.instagram || '',
            alamat: reseller.profile?.alamat || '',
            provinsi: reseller.profile?.provinsi || '',
            kabupaten: reseller.profile?.kabupaten || '',
            kecamatan: reseller.profile?.kecamatan || '',
            bank: reseller.profile?.bank || '',
            rekening: reseller.profile?.rekening || '',
            level: reseller.profile?.level || reseller.status || '',
          });
          
          // Set photo preview
          if (reseller.profile?.photo_url) {
            setPhotoPreview(reseller.profile.photo_url);
          }
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
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle Facebook dan Instagram dengan prefix
    if (name === 'facebook' && value && !value.startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        [name]: `https://facebook.com/${value.replace(/^@/, '')}`
      }));
    } else if (name === 'instagram' && value && !value.startsWith('http')) {
      setFormData(prev => ({
        ...prev,
        [name]: `https://instagram.com/${value.replace(/^@/, '')}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Ukuran file maksimal 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Create FormData for upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      // Get reseller ID from current profile data
      const profileResponse = await fetch('/api/resellers/me');
      const profileData = await profileResponse.json();
      const resellerId = profileData.reseller.id;
      
      uploadFormData.append('resellerId', resellerId);

      // Upload to Vercel Blob
      const response = await fetch('/api/upload-foto', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          photo_url: data.url
        }));
        setPhotoPreview(data.url);
        showNotification('success', 'Foto profil berhasil diupload!');
      } else {
        showNotification('error', data.error || 'Gagal mengupload foto');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showNotification('error', 'Terjadi kesalahan saat mengupload foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi required fields
    if (!formData.nama_reseller.trim()) {
      showNotification('error', 'Nama reseller wajib diisi');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nama_reseller: formData.nama_reseller || null,
        city: formData.city || null,
        whatsapp_number: formData.whatsapp_number || null,
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
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
              <h1 className="text-3xl font-bold text-gray-900">Profil Reseller</h1>
              <p className="mt-2 text-gray-600">
                Kelola informasi profil dan data reseller Anda
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
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Photo Upload Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Foto Profil</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {photoPreview ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
                      <Image
                        src={photoPreview}
                        alt="Preview foto profil"
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploadingPhoto ? 'Mengupload...' : 'Upload Foto'}
                  </button>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG maksimal 5MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Informasi Dasar</h3>
              
              {/* Nama Reseller */}
              <div>
                <label htmlFor="nama_reseller" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Reseller <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nama_reseller"
                  name="nama_reseller"
                  value={formData.nama_reseller}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan nama reseller"
                  required
                />
              </div>

              {/* Level (Read-only) */}
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <input
                  type="text"
                  id="level"
                  name="level"
                  value={formData.level}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Level akan ditentukan sistem"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Level ditentukan oleh sistem dan tidak dapat diubah
                </p>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp_number"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Contoh: 081234567890"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Nomor ini akan digunakan untuk kontak pelanggan
                </p>
              </div>

              {/* City/Area */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Kota/Area
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan kota atau area"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ceritakan tentang diri Anda sebagai reseller"
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Media Sosial</h3>
              
              {/* Facebook */}
              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    facebook.com/
                  </span>
                  <input
                    type="text"
                    id="facebook"
                    name="facebook"
                    value={formData.facebook.replace('https://facebook.com/', '').replace('https://www.facebook.com/', '')}
                    onChange={(e) => {
                      const username = e.target.value.replace(/^@/, '');
                      setFormData(prev => ({
                        ...prev,
                        facebook: username ? `https://facebook.com/${username}` : ''
                      }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="username"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    instagram.com/
                  </span>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram.replace('https://instagram.com/', '').replace('https://www.instagram.com/', '')}
                    onChange={(e) => {
                      const username = e.target.value.replace(/^@/, '');
                      setFormData(prev => ({
                        ...prev,
                        instagram: username ? `https://instagram.com/${username}` : ''
                      }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Informasi Alamat</h3>
              
              {/* Alamat */}
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Jalan, Nomor, RT/RW"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Provinsi */}
                <div>
                  <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-2">
                    Provinsi
                  </label>
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

                {/* Kabupaten */}
                <div>
                  <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700 mb-2">
                    Kabupaten/Kota
                  </label>
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

              {/* Kecamatan */}
              <div>
                <label htmlFor="kecamatan" className="block text-sm font-medium text-gray-700 mb-2">
                  Kecamatan
                </label>
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
            </div>

            {/* Banking Information */}
            <div className="space-y-6 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Informasi Bank</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Bank */}
                <div>
                  <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    id="bank"
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Contoh: BCA, Mandiri, BRI"
                  />
                </div>

                {/* Rekening */}
                <div>
                  <label htmlFor="rekening" className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Rekening
                  </label>
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
              </div>
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
