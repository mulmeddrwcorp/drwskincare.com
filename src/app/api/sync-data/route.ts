import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createSlug } from '../../../lib/data';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

// Function untuk download dan upload gambar ke Blob
async function uploadImageToBlob(imageUrl: string, fileName: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    
    const uploadResult = await put(fileName, file, { 
      access: 'public',
      addRandomSuffix: true // Tambahkan suffix random untuk avoid conflict
    });
    return uploadResult.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Handle both GET (from cron) and POST requests
export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

async function handleSync(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const syncType = searchParams.get('type'); // 'resellers', 'products', or null for both
    
    // Verify authorization for cron jobs
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'fallback-secret';
    
    if (authHeader && !authHeader.includes(expectedSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resellersCount = 0;
    let productsCount = 0;

    // 1. Sync data resellers (if type is 'resellers' or null)
    if (!syncType || syncType === 'resellers') {
      console.log('Syncing resellers...');
      const resellersResponse = await fetch('https://drwgroup.id/apis/reseller/get', {
        headers: {
          'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
        }
      });
      const resellersData = await resellersResponse.json();

      if (resellersData.data) {
        resellersCount = Array.isArray(resellersData.data) ? resellersData.data.length : 0;
        for (const reseller of resellersData.data) {
          // Upload foto reseller jika ada
          let fotoProfil = null;
          if (reseller.foto_reseller) {
            fotoProfil = await uploadImageToBlob(
              reseller.foto_reseller, 
              `reseller-${reseller.id_reseller}-profile.jpg`
            );
          }

          await prisma.reseller.upsert({
            where: { idReseller: reseller.id_reseller },
            update: {
              namaReseller: reseller.nama_reseller,
              nomorHp: reseller.nomor_hp,
              area: reseller.area,
              idUpline: reseller.id_upline,
              level: reseller.level,
              facebook: reseller.facebook,
              instagram: reseller.instagram,
              fotoReseller: reseller.foto_reseller,
              fotoProfil: fotoProfil,
              apiData: reseller,
              updatedAt: new Date(),
            },
            create: {
              idReseller: reseller.id_reseller,
              namaReseller: reseller.nama_reseller,
              nomorHp: reseller.nomor_hp,
              area: reseller.area,
              idUpline: reseller.id_upline,
              level: reseller.level,
              facebook: reseller.facebook,
              instagram: reseller.instagram,
              fotoReseller: reseller.foto_reseller,
              fotoProfil: fotoProfil,
              apiData: reseller,
            },
          });
        }
      }
    }

    // 2. Sync data products
    if (!syncType || syncType === 'products') {
      console.log('Syncing products...');
      const productsResponse = await fetch('https://drwgroup.id/apis/product/get', {
        headers: {
          'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
        }
      });
      const productsData = await productsResponse.json();

      if (productsData.data) {
        productsCount = Array.isArray(productsData.data) ? productsData.data.length : 0;
        for (const product of productsData.data) {
          // Upload gambar produk jika ada
          let gambar = null;
          if (product.foto_produk) {
            gambar = await uploadImageToBlob(
              product.foto_produk, 
              `product-${product.id_produk}-image.jpg`
            );
          }

          await prisma.product.upsert({
            where: { idProduk: product.id_produk },
            update: {
              namaProduk: product.nama_produk,
              bpom: product.bpom,
              hargaDirector: product.harga_director ? parseFloat(product.harga_director) : null,
              hargaManager: product.harga_manager ? parseFloat(product.harga_manager) : null,
              hargaSupervisor: product.harga_supervisor ? parseFloat(product.harga_supervisor) : null,
              hargaConsultant: product.harga_consultant ? parseFloat(product.harga_consultant) : null,
              hargaUmum: product.harga_umum ? parseFloat(product.harga_umum) : null,
              fotoProduk: product.foto_produk,
              gambar: gambar,
              deskripsi: product.deskripsi,
              apiData: product,
              updatedAt: new Date(),
            },
            create: {
              idProduk: product.id_produk,
              namaProduk: product.nama_produk,
              bpom: product.bpom,
              hargaDirector: product.harga_director ? parseFloat(product.harga_director) : null,
              hargaManager: product.harga_manager ? parseFloat(product.harga_manager) : null,
              hargaSupervisor: product.harga_supervisor ? parseFloat(product.harga_supervisor) : null,
              hargaConsultant: product.harga_consultant ? parseFloat(product.harga_consultant) : null,
              hargaUmum: product.harga_umum ? parseFloat(product.harga_umum) : null,
              fotoProduk: product.foto_produk,
              gambar: gambar,
              deskripsi: product.deskripsi,
              apiData: product,
              slug: product.slug || createSlug(product.nama_produk),
            },
          });
        }
      }
    }

    // Simpan tanggal terakhir sync di database (atau file)
    const lastSync = new Date().toISOString();
    await prisma.$executeRawUnsafe(`UPDATE public.sync_status SET last_sync = '${lastSync}'`);

    return NextResponse.json({ 
      message: 'Data sync completed successfully',
      resellers: resellersCount,
      products: productsCount,
      lastSync,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed', details: error }, { status: 500 });
  }
}
