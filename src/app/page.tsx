import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex-1 py-14">
      <div className="container">
        <SignedOut>
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400">
              Selamat Datang di DRW Skincare
            </h1>
            <p className="text-lg text-brand-800/70 mb-10 max-w-2xl mx-auto">
              Produk perawatan kulit premium untuk rutinitas harian Anda. Silakan masuk untuk menjelajahi produk kami.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Pembersih</h3>
                <p className="text-brand-800/70">Produk pembersih lembut untuk semua jenis kulit</p>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Pelembab</h3>
                <p className="text-brand-800/70">Formula menghidrasi untuk kulit yang sehat</p>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Serum</h3>
                <p className="text-brand-800/70">Perawatan khusus untuk masalah kulit tertentu</p>
              </div>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400">
              Selamat Datang Kembali di DRW Skincare
            </h1>
            <p className="text-lg text-brand-800/70 mb-10 max-w-2xl mx-auto">
              Anda telah masuk. Jelajahi koleksi perawatan kulit premium kami.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Pembersih</h3>
                <p className="text-brand-800/70">Produk pembersih lembut untuk semua jenis kulit</p>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Pelembab</h3>
                <p className="text-brand-800/70">Formula menghidrasi untuk kulit yang sehat</p>
              </div>
              <div className="card group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
                <h3 className="text-xl font-semibold mb-2 text-brand-700">Serum</h3>
                <p className="text-brand-800/70">Perawatan khusus untuk masalah kulit tertentu</p>
              </div>
            </div>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
