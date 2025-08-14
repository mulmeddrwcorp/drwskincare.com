import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getResellerPublicProfile } from '../../../lib/data';

// TypeScript interface for the params - Next.js 15 compatibility
interface ResellerPageProps {
  params: Promise<{
    username: string;
  }>;
}

// ProductCard component
interface ProductCardProps {
  product: any;
  displayPrice: number | null;
  resellerWhatsappNumber?: string;
}

function ProductCard({ product, displayPrice, resellerWhatsappNumber }: ProductCardProps) {
  // Format harga ke Rupiah
  const formatPrice = (price: number | null) => {
    if (!price) return 'Harga tidak tersedia';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(price));
  };

  // Create slug from product name for detail link
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const slug = product.slug || createSlug(product.namaProduk);

  // WhatsApp message template
  const whatsappMessage = `Halo! Saya tertarik dengan produk ${product.namaProduk}. Bisakah Anda memberikan informasi lebih lanjut?`;
  const whatsappUrl = resellerWhatsappNumber 
    ? `https://wa.me/${resellerWhatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`
    : '#';

  return (
    <div className="card group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
      <div className="relative z-10 p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Product Image */}
          {product.fotoProduk ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md">
              <Image
                src={String(product.fotoProduk).replace(/\\/g, "")}
                alt={product.namaProduk}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="128px"
              />
            </div>
          ) : (
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Product Details */}
          <div className="text-center w-full">
            <h3 className="text-lg font-semibold text-brand-700 mb-2">
              <a 
                href={`/produk/${slug}`}
                className="hover:text-brand-600 transition-colors"
              >
                {product.namaProduk}
              </a>
            </h3>
            
            {product.bpom && (
              <p className="text-sm text-gray-600 mb-2">
                BPOM: {product.bpom}
              </p>
            )}
            
            {/* Display Price */}
            <div className="mb-4">
              <p className="text-xl font-bold text-brand-600">
                {formatPrice(displayPrice)}
              </p>
              {displayPrice !== product.hargaUmum && product.hargaUmum && (
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(Number(product.hargaUmum))}
                </p>
              )}
            </div>
            
            {product.deskripsi && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {product.deskripsi}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <a 
                href={`/produk/${slug}`}
                className="w-full px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors text-center"
              >
                Lihat Detail
              </a>
              
              {resellerWhatsappNumber && (
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Beli ${product.namaProduk} via WhatsApp`}
                  className="w-full px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                  </svg>
                  Beli via WA
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server Component untuk halaman profil reseller
export default async function ResellerProfilePage({ params }: ResellerPageProps) {
  // Await params before using - Next.js 15 compatibility
  const { username } = await params;
  
  // Ambil data profil reseller berdasarkan username
  const profile = await getResellerPublicProfile(username);

  // Jika profil tidak ditemukan, panggil notFound()
  if (!profile) {
    notFound();
  }

  const { reseller, products, customPrices } = profile;

  return (
    <div className="min-h-screen">
      {/* Header Profil / Hero Section */}
      <div className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 text-white py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Foto Profil */}
            <div className="relative">
              {reseller.fotoProfil ? (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                  <Image
                    src={reseller.fotoProfil}
                    alt={reseller.namaReseller}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20">
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              
              {/* Level Badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-brand-600 shadow-lg">
                  {reseller.level}
                </span>
              </div>
            </div>

            {/* Info Profil */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {reseller.namaReseller}
              </h1>
              <p className="text-xl text-white/90 mb-4">
                📍 {reseller.area}
              </p>
              <p className="text-white/80 mb-6">
                Reseller terpercaya DRW Skincare dengan level <strong>{reseller.level}</strong>
              </p>

              {/* Social Media Links */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                {reseller.facebook && (
                  <a 
                    href={reseller.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                
                {reseller.instagram && (
                  <a 
                    href={reseller.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.565-3.252-1.453-.804-.888-1.297-2.08-1.297-3.378 0-1.297.493-2.489 1.297-3.377.804-.888 1.955-1.453 3.252-1.453s2.448.565 3.252 1.453c.804.888 1.297 2.08 1.297 3.377 0 1.298-.493 2.49-1.297 3.378-.804.888-1.955 1.453-3.252 1.453zm7.718 0c-1.297 0-2.448-.565-3.252-1.453-.804-.888-1.297-2.08-1.297-3.378 0-1.297.493-2.489 1.297-3.377.804-.888 1.955-1.453 3.252-1.453s2.448.565 3.252 1.453c.804.888 1.297 2.08 1.297 3.377 0 1.298-.493 2.49-1.297 3.378-.804.888-1.955 1.453-3.252 1.453z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Katalog Produk */}
      <div className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
          Katalog Produk dari {reseller.namaReseller}
        </h2>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-2-2m0 0l-2 2m2-2v6m-1 1l-2 2m2-2l2 2"/>
            </svg>
            <p>Belum ada produk tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product: any) => {
              // LOGIKA INTI: Cari harga custom untuk produk ini
              const customPrice = customPrices.find(
                (cp: any) => cp.productId === product.id
              );
              
              // Tentukan harga yang akan ditampilkan
              const displayPrice = customPrice 
                ? Number(customPrice.hargaCustom) 
                : product.hargaUmum 
                  ? Number(product.hargaUmum) 
                  : null;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  displayPrice={displayPrice}
                  resellerWhatsappNumber={reseller.nomorHp}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: ResellerPageProps) {
  // Await params per Next.js 15 dynamic params requirement
  const { username } = await params as any;

  const profile = await getResellerPublicProfile(username);

  if (!profile) {
    return {
      title: 'Reseller Tidak Ditemukan | DRW Skincare',
      description: 'Reseller yang Anda cari tidak ditemukan.',
    };
  }

  const { reseller } = profile;

  return {
    title: `Toko Resmi DRW Skincare - ${reseller.namaReseller}`,
    description: `Beli produk DRW Skincare asli dari Beauty Consultant resmi kami, ${reseller.namaReseller}, yang berlokasi di ${reseller.area}.`,
  };
}