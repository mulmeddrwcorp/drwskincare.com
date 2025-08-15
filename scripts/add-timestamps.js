const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Adding timestamp columns if not exists...');

    // Use raw SQL to add nullable timestamptz columns if they don't already exist
    await prisma.$executeRawUnsafe(`ALTER TABLE resellers ADD COLUMN IF NOT EXISTS last_api_sync_at timestamptz;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE reseller_profiles ADD COLUMN IF NOT EXISTS last_user_update timestamptz;`);

    console.log('Columns added (or already present).');
  } catch (e) {
    console.error('Failed to add columns:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
