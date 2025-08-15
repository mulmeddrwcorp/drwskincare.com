const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Dropping clerk name columns (if they exist) from resellers and reseller_profiles...');
    // Use raw SQL to drop columns if present
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resellers' AND column_name='first_name') THEN
        ALTER TABLE resellers DROP COLUMN IF EXISTS first_name;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='resellers' AND column_name='last_name') THEN
        ALTER TABLE resellers DROP COLUMN IF EXISTS last_name;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reseller_profiles' AND column_name='first_name') THEN
        ALTER TABLE reseller_profiles DROP COLUMN IF EXISTS first_name;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reseller_profiles' AND column_name='last_name') THEN
        ALTER TABLE reseller_profiles DROP COLUMN IF EXISTS last_name;
      END IF;
    END $$;`);

    console.log('Done.');
  } catch (e) {
    console.error('Error dropping columns:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
