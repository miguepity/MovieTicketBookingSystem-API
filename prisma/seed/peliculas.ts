import { prisma } from './client';
import type { IdiomasMap } from './idiomas';
import type { GenerosMap } from './generos';

const PELICULAS: ReadonlyArray<
  readonly [string, string, string, string, string]
> = [
  [
    'Dune: Part Two',
    'Paul Atreides se une a los Fremen para vengar a su familia.',
    'Inglés',
    'Ciencia Ficción',
    '2026-03-01',
  ],
  [
    'Inside Out 2',
    'Riley enfrenta nuevas emociones en su adolescencia.',
    'Español',
    'Animación',
    '2026-06-14',
  ],
  [
    'La Sociedad de la Nieve',
    'La historia real de los supervivientes del vuelo 571 en los Andes.',
    'Español',
    'Drama',
    '2026-01-04',
  ],
  [
    'Godzilla x Kong',
    'Los dos titanes se enfrentan a una nueva amenaza colosal.',
    'Inglés',
    'Acción',
    '2026-03-29',
  ],
  [
    'Parásitos',
    'Una familia pobre se infiltra en la vida de una familia rica.',
    'Coreano',
    'Drama',
    '2026-02-15',
  ],
  [
    'El Reino del Planeta de los Simios',
    'Generaciones después de César, un nuevo líder simio emerge.',
    'Inglés',
    'Aventura',
    '2026-05-10',
  ],
  [
    'Kung Fu Panda 4',
    'Po enfrenta a una nueva villana mientras busca a su sucesor.',
    'Inglés',
    'Animación',
    '2026-04-08',
  ],
  [
    'Civil War',
    'Periodistas cubren una guerra civil en los Estados Unidos.',
    'Inglés',
    'Drama',
    '2026-07-12',
  ],
  [
    'It Ends With Us',
    'Lily descubre que el amor también puede doler.',
    'Inglés',
    'Romance',
    '2026-08-09',
  ],
  [
    'Furiosa',
    'La saga del páramo continúa con la historia de Furiosa.',
    'Inglés',
    'Acción',
    '2026-05-24',
  ],
];

export interface PeliculaSeed {
  id: bigint;
  titulo: string;
}

export interface PeliculasMap {
  all: PeliculaSeed[];
}

export async function seedPeliculas(
  idiomas: IdiomasMap,
  generos: GenerosMap,
  admin: { id: bigint },
): Promise<PeliculasMap> {
  const all: PeliculaSeed[] = [];

  for (const [titulo, sinopsis, idioma, genero, fecha] of PELICULAS) {
    const existing = await prisma.peliculas.findFirst({
      where: { titulo },
      select: { id: true, titulo: true },
    });
    const pelicula =
      existing ??
      (await prisma.peliculas.create({
        data: {
          titulo,
          sinopsis,
          id_idioma: idiomas[idioma].id,
          id_genero: generos[genero].id,
          fecha_estreno: new Date(fecha),
          id_usuario: admin.id,
        },
        select: { id: true, titulo: true },
      }));
    all.push(pelicula);
  }

  return { all };
}
