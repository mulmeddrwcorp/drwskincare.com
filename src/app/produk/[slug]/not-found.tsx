import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-14">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Produk Tidak Ditemukan
        </h1>
        
        <p className="text-gray-600 mb-8">
          Maaf, produk yang Anda cari tidak ditemukan atau mungkin sudah tidak tersedia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/produk"
            className="btn-primary"
          >
            ← Kembali ke Daftar Produk
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
