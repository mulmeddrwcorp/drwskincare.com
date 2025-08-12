import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SignedOut>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Selamat Datang di DRW Skincare
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Produk perawatan kulit premium untuk rutinitas harian Anda. Silakan masuk untuk menjelajahi produk kami.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Pembersih</h3>
              <p className="text-gray-600">Produk pembersih lembut untuk semua jenis kulit</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Pelembab</h3>
              <p className="text-gray-600">Formula menghidrasi untuk kulit yang sehat</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Serum</h3>
              <p className="text-gray-600">Perawatan khusus untuk masalah kulit tertentu</p>
            </div>
          </div>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Selamat Datang Kembali di DRW Skincare
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Anda telah masuk. Jelajahi koleksi perawatan kulit premium kami.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Pembersih</h3>
              <p className="text-gray-600">Produk pembersih lembut untuk semua jenis kulit</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Pelembab</h3>
              <p className="text-gray-600">Formula menghidrasi untuk kulit yang sehat</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Serum</h3>
              <p className="text-gray-600">Perawatan khusus untuk masalah kulit tertentu</p>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
