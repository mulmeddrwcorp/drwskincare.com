import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// Type definitions for return values
export interface ResellerPublicProfile {
  reseller: any; // legacy shape used by UI — we map DB fields to this shape below
  products: Array<any>;
  customPrices: Array<any>;
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
    const matched = products.find((p: any) => {
      const productName = p.namaProduk ?? p.nama_produk ?? p.name ?? '';
      return p.slug === slug || createSlug(productName) === slug;
    });
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
      where: { apiResellerId: userId },
      include: { profile: true }
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

    // 4. Map DB fields (snake_case) ke bentuk legacy yang digunakan UI (camelCase)
    const profile = (reseller as any).profile;
    const mappedReseller = {
      id: reseller.id,
      apiResellerId: reseller.apiResellerId,
  namaReseller: profile?.nama_reseller ?? reseller.apiResellerId,
      nomorHp: reseller.nomorHp ?? null,
      area: profile?.city ?? null,
      level: reseller.status ?? 'member',
      status: reseller.status,
      createdAt: reseller.createdAt,
      updatedAt: reseller.updatedAt,
      profile: profile
        ? {
            id: profile.id,
            displayName: profile.nama_reseller,
            whatsappNumber: profile.whatsapp_number,
            photoUrl: profile.photo_url,
            city: profile.city,
            bio: profile.bio,
            email: profile.email_address,
            // map new fields from ResellerProfile when present
            facebook: profile.facebook ?? null,
            instagram: profile.instagram ?? null,
            alamat: profile.alamat ?? null,
            provinsi: profile.provinsi ?? null,
            kabupaten: profile.kabupaten ?? null,
            kecamatan: profile.kecamatan ?? null,
            bank: profile.bank ?? null,
            rekening: profile.rekening ?? null,
            isPublic: true,
            customSlug: null,
          }
        : null,
    };

    return {
      reseller: mappedReseller,
      totalClicks,
    };

  } catch (error) {
    console.error('Error fetching reseller dashboard data:', error);
    return null;
  }
}
export async function getResellerPublicProfile(username: string): Promise<ResellerPublicProfile | null> {
  try {
    // 1. Cari reseller berdasarkan apiResellerId (username) dengan include profile
    const reseller = await prisma.reseller.findUnique({
      where: { apiResellerId: username },
      include: { profile: true }
    });

    // Jika reseller tidak ditemukan, kembalikan null
    if (!reseller) {
      return null;
    }

    // 2. Ambil SEMUA daftar produk
    const products = await prisma.product.findMany({
      orderBy: {
        // Try ordering by camelCase field if present in generated client, fallback to snake_case in DB
        namaProduk: 'asc' as any,
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

    // Map DB snake_case fields to legacy UI shape
    const mappedReseller = {
      id: reseller.id,
      apiResellerId: reseller.apiResellerId,
  namaReseller: reseller.profile?.nama_reseller ?? reseller.apiResellerId,
      nomorHp: reseller.nomorHp ?? null,
      area: reseller.profile?.city ?? null,
      level: reseller.status ?? 'member',
      status: reseller.status,
      createdAt: reseller.createdAt,
      updatedAt: reseller.updatedAt,
      profile: reseller.profile
        ? {
            id: reseller.profile.id,
            displayName: reseller.profile.nama_reseller,
            whatsappNumber: reseller.profile.whatsapp_number,
            photoUrl: reseller.profile.photo_url,
            city: reseller.profile.city,
            bio: reseller.profile.bio,
            email: reseller.profile.email_address,
            facebook: reseller.profile.facebook ?? null,
            instagram: reseller.profile.instagram ?? null,
            alamat: reseller.profile.alamat ?? null,
            provinsi: reseller.profile.provinsi ?? null,
            kabupaten: reseller.profile.kabupaten ?? null,
            kecamatan: reseller.profile.kecamatan ?? null,
            bank: reseller.profile.bank ?? null,
            rekening: reseller.profile.rekening ?? null,
            isPublic: true,
            customSlug: null,
          }
        : null,
    };

    // Kembalikan objek dengan reseller, products, dan customPrices
    return {
      reseller: mappedReseller,
      products,
      customPrices,
    };

  } catch (error) {
    console.error('Error fetching reseller public profile:', error);
    return null;
  }
}