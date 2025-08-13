import Link from 'next/link';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  totalProducts: number;
  basePath: string; // e.g., "/produk"
}

export default function PaginationControls({ currentPage, totalPages, limit, totalProducts, basePath }: PaginationControlsProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : 1;
  const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;

  const makeHref = (page: number) => `${basePath}?page=${page}`;

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between">
      <div className="text-sm text-brand-700">
        Menampilkan halaman {currentPage} dari {totalPages} • {totalProducts} produk
      </div>
      <div className="flex items-center gap-2">
        <Link
          aria-disabled={currentPage <= 1}
          href={makeHref(prevPage)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-brand-50 border-brand-200 text-brand-700'}`}
        >
          Sebelumnya
        </Link>
        <Link
          aria-disabled={currentPage >= totalPages}
          href={makeHref(nextPage)}
          className={`px-3 py-1.5 rounded-lg border text-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-brand-50 border-brand-200 text-brand-700'}`}
        >
          Selanjutnya
        </Link>
      </div>
    </nav>
  );
}
