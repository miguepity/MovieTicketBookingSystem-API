import { prisma, runSeed } from './_bootstrap';

function randomPuntuacion(): number {
  // 10% chance 1–2, 30% chance 3, 60% chance 4–5
  const roll = Math.random();
  if (roll < 0.05) return 1;
  if (roll < 0.1) return 2;
  if (roll < 0.4) return 3;
  if (roll < 0.7) return 4;
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

  const candidatos: {
    id_pelicula: bigint;
    id_usuario: bigint;
    puntuacion: number;
  }[] = [];
  for (const pelicula of peliculas) {
    const numVotos = Math.floor(Math.random() * 11) + 5; // 5..15
    const votantes = pickRandom(usuarios, numVotos);
    for (const usuario of votantes) {
      candidatos.push({
        id_pelicula: pelicula.id,
        id_usuario: usuario.id,
        puntuacion: randomPuntuacion(),
      });
    }
  }

  if (candidatos.length === 0) return 0;

  const peliculaIds = Array.from(
    new Set(candidatos.map((c) => c.id_pelicula.toString())),
  ).map((s) => BigInt(s));
  const usuarioIds = Array.from(
    new Set(candidatos.map((c) => c.id_usuario.toString())),
  ).map((s) => BigInt(s));

  const existentes = await prisma.calificacionPelicula.findMany({
    where: {
      id_pelicula: { in: peliculaIds },
      id_usuario: { in: usuarioIds },
    },
    select: { id_pelicula: true, id_usuario: true },
  });
  const existentesSet = new Set(
    existentes.map((e) => `${e.id_pelicula}-${e.id_usuario}`),
  );
  const aCrear = candidatos.filter(
    (c) => !existentesSet.has(`${c.id_pelicula}-${c.id_usuario}`),
  );

  if (aCrear.length) {
    await prisma.calificacionPelicula.createMany({
      data: aCrear,
      skipDuplicates: true,
    });
  }

  return candidatos.length;
}

if (require.main === module) {
  void runSeed('calificacion-pelicula', async () => {
    await seedCalificaciones();
  });
}
