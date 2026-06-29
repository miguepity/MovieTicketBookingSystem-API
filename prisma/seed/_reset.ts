import 'dotenv/config';
import { runSeed } from './_bootstrap';

if (require.main === module) {
  void runSeed('reset', async (prisma) => {
    const rows = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '\\_%' ESCAPE '\\'
    `;
    if (rows.length === 0) {
      console.log('  No hay tablas en el schema public.');
      return;
    }
    const tables = rows.map((r) => `"public"."${r.tablename}"`).join(', ');
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`,
    );
    console.log(`  Truncadas ${rows.length} tablas.`);
  });
}
