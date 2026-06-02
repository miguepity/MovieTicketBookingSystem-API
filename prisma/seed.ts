import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const rolCliente = await prisma.roles.upsert({
    where: { nombre: 'cliente' },
    update: {},
    create: { nombre: 'cliente' },
  });

  const rolAdmin = await prisma.roles.upsert({
    where: { nombre: 'admin' },
    update: {},
    create: { nombre: 'admin' },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.usuarios.upsert({
    where: { email: 'admin@cinema.com' },
    update: {},
    create: {
      nombre: 'Admin Cinema',
      email: 'admin@cinema.com',
      password_hash: passwordHash,
      telefono: '+502 5555-0001',
      id_rol: rolAdmin.id,
      estado: 'activo',
    },
  });

  const cliente = await prisma.usuarios.upsert({
    where: { email: 'cliente@cinema.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'cliente@cinema.com',
      password_hash: passwordHash,
      telefono: '+502 5555-0002',
      id_rol: rolCliente.id,
      estado: 'activo',
    },
  });

  console.log('Seed completado:');
  console.log(`  Rol creado: ${rolAdmin.nombre} (id: ${rolAdmin.id})`);
  console.log(`  Rol creado: ${rolCliente.nombre} (id: ${rolCliente.id})`);
  console.log(`  Usuario: ${admin.email} | password: password123`);
  console.log(`  Usuario: ${cliente.email} | password: password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
