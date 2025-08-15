const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Backfilling reseller_profiles from apiData where last_user_update IS NULL...');

    const rows = await prisma.resellerProfile.findMany({
      where: { apiData: { not: null }, last_user_update: null },
      select: { id: true, resellerId: true, apiData: true }
    });

    console.log(`Found ${rows.length} rows to inspect.`);

    let updated = 0;
    for (const r of rows) {
      const src = r.apiData;
      if (!src) continue;
      // handle case where apiData is a string
      const data = typeof src === 'string' ? JSON.parse(src) : src;

      const upd = {};
  if (data.nama_reseller) upd.nama_reseller = String(data.nama_reseller).trim() || null;
      if (data.nomor_hp) upd.nomor_hp = String(data.nomor_hp).trim() || null;
      if (data.area) upd.area = String(data.area).trim() || null;
      if (data.facebook) upd.facebook = String(data.facebook).trim() || null;
      if (data.instagram) upd.instagram = String(data.instagram).trim() || null;
      if (data.alamat) upd.alamat = String(data.alamat).trim() || null;
      if (data.provinsi) upd.provinsi = String(data.provinsi).trim() || null;
      if (data.kabupaten) upd.kabupaten = String(data.kabupaten).trim() || null;
      if (data.kecamatan) upd.kecamatan = String(data.kecamatan).trim() || null;
      if (data.bank) upd.bank = String(data.bank).trim() || null;
      if (data.rekening) upd.rekening = String(data.rekening).trim() || null;
      if (data.level) upd.level = String(data.level).trim() || null;
  if (data.id_reseller) upd.nama_reseller = upd.nama_reseller ?? String(data.id_reseller).trim();

      // If nothing to update, continue
      if (Object.keys(upd).length === 0) continue;

      await prisma.resellerProfile.update({ where: { id: r.id }, data: upd });
      updated++;
    }

    console.log(`Backfill done. Updated ${updated} rows.`);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
