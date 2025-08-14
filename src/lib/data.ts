import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Type definitions for return values
export interface ResellerPublicProfile {
  reseller: {
    id: string;
    idReseller: string;
    namaReseller: string;
    nomorHp: string;
    area: string;
    level: string;
    facebook: string | null;
    instagram: string | null;
    fotoProfil: string | null;
    createdAt: Date;
  };
  products: Array<any>; // Complete product objects
  customPrices: Array<{
    id: string;
    resellerId: string;
    productId: string;
    hargaCustom: any; // Decimal type
    createdAt: Date;
    updatedAt: Date;
    product: {
      id: string;
      namaProduk: string;
      fotoProduk: string | null;
    };
  }>;
}

/**
 * Create a slug from product name
 * @param name - Product name
 * @returns URL-friendly slug
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Mencari produk berdasarkan slug
 * @param slug - URL-friendly identifier untuk produk
 * @returns Product atau null jika tidak ditemukan
 */
export async function getProductBySlug(slug: string) {
  // First, try the ideal lookup by slug with category included
  try {
    const product = await (prisma as any).product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (product) return product;
  } catch (error) {
    // If Prisma Client is outdated (e.g., unknown arg `slug`), fall back below
    console.warn('Primary slug lookup failed, falling back to name-derived slug matching:', error);
  }

  // Fallback: fetch all products and try matching against stored slug or generated slug from namaProduk
  try {
    const products = await prisma.product.findMany();
    const matched = products.find((p: any) => p.slug === slug || createSlug(p.namaProduk) === slug);
    return matched || null;
  } catch (error) {
    console.error('Error fetching product by slug (fallback):', error);
    return null;
  }
}

/**
 * Mendapatkan profil publik reseller berdasarkan username/idReseller
 * @param username - ID reseller atau username reseller
 * @returns Object berisi reseller, products, dan customPrices atau null jika tidak ditemukan
 */
export async function getResellerPublicProfile(username: string): Promise<ResellerPublicProfile | null> {
  try {
    // 1. Cari reseller berdasarkan idReseller (username)
    // Pilih hanya field yang bersifat publik
    const reseller = await prisma.reseller.findUnique({
      where: {
        idReseller: username
      },
      select: {
        id: true,
        idReseller: true,
        namaReseller: true,
        nomorHp: true, // Include for WhatsApp contact
        area: true,
        level: true,
        facebook: true,
        instagram: true,
        fotoProfil: true,
        createdAt: true,
        // Exclude sensitive data like apiData, etc.
      }
    });

    // Jika reseller tidak ditemukan, kembalikan null
    if (!reseller) {
      return null;
    }

    // 2. Ambil SEMUA daftar produk
    const products = await prisma.product.findMany({
      orderBy: {
        namaProduk: 'asc'
      }
    });

    // 3. Ambil SEMUA data harga_custom untuk reseller ini
    const customPrices = await prisma.hargaCustom.findMany({
      where: {
        resellerId: reseller.id
      },
      include: {
        product: {
          select: {
            id: true,
            namaProduk: true,
            fotoProduk: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Kembalikan objek dengan reseller, products, dan customPrices
    return {
      reseller,
      products,
      customPrices
    };

  } catch (error) {
    console.error('Error fetching reseller public profile:', error);
    return null;
  }
}