const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Backfilling last_api_sync_at using updatedAt for resellers...');
  // updatedAt is a camelCase column; quote it to preserve case in Postgres
  const res = await prisma.$executeRawUnsafe(`UPDATE resellers SET last_api_sync_at = "updatedAt" WHERE last_api_sync_at IS NULL;`);
    console.log('Backfill complete.');
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
