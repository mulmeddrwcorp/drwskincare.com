import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-14">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Reseller Tidak Ditemukan
        </h1>
        
        <p className="text-gray-600 mb-8">
          Maaf, reseller yang Anda cari tidak ditemukan atau mungkin sudah tidak aktif.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/reseller"
            className="btn-primary"
          >
            ← Lihat Daftar Reseller
          </Link>
          
          <Link 
            href="/"
            className="btn-secondary"
          >
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
