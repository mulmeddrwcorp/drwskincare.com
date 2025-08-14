import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductBySlug } from '../../../lib/data';

// TypeScript interface for the params - Next.js 15 compatibility
interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Server Component untuk halaman detail produk
export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Await params before using
  const { slug } = await params;
  
  // Ambil data produk berdasarkan slug
  const product: any = await getProductBySlug(slug);

  // Jika produk tidak ditemukan, panggil notFound()
  if (!product) {
    notFound();
  }

  // Format harga ke Rupiah
  const formatPrice = (price: number | null) => {
    if (!price) return 'Harga tidak tersedia';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container py-14">      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-brand-600 mb-8">
        <a href="/produk" className="hover:text-brand-700 transition-colors">
          Produk
        </a>
        {product?.category?.name && (
          <>
            <span>/</span>
            <span className="text-gray-500">{product.category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-500">{product.namaProduk}</span>
      </nav>

      {/* Layout dua kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Kolom kiri - Gambar produk (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-8">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
              {product.fotoProduk ? (
                <Image
                  src={product.fotoProduk.replace(/\\/g, "")}
                  alt={product.namaProduk}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Gambar tidak tersedia</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>        {/* Kolom kanan - Detail produk (60%) */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Nama produk */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.namaProduk}
                </h1>
                {product?.category?.name && (
                  <span className="px-3 py-1 h-fit rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                    {product.category.name}
                  </span>
                )}
              </div>
              {product.bpom && (
                <p className="text-sm text-gray-600">
                  BPOM: {product.bpom}
                </p>
              )}
            </div>

            {/* Harga produk */}
            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex flex-col space-y-2">
                {product.hargaUmum && (
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">Harga Umum:</span>
                    <span className="text-2xl font-bold text-brand-600">
                      {formatPrice(Number(product.hargaUmum))}
                    </span>
                  </div>
                )}
                
                {/* Harga untuk reseller */}
                {(product.hargaConsultant || product.hargaSupervisor || product.hargaManager || product.hargaDirector) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Harga Reseller:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {product.hargaConsultant && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Consultant:</span>
                          <span className="font-medium">{formatPrice(Number(product.hargaConsultant))}</span>
                        </div>
                      )}
                      {product.hargaSupervisor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supervisor:</span>
                          <span className="font-medium">{formatPrice(Number(product.hargaSupervisor))}</span>
                        </div>
                      )}
                      {product.hargaManager && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Manager:</span>
                          <span className="font-medium">{formatPrice(Number(product.hargaManager))}</span>
                        </div>
                      )}
                      {product.hargaDirector && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Director:</span>
                          <span className="font-medium">{formatPrice(Number(product.hargaDirector))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Deskripsi produk */}
            {product.deskripsi && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Deskripsi Produk
                </h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.deskripsi}
                  </p>
                </div>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="flex-1 btn-primary text-lg py-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                </svg>
                Tambah ke Keranjang
              </button>
              <button className="flex-1 btn-secondary text-lg py-3">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.436L3 21l1.436-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                Hubungi WhatsApp
              </button>
            </div>

            {/* Info tambahan */}
            <div className="bg-brand-50 rounded-lg p-4 mt-6">
              <h4 className="font-semibold text-brand-700 mb-2">Informasi Pembelian</h4>
              <ul className="text-sm text-brand-600 space-y-1">
                <li>• Produk original dan bergaransi</li>
                <li>• Pengiriman ke seluruh Indonesia</li>
                <li>• Konsultasi gratis dengan tim ahli</li>
                <li>• Dapatkan harga reseller dengan bergabung sebagai member</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: ProductPageProps) {
  // Await params before using
  const { slug } = await params;
  
  const product: any = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan | DRW Skincare',
      description: 'Produk yang Anda cari tidak ditemukan. Silakan lihat produk lainnya dari DRW Skincare.',
    };
  }

  // Truncate description to 160 characters for SEO
  const truncateDescription = (text: string, maxLength: number = 160) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const defaultDescription = `${product.namaProduk} - Produk kecantikan berkualitas dari DRW Skincare dengan BPOM ${product.bpom || 'terdaftar'}.`;
  const description = product.deskripsi 
    ? truncateDescription(product.deskripsi) 
    : defaultDescription;

  return {
    title: `${product.namaProduk} | DRW Skincare`,
    description: description,
    keywords: `${product.namaProduk}, ${product?.category?.name ? product.category.name + ', ' : ''}skincare, kecantikan, BPOM, DRW Skincare`,    openGraph: {
      title: product.namaProduk,
      description: description,
      images: product.fotoProduk ? [product.fotoProduk.replace(/\\/g, "")] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.namaProduk,
      description: description,
      images: product.fotoProduk ? [product.fotoProduk.replace(/\\/g, "")] : [],
    }
  };
}