import { getResellerDashboardData } from '../../lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Ambil data reseller dashboard
  const dashboardData = await getResellerDashboardData();

  // Jika tidak ada data, tampilkan pesan error atau redirect
  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">
            Tidak dapat memuat data dashboard. Pastikan Anda sudah login dan terdaftar sebagai reseller.
          </p>
          <Link 
            href="/sign-in" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login Kembali
          </Link>
        </div>
      </div>
    );
  }

  const { reseller, totalClicks } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Selamat Datang, {reseller.namaReseller}!
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola toko online Anda dan pantau performa penjualan
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Widget Profil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Reseller</h2>
              
              <div className="flex flex-col items-center text-center">
                {/* Foto Profil */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                  {reseller.fotoProfil ? (
                    <Image
                      src={reseller.fotoProfil}
                      alt={reseller.namaReseller}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Info Profil */}
                <h3 className="text-lg font-medium text-gray-900 mb-1">{reseller.namaReseller}</h3>
                <p className="text-sm text-gray-600 mb-1">ID: {reseller.idReseller}</p>
                <p className="text-sm text-gray-600 mb-1">Level: {reseller.level}</p>
                <p className="text-sm text-gray-600 mb-4">Area: {reseller.area}</p>
                
                {/* Edit Profil Button */}
                <Link
                  href="/dashboard/profil/edit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Edit Profil
                </Link>
              </div>
            </div>
          </div>

          {/* Widget Statistik & Shortcuts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Widget Statistik */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistik Analytics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Klik WhatsApp */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Total Klik WhatsApp</p>
                      <p className="text-2xl font-bold text-green-900">{totalClicks.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Placeholder untuk statistik lainnya */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Produk Aktif</p>
                      <p className="text-2xl font-bold text-blue-900">-</p>
                      <p className="text-xs text-blue-500">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget Shortcut */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Atur Harga Custom */}
                <Link
                  href="/dashboard/harga-custom"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Atur Harga Custom</p>
                    <p className="text-xs text-gray-500">Kelola harga produk Anda</p>
                  </div>
                </Link>

                {/* Lihat Halaman Toko */}
                <Link
                  href={`/reseller/${reseller.idReseller}`}
                  target="_blank"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Lihat Halaman Toko Saya</p>
                    <p className="text-xs text-gray-500">Preview toko online Anda</p>
                  </div>
                </Link>

                {/* Kelola Produk */}
                <Link
                  href="/dashboard/produk"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Kelola Produk</p>
                    <p className="text-xs text-gray-500">Atur katalog produk</p>
                  </div>
                </Link>

                {/* Analytics */}
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Analytics</p>
                    <p className="text-xs text-gray-500">Lihat laporan performa</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}