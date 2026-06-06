import * as bcrypt from 'bcryptjs';
import { prisma } from './client';
import type { RolesMap } from './roles';

const USUARIOS = [
  { nombre: 'Admin Cinema', email: 'admin@cinema.com', rol: 'admin' },
  { nombre: 'Juan Pérez', email: 'cliente@cinema.com', rol: 'cliente' },
  { nombre: 'María López', email: 'empleado@cinema.com', rol: 'empleado' },
  { nombre: 'Carlos Ruiz', email: 'gerente@cinema.com', rol: 'gerente' },
  { nombre: 'Ana Torres', email: 'soporte@cinema.com', rol: 'soporte' },
  {
    nombre: 'Luis Martínez',
    email: 'taquillero@cinema.com',
    rol: 'taquillero',
  },
  { nombre: 'Sofía Hernández', email: 'jefe@cinema.com', rol: 'jefe_sala' },
  { nombre: 'Diego Castro', email: 'limpieza@cinema.com', rol: 'limpieza' },
  { nombre: 'Laura Mendoza', email: 'auditor@cinema.com', rol: 'auditor' },
  { nombre: 'Pedro Sánchez', email: 'marketing@cinema.com', rol: 'marketing' },
];

export interface UsuariosMap {
  admin: { id: bigint };
  cliente: { id: bigint };
  empleado: { id: bigint };
  all: { id: bigint; email: string }[];
}

export async function seedUsuarios(roles: RolesMap): Promise<UsuariosMap> {
  const passwordHash = await bcrypt.hash('password123', 10);
  const result: { id: bigint; email: string }[] = [];
  let admin!: { id: bigint };
  let cliente!: { id: bigint };
  let empleado!: { id: bigint };

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
    if (u.rol === 'empleado') empleado = usuario;
  }

  return { admin, cliente, empleado, all: result };
}
