import { prisma } from './client';

function randomPuntuacion(): number {
  // 10% chance 1–2, 30% chance 3, 60% chance 4–5
  const roll = Math.random();
  if (roll < 0.05) return 1;
  if (roll < 0.10) return 2;
  if (roll < 0.40) return 3;
  if (roll < 0.70) return 4;
  return 5;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

export async function seedCalificaciones(): Promise<number> {
  const peliculas = await prisma.peliculas.findMany({
    select: { id: true },
  });

  const clienteRole = await prisma.roles.findFirst({
    where: { nombre: 'cliente' },
    select: { id: true },
  });

  if (!clienteRole) {
    console.warn('  ⚠ Rol cliente no encontrado; omitiendo calificaciones.');
    return 0;
  }

  const usuarios = await prisma.usuarios.findMany({
    where: { id_rol: clienteRole.id },
    select: { id: true },
  });

  if (usuarios.length === 0) {
    console.warn('  ⚠ Sin usuarios cliente; omitiendo calificaciones.');
    return 0;
  }

  let count = 0;

  for (const pelicula of peliculas) {
    const numVotos = Math.floor(Math.random() * 11) + 5; // 5..15
    const votantes = pickRandom(usuarios, numVotos);

    for (const usuario of votantes) {
      await prisma.calificacionPelicula.upsert({
        where: {
          id_pelicula_id_usuario: {
            id_pelicula: pelicula.id,
            id_usuario: usuario.id,
          },
        },
        update: {},
        create: {
          id_pelicula: pelicula.id,
          id_usuario: usuario.id,
          puntuacion: randomPuntuacion(),
        },
      });
      count++;
    }
  }

  return count;
}
