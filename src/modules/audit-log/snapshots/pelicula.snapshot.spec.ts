import { snapshotPelicula } from './pelicula.snapshot';

describe('snapshotPelicula', () => {
  const base = {
    id: 12n,
    titulo: 'Inception',
    sinopsis: 'Sueños',
    fecha_estreno: new Date('2010-07-16'),
    id_idioma: 3n,
    id_genero: 7n,
    activo: true,
    generos: { nombre: 'Acción' },
    idiomas: { nombre: 'Inglés' },
  };

  it('mapea campos básicos + nombres resueltos de género e idioma', () => {
    expect(snapshotPelicula(base as any)).toEqual({
      titulo: 'Inception',
      sinopsis: 'Sueños',
      fecha_estreno: '2010-07-16',
      id_idioma: '3',
      id_genero: '7',
      genero_nombre: 'Acción',
      idioma_nombre: 'Inglés',
      activo: true,
    });
  });

  it('soporta FKs y relaciones nulas', () => {
    const snap = snapshotPelicula({
      ...base,
      sinopsis: null,
      fecha_estreno: null,
      id_idioma: null,
      id_genero: null,
      generos: null,
      idiomas: null,
    });
    expect(snap).toEqual({
      titulo: 'Inception',
      sinopsis: null,
      fecha_estreno: null,
      id_idioma: null,
      id_genero: null,
      genero_nombre: null,
      idioma_nombre: null,
      activo: true,
    });
  });
});
