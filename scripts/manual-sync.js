const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Upload tracking
let uploadSuccessCount = 0;
let uploadFailCount = 0;
const uploadFailures = [];

function createSlug(name) {
  if (!name) return null;
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const { put } = require('@vercel/blob');

async function uploadImageToBlob(imageUrl, fileName) {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      const msg = `Failed to fetch image ${imageUrl} status=${res.status}`;
      console.warn(msg);
      uploadFailCount++;
      uploadFailures.push({ source: imageUrl, reason: msg });
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    // Create a File from the ArrayBuffer (Node 18+ provides File)
    const file = new File([arrayBuffer], fileName, { type: contentType });

    // Use @vercel/blob put. Requires VERCEL_BLOB_TOKEN in env.
    try {
      const result = await put(fileName, file, { access: 'public', addRandomSuffix: true });
      if (result?.url) {
        uploadSuccessCount++;
        return result.url;
      } else {
        const msg = `put returned no url for ${imageUrl}`;
        console.warn(msg);
        uploadFailCount++;
        uploadFailures.push({ source: imageUrl, reason: msg });
        return null;
      }
    } catch (err) {
      const msg = err?.message || String(err);
      console.warn('uploadImageToBlob failed for', imageUrl, msg);
      uploadFailCount++;
      uploadFailures.push({ source: imageUrl, reason: msg });
      return null;
    }
  } catch (err) {
    const msg = err?.message || String(err);
    console.warn('uploadImageToBlob failed for', imageUrl, msg);
    uploadFailCount++;
    uploadFailures.push({ source: imageUrl, reason: msg });
    return null;
  }
}

async function syncResellers() {
  console.log('Syncing resellers...');
  const res = await fetch('https://drwgroup.id/apis/reseller/get', {
    headers: {
      'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
    }
  });
  const data = await res.json();
  let count = 0;
  if (data?.data && Array.isArray(data.data)) {
    count = data.data.length;
    for (const r of data.data) {
      try {
        // detect possible photo fields
        const photoCandidates = [
          r.foto_reseller,
          r.foto,
          r.photo,
          r.image,
          r.image_url,
          r.avatar,
          r.foto_profile,
        ];
        const photoUrlRaw = photoCandidates.find(Boolean) || null;

        // upload photo if present
        let uploadedPhotoUrl = null;
        if (photoUrlRaw) {
          uploadedPhotoUrl = await uploadImageToBlob(String(photoUrlRaw), `reseller-${r.id_reseller}-photo.jpg`);
        }

  // derive contact fields; we only persist email from Clerk/API
  const email = r.email ?? null;

        const upserted = await prisma.reseller.upsert({
          where: { apiResellerId: r.id_reseller },
            create: {
            apiResellerId: r.id_reseller,
            nomorHp: r.nomor_hp || null,
            status: r.status || 'active',
              email_address: email,
            photo_url: uploadedPhotoUrl ?? (photoUrlRaw || null),
            apiData: r || null,
            last_api_sync_at: new Date(),
          },
          update: {
            nomorHp: r.nomor_hp || null,
            status: r.status || 'active',
              email_address: email,
            photo_url: uploadedPhotoUrl ?? (photoUrlRaw || null),
            apiData: r || null,
            last_api_sync_at: new Date(),
            updatedAt: new Date(),
          }
        });

        try {
          // Read existing profile to decide whether to overwrite user-managed fields
          const existingProfile = await prisma.resellerProfile.findUnique({ where: { resellerId: upserted.id } });

          const profileCreate = {
            resellerId: upserted.id,
            nama_reseller: r.nama_reseller || null,
            city: r.area || null,
            email_address: email,
            whatsapp_number: r.nomor_hp || null,
            photo_url: uploadedPhotoUrl ?? (photoUrlRaw || null),
            bio: r.bio ?? r.keterangan ?? null,
            apiData: r || null,
          };

          // Build update payload. If user has manually updated recently (last_user_update exists),
          // avoid overwriting those specific user-managed fields.
          const shouldRespectUser = existingProfile && existingProfile.last_user_update;

          const profileUpdate = {
            // fields safe to update from API
            city: r.area || null,
            email_address: email,
            bio: r.bio ?? r.keterangan ?? null,
            apiData: r || null,
            updatedAt: new Date(),
          };

          if (!shouldRespectUser) {
            // No recent manual update: allow API to set user-visible fields
            profileUpdate.nama_reseller = r.nama_reseller || null;
            profileUpdate.whatsapp_number = r.nomor_hp || null;
            profileUpdate.photo_url = uploadedPhotoUrl ?? (photoUrlRaw || null);
            // also map API address/bank fields when no user override exists
            profileUpdate.nama_reseller = r.nama_reseller || null;
            profileUpdate.nomor_hp = r.nomor_hp || null;
            profileUpdate.area = r.area || null;
            profileUpdate.facebook = r.facebook || null;
            profileUpdate.instagram = r.instagram || null;
            profileUpdate.alamat = r.alamat || null;
            profileUpdate.provinsi = r.provinsi || null;
            profileUpdate.kabupaten = r.kabupaten || null;
            profileUpdate.kecamatan = r.kecamatan || null;
            profileUpdate.bank = r.bank || null;
            profileUpdate.rekening = r.rekening || null;
          } else {
            // Respect user edits: only update API-only fields and apiData
            profileUpdate.apiData = r || null;
          }

          await prisma.resellerProfile.upsert({
            where: { resellerId: upserted.id },
            create: profileCreate,
            update: profileUpdate,
          });
        } catch (e) {
          console.warn('resellerProfile upsert failed for', r.id_reseller, e?.message || e);
        }
      } catch (e) {
        const msg = e?.message || String(e);
        // Handle unique constraint on nomorHp by finding the existing reseller and updating it
        if (msg.includes('Unique constraint failed') && r?.nomor_hp) {
          try {
            const existing = await prisma.reseller.findFirst({ where: { nomorHp: r.nomor_hp } });
            if (existing) {
              console.log('Merging reseller: updating existing record with apiResellerId', r.id_reseller, 'for nomorHp', r.nomor_hp);
              const updated = await prisma.reseller.update({
                where: { id: existing.id },
                data: { apiResellerId: r.id_reseller, status: r.status || 'active', updatedAt: new Date() }
              });
                // mark last API sync
                await prisma.reseller.update({ where: { id: updated.id }, data: { last_api_sync_at: new Date() } });

              // Upsert the profile for the merged record
              try {
                await prisma.resellerProfile.upsert({
                  where: { resellerId: updated.id },
                  create: {
                    resellerId: updated.id,
                    nama_reseller: r.nama_reseller || null,
                    city: r.area || null,
                    email_address: r.email || null,
                  },
                  update: {
                    nama_reseller: r.nama_reseller || null,
                    city: r.area || null,
                    email_address: r.email || null,
                    updatedAt: new Date(),
                  }
                });
              } catch (pe) {
                console.warn('resellerProfile upsert failed during merge for', r.id_reseller, pe?.message || pe);
              }
            } else {
              console.warn('Unique constraint on nomorHp but no existing record found for', r.nomor_hp, '— skipping', r.id_reseller);
            }
          } catch (mergeErr) {
            console.warn('Error while merging reseller for', r.id_reseller, mergeErr?.message || mergeErr);
          }
        } else {
          console.warn('reseller upsert failed for', r.id_reseller, msg);
        }
      }
    }
  }
  return count;
}

async function syncProducts() {
  console.log('Syncing products...');
  const res = await fetch('https://drwgroup.id/apis/product/get', {
    headers: {
      'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
    }
  });
  const data = await res.json();
  let count = 0;
  if (data?.data && Array.isArray(data.data)) {
    count = data.data.length;
    for (const p of data.data) {
      try {
        let gambar = null;
        if (p.foto_produk) {
          gambar = await uploadImageToBlob(p.foto_produk, `product-${p.id_produk}-image.jpg`);
        }

        await prisma.product.upsert({
          where: { idProduk: p.id_produk },
          update: {
            namaProduk: p.nama_produk,
            bpom: p.bpom,
            hargaDirector: p.harga_director ? parseFloat(p.harga_director) : null,
            hargaManager: p.harga_manager ? parseFloat(p.harga_manager) : null,
            hargaSupervisor: p.harga_supervisor ? parseFloat(p.harga_supervisor) : null,
            hargaConsultant: p.harga_consultant ? parseFloat(p.harga_consultant) : null,
            hargaUmum: p.harga_umum ? parseFloat(p.harga_umum) : null,
            fotoProduk: p.foto_produk,
            gambar: gambar,
            deskripsi: p.deskripsi,
              apiData: p || null,
            updatedAt: new Date(),
          },
          create: {
            idProduk: p.id_produk,
            namaProduk: p.nama_produk,
            bpom: p.bpom,
            hargaDirector: p.harga_director ? parseFloat(p.harga_director) : null,
            hargaManager: p.harga_manager ? parseFloat(p.harga_manager) : null,
            hargaSupervisor: p.harga_supervisor ? parseFloat(p.harga_supervisor) : null,
            hargaConsultant: p.harga_consultant ? parseFloat(p.harga_consultant) : null,
            hargaUmum: p.harga_umum ? parseFloat(p.harga_umum) : null,
            fotoProduk: p.foto_produk,
            gambar: gambar,
              deskripsi: p.deskripsi,
              apiData: p || null,
            slug: p.slug || createSlug(p.nama_produk),
          }
        });
      } catch (e) {
        console.warn('product upsert failed for', p.id_produk, e?.message || e);
      }
    }
  }
  return count;
}

async function syncBundling() {
  console.log('Syncing bundling...');
  const res = await fetch('https://drwgroup.id/apis/bundling/get', {
    headers: {
      'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89'
    }
  });
  const data = await res.json();
  let count = 0;
  if (data?.data && Array.isArray(data.data)) {
    count = data.data.length;

    // Ensure Paket category exists
    let paketCategory = await prisma.category.findFirst({ where: { name: 'Paket' } });
    if (!paketCategory) {
      paketCategory = await prisma.category.create({ data: { name: 'Paket', slug: 'paket', description: 'Paket produk bundling' } });
    }

    for (const b of data.data) {
      try {
        let gambar = null;
        if (b.foto_bundling) {
          gambar = await uploadImageToBlob(b.foto_bundling, `bundling-${b.id_bundling}-image.jpg`);
        }

        await prisma.product.upsert({
          where: { apiBundlingId: b.id_bundling },
          update: {
            namaProduk: b.nama_bundling,
            hargaDirector: b.harga_director ? parseFloat(b.harga_director) : null,
            hargaManager: b.harga_manager ? parseFloat(b.harga_manager) : null,
            hargaSupervisor: b.harga_supervisor ? parseFloat(b.harga_supervisor) : null,
            hargaConsultant: b.harga_consultant ? parseFloat(b.harga_consultant) : null,
            hargaUmum: b.harga_umum ? parseFloat(b.harga_umum) : null,
            fotoProduk: b.foto_bundling,
            gambar: gambar,
            deskripsi: b.deskripsi,
              apiData: b || null,
              items: b.items || null,
            categoryId: paketCategory.id,
            updatedAt: new Date(),
          },
          create: {
            apiBundlingId: b.id_bundling,
            idProduk: `bundling-${b.id_bundling}`,
            namaProduk: b.nama_bundling,
            hargaDirector: b.harga_director ? parseFloat(b.harga_director) : null,
            hargaManager: b.harga_manager ? parseFloat(b.harga_manager) : null,
            hargaSupervisor: b.harga_supervisor ? parseFloat(b.harga_supervisor) : null,
            hargaConsultant: b.harga_consultant ? parseFloat(b.harga_consultant) : null,
            hargaUmum: b.harga_umum ? parseFloat(b.harga_umum) : null,
            fotoProduk: b.foto_bundling,
            gambar: gambar,
              deskripsi: b.deskripsi,
              apiData: b || null,
              items: b.items || null,
            categoryId: paketCategory.id,
            isBundling: true,
            slug: createSlug(b.nama_bundling),
          }
        });
      } catch (e) {
        console.warn('bundling upsert failed for', b.id_bundling, e?.message || e);
      }
    }
  }
  return count;
}

async function main() {
  try {
    const resellers = await syncResellers();
    const products = await syncProducts();
    const bundling = await syncBundling();

    const lastSync = new Date().toISOString();
    console.log('Sync completed:', { resellers, products, bundling, lastSync });

    // Write upload failures to CSV if any
    if (uploadFailures.length > 0) {
      const csvPath = path.resolve(__dirname, 'upload-failures.csv');
      const header = 'source,reason\n';
      const rows = uploadFailures.map(f => `${JSON.stringify(f.source)},${JSON.stringify(f.reason)}`).join('\n');
      fs.writeFileSync(csvPath, header + rows, 'utf8');
      console.log(`Upload failures written to ${csvPath} (${uploadFailures.length} rows)`);
    }

    console.log(`Upload summary: success=${uploadSuccessCount} fail=${uploadFailCount}`);
  } catch (e) {
    console.error('Manual sync failed', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
