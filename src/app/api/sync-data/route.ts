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
    const syncType = searchParams.get('type'); // 'resellers', 'products', 'bundling', or null for all
    
    // Verify authorization for cron jobs
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET || 'fallback-secret';
    
    if (authHeader && !authHeader.includes(expectedSecret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resellersCount = 0;
    let productsCount = 0;
    let bundlingCount = 0;

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
        
        // 2. Loop through each reseller from API
        for (const resellerFromApi of resellersData.data) {
          // 3. Upsert reseller data - only core Reseller fields defined in prisma schema
          const upsertedReseller = await prisma.reseller.upsert({
            where: {
              apiResellerId: resellerFromApi.id_reseller,
            },
            create: {
              apiResellerId: resellerFromApi.id_reseller,
              nomorHp: resellerFromApi.nomor_hp || null,
              status: resellerFromApi.status || 'active',
            },
            update: {
              nomorHp: resellerFromApi.nomor_hp || null,
              status: resellerFromApi.status || 'active',
              updatedAt: new Date(),
            },
          });

          // 3b. Upsert ResellerProfile for editable/display data (nama_reseller, city, email)
          try {
            await prisma.resellerProfile.upsert({
              where: { resellerId: upsertedReseller.id },
              create: {
                resellerId: upsertedReseller.id,
                nama_reseller: resellerFromApi.nama_reseller || null,
                city: resellerFromApi.area || null,
                email_address: resellerFromApi.email || null,
              },
              update: {
                nama_reseller: resellerFromApi.nama_reseller || null,
                city: resellerFromApi.area || null,
                email_address: resellerFromApi.email || null,
                updatedAt: new Date(),
              },
            });
          } catch (e) {
            // if profile table constraints or other issues occur, log and continue
            console.warn('upsert resellerProfile failed for', resellerFromApi.id_reseller, e);
          }
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
              slug: product.slug || createSlug(product.nama_produk),
            },
          });
        }
      }
    }

    // 3. Sync data bundling
    if (!syncType || syncType === 'bundling') {
      console.log('Syncing bundling...');
      const bundlingResponse = await fetch('https://drwgroup.id/apis/bundling/get', {
        headers: {
          'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
        }
      });
      const bundlingData = await bundlingResponse.json();

      if (bundlingData.data) {
        bundlingCount = Array.isArray(bundlingData.data) ? bundlingData.data.length : 0;
        
        // Find or create "Paket" category for bundling products
        let paketCategory = await prisma.category.findFirst({
          where: { name: 'Paket' }
        });
        
        if (!paketCategory) {
          paketCategory = await prisma.category.create({
            data: {
              name: 'Paket',
              slug: 'paket',
              description: 'Paket produk bundling'
            }
          });
        }

        for (const bundling of bundlingData.data) {
          // Upload gambar bundling jika ada
          let gambar = null;
          if (bundling.foto_bundling) {
            gambar = await uploadImageToBlob(
              bundling.foto_bundling, 
              `bundling-${bundling.id_bundling}-image.jpg`
            );
          }

          await prisma.product.upsert({
            where: { apiBundlingId: bundling.id_bundling },
            update: {
              namaProduk: bundling.nama_bundling,
              hargaDirector: bundling.harga_director ? parseFloat(bundling.harga_director) : null,
              hargaManager: bundling.harga_manager ? parseFloat(bundling.harga_manager) : null,
              hargaSupervisor: bundling.harga_supervisor ? parseFloat(bundling.harga_supervisor) : null,
              hargaConsultant: bundling.harga_consultant ? parseFloat(bundling.harga_consultant) : null,
              hargaUmum: bundling.harga_umum ? parseFloat(bundling.harga_umum) : null,
              fotoProduk: bundling.foto_bundling,
              gambar: gambar,
              deskripsi: bundling.deskripsi,
              categoryId: paketCategory.id,
              updatedAt: new Date(),
            },
            create: {
              apiBundlingId: bundling.id_bundling,
              idProduk: `bundling-${bundling.id_bundling}`, // Generate unique idProduk for bundling
              namaProduk: bundling.nama_bundling,
              hargaDirector: bundling.harga_director ? parseFloat(bundling.harga_director) : null,
              hargaManager: bundling.harga_manager ? parseFloat(bundling.harga_manager) : null,
              hargaSupervisor: bundling.harga_supervisor ? parseFloat(bundling.harga_supervisor) : null,
              hargaConsultant: bundling.harga_consultant ? parseFloat(bundling.harga_consultant) : null,
              hargaUmum: bundling.harga_umum ? parseFloat(bundling.harga_umum) : null,
              fotoProduk: bundling.foto_bundling,
              gambar: gambar,
              deskripsi: bundling.deskripsi,
              categoryId: paketCategory.id,
              isBundling: true,
              slug: createSlug(bundling.nama_bundling),
            },
          });
        }
      }
    }

    // Simpan tanggal terakhir sync di database (atau file)
    const lastSync = new Date().toISOString();
    // Remove this line that causes error since sync_status table doesn't exist
    // await prisma.$executeRawUnsafe(`UPDATE public.sync_status SET last_sync = '${lastSync}'`);

    return NextResponse.json({ 
      message: 'Data sync completed successfully',
      resellers: resellersCount,
      products: productsCount,
      bundling: bundlingCount,
      lastSync,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed', details: error }, { status: 500 });
  }
}
