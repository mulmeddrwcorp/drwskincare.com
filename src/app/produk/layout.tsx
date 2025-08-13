// filepath: src/app/produk/layout.tsx
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Daftar Produk | DRW Skincare',
  description: 'Jelajahi katalog produk DRW Skincare. Temukan skincare berkualitas dengan BPOM dan harga terbaik.',
  openGraph: {
    title: 'Daftar Produk | DRW Skincare',
    description: 'Katalog produk DRW Skincare dengan berbagai pilihan skincare berkualitas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daftar Produk | DRW Skincare',
    description: 'Katalog produk DRW Skincare dengan berbagai pilihan skincare berkualitas.',
  },
};

export default function ProdukLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
