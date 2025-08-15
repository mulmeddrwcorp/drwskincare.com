const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Reading DB schema for public tables...');

    const resColsRaw = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='resellers' ORDER BY ordinal_position");
    const resCols = resColsRaw.map(r => r.column_name);
    console.log('\nresellers columns:\n', resCols.join(', '));

    const profColsRaw = await prisma.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_name='reseller_profiles' ORDER BY ordinal_position");
    const profCols = profColsRaw.map(r => r.column_name);
    console.log('\nreseller_profiles columns:\n', profCols.join(', '));

    console.log('\nFetching sample rows (up to 5) from resellers:');
    const resRows = await prisma.reseller.findMany({ take: 5 });
    console.log(JSON.stringify(resRows, null, 2));

    console.log('\nFetching sample rows (up to 5) from reseller_profiles:');
    const profRows = await prisma.resellerProfile.findMany({ take: 5 });
    console.log(JSON.stringify(profRows, null, 2));

    await prisma.$disconnect();
  } catch (e) {
    console.error('DB inspect failed:', e);
    try { await prisma.$disconnect(); } catch (ignore) {}
    process.exit(1);
  }
})();
