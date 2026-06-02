import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('[Seeding] Seeding base data...');
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = 'admin';

  const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const adminRole = await prisma.roles.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: {
      nombre: 'admin',
    },
  });

  console.log('[Seeding] Admin role created or already exists');
  console.log(adminRole);

  const adminUser = await prisma.usuarios.upsert({
    where: { email: email },
    update: {},
    create: {
      nombre: 'Admin',
      email: email,
      id_rol: adminRole.id,
      password_hash: hash,
      estado: 'active',
    },
  });

  console.log('[Seeding] Admin user created or already exists');
  console.log(adminUser);
}

void main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('[Seeding] Seeding completed successfully');
  })
  .catch(async (e) => {
    console.error('[Seeding] Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
