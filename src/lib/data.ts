import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Type definitions for return values
export interface ResellerPublicProfile {
  reseller: {
    id: string;
    apiResellerId: string;
    namaReseller: string;
    nomorHp: string;
    area: string;
    level: string;
    status: string;
    createdAt: Date;
    profile?: {
      id: string;
      displayName: string | null;
      whatsappNumber: string | null;
      photoUrl: string | null;
      city: string | null;
      bio: string | null;
      facebook: string | null;
      instagram: string | null;
      isPublic: boolean;
      customSlug: string | null;
    } | null;
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
      gambar: string | null;
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
 * Mendapatkan data dashboard untuk reseller yang sedang login
 * @returns Object berisi reseller dan analytics atau null jika tidak ditemukan
 */
export async function getResellerDashboardData() {
  try {
    // 1. Gunakan auth() untuk mendapatkan userId dari sesi yang sedang login
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 2. Gunakan userId untuk mengambil data reseller dari database
    const reseller = await prisma.reseller.findUnique({
      where: {
        apiResellerId: userId // Assuming userId corresponds to apiResellerId
      },
      select: {
        id: true,
        apiResellerId: true,
        namaReseller: true,
        nomorHp: true,
        area: true,
        level: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            whatsappNumber: true,
            photoUrl: true,
            city: true,
            bio: true,
            facebook: true,
            instagram: true,
            isPublic: true,
            customSlug: true,
          }
        }
      }
    });

    if (!reseller) {
      return null;
    }

    // 3. Query untuk menghitung totalClicks dari tabel ClickLog
    let totalClicks = 0;
    try {
      const clickLogCount = await prisma.clickLog.count({
        where: {
          resellerId: reseller.id
        }
      });
      totalClicks = clickLogCount;
    } catch (error) {
      console.warn('Error counting click logs:', error);
      totalClicks = 0;
    }

    // 4. Kembalikan objek yang berisi reseller dan totalClicks
    return {
      reseller,
      totalClicks
    };

  } catch (error) {
    console.error('Error fetching reseller dashboard data:', error);
    return null;
  }
}
export async function getResellerPublicProfile(username: string): Promise<ResellerPublicProfile | null> {
  try {
    // 1. Cari reseller berdasarkan apiResellerId (username) atau customSlug di profile
    const reseller = await prisma.reseller.findFirst({
      where: {
        OR: [
          { apiResellerId: username },
          { profile: { customSlug: username } }
        ]
      },
      select: {
        id: true,
        apiResellerId: true,
        namaReseller: true,
        nomorHp: true,
        area: true,
        level: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            whatsappNumber: true,
            photoUrl: true,
            city: true,
            bio: true,
            facebook: true,
            instagram: true,
            isPublic: true,
            customSlug: true,
          }
        }
      }
    });

    // Jika reseller tidak ditemukan atau profil tidak public, kembalikan null
    if (!reseller || (reseller.profile && !reseller.profile.isPublic)) {
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
            gambar: true
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