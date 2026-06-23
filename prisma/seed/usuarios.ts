import * as bcrypt from 'bcryptjs';
import { prisma } from './client';
import type { RolesMap } from './roles';

const USUARIOS = [
  { nombre: 'Admin Cinema', email: 'admin@cinema.com', rol: 'admin' },
  { nombre: 'Juan Pérez', email: 'cliente@cinema.com', rol: 'cliente' },
];

export interface UsuariosMap {
  admin: { id: bigint };
  cliente: { id: bigint };
  clientes: { id: bigint; email: string }[];
  all: { id: bigint; email: string }[];
}

export async function seedUsuarios(roles: RolesMap): Promise<UsuariosMap> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const votanteHash = await bcrypt.hash('votante123', 10);
  const result: { id: bigint; email: string }[] = [];
  let admin!: { id: bigint };
  let cliente!: { id: bigint };

  for (let i = 0; i < USUARIOS.length; i++) {
    const u = USUARIOS[i];
    const usuario = await prisma.usuarios.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        email: u.email,
        password_hash: passwordHash,
        telefono: `+502 5555-${(i + 1).toString().padStart(4, '0')}`,
        id_rol: roles[u.rol].id,
        estado: 'activo',
      },
      select: { id: true, email: true },
    });
    result.push(usuario);
    if (u.rol === 'admin') admin = usuario;
    if (u.rol === 'cliente') cliente = usuario;
  }

  // Add 10 votante users
  for (let i = 1; i <= 10; i++) {
    const email = `votante${i}@gmail.com`;
    const usuario = await prisma.usuarios.upsert({
      where: { email },
      update: {},
      create: {
        nombre: `Votante ${i}`,
        email,
        password_hash: votanteHash,
        telefono: `5555-000${i}`,
        id_rol: roles['cliente'].id,
        estado: 'activo',
        notificaciones_activas: i % 2 === 0,
      },
      select: { id: true, email: true },
    });
    result.push(usuario);
  }

  const clientes = result.filter(
    (u) => u.email === 'cliente@cinema.com' || u.email.startsWith('votante'),
  );

  return { admin, cliente, clientes, all: result };
}
