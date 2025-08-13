import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import PaginationControls from '../../components/PaginationControls';

// Types for search params and API response
interface ProdukPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface PaginationInfo {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Helper: format Rupiah
function formatPrice(price: number | string | null | undefined) {
  if (price === null || price === undefined || price === '') return 'Harga tidak tersedia';
  const n = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(n as number)) return 'Harga tidak tersedia';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n as number);
}

// Helper: slug fallback
function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Local ProductCard (server component)
function ProductCard({ product }: { product: any }) {
  const slug = product.slug || toSlug(product.namaProduk || '');
  return (
    <div className="card group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 to-brand-200/10 opacity-0 group-hover:opacity-100 transition" />
      <div className="relative z-10 p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          {product.fotoProduk && (
            <Image
              src={String(product.fotoProduk).replace(/\\/g, '')}
              alt={product.namaProduk}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-200"
            />
          )}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-brand-700 mb-2">
              <Link href={`/produk/${slug}`} className="hover:text-brand-600 transition-colors">
                {product.namaProduk}
              </Link>
            </h2>
            {product.bpom && (
              <p className="text-sm text-gray-600 mb-2">BPOM: {product.bpom}</p>
            )}
            {product.hargaUmum && (
              <p className="text-xl font-bold text-brand-600">{formatPrice(product.hargaUmum)}</p>
            )}
            {product.deskripsi && (
              <p className="text-sm text-gray-700 mt-3 line-clamp-3">{product.deskripsi}</p>
            )}
            <div className="mt-4">
              <Link
                href={`/produk/${slug}`}
                className="inline-flex items-center px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Lihat Detail
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProdukPage({ searchParams }: ProdukPageProps) {
  // 1-2. Determine currentPage
  const rawPage = (searchParams?.page ?? '1');
  const currentPage = Array.isArray(rawPage) ? parseInt(rawPage[0] || '1', 10) : parseInt(rawPage as string, 10) || 1;
  const page = Number.isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const limit = 12;

  // 3. Fetch data from internal API with absolute URL
  const hdrs = await headers();
  const host = hdrs.get('host');
  const proto = hdrs.get('x-forwarded-proto') || 'http';
  const base = `${proto}://${host}`;

  const res = await fetch(`${base}/api/db-products?page=${page}&limit=${limit}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Gagal mengambil data produk');
  }
  // 4. Extract products and pagination
  const json = await res.json();
  const products: any[] = Array.isArray(json.data) ? json.data : [];
  const paginationInfo: PaginationInfo = json.pagination || {
    totalProducts: products.length,
    totalPages: 1,
    currentPage: page,
    limit,
  };

  return (
    <div className="container py-14">
      {/* 5. Heading */}
      <h1 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
        Katalog Produk
      </h1>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center text-brand-700">Tidak ada produk ditemukan.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 6. PaginationControls */}
      <div className="mt-10">
        <PaginationControls
          currentPage={paginationInfo.currentPage}
          totalPages={paginationInfo.totalPages}
          limit={paginationInfo.limit}
          totalProducts={paginationInfo.totalProducts}
          basePath="/produk"
        />
      </div>
    </div>
  );
}
