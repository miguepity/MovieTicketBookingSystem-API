import { prisma } from './client';
import { upsertByNombre } from './helpers';

const GENEROS = [
  'Acción',
  'Aventura',
  'Animación',
  'Ciencia Ficción',
  'Comedia',
  'Documental',
  'Drama',
  'Romance',
  'Terror',
  'Fantasía',
];

export type GenerosMap = Record<string, { id: bigint }>;

export async function seedGeneros(): Promise<GenerosMap> {
  const map: GenerosMap = {};
  for (const nombre of GENEROS) {
    map[nombre] = await upsertByNombre(prisma.generos, nombre);
  }
  return map;
}
