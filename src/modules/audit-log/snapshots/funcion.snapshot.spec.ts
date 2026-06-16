import { snapshotFuncion } from './funcion.snapshot';

describe('snapshotFuncion', () => {
  it('mapea con FK resueltas a nombres', () => {
    const f = {
      id: 5n,
      id_pelicula: 12n,
      id_sala: 3n,
      fecha_hora: new Date('2026-06-14T20:00:00Z'),
      estado: 'PROGRAMADA',
      peliculas: { titulo: 'Inception' },
      salas: { nombre: 'Sala 3' },
    };
    expect(snapshotFuncion(f as any)).toEqual({
      id_pelicula: '12',
      pelicula_titulo: 'Inception',
      id_sala: '3',
      sala_nombre: 'Sala 3',
      fecha_hora: '2026-06-14T20:00:00.000Z',
      estado: 'PROGRAMADA',
    });
  });
});
