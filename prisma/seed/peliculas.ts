import { prisma } from './client';
import type { IdiomasMap } from './idiomas';
import type { GenerosMap } from './generos';

interface PeliculaData {
  titulo: string;
  sinopsis: string;
  idioma: string;
  genero: string;
  fecha: string;
  duracion_min: number;
  tagline: string;
  ficha_tecnica: {
    direccion: string;
    guion: string;
    fotografia: string;
    reparto: string[];
    musica: string;
    pais: string;
    productora: string;
    distribuidor: string;
  };
}

const PELICULAS: ReadonlyArray<PeliculaData> = [
  {
    titulo: 'Dune: Part Two',
    sinopsis: 'Paul Atreides se une a los Fremen para vengar a su familia.',
    idioma: 'Inglés',
    genero: 'Ciencia Ficción',
    fecha: '2026-03-01',
    duracion_min: 166,
    tagline: 'El futuro del universo depende de una sola decisión.',
    ficha_tecnica: {
      direccion: 'Denis Villeneuve',
      guion: 'Denis Villeneuve, Jon Spaihts',
      fotografia: 'Greig Fraser',
      reparto: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Josh Brolin', 'Austin Butler'],
      musica: 'Hans Zimmer',
      pais: 'Estados Unidos',
      productora: 'Legendary Pictures',
      distribuidor: 'Warner Bros. Pictures',
    },
  },
  {
    titulo: 'Inside Out 2',
    sinopsis: 'Riley enfrenta nuevas emociones en su adolescencia.',
    idioma: 'Español',
    genero: 'Animación',
    fecha: '2026-06-14',
    duracion_min: 100,
    tagline: 'Crecer nunca fue tan complicado, ni tan emocionante.',
    ficha_tecnica: {
      direccion: 'Kelsey Mann',
      guion: 'Meg LeFauve, Dave Holstein',
      fotografia: 'Adam Newport-Berra',
      reparto: ['Amy Poehler', 'Maya Hawke', 'Kensington Tallman', 'Liza Lapira'],
      musica: 'Andrea Datzman',
      pais: 'Estados Unidos',
      productora: 'Pixar Animation Studios',
      distribuidor: 'Walt Disney Pictures',
    },
  },
  {
    titulo: 'La Sociedad de la Nieve',
    sinopsis: 'La historia real de los supervivientes del vuelo 571 en los Andes.',
    idioma: 'Español',
    genero: 'Drama',
    fecha: '2026-01-04',
    duracion_min: 144,
    tagline: 'Sobrevivir fue sólo el comienzo.',
    ficha_tecnica: {
      direccion: 'J.A. Bayona',
      guion: 'J.A. Bayona, Bernat Vilaplana',
      fotografia: 'Pedro Luque',
      reparto: ['Enzo Vogrincic', 'Agustín Pardella', 'Matías Recalt', 'Esteban Bigliardi'],
      musica: 'Michael Giacchino',
      pais: 'España',
      productora: 'Mistery Productions',
      distribuidor: 'Netflix',
    },
  },
  {
    titulo: 'Godzilla x Kong',
    sinopsis: 'Los dos titanes se enfrentan a una nueva amenaza colosal.',
    idioma: 'Inglés',
    genero: 'Acción',
    fecha: '2026-03-29',
    duracion_min: 115,
    tagline: 'Dos leyendas. Una batalla. Un mundo en juego.',
    ficha_tecnica: {
      direccion: 'Adam Wingard',
      guion: 'Terry Rossio, Simon Barrett',
      fotografia: 'Ben Seresin',
      reparto: ['Rebecca Hall', 'Brian Tyree Henry', 'Dan Stevens', 'Kaylee Hottle'],
      musica: 'Antonio Di Iorio',
      pais: 'Estados Unidos',
      productora: 'Legendary Pictures',
      distribuidor: 'Warner Bros. Pictures',
    },
  },
  {
    titulo: 'Parásitos',
    sinopsis: 'Una familia pobre se infiltra en la vida de una familia rica.',
    idioma: 'Coreano',
    genero: 'Drama',
    fecha: '2026-02-15',
    duracion_min: 132,
    tagline: 'La línea entre ellos y nosotros es más delgada de lo que crees.',
    ficha_tecnica: {
      direccion: 'Bong Joon-ho',
      guion: 'Bong Joon-ho, Han Jin-won',
      fotografia: 'Hong Kyung-pyo',
      reparto: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik', 'Park So-dam'],
      musica: 'Jung Jae-il',
      pais: 'Corea del Sur',
      productora: 'Barunson E&A',
      distribuidor: 'CJ Entertainment',
    },
  },
  {
    titulo: 'El Reino del Planeta de los Simios',
    sinopsis: 'Generaciones después de César, un nuevo líder simio emerge.',
    idioma: 'Inglés',
    genero: 'Aventura',
    fecha: '2026-05-10',
    duracion_min: 145,
    tagline: 'Un nuevo reino. Un nuevo destino.',
    ficha_tecnica: {
      direccion: 'Wes Ball',
      guion: 'Josh Friedman',
      fotografia: 'Gyula Pados',
      reparto: ['Owen Teague', 'Freya Allan', 'Kevin Durand', 'Peter Macon'],
      musica: 'John Paesano',
      pais: 'Estados Unidos',
      productora: 'Weta FX',
      distribuidor: '20th Century Studios',
    },
  },
  {
    titulo: 'Kung Fu Panda 4',
    sinopsis: 'Po enfrenta a una nueva villana mientras busca a su sucesor.',
    idioma: 'Inglés',
    genero: 'Animación',
    fecha: '2026-04-08',
    duracion_min: 94,
    tagline: 'El Guerrero Dragón necesita un sucesor. El universo necesita a Po.',
    ficha_tecnica: {
      direccion: 'Mike Mitchell',
      guion: 'Darren Lemke, Glenn Berger',
      fotografia: 'Yong Duk Jhun',
      reparto: ['Jack Black', 'Awkwafina', 'Viola Davis', 'Bryan Cranston', 'Ian McShane'],
      musica: 'Hans Zimmer, Steve Mazzaro',
      pais: 'Estados Unidos',
      productora: 'DreamWorks Animation',
      distribuidor: 'Universal Pictures',
    },
  },
  {
    titulo: 'Civil War',
    sinopsis: 'Periodistas cubren una guerra civil en los Estados Unidos.',
    idioma: 'Inglés',
    genero: 'Drama',
    fecha: '2026-07-12',
    duracion_min: 109,
    tagline: 'Cuando la nación se divide, la verdad es la primera baja.',
    ficha_tecnica: {
      direccion: 'Alex Garland',
      guion: 'Alex Garland',
      fotografia: 'Rob Hardy',
      reparto: ['Kirsten Dunst', 'Wagner Moura', 'Cailee Spaeny', 'Stephen McKinley Henderson'],
      musica: 'Ben Salisbury, Geoff Barrow',
      pais: 'Reino Unido / Estados Unidos',
      productora: 'DNA Films',
      distribuidor: 'A24',
    },
  },
  {
    titulo: 'It Ends With Us',
    sinopsis: 'Lily descubre que el amor también puede doler.',
    idioma: 'Inglés',
    genero: 'Romance',
    fecha: '2026-08-09',
    duracion_min: 130,
    tagline: 'A veces el amor más difícil es el que debes soltar.',
    ficha_tecnica: {
      direccion: 'Justin Baldoni',
      guion: 'Christy Hall',
      fotografia: 'Bart Freundlich',
      reparto: ['Blake Lively', 'Justin Baldoni', 'Jenny Slate', 'Hasan Minhaj'],
      musica: 'Evan Lurie',
      pais: 'Estados Unidos',
      productora: 'Wayfarer Studios',
      distribuidor: 'Sony Pictures',
    },
  },
  {
    titulo: 'Furiosa',
    sinopsis: 'La saga del páramo continúa con la historia de Furiosa.',
    idioma: 'Inglés',
    genero: 'Acción',
    fecha: '2026-05-24',
    duracion_min: 148,
    tagline: 'Antes de la furia, hubo una historia.',
    ficha_tecnica: {
      direccion: 'George Miller',
      guion: 'George Miller, Nico Lathouris',
      fotografia: 'Simon Duggan',
      reparto: ['Anya Taylor-Joy', 'Chris Hemsworth', 'Tom Burke', 'Alyla Browne'],
      musica: 'Junkie XL',
      pais: 'Australia / Estados Unidos',
      productora: 'Kennedy Miller Mitchell',
      distribuidor: 'Warner Bros. Pictures',
    },
  },
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

  for (const p of PELICULAS) {
    const existing = await prisma.peliculas.findFirst({
      where: { titulo: p.titulo },
      select: { id: true, titulo: true },
    });
    const pelicula =
      existing ??
      (await prisma.peliculas.create({
        data: {
          titulo: p.titulo,
          sinopsis: p.sinopsis,
          id_idioma: idiomas[p.idioma].id,
          id_genero: generos[p.genero].id,
          fecha_estreno: new Date(p.fecha),
          id_usuario: admin.id,
          duracion_min: p.duracion_min,
          tagline: p.tagline,
          ficha_tecnica: p.ficha_tecnica,
        },
        select: { id: true, titulo: true },
      }));
    all.push(pelicula);
  }

  return { all };
}
